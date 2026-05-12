// Notification Service for Creator
// Sends all important system events to creator's real email

import { sendVerificationEmail } from "@/modules/auth/emailService";

// Get creator's notification email
function getCreatorNotificationEmail(): string {
  // In production, this would come from database
  return "sirajkn.work@gmail.com";
}

// Send notification to creator (development version - logs to console)
export async function notifyCreator(
  subject: string, 
  message: string, 
  data?: any
): Promise<boolean> {
  try {
    const creatorEmail = getCreatorNotificationEmail();
    
    // In development, log the notification
    console.log('=== CREATOR NOTIFICATION ===');
    console.log(`To: ${creatorEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    if (data) {
      console.log(`Data:`, data);
    }
    console.log('============================');
    
    // In production, you would send real email:
    // await sendRealNotificationEmail(creatorEmail, subject, message, data);
    
    return true;
  } catch (error) {
    console.error('Failed to send creator notification:', error);
    return false;
  }
}

// Specific notification types
export async function notifyUserCreated(userData: any): Promise<boolean> {
  return notifyCreator(
    "New User Created",
    `A new user has been created in the system`,
    {
      email: userData.email,
      name: userData.name,
      role: userData.role,
      createdAt: new Date().toISOString()
    }
  );
}

export async function notifyCompanyCreated(companyData: any): Promise<boolean> {
  return notifyCreator(
    "New Company Created",
    `A new company has been added to the system`,
    {
      companyName: companyData.company_name,
      companyCode: companyData.company_code,
      createdBy: companyData.created_by,
      createdAt: new Date().toISOString()
    }
  );
}

export async function notifyEmployeeCreated(employeeData: any): Promise<boolean> {
  return notifyCreator(
    "New Employee Created",
    `A new employee has been added to the system`,
    {
      employeeName: employeeData.name,
      employeeId: employeeData.employee_id,
      company: employeeData.company_name,
      designation: employeeData.designation,
      createdAt: new Date().toISOString()
    }
  );
}

export async function notifyExpiryAlert(expiryData: any): Promise<boolean> {
  return notifyCreator(
    "Document Expiry Alert",
    `A document is expiring soon`,
    {
      documentType: expiryData.document_type,
      documentTitle: expiryData.title,
      expiryDate: expiryData.expires_at,
      daysUntilExpiry: expiryData.days_until_expiry,
      company: expiryData.company_name,
      employee: expiryData.employee_name
    }
  );
}

export async function notifySystemError(errorData: any): Promise<boolean> {
  return notifyCreator(
    "System Error Alert",
    `An error occurred in the system`,
    {
      error: errorData.error,
      timestamp: new Date().toISOString(),
      page: errorData.page,
      user: errorData.user
    }
  );
}

export async function notifyLoginAttempt(loginData: any): Promise<boolean> {
  return notifyCreator(
    "New Login Attempt",
    `A user attempted to login to the system`,
    {
      email: loginData.email,
      timestamp: new Date().toISOString(),
      success: loginData.success,
      ip: loginData.ip
    }
  );
}

// Production email service (example - would need actual implementation)
async function sendRealNotificationEmail(
  email: string, 
  subject: string, 
  message: string, 
  data?: any
): Promise<void> {
  // Example implementation with SendGrid or similar service:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: email,
    from: 'noreply@businesscenter.com',
    subject: subject,
    text: message,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${subject}</h2>
        <p>${message}</p>
        ${data ? `
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
            <h3>Details:</h3>
            <pre>${JSON.stringify(data, null, 2)}</pre>
          </div>
        ` : ''}
        <p>This is an automated notification from Business Center System.</p>
      </div>
    `
  };
  
  await sgMail.send(msg);
  */
}
