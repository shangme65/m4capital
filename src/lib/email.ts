// Email service configuration for email verification
// This file provides placeholder setup and instructions for email services

export interface EmailConfig {
  provider: 'resend' | 'sendgrid' | 'nodemailer';
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

// Default configuration - should be moved to environment variables
export const emailConfig: EmailConfig = {
  provider: 'resend', // Change to your preferred provider
  apiKey: process.env.EMAIL_API_KEY || '', // Set in .env.local
  fromEmail: process.env.FROM_EMAIL || 'noreply@m4capital.com',
  fromName: process.env.FROM_NAME || 'm4capital',
};

export interface VerificationEmailData {
  to: string;
  userName: string;
  verificationUrl: string;
}

export async function sendVerificationEmail(data: VerificationEmailData): Promise<boolean> {
  try {
    // PLACEHOLDER: Replace with actual email service implementation
    console.log('📧 Sending verification email to:', data.to);
    console.log('🔗 Verification URL:', data.verificationUrl);
    
    // Example implementation for Resend:
    /*
    if (emailConfig.provider === 'resend') {
      const { Resend } = require('resend');
      const resend = new Resend(emailConfig.apiKey);
      
      await resend.emails.send({
        from: `${emailConfig.fromName} <${emailConfig.fromEmail}>`,
        to: data.to,
        subject: 'Verify your m4capital account',
        html: getVerificationEmailTemplate(data.userName, data.verificationUrl),
      });
    }
    */
    
    // For development, we'll simulate email sending
    console.log(`✅ Email would be sent to ${data.to} with verification link`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    return false;
  }
}

export function getVerificationEmailTemplate(userName: string, verificationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your m4capital account</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #1f2937; }
        .container { max-width: 600px; margin: 0 auto; background-color: #374151; padding: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #6366f1; font-size: 24px; font-weight: bold; }
        .content { color: #f3f4f6; line-height: 1.6; }
        .button { display: inline-block; background: linear-gradient(to right, #6366f1, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">m4capital</div>
        </div>
        <div class="content">
          <h1 style="color: #f3f4f6;">Welcome to m4capital, ${userName}!</h1>
          <p>Thank you for creating an account with m4capital. To complete your registration and start trading, please verify your email address by clicking the button below:</p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6366f1;">${verificationUrl}</p>
          <p>This verification link will expire in 24 hours.</p>
          <p>If you didn't create an account with m4capital, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2025 m4capital. All rights reserved.</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/* 
SETUP INSTRUCTIONS:

1. Choose an email service provider:
   - Resend (recommended): https://resend.com/
   - SendGrid: https://sendgrid.com/
   - Nodemailer with SMTP

2. Install the required package:
   For Resend: npm install resend
   For SendGrid: npm install @sendgrid/mail

3. Add environment variables to .env.local:
   EMAIL_API_KEY=your_api_key_here
   FROM_EMAIL=noreply@yourdomain.com
   FROM_NAME=m4capital
   NEXTAUTH_URL=http://localhost:3000 (or your domain)

4. Uncomment and modify the email sending code above based on your provider

5. For production, make sure to:
   - Use your own domain for FROM_EMAIL
   - Set up proper DNS records (SPF, DKIM, DMARC)
   - Test email delivery thoroughly
*/