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
      max-width: 200px;
      height: auto;
      display: block;
      margin: 0 auto;
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
      }/m4capitallogo1.png" alt="M4 Capital" class="logo-img" />
    </div>
    <div class="content">
      ${content}
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
