// Base email template wrapper
export const emailTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>M4 Capital</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo-img {
      max-width: 180px;
      height: auto;
      display: block;
      margin: 0 auto;
      background-color: white;
      padding: 10px;
      border-radius: 8px;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      margin: 20px 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 600;
    }
    .footer {
      padding: 30px;
      text-align: center;
      color: #999999;
      font-size: 14px;
      border-top: 1px solid #eeeeee;
    }
    .alert {
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .alert-success {
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
    }
    .alert-warning {
      background-color: #fff3cd;
      border: 1px solid #ffeeba;
      color: #856404;
    }
    .alert-danger {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }
    .alert-info {
      background-color: #d1ecf1;
      border: 1px solid #bee5eb;
      color: #0c5460;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${
        process.env.NEXTAUTH_URL || "https://m4capital.online"
      }/m4capitallogo2.png" alt="M4 Capital" class="logo-img" />
    </div>
    <div class="content">${content}
    </div>
    <div class="footer">
      <p>© 2025 M4 Capital. All rights reserved.</p>
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`;

// KYC Submission Confirmation (to user)
export const kycSubmissionTemplate = (userName: string) =>
  emailTemplate(`
  <h2>KYC Verification Submitted Successfully</h2>
  <p>Dear ${userName},</p>
  <p>Thank you for submitting your KYC (Know Your Customer) verification documents. We have received your application and our team is currently reviewing it.</p>
  
  <div class="alert alert-info">
    <strong>What happens next?</strong><br>
    Our compliance team will review your documents within 24-48 hours. You will receive an email notification once the review is complete.
  </div>
  
  <p>You can check the status of your verification at any time by visiting your account settings.</p>
  
  <a href="${process.env.NEXTAUTH_URL}/settings" class="button">View KYC Status</a>
  
  <p>If you have any questions, please don't hesitate to contact our support team.</p>
  
  <p>Best regards,<br>The M4 Capital Team</p>
`);

// KYC Approved (to user)
export const kycApprovedTemplate = (userName: string) =>
  emailTemplate(`
  <h2>🎉 KYC Verification Approved!</h2>
  <p>Dear ${userName},</p>
  
  <div class="alert alert-success">
    <strong>Congratulations!</strong><br>
    Your KYC verification has been approved. Your account is now fully verified.
  </div>
  
  <p>You now have access to all platform features, including:</p>
  <ul>
    <li>Unlimited deposits and withdrawals</li>
    <li>Higher trading limits</li>
    <li>Access to premium features</li>
    <li>Priority customer support</li>
  </ul>
  
  <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Go to Dashboard</a>
  
  <p>Thank you for completing your verification!</p>
  
  <p>Best regards,<br>The M4 Capital Team</p>
`);

// KYC Rejected (to user)
export const kycRejectedTemplate = (userName: string, reason: string) =>
  emailTemplate(`
  <h2>KYC Verification Requires Attention</h2>
  <p>Dear ${userName},</p>
  
  <div class="alert alert-warning">
    <strong>Action Required</strong><br>
    Unfortunately, we were unable to approve your KYC verification at this time.
  </div>
  
  <p><strong>Reason:</strong></p>
  <p>${reason}</p>
  
  <p>Please review the feedback above and resubmit your KYC documents with the necessary corrections.</p>
  
  <p><strong>Common issues to check:</strong></p>
  <ul>
    <li>Ensure all documents are clear and legible</li>
    <li>Verify that document photos are not blurry or cut off</li>
    <li>Make sure your selfie clearly shows your face</li>
    <li>Confirm all information matches across documents</li>
    <li>Check that documents are valid and not expired</li>
  </ul>
  
  <a href="${process.env.NEXTAUTH_URL}/settings" class="button">Resubmit KYC</a>
  
  <p>If you have any questions or need assistance, please contact our support team.</p>
  
  <p>Best regards,<br>The M4 Capital Team</p>
`);

// New KYC Submission (to admin)
export const kycAdminNotificationTemplate = (
  userName: string,
  userEmail: string,
  userId: string,
  kycId: string
) =>
  emailTemplate(`
  <h2>New KYC Submission Received</h2>
  
  <div class="alert alert-info">
    <strong>Action Required</strong><br>
    A new KYC verification has been submitted and requires review.
  </div>
  
  <p><strong>User Details:</strong></p>
  <ul>
    <li><strong>Name:</strong> ${userName}</li>
    <li><strong>Email:</strong> ${userEmail}</li>
    <li><strong>User ID:</strong> ${userId}</li>
    <li><strong>KYC ID:</strong> ${kycId}</li>
  </ul>
  
  <p>Please review the submitted documents and approve or reject the verification.</p>
  
  <a href="${process.env.NEXTAUTH_URL}/admin/kyc" class="button">Review KYC Submission</a>
  
  <p>This notification was sent to all admin users.</p>
`);

// Plain text versions for email clients that don't support HTML
export const kycSubmissionTextTemplate = (userName: string) => `
KYC Verification Submitted Successfully

Dear ${userName},

Thank you for submitting your KYC (Know Your Customer) verification documents. We have received your application and our team is currently reviewing it.

What happens next?
Our compliance team will review your documents within 24-48 hours. You will receive an email notification once the review is complete.

You can check the status of your verification at any time by visiting your account settings at ${process.env.NEXTAUTH_URL}/settings

If you have any questions, please don't hesitate to contact our support team.

Best regards,
The M4 Capital Team
`;

export const kycApprovedTextTemplate = (userName: string) => `
KYC Verification Approved!

Dear ${userName},

Congratulations! Your KYC verification has been approved. Your account is now fully verified.

You now have access to all platform features, including:
- Unlimited deposits and withdrawals
- Higher trading limits
- Access to premium features
- Priority customer support

Visit your dashboard: ${process.env.NEXTAUTH_URL}/dashboard

Thank you for completing your verification!

Best regards,
The M4 Capital Team
`;

export const kycRejectedTextTemplate = (userName: string, reason: string) => `
KYC Verification Requires Attention

Dear ${userName},

Unfortunately, we were unable to approve your KYC verification at this time.

Reason: ${reason}

Please review the feedback above and resubmit your KYC documents with the necessary corrections.

Common issues to check:
- Ensure all documents are clear and legible
- Verify that document photos are not blurry or cut off
- Make sure your selfie clearly shows your face
- Confirm all information matches across documents
- Check that documents are valid and not expired

Resubmit your KYC: ${process.env.NEXTAUTH_URL}/settings

If you have any questions or need assistance, please contact our support team.

Best regards,
The M4 Capital Team
`;

export const kycAdminNotificationTextTemplate = (
  userName: string,
  userEmail: string,
  userId: string,
  kycId: string
) => `
New KYC Submission Received

A new KYC verification has been submitted and requires review.

User Details:
- Name: ${userName}
- Email: ${userEmail}
- User ID: ${userId}
- KYC ID: ${kycId}

Please review the submitted documents and approve or reject the verification.

Review KYC: ${process.env.NEXTAUTH_URL}/admin/kyc

This notification was sent to all admin users.
`;

// Email Verification Code Template
export const verificationCodeTemplate = (name: string, code: string) => `
<div style="text-align: center;">
  <h1 style="color: #333333; margin-bottom: 10px;">Verify Your Email</h1>
  <p style="font-size: 16px; color: #666666; margin-bottom: 30px;">
    Welcome to M4 Capital, ${name}! Please use the code below to verify your email address.
  </p>
</div>

<div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin: 30px 0; text-align: center;">
  <p style="font-size: 14px; color: #666666; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
  <div style="font-size: 42px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace; margin: 10px 0;">
    ${code}
  </div>
  <p style="font-size: 12px; color: #999999; margin-top: 15px;">This code will expire in 15 minutes</p>
</div>

<div style="margin-top: 30px;">
  <p style="font-size: 14px; color: #666666;">
    If you didn't create an account with M4 Capital, you can safely ignore this email.
  </p>
</div>

<div style="border-top: 1px solid #eeeeee; margin-top: 30px; padding-top: 20px;">
  <p style="font-size: 12px; color: #999999; margin: 5px 0;">
    <strong>Security Tip:</strong> Never share this code with anyone. M4 Capital will never ask you for this code.
  </p>
</div>
`;

// Welcome Email Template (after verification)
export const welcomeEmailTemplate = (name: string) => `
<div style="text-align: center;">
  <h1 style="color: #333333; margin-bottom: 10px;">Welcome to M4 Capital!</h1>
  <p style="font-size: 16px; color: #666666; margin-bottom: 30px;">
    Your email has been successfully verified, ${name}!
  </p>
</div>

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; padding: 30px; margin: 30px 0; text-align: center;">
  <h2 style="color: #ffffff; margin: 0 0 15px 0; font-size: 24px;">🎉 You're All Set!</h2>
  <p style="color: #ffffff; opacity: 0.9; margin: 0;">
    Your M4 Capital account is now active and ready to use.
  </p>
</div>

<div style="margin: 30px 0;">
  <h3 style="color: #333333; font-size: 18px; margin-bottom: 15px;">What's Next?</h3>
  <ul style="list-style: none; padding: 0; margin: 0;">
    <li style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
      <span style="color: #667eea; margin-right: 10px;">📊</span>
      <span style="color: #666666;">Monitor real-time cryptocurrency prices</span>
    </li>
    <li style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
      <span style="color: #667eea; margin-right: 10px;">💼</span>
      <span style="color: #666666;">Manage your investment portfolio</span>
    </li>
    <li style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
      <span style="color: #667eea; margin-right: 10px;">📈</span>
      <span style="color: #666666;">Access trading signals and market insights</span>
    </li>
    <li style="padding: 12px 0;">
      <span style="color: #667eea; margin-right: 10px;">✅</span>
      <span style="color: #666666;">Complete your KYC verification for full access</span>
    </li>
  </ul>
</div>

<div style="margin-top: 30px; text-align: center;">
  <p style="font-size: 14px; color: #666666; margin-bottom: 15px;">
    Need help getting started? Our support team is here to assist you.
  </p>
</div>

<div style="border-top: 1px solid #eeeeee; margin-top: 30px; padding-top: 20px; text-align: center;">
  <p style="font-size: 12px; color: #999999; margin: 5px 0;">
    Thank you for choosing M4 Capital - Your trusted partner in crypto investment.
  </p>
</div>
`;

// Telegram Linking Success Template
export const telegramLinkSuccessTemplate = (
  name: string,
  telegramUsername: string
) =>
  emailTemplate(`
  <div style="text-align: center;">
    <h1 style="color: #333333; margin-bottom: 10px;">🔗 Telegram Account Connected!</h1>
    <p style="font-size: 16px; color: #666666; margin-bottom: 30px;">
      Great news, ${name}! Your Telegram account has been successfully linked to your M4 Capital account.
    </p>
  </div>

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; padding: 30px; margin: 30px 0; text-align: center;">
    <h2 style="color: #ffffff; margin: 0 0 15px 0; font-size: 24px;">✅ Connection Successful</h2>
    <p style="color: #ffffff; opacity: 0.9; margin: 0;">
      Connected to: <strong>@${telegramUsername}</strong>
    </p>
  </div>

  <div style="margin: 30px 0;">
    <h3 style="color: #333333; font-size: 18px; margin-bottom: 15px;">What You Can Do Now:</h3>
    <ul style="list-style: none; padding: 0; margin: 0;">
      <li style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
        <span style="color: #667eea; margin-right: 10px;">💰</span>
        <span style="color: #666666;">Check your balance with /balance command</span>
      </li>
      <li style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
        <span style="color: #667eea; margin-right: 10px;">📊</span>
        <span style="color: #666666;">View your portfolio with /portfolio command</span>
      </li>
      <li style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
        <span style="color: #667eea; margin-right: 10px;">🔔</span>
        <span style="color: #666666;">Receive instant notifications for deposits & withdrawals</span>
      </li>
      <li style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
        <span style="color: #667eea; margin-right: 10px;">📈</span>
        <span style="color: #666666;">Get real-time crypto price updates</span>
      </li>
      <li style="padding: 12px 0;">
        <span style="color: #667eea; margin-right: 10px;">⚡</span>
        <span style="color: #666666;">Set custom price alerts</span>
      </li>
    </ul>
  </div>

  <div style="background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 20px 0; border-radius: 4px;">
    <p style="font-size: 14px; color: #0c5460; margin: 0;">
      <strong>💡 Pro Tip:</strong> Use the /help command in Telegram to see all available commands and features.
    </p>
  </div>

  <div style="margin-top: 30px; text-align: center;">
    <a href="${process.env.NEXTAUTH_URL}/settings" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: 600;">View Settings</a>
  </div>

  <div style="border-top: 1px solid #eeeeee; margin-top: 30px; padding-top: 20px;">
    <p style="font-size: 12px; color: #999999; margin: 5px 0;">
      <strong>Security Notice:</strong> If you didn't authorize this connection, please unlink the account immediately and change your password.
    </p>
  </div>
`);

export const telegramUnlinkTemplate = (
  name: string,
  telegramUsername: string
) =>
  emailTemplate(`
  <div style="text-align: center;">
    <h1 style="color: #333333; margin-bottom: 10px;">🔓 Telegram Account Disconnected</h1>
    <p style="font-size: 16px; color: #666666; margin-bottom: 30px;">
      ${name}, your Telegram account has been successfully unlinked from your M4 Capital account.
    </p>
  </div>

  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 10px; padding: 30px; margin: 30px 0; text-align: center;">
    <h2 style="color: #ffffff; margin: 0 0 15px 0; font-size: 24px;">✅ Disconnection Complete</h2>
    <p style="color: #ffffff; opacity: 0.9; margin: 0;">
      Unlinked from: <strong>@${telegramUsername}</strong>
    </p>
  </div>

  <div style="margin: 30px 0;">
    <h3 style="color: #333333; font-size: 18px; margin-bottom: 15px;">What This Means:</h3>
    <ul style="list-style: none; padding: 0; margin: 0;">
      <li style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
        <span style="color: #f5576c; margin-right: 10px;">🚫</span>
        <span style="color: #666666;">You will no longer receive Telegram notifications</span>
      </li>
      <li style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
        <span style="color: #f5576c; margin-right: 10px;">📱</span>
        <span style="color: #666666;">Telegram commands (/balance, /portfolio) are now disabled</span>
      </li>
      <li style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
        <span style="color: #f5576c; margin-right: 10px;">🔒</span>
        <span style="color: #666666;">Your account security remains intact</span>
      </li>
      <li style="padding: 12px 0;">
        <span style="color: #f5576c; margin-right: 10px;">🔄</span>
        <span style="color: #666666;">You can reconnect anytime from your settings</span>
      </li>
    </ul>
  </div>

  <div style="background: #fff3cd; border-left: 4px solid #856404; padding: 15px; margin: 20px 0; border-radius: 4px;">
    <p style="font-size: 14px; color: #856404; margin: 0;">
      <strong>⚠️ Important:</strong> If you didn't authorize this disconnection, please secure your account immediately and contact support.
    </p>
  </div>

  <div style="margin-top: 30px; text-align: center;">
    <a href="${process.env.NEXTAUTH_URL}/settings" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: 600;">Reconnect Telegram</a>
  </div>

  <div style="border-top: 1px solid #eeeeee; margin-top: 30px; padding-top: 20px;">
    <p style="font-size: 12px; color: #999999; margin: 5px 0;">
      <strong>Need Help?</strong> Visit our support center or contact us at support@m4capital.com
    </p>
  </div>
`);

// Password Reset Email Template
export const passwordResetTemplate = (name: string, resetUrl: string) => `
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Password Reset Request</h1>
  </div>

  <!-- Content -->
  <div style="padding: 40px 30px;">
    <h2 style="color: #333333; margin-bottom: 20px;">Hi ${name},</h2>
    
    <p style="font-size: 16px; color: #666666; line-height: 1.6; margin-bottom: 20px;">
      We received a request to reset your password for your M4 Capital account. If you made this request, click the button below to reset your password:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
        Reset Password
      </a>
    </div>

    <p style="font-size: 14px; color: #666666; line-height: 1.6; margin-bottom: 20px;">
      Or copy and paste this link into your browser:
    </p>
    
    <p style="font-size: 14px; color: #667eea; word-break: break-all; background: #f5f5f5; padding: 12px; border-radius: 5px; margin-bottom: 20px;">
      ${resetUrl}
    </p>

    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="font-size: 14px; color: #856404; margin: 0;">
        <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour for security reasons.
      </p>
    </div>

    <p style="font-size: 14px; color: #666666; line-height: 1.6;">
      If you didn't request a password reset, please ignore this email or contact our support team if you have concerns about your account security.
    </p>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee;">
      <p style="font-size: 12px; color: #999999; margin: 5px 0;">
        Best regards,<br>
        M4 Capital Security Team
      </p>
    </div>
  </div>

  <!-- Footer -->
  <div style="background: #f5f5f5; padding: 20px; text-align: center;">
    <p style="font-size: 12px; color: #999999; margin: 5px 0;">
      This is an automated message, please do not reply to this email.
    </p>
    <p style="font-size: 12px; color: #999999; margin: 5px 0;">
      © 2025 M4 Capital. All rights reserved.
    </p>
  </div>
</div>
`;

// Crypto Purchase Confirmation Template
export const cryptoPurchaseTemplate = (
  userName: string,
  asset: string,
  amount: number,
  price: number,
  totalCost: number,
  newBalance: number
) =>
  emailTemplate(`
  <h2>🎉 Crypto Purchase Successful!</h2>
  
  <p>Hi ${userName},</p>
  
  <p>Your cryptocurrency purchase has been completed successfully.</p>
  
  <div class="alert alert-success">
    <strong>Transaction Details</strong>
  </div>
  
  <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee;"><strong>Asset:</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right;">${asset}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee;"><strong>Amount:</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right;">${amount.toFixed(
        8
      )} ${asset}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee;"><strong>Price per Unit:</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right;">$${price.toLocaleString(
        "en-US",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      )}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee;"><strong>Total Cost:</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right; color: #e74c3c; font-weight: bold;">-$${totalCost.toLocaleString(
        "en-US",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      )}</td>
    </tr>
    <tr>
      <td style="padding: 10px;"><strong>New Balance:</strong></td>
      <td style="padding: 10px; text-align: right; color: #27ae60; font-weight: bold;">$${newBalance.toLocaleString(
        "en-US",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      )}</td>
    </tr>
  </table>
  
  <p>The ${asset} has been added to your portfolio and is ready to track!</p>
  
  <a href="${
    process.env.NEXTAUTH_URL
  }/dashboard" class="button">View Portfolio</a>
  
  <p style="color: #666; font-size: 14px; margin-top: 30px;">
    <strong>Note:</strong> This is a spot purchase transaction. Your crypto is now available in your portfolio.
  </p>
  
  <p>If you have any questions or concerns about this transaction, please contact our support team.</p>
  
  <p>Best regards,<br>The M4 Capital Team</p>
`);

// Crypto Purchase Text Template (plain text version)
export const cryptoPurchaseTextTemplate = (
  userName: string,
  asset: string,
  amount: number,
  price: number,
  totalCost: number,
  newBalance: number
) => `
Crypto Purchase Successful!

Hi ${userName},

Your cryptocurrency purchase has been completed successfully.

Transaction Details:
- Asset: ${asset}
- Amount: ${amount.toFixed(8)} ${asset}
- Price per Unit: $${price.toLocaleString("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}
- Total Cost: -$${totalCost.toLocaleString("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}
- New Balance: $${newBalance.toLocaleString("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}

The ${asset} has been added to your portfolio and is ready to track!

View Portfolio: ${process.env.NEXTAUTH_URL}/dashboard

Note: This is a spot purchase transaction. Your crypto is now available in your portfolio.

If you have any questions or concerns about this transaction, please contact our support team.

Best regards,
The M4 Capital Team
`;
