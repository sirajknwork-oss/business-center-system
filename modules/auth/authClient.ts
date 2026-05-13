import { supabase } from "@/lib/supabaseClient";
import { authenticateUser, getUserAssignedCompanies, initializeSampleUsers } from "./userStorageClient";
import { sendVerificationEmail, verifyEmailCode, validateEmailFormat, hasValidVerificationCode } from "./emailService";
import { notifyUserCreated } from "@/modules/notifications/notificationService";

export interface CurrentUserInfo {
  role: string | null;
  companyId: string | null;
  email: string | null;
  name: string | null;
  assignedCompanies: string[] | null;
}

// Helper function to fetch profile from MongoDB via API
async function getProfileFromAPI(id: string) {
  try {
    const response = await fetch(`/api/profiles/${id}`)
    if (!response.ok) {
      return null
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching profile from API:', error)
    return null
  }
}

// Local storage for user sessions
const USER_SESSION_KEY = 'business_center_user_session';

// Sample users for local authentication (until database is ready)
const SAMPLE_USERS = {
  [process.env.CREATOR_EMAIL || "sirajkn.work@gmail.com"]: {
    password: process.env.CREATOR_PASSWORD || "SirajZaira@126",
    role: process.env.CREATOR_ROLE || "creator",
    name: process.env.CREATOR_NAME || "System Creator",
    // Real email for notifications (same as login email)
    notificationEmail: process.env.CREATOR_EMAIL || "sirajkn.work@gmail.com"
  }
};

export async function signInWithEmail(email: string, password: string) {
  try {
    // Skip sample users initialization - use real user storage only
    // initializeSampleUsers();
    
    // First check user storage system
    const authenticatedUser = authenticateUser(email, password);
    if (authenticatedUser) {
      const userSession = {
        email: authenticatedUser.email,
        role: authenticatedUser.role,
        name: authenticatedUser.name,
        assignedCompanies: authenticatedUser.assignedCompanies || getAssignedCompanies(email, authenticatedUser.role),
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userSession));
      
      return { 
        data: { 
          user: { 
            email: authenticatedUser.email, 
            role: authenticatedUser.role,
            name: authenticatedUser.name
          } 
        }, 
        error: null 
      };
    }
    
    // Fallback to sample users (for backward compatibility)
    const sampleUser = SAMPLE_USERS[email as keyof typeof SAMPLE_USERS];
    if (sampleUser && sampleUser.password === password) {
      const userSession = {
        email,
        role: sampleUser.role,
        name: sampleUser.name,
        assignedCompanies: getAssignedCompanies(email, sampleUser.role),
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userSession));
      
      return { 
        data: { 
          user: { 
            email, 
            role: sampleUser.role,
            name: sampleUser.name
          } 
        }, 
        error: null 
      };
    }
    
    // Fallback to Supabase (for production)
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
    
  } catch (error) {
    return { data: null, error };
  }
}

export async function signUpWithEmail(email: string, password: string, role = "customer") {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role },
    },
  });
  if (error) {
    throw error;
  }
  return data;
}

export async function getCurrentUserInfo(): Promise<CurrentUserInfo> {
  try {
    // Check local session first (for development)
    const localSession = localStorage.getItem(USER_SESSION_KEY);
    if (localSession) {
      const session = JSON.parse(localSession);
      
      // For staff and customer users, get the latest assigned companies from user storage
      let latestAssignedCompanies = session.assignedCompanies;
      if (session.role === 'staff' || session.role === 'customer') {
        const { getUserByEmail } = require('./userStorageClient');
        const user = getUserByEmail(session.email);
        if (user && user.assignedCompanies) {
          latestAssignedCompanies = user.assignedCompanies;
        }
      }
      
      return {
        email: session.email,
        role: session.role,
        name: session.name,
        companyId: null, // Will be set based on company assignment
        assignedCompanies: latestAssignedCompanies
      };
    }
    
    // Fallback to Supabase session
    if (!supabase) {
      return { role: null, companyId: null, email: null, name: null, assignedCompanies: null };
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { role: null, companyId: null, email: null, name: null, assignedCompanies: null };
    }

    // Get profile from MongoDB via API instead of Supabase
    const profile = await getProfileFromAPI(session.user.id);

    return {
      role: profile?.role || null,
      companyId: profile?.company_id || null,
      email: session.user.email || null,
      name: profile?.name || null,
      assignedCompanies: null
    };
  } catch (error) {
    console.error('Error getting current user info:', error);
    return { role: null, companyId: null, email: null, name: null, assignedCompanies: null };
  }
}

export async function signOut() {
  try {
    // Clear local session
    localStorage.removeItem(USER_SESSION_KEY);
    
    // Clear Supabase session
    if (supabase) {
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

// Get assigned companies based on user role and email
function getAssignedCompanies(email: string, role: string): string[] | null {
  switch (role) {
    case 'creator':
    case 'admin':
      return null; // All companies access
    
    case 'staff':
      return ['C-11002']; // Emirates Business Solutions
    
    case 'customer':
      if (email === 'customer1@businesscenter.com') {
        return ['C-11000']; // Al Falah Business Center
      } else if (email === 'customer2@businesscenter.com') {
        return ['C-11001']; // Gulf Star Typing Services
      }
      return null;
    
    default:
      return null;
  }
}

// Check if user has access to specific company
export function hasCompanyAccess(userRole: string, userEmail: string, companyId: string): boolean {
  if (userRole === 'creator' || userRole === 'admin') {
    return true; // Full access
  }
  
  const assignedCompanies = getAssignedCompanies(userEmail, userRole);
  if (!assignedCompanies) {
    return false;
  }
  
  return assignedCompanies.includes(companyId);
}

// Get user permissions using enhanced system
export function getUserPermissions(role: string) {
  const { ROLE_PERMISSIONS } = require('./enhancedPermissions');
  return ROLE_PERMISSIONS[role] || {};
}

// Check if user has specific permission
export function hasPermission(userRole: string, category: string, action: string): boolean {
  const { hasPermission: checkPermission } = require('./enhancedPermissions');
  return checkPermission(userRole, category, action);
}

// Check if user can access specific company
export function canAccessCompany(userRole: string, userEmail: string, companyCode: string, assignedCompanies?: string[]): boolean {
  const { canAccessCompany: checkAccess } = require('./enhancedPermissions');
  return checkAccess(userRole, userEmail, companyCode, assignedCompanies);
}

// Get user's accessible companies
export function getAccessibleCompanies(userRole: string, userEmail: string, allCompanies: any[], assignedCompanies?: string[]) {
  const { getAccessibleCompanies: getCompanies } = require('./enhancedPermissions');
  return getCompanies(userRole, userEmail, allCompanies, assignedCompanies);
}

// Get dashboard features for user
export function getDashboardFeatures(userRole: string) {
  const { getDashboardFeatures: getFeatures } = require('./enhancedPermissions');
  return getFeatures(userRole);
}

// Email verification functions
export async function requestEmailVerification(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Validate email format
    if (!validateEmailFormat(email)) {
      return { success: false, message: "Invalid email format" };
    }
    
    // Send verification email
    const emailSent = await sendVerificationEmail(email);
    
    if (emailSent) {
      return { 
        success: true, 
        message: "Verification code sent to your email. Please check your console for the code (development mode)." 
      };
    } else {
      return { success: false, message: "Failed to send verification email" };
    }
  } catch (error) {
    console.error('Email verification error:', error);
    return { success: false, message: "An error occurred while sending verification email" };
  }
}

export async function verifyEmailWithCode(email: string, code: string): Promise<{ success: boolean; message: string }> {
  try {
    const isValid = verifyEmailCode(email, code);
    
    if (isValid) {
      return { success: true, message: "Email verified successfully" };
    } else {
      return { success: false, message: "Invalid or expired verification code" };
    }
  } catch (error) {
    console.error('Email verification error:', error);
    return { success: false, message: "An error occurred during verification" };
  }
}

export function checkEmailVerificationStatus(email: string): { hasValidCode: boolean; message: string } {
  const hasCode = hasValidVerificationCode(email);
  
  if (hasCode) {
    return { hasValidCode: true, message: "Verification code sent and still valid" };
  } else {
    return { hasValidCode: false, message: "No valid verification code found" };
  }
}

// Enhanced user creation with email verification
export async function createUserWithVerification(
  email: string, 
  password: string, 
  role: string, 
  name: string,
  verificationCode: string
): Promise<{ success: boolean; message: string }> {
  try {
    // First verify email
    const emailVerified = verifyEmailCode(email, verificationCode);
    
    if (!emailVerified) {
      return { success: false, message: "Email verification failed or code expired" };
    }
    
    // Validate email format
    if (!validateEmailFormat(email)) {
      return { success: false, message: "Invalid email format" };
    }
    
    // Create user (you would integrate with your user storage here)
    // For now, we'll add to SAMPLE_USERS for demonstration
    const newUser = {
      email,
      password,
      role,
      name,
      verified: true,
      createdAt: new Date().toISOString()
    };
    
    // In production, save to database
    // await saveUserToDatabase(newUser);
    
    console.log('User created successfully:', { email, role, name });
    
    // Notify creator about new user creation
    await notifyUserCreated({ email, role, name, verified: true, createdAt: new Date().toISOString() });
    
    return { 
      success: true, 
      message: "User created successfully with verified email" 
    };
    
  } catch (error) {
    console.error('User creation error:', error);
    return { success: false, message: "Failed to create user" };
  }
}
