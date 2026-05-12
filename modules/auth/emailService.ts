// Email Service for User Verification
// For development, we'll use console logging instead of real email sending
// In production, you would integrate with an email service like SendGrid, Nodemailer, etc.

export interface EmailVerificationData {
  email: string;
  verificationCode: string;
  expiresAt: number;
}

// Generate 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store verification codes (in production, use database)
const VERIFICATION_CODES = new Map<string, EmailVerificationData>();

// Send verification email (development version - logs to console)
export async function sendVerificationEmail(email: string): Promise<boolean> {
  try {
    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = Date.now() + (15 * 60 * 1000); // 15 minutes
    
    // Store verification data
    VERIFICATION_CODES.set(email, {
      email,
      verificationCode,
      expiresAt
    });
    
    // In development, log the verification code
    console.log('=== EMAIL VERIFICATION ===');
    console.log(`To: ${email}`);
    console.log(`Subject: Verify Your Email Address`);
    console.log(`Verification Code: ${verificationCode}`);
    console.log(`Expires: 15 minutes`);
    console.log('========================');
    
    // In production, you would use an email service:
    // await sendRealEmail(email, verificationCode);
    
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}

// Verify email with code
export function verifyEmailCode(email: string, code: string): boolean {
  const verificationData = VERIFICATION_CODES.get(email);
  
  if (!verificationData) {
    return false;
  }
  
  // Check if code matches and hasn't expired
  if (verificationData.verificationCode === code && 
      verificationData.expiresAt > Date.now()) {
    // Remove used verification code
    VERIFICATION_CODES.delete(email);
    return true;
  }
  
  return false;
}

// Check if email has valid verification code
export function hasValidVerificationCode(email: string): boolean {
  const verificationData = VERIFICATION_CODES.get(email);
  return verificationData ? verificationData.expiresAt > Date.now() : false;
}

// Clean up expired verification codes
export function cleanupExpiredCodes(): void {
  const now = Date.now();
  for (const [email, data] of VERIFICATION_CODES.entries()) {
    if (data.expiresAt <= now) {
      VERIFICATION_CODES.delete(email);
    }
  }
}

// Validate email format
export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Production email service (example - would need actual implementation)
async function sendRealEmail(email: string, verificationCode: string): Promise<void> {
  // Example implementation with SendGrid or similar service:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: email,
    from: 'noreply@businesscenter.com',
    subject: 'Verify Your Email Address',
    text: `Your verification code is: ${verificationCode}. This code will expire in 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Thank you for signing up! Please use the verification code below to verify your email address:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 3px;">${verificationCode}</span>
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
      </div>
    `
  };
  
  await sgMail.send(msg);
  */
}
