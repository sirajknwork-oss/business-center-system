// User Storage Client for persistent user management
// Saves user credentials to local storage for authentication

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  status: 'active' | 'inactive';
  assignedCompanies?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
}

const USERS_STORAGE_KEY = 'business_center_users';

// Get all users from local storage
export function getUsers(): User[] {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
  return [];
}

// Save users to local storage
export function saveUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users:', error);
  }
}

// Create a new user
export function createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
  const users = getUsers();
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
    created_at: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString().split('T')[0]
  };
  
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

// Update a user
export function updateUser(id: string, updates: Partial<User>): User | null {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) return null;
  
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updated_at: new Date().toISOString().split('T')[0]
  };
  
  saveUsers(users);
  return users[userIndex];
}

// Delete a user
export function deleteUser(id: string): boolean {
  const users = getUsers();
  const filteredUsers = users.filter(u => u.id !== id);
  
  if (filteredUsers.length === users.length) return false;
  
  saveUsers(filteredUsers);
  return true;
}

// Get user by email
export function getUserByEmail(email: string): User | null {
  const users = getUsers();
  return users.find(u => u.email === email) || null;
}

// Get users by role
export function getUsersByRole(role: string): User[] {
  const users = getUsers();
  return users.filter(u => u.role === role);
}

// Initialize system users if no users exist
export function initializeSampleUsers(): void {
  const existingUsers = getUsers();
  
  if (existingUsers.length === 0) {
    const systemUsers: User[] = [
      {
        id: '1',
        email: 'sirajkn.work@gmail.com',
        name: 'System Administrator',
        password: 'SirajZaira@126',
        role: 'creator',
        status: 'active',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }
    ];
    
    saveUsers(systemUsers);
    console.log('✅ System users initialized');
  }
}

// Check if user credentials are valid
export function authenticateUser(email: string, password: string): User | null {
  const user = getUserByEmail(email);
  if (user && user.password === password && user.status === 'active') {
    return user;
  }
  return null;
}

// Get user's assigned companies
export function getUserAssignedCompanies(email: string): string[] | null {
  const user = getUserByEmail(email);
  return user?.assignedCompanies || null;
}

// Clear all users and reinitialize with system account only
export function clearAllUsers(): void {
  localStorage.removeItem(USERS_STORAGE_KEY);
  initializeSampleUsers();
  console.log('✅ All users cleared and system account initialized');
}
