// ============================================================================
// MODERN PROFESSIONAL EMAIL TEMPLATE SYSTEM
// ============================================================================

const baseUrl = process.env.NEXTAUTH_URL || "https://m4capital.online";
const currentYear = new Date().getFullYear();

// Color Palette
const colors = {
  primary: "#6366f1",
  primaryDark: "#4f46e5",
  secondary: "#8b5cf6",
  success: "#10b981",
  successDark: "#059669",
  warning: "#f59e0b",
  warningDark: "#d97706",
  danger: "#ef4444",
  dangerDark: "#dc2626",
  info: "#3b82f6",
  infoDark: "#2563eb",
  dark: "#0f172a",
  darkSecondary: "#1e293b",
  light: "#f8fafc",
  gray: "#64748b",
  grayLight: "#94a3b8",
  white: "#ffffff",
  border: "#e2e8f0",
  textPrimary: "#ffffff",
  textSecondary: "#e2e8f0",
  textMuted: "#94a3b8",
};

// Base email template wrapper - Modern Dark Theme
export const emailTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>M4 Capital</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.dark}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <!-- Outer Container -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(180deg, ${colors.dark} 0%, ${colors.darkSecondary} 100%); min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Main Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background: linear-gradient(145deg, ${colors.darkSecondary} 0%, ${colors.dark} 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <img src="${baseUrl}/m4capitallogo1.png" alt="M4 Capital" width="160" style="display: block; max-width: 160px; height: auto; background: ${colors.white}; padding: 12px 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px 30px; color: ${colors.light};">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background: rgba(0, 0, 0, 0.2); border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <!-- Social Links -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td style="padding: 0 8px;">
                          <a href="https://t.me/m4capitalbot" style="display: inline-block; width: 36px; height: 36px; background: rgba(99, 102, 241, 0.2); border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none;">
                            <img src="${baseUrl}/socials/telegram.svg" alt="Telegram" width="18" height="18" style="vertical-align: middle;" />
                          </a>
                        </td>
                        <td style="padding: 0 8px;">
                          <a href="${baseUrl}" style="display: inline-block; width: 36px; height: 36px; background: rgba(99, 102, 241, 0.2); border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none;">
                            <img src="${baseUrl}/icons/icon-64.png" alt="Website" width="18" height="18" style="vertical-align: middle; border-radius: 4px;" />
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 0 0 8px; color: ${colors.grayLight}; font-size: 13px;">
                      © ${currentYear} M4 Capital. All rights reserved.
                    </p>
                    <p style="margin: 0; color: ${colors.gray}; font-size: 12px;">
                      This is an automated message. Please do not reply directly to this email.
                    </p>
                    <p style="margin: 15px 0 0; color: ${colors.gray}; font-size: 11px;">
                      <a href="${baseUrl}/settings" style="color: ${colors.grayLight}; text-decoration: none;">Manage Notifications</a>
                      &nbsp;•&nbsp;
                      <a href="${baseUrl}/contact" style="color: ${colors.grayLight}; text-decoration: none;">Contact Support</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Trust Badge -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin-top: 20px;">
          <tr>
            <td align="center">
              <p style="margin: 0; color: ${colors.gray}; font-size: 11px;">
                🔒 Secured by industry-standard encryption
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ============================================================================
// REUSABLE EMAIL COMPONENTS
// ============================================================================

// Hero Section
export const emailHero = (
  _icon: string, // kept for backwards compatibility, not displayed
  title: string,
  subtitle?: string,
  gradient: "primary" | "success" | "warning" | "danger" | "info" = "primary"
) => {
  const gradients = {
    primary: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
    success: `linear-gradient(135deg, ${colors.success} 0%, ${colors.successDark} 100%)`,
    warning: `linear-gradient(135deg, ${colors.warning} 0%, ${colors.warningDark} 100%)`,
    danger: `linear-gradient(135deg, ${colors.danger} 0%, ${colors.dangerDark} 100%)`,
    info: `linear-gradient(135deg, ${colors.info} 0%, ${colors.infoDark} 100%)`,
  };

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
      <tr>
        <td align="center">
          <div style="display: inline-block; width: 80px; height: 80px; background: ${gradients[gradient]}; border-radius: 50%; margin-bottom: 20px; box-shadow: 0 10px 40px -10px ${gradient === "primary" ? colors.primary : gradient === "success" ? colors.success : gradient === "warning" ? colors.warning : gradient === "danger" ? colors.danger : colors.info};"></div>
          <h1 style="margin: 0 0 8px; color: ${colors.white}; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
            ${title}
          </h1>
          ${subtitle ? `<p style="margin: 0; color: ${colors.grayLight}; font-size: 16px;">${subtitle}</p>` : ""}
        </td>
      </tr>
    </table>
  `;
};

// Info Card Component
export const emailCard = (content: string, borderColor?: string) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
    <tr>
      <td style="background: rgba(0, 0, 0, 0.3); border-radius: 16px; padding: 24px; ${borderColor ? `border-left: 4px solid ${borderColor};` : ""}">
        ${content}
      </td>
    </tr>
  </table>
`;

// Transaction Details Table
export const emailTransactionTable = (
  rows: Array<{ label: string; value: string; highlight?: boolean; color?: string }>
) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0; background: rgba(0, 0, 0, 0.3); border-radius: 16px; overflow: hidden;">
    ${rows
      .map(
        (row, index) => `
      <tr>
        <td style="padding: 16px 20px; color: ${colors.grayLight}; font-size: 14px; ${index < rows.length - 1 ? `border-bottom: 1px solid rgba(255, 255, 255, 0.05);` : ""}">
          ${row.label}
        </td>
        <td align="right" style="padding: 16px 20px; color: ${row.color || (row.highlight ? colors.success : colors.white)}; font-size: ${row.highlight ? "18px" : "15px"}; font-weight: ${row.highlight ? "700" : "600"}; ${index < rows.length - 1 ? `border-bottom: 1px solid rgba(255, 255, 255, 0.05);` : ""}">
          ${row.value}
        </td>
      </tr>
    `
      )
      .join("")}
  </table>
`;

// Status Badge
export const emailBadge = (
  text: string,
  status: "success" | "warning" | "danger" | "info" | "pending" = "success"
) => {
  const statusColors = {
    success: { bg: "rgba(16, 185, 129, 0.2)", text: colors.success },
    warning: { bg: "rgba(245, 158, 11, 0.2)", text: colors.warning },
    danger: { bg: "rgba(239, 68, 68, 0.2)", text: colors.danger },
    info: { bg: "rgba(59, 130, 246, 0.2)", text: colors.info },
    pending: { bg: "rgba(148, 163, 184, 0.2)", text: colors.grayLight },
  };

  return `<span style="display: inline-block; background: ${statusColors[status].bg}; color: ${statusColors[status].text}; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;">${text}</span>`;
};

// Primary Button
export const emailButton = (text: string, href: string, fullWidth = false) => `
  <table role="presentation" ${fullWidth ? 'width="100%"' : ""} cellpadding="0" cellspacing="0" border="0" style="margin: 25px 0;">
    <tr>
      <td align="center">
        <a href="${href}" style="display: inline-block; ${fullWidth ? "width: 100%; text-align: center;" : ""} padding: 16px 40px; background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); color: ${colors.white}; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.4); transition: all 0.3s ease;">
          ${text}
        </a>
      </td>
    </tr>
  </table>
`;

// Secondary Button
export const emailButtonSecondary = (text: string, href: string) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 15px 0;">
    <tr>
      <td align="center">
        <a href="${href}" style="display: inline-block; padding: 14px 32px; background: transparent; border: 2px solid ${colors.primary}; color: ${colors.primary}; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 14px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>
`;

// Alert Box
export const emailAlert = (
  message: string,
  type: "success" | "warning" | "danger" | "info" = "info",
  _icon?: string // kept for backwards compatibility, not displayed
) => {
  const alertStyles = {
    success: { bg: "rgba(16, 185, 129, 0.15)", border: colors.success, text: colors.success },
    warning: { bg: "rgba(245, 158, 11, 0.15)", border: colors.warning, text: colors.warning },
    danger: { bg: "rgba(239, 68, 68, 0.15)", border: colors.danger, text: colors.danger },
    info: { bg: "rgba(59, 130, 246, 0.15)", border: colors.info, text: colors.info },
  };

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
      <tr>
        <td style="background: ${alertStyles[type].bg}; border-left: 4px solid ${alertStyles[type].border}; border-radius: 8px; padding: 16px 20px;">
          <p style="margin: 0; color: ${alertStyles[type].text}; font-size: 14px; line-height: 1.5;">
            ${message}
          </p>
        </td>
      </tr>
    </table>
  `;
};

// Divider
export const emailDivider = () => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 25px 0;">
    <tr>
      <td style="height: 1px; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);"></td>
    </tr>
  </table>
`;

// Feature List
export const emailFeatureList = (items: Array<{ icon: string; text: string }>) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
    ${items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="color: ${colors.grayLight}; font-size: 15px; vertical-align: middle;">• ${item.text}</td>
            </tr>
          </table>
        </td>
      </tr>
    `
      )
      .join("")}
  </table>
`;

// Paragraph
export const emailParagraph = (text: string) => `
  <p style="margin: 0 0 16px; color: ${colors.grayLight}; font-size: 15px; line-height: 1.7;">
    ${text}
  </p>
`;

// Greeting
export const emailGreeting = (name: string) => `
  <p style="margin: 0 0 20px; color: ${colors.white}; font-size: 17px; font-weight: 500;">
    Hi ${name},
  </p>
`;

// Signature
export const emailSignature = () => `
  ${emailDivider()}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td>
        <p style="margin: 0 0 4px; color: ${colors.grayLight}; font-size: 14px;">Best regards,</p>
        <p style="margin: 0; color: ${colors.white}; font-size: 15px; font-weight: 600;">The M4 Capital Team</p>
      </td>
    </tr>
  </table>
`;

// Code Display (for verification codes)
export const emailCode = (code: string, expiryMinutes: number = 15) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
    <tr>
      <td align="center" style="background: linear-gradient(145deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border: 2px dashed rgba(99, 102, 241, 0.3); border-radius: 16px; padding: 30px;">
        <p style="margin: 0 0 10px; color: ${colors.grayLight}; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">
          Your Verification Code
        </p>
        <p style="margin: 0; font-family: 'SF Mono', 'Consolas', 'Monaco', monospace; font-size: 42px; font-weight: 700; letter-spacing: 10px; color: ${colors.primary}; text-shadow: 0 0 30px rgba(99, 102, 241, 0.3);">
          ${code}
        </p>
        <p style="margin: 15px 0 0; color: ${colors.gray}; font-size: 12px;">
          ⏱️ Expires in ${expiryMinutes} minutes
        </p>
      </td>
    </tr>
  </table>
`;

// ============================================================================
// KYC EMAIL TEMPLATES
// ============================================================================

// KYC Submission Confirmation (to user)
export const kycSubmissionTemplate = (userName: string) =>
  emailTemplate(`
    ${emailHero("📋", "KYC Submission Received", "We're reviewing your documents", "info")}
    
    ${emailGreeting(userName)}
    
    ${emailParagraph("Thank you for submitting your KYC (Know Your Customer) verification documents. We have received your application and our compliance team is now reviewing it.")}
    
    ${emailAlert("Our compliance team will review your documents within <strong>24-48 hours</strong>. You will receive an email notification once the review is complete.", "info", "⏱️")}
    
    ${emailCard(`
      <p style="margin: 0 0 12px; color: ${colors.white}; font-size: 16px; font-weight: 600;">What happens next?</p>
      ${emailFeatureList([
        { icon: "📝", text: "Our team reviews your submitted documents" },
        { icon: "🔍", text: "We verify the authenticity of your information" },
        { icon: "✅", text: "You receive approval confirmation via email" },
        { icon: "🚀", text: "Full platform access is unlocked" },
      ])}
    `)}
    
    ${emailButton("Check KYC Status", `${baseUrl}/settings`)}
    
    ${emailParagraph("If you have any questions about the verification process, please don't hesitate to contact our support team.")}
    
    ${emailSignature()}
  `);

// KYC Approved (to user)
export const kycApprovedTemplate = (userName: string) =>
  emailTemplate(`
    ${emailHero("🎉", "KYC Verification Approved!", "Your account is now fully verified", "success")}
    
    ${emailGreeting(userName)}
    
    ${emailAlert("Congratulations! Your KYC verification has been successfully approved. Your account now has full access to all platform features.", "success")}
    
    ${emailCard(`
      <p style="margin: 0 0 16px; color: ${colors.white}; font-size: 16px; font-weight: 600;">You now have access to:</p>
      ${emailFeatureList([
        { icon: "💰", text: "Unlimited deposits and withdrawals" },
        { icon: "📈", text: "Higher trading limits" },
        { icon: "⭐", text: "Access to premium features" },
        { icon: "🎧", text: "Priority customer support" },
      ])}
    `)}
    
    ${emailButton("Go to Dashboard", `${baseUrl}/dashboard`)}
    
    ${emailParagraph("Thank you for completing your verification and trusting M4 Capital with your investments!")}
    
    ${emailSignature()}
  `);

// KYC Rejected (to user)
export const kycRejectedTemplate = (userName: string, reason: string) =>
  emailTemplate(`
    ${emailHero("📋", "KYC Verification Update", "Action required on your submission", "warning")}
    
    ${emailGreeting(userName)}
    
    ${emailParagraph("Unfortunately, we were unable to approve your KYC verification at this time. Please review the feedback below and resubmit your documents.")}
    
    ${emailCard(`
      <p style="margin: 0 0 8px; color: ${colors.grayLight}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Reason for Review</p>
      <p style="margin: 0; color: ${colors.white}; font-size: 15px; line-height: 1.6;">${reason}</p>
    `, colors.warning)}
    
    ${emailCard(`
      <p style="margin: 0 0 16px; color: ${colors.white}; font-size: 16px; font-weight: 600;">📝 Common Issues to Check</p>
      ${emailFeatureList([
        { icon: "📷", text: "Ensure all documents are clear and legible" },
        { icon: "🖼️", text: "Verify that photos are not blurry or cut off" },
        { icon: "🤳", text: "Make sure your selfie clearly shows your face" },
        { icon: "✓", text: "Confirm all information matches across documents" },
        { icon: "📅", text: "Check that documents are valid and not expired" },
      ])}
    `)}
    
    ${emailButton("Resubmit Documents", `${baseUrl}/settings`)}
    
    ${emailParagraph("If you have any questions or need assistance, please contact our support team.")}
    
    ${emailSignature()}
  `);

// New KYC Submission (to admin)
export const kycAdminNotificationTemplate = (
  userName: string,
  userEmail: string,
  userId: string,
  kycId: string
) =>
  emailTemplate(`
    ${emailHero("🔔", "New KYC Submission", "A user has submitted documents for review", "info")}
    
    ${emailAlert("A new KYC verification has been submitted and requires your review.", "info", "👤")}
    
    ${emailTransactionTable([
      { label: "User Name", value: userName },
      { label: "Email", value: userEmail },
      { label: "User ID", value: userId.substring(0, 12) + "..." },
      { label: "KYC ID", value: kycId.substring(0, 12) + "..." },
      { label: "Status", value: emailBadge("Pending Review", "pending") },
    ])}
    
    ${emailButton("Review Submission", `${baseUrl}/admin/kyc`)}
    
    ${emailParagraph("Please review the submitted documents and approve or reject the verification in a timely manner.")}
    
    ${emailDivider()}
    
    <p style="margin: 0; color: ${colors.gray}; font-size: 13px; text-align: center;">
      This notification was sent to all admin users.
    </p>
  `);

// ============================================================================
// PLAIN TEXT EMAIL TEMPLATES
// ============================================================================

// Plain text versions for email clients that don't support HTML
export const kycSubmissionTextTemplate = (userName: string) => `
📋 KYC VERIFICATION SUBMITTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi ${userName},

Thank you for submitting your KYC (Know Your Customer) verification documents. We have received your application and our compliance team is now reviewing it.

⏱️ WHAT HAPPENS NEXT?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Our compliance team reviews your documents within 24-48 hours
• You will receive an email once the review is complete
• Check status anytime: ${baseUrl}/settings

If you have any questions, please contact our support team.

Best regards,
The M4 Capital Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© ${currentYear} M4 Capital. All rights reserved.
`;

export const kycApprovedTextTemplate = (userName: string) => `
🎉 KYC VERIFICATION APPROVED!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi ${userName},

Congratulations! Your KYC verification has been approved. Your account is now fully verified.

✅ YOU NOW HAVE ACCESS TO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Unlimited deposits and withdrawals
• Higher trading limits
• Access to premium features
• Priority customer support

Go to Dashboard: ${baseUrl}/dashboard

Thank you for completing your verification!

Best regards,
The M4 Capital Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© ${currentYear} M4 Capital. All rights reserved.
`;

export const kycRejectedTextTemplate = (userName: string, reason: string) => `
📋 KYC VERIFICATION UPDATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi ${userName},

Unfortunately, we were unable to approve your KYC verification at this time.

REASON:
${reason}

📝 COMMON ISSUES TO CHECK:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Ensure all documents are clear and legible
• Verify that photos are not blurry or cut off
• Make sure your selfie clearly shows your face
• Confirm all information matches across documents
• Check that documents are valid and not expired

Resubmit Documents: ${baseUrl}/settings

If you have any questions, please contact our support team.

Best regards,
The M4 Capital Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© ${currentYear} M4 Capital. All rights reserved.
`;

export const kycAdminNotificationTextTemplate = (
  userName: string,
  userEmail: string,
  userId: string,
  kycId: string
) => `
🔔 NEW KYC SUBMISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A new KYC verification has been submitted and requires review.

👤 USER DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Name: ${userName}
• Email: ${userEmail}
• User ID: ${userId}
• KYC ID: ${kycId}

Please review the submitted documents and approve or reject the verification.

Review KYC: ${baseUrl}/admin/kyc

This notification was sent to all admin users.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© ${currentYear} M4 Capital. All rights reserved.
`;

// ============================================================================
// EMAIL VERIFICATION CODE TEMPLATE
// ============================================================================

// Email Verification Code Template
export const verificationCodeTemplate = (name: string, code: string) => `
  ${emailHero("✉️", "Verify Your Email", `Welcome to M4 Capital, ${name}!`, "primary")}
  
  ${emailParagraph("To complete your registration and secure your account, please use the verification code below:")}
  
  ${emailCode(code, 15)}
  
  ${emailAlert("For your security, never share this code with anyone. M4 Capital will never ask you for this code via phone or message.", "warning", "🔒")}
  
  ${emailCard(`
    <p style="margin: 0 0 12px; color: ${colors.white}; font-size: 15px; font-weight: 600;">What's Next?</p>
    <p style="margin: 0; color: ${colors.grayLight}; font-size: 14px; line-height: 1.6;">
      After verifying your email, you'll have full access to M4 Capital's trading platform, real-time market data, and portfolio management tools.
    </p>
  `)}
  
  ${emailDivider()}
  
  <p style="margin: 0; color: ${colors.gray}; font-size: 13px; text-align: center;">
    If you didn't create an account with M4 Capital, you can safely ignore this email.
  </p>
`;

// ============================================================================
// WELCOME EMAIL TEMPLATE
// ============================================================================

// Welcome Email Template (after verification)
export const welcomeEmailTemplate = (name: string) => emailTemplate(`
  ${emailHero("🚀", "Welcome to M4 Capital!", `Your account is ready, ${name}`, "success")}
  
  ${emailAlert("Your email has been successfully verified and your account is now active!", "success")}
  
  ${emailCard(`
    <p style="margin: 0 0 16px; color: ${colors.white}; font-size: 16px; font-weight: 600;">🌟 Getting Started</p>
    ${emailFeatureList([
      { icon: "📊", text: "Monitor real-time cryptocurrency prices" },
      { icon: "💼", text: "Build and manage your investment portfolio" },
      { icon: "📈", text: "Access trading signals and market insights" },
      { icon: "🔐", text: "Complete KYC verification for full access" },
    ])}
  `)}
  
  ${emailButton("Start Trading Now", `${baseUrl}/dashboard`)}
  
  ${emailCard(`
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td width="50" style="vertical-align: top;">
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, ${colors.info} 0%, ${colors.infoDark} 100%); border-radius: 50%; text-align: center; line-height: 40px; font-size: 18px;">💡</div>
        </td>
        <td style="vertical-align: top; padding-left: 12px;">
          <p style="margin: 0 0 4px; color: ${colors.white}; font-size: 15px; font-weight: 600;">Pro Tip</p>
          <p style="margin: 0; color: ${colors.grayLight}; font-size: 14px; line-height: 1.5;">
            Connect your Telegram account for instant notifications about deposits, trades, and market updates. Visit Settings to link your account.
          </p>
        </td>
      </tr>
    </table>
  `)}
  
  ${emailSignature()}
`);

// ============================================================================
// TELEGRAM LINKING TEMPLATES
// ============================================================================

// Telegram Linking Success Template
export const telegramLinkSuccessTemplate = (
  name: string,
  telegramUsername: string
) =>
  emailTemplate(`
    ${emailHero("🔗", "Telegram Connected!", `Your account is now linked`, "success")}
    
    ${emailGreeting(name)}
    
    ${emailAlert(`Successfully connected to <strong>@${telegramUsername}</strong>`, "success", "✅")}
    
    ${emailCard(`
      <p style="margin: 0 0 16px; color: ${colors.white}; font-size: 16px; font-weight: 600;">📱 What You Can Do Now</p>
      ${emailFeatureList([
        { icon: "💰", text: "Check your balance with /balance command" },
        { icon: "📊", text: "View your portfolio with /portfolio command" },
        { icon: "🔔", text: "Receive instant deposit & withdrawal notifications" },
        { icon: "📈", text: "Get real-time crypto price updates" },
        { icon: "⚡", text: "Set custom price alerts" },
      ])}
    `)}
    
    ${emailAlert("Use the <strong>/help</strong> command in Telegram to see all available commands and features.", "info", "💡")}
    
    ${emailButton("View Settings", `${baseUrl}/settings`)}
    
    ${emailDivider()}
    
    <p style="margin: 0; color: ${colors.gray}; font-size: 13px; text-align: center;">
      🔒 If you didn't authorize this connection, please unlink the account immediately and change your password.
    </p>
  `);

export const telegramUnlinkTemplate = (
  name: string,
  telegramUsername: string
) =>
  emailTemplate(`
    ${emailHero("🔓", "Telegram Disconnected", `Your account has been unlinked`, "warning")}
    
    ${emailGreeting(name)}
    
    ${emailAlert(`Disconnected from <strong>@${telegramUsername}</strong>`, "warning", "📵")}
    
    ${emailCard(`
      <p style="margin: 0 0 16px; color: ${colors.white}; font-size: 16px; font-weight: 600;">What This Means</p>
      ${emailFeatureList([
        { icon: "🚫", text: "You will no longer receive Telegram notifications" },
        { icon: "📱", text: "Telegram commands (/balance, /portfolio) are disabled" },
        { icon: "🔒", text: "Your account security remains intact" },
        { icon: "🔄", text: "You can reconnect anytime from your settings" },
      ])}
    `)}
    
    ${emailButton("Reconnect Telegram", `${baseUrl}/settings`)}
    
    ${emailDivider()}
    
    <p style="margin: 0; color: ${colors.gray}; font-size: 13px; text-align: center;">
      ⚠️ If you didn't authorize this disconnection, please secure your account immediately.
    </p>
  `);

// ============================================================================
// PASSWORD RESET TEMPLATE
// ============================================================================

// Password Reset Email Template
export const passwordResetTemplate = (name: string, resetUrl: string) => emailTemplate(`
  ${emailHero("🔐", "Password Reset Request", "We received a request to reset your password", "warning")}
  
  ${emailGreeting(name)}
  
  ${emailParagraph("We received a request to reset your password for your M4 Capital account. If you made this request, click the button below to create a new password:")}
  
  ${emailButton("Reset My Password", resetUrl)}
  
  ${emailCard(`
    <p style="margin: 0 0 8px; color: ${colors.grayLight}; font-size: 13px;">Or copy and paste this link into your browser:</p>
    <p style="margin: 0; color: ${colors.primary}; font-size: 13px; word-break: break-all; background: rgba(99, 102, 241, 0.1); padding: 12px; border-radius: 8px; font-family: monospace;">
      ${resetUrl}
    </p>
  `)}
  
  ${emailAlert("This link will expire in <strong>1 hour</strong> for security reasons.", "warning", "⏱️")}
  
  ${emailDivider()}
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td>
        <p style="margin: 0 0 8px; color: ${colors.grayLight}; font-size: 14px;">
          <strong>🛡️ Didn't request this?</strong>
        </p>
        <p style="margin: 0; color: ${colors.gray}; font-size: 13px; line-height: 1.6;">
          If you didn't request a password reset, please ignore this email or contact our support team if you have concerns about your account security.
        </p>
      </td>
    </tr>
  </table>
  
  ${emailSignature()}
`);

// ============================================================================
// CRYPTO TRANSACTION TEMPLATES
// ============================================================================

// Crypto Purchase Confirmation Template
export const cryptoPurchaseTemplate = (
  userName: string,
  asset: string,
  amount: number,
  price: number,
  totalCost: number,
  newBalance: number,
  currencyCode: string = "USD",
  currencySymbol: string = "$"
) =>
  emailTemplate(`
    ${emailHero("🎉", "Purchase Successful!", `You bought ${asset}`, "success")}
    
    ${emailGreeting(userName)}
    
    ${emailParagraph("Great news! Your cryptocurrency purchase has been completed successfully and added to your portfolio.")}
    
    ${emailTransactionTable([
      { label: "Asset", value: `<strong style="color: ${colors.primary};">${asset}</strong>` },
      { label: "Amount Purchased", value: `${amount.toFixed(8)} ${asset}` },
      { label: "Price per Unit", value: `${currencySymbol}${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { label: "Total Cost", value: `-${currencySymbol}${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: colors.danger },
      { label: "New Balance", value: `${currencySymbol}${newBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, highlight: true },
    ])}
    
    ${emailButton("View Portfolio", `${baseUrl}/dashboard`)}
    
    ${emailAlert("Your crypto is now available in your portfolio and ready to track!", "success", "✅")}
    
    ${emailSignature()}
  `);

// Crypto Purchase Text Template (plain text version)
export const cryptoPurchaseTextTemplate = (
  userName: string,
  asset: string,
  amount: number,
  price: number,
  totalCost: number,
  newBalance: number,
  currencyCode: string = "USD",
  currencySymbol: string = "$"
) => `
🎉 Crypto Purchase Successful!

Hi ${userName},

Your cryptocurrency purchase has been completed successfully.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 TRANSACTION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Asset: ${asset}
Amount: ${amount.toFixed(8)} ${asset}
Price per Unit: ${currencySymbol}${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Total Cost: -${currencySymbol}${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
New Balance: ${currencySymbol}${newBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Your ${asset} has been added to your portfolio!

View Portfolio: ${baseUrl}/dashboard

Best regards,
The M4 Capital Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© ${currentYear} M4 Capital. All rights reserved.
`;

// ============================================================================
// CRYPTO SALE TEMPLATE
// ============================================================================

// Crypto Sale Confirmation Template
export const cryptoSaleTemplate = (
  userName: string,
  asset: string,
  assetName: string,
  amount: number,
  price: number,
  totalValue: number,
  fee: number,
  netReceived: number,
  newBalance: number,
  currencySymbol: string = "$"
) =>
  emailTemplate(`
    ${emailHero("💰", "Sale Successful!", `You sold ${asset}`, "success")}
    
    ${emailGreeting(userName)}
    
    ${emailParagraph(`Your ${assetName} (${asset}) sale has been completed and the funds have been credited to your account.`)}
    
    ${emailTransactionTable([
      { label: "Asset", value: `<strong style="color: ${colors.primary};">${assetName} (${asset})</strong>` },
      { label: "Amount Sold", value: `${amount.toFixed(8)} ${asset}` },
      { label: "Price per Unit", value: `${currencySymbol}${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { label: "Total Value", value: `${currencySymbol}${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { label: "Fee (1.5%)", value: `-${currencySymbol}${fee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: colors.warning },
      { label: "Net Received", value: `+${currencySymbol}${netReceived.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, highlight: true },
      { label: "New Balance", value: `${currencySymbol}${newBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: colors.success },
    ])}
    
    ${emailButton("View Portfolio", `${baseUrl}/dashboard`)}
    
    ${emailAlert("Funds have been credited to your account balance.", "success", "✅")}
    
    ${emailSignature()}
  `);

// Crypto Sale Text Template
export const cryptoSaleTextTemplate = (
  userName: string,
  asset: string,
  assetName: string,
  amount: number,
  price: number,
  totalValue: number,
  fee: number,
  netReceived: number,
  newBalance: number,
  currencySymbol: string = "$"
) => `
💰 Crypto Sale Successful!

Hi ${userName},

Your ${assetName} (${asset}) sale has been completed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 TRANSACTION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Asset: ${assetName} (${asset})
Amount Sold: ${amount.toFixed(8)} ${asset}
Price per Unit: ${currencySymbol}${price.toFixed(2)}
Total Value: ${currencySymbol}${totalValue.toFixed(2)}
Fee (1.5%): -${currencySymbol}${fee.toFixed(2)}
Net Received: +${currencySymbol}${netReceived.toFixed(2)}
New Balance: ${currencySymbol}${newBalance.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Funds have been credited to your account!

View Portfolio: ${baseUrl}/dashboard

Best regards,
The M4 Capital Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© ${currentYear} M4 Capital. All rights reserved.
`;

// ============================================================================
// DEPOSIT CONFIRMATION TEMPLATES
// ============================================================================

// Deposit Confirmed Template
export const depositConfirmedTemplate = (
  userName: string,
  amount: string,
  asset: string,
  currencySymbol: string = "$",
  transactionId?: string,
  isCrypto: boolean = false
) =>
  emailTemplate(`
    ${emailHero("✅", "Deposit Confirmed!", `Your ${asset} deposit is complete`, "success")}
    
    ${emailGreeting(userName)}
    
    ${emailParagraph("Great news! Your deposit has been confirmed and credited to your account.")}
    
    ${emailTransactionTable([
      { label: "Amount", value: isCrypto ? `${amount} ${asset}` : `${currencySymbol}${amount}` },
      { label: "Asset", value: asset },
      { label: "Status", value: emailBadge("Completed", "success") },
      ...(transactionId ? [{ label: "Transaction ID", value: transactionId.substring(0, 16) + "..." }] : []),
      { label: "Date", value: new Date().toLocaleString() },
    ])}
    
    ${emailAlert("Your funds are now available! You can start trading immediately.", "success", "🚀")}
    
    ${emailButton("Go to Dashboard", `${baseUrl}/dashboard`)}
    
    ${emailSignature()}
  `);

// Deposit Pending Template
export const depositPendingTemplate = (
  userName: string,
  amount: string,
  asset: string,
  currencySymbol: string = "$",
  confirmationsRequired: number = 6,
  isCrypto: boolean = false
) =>
  emailTemplate(`
    ${emailHero("⏳", "Deposit Pending", `Waiting for ${asset} confirmation`, "info")}
    
    ${emailGreeting(userName)}
    
    ${emailParagraph("We've received your deposit and it's currently being processed. Your funds will be credited once the required confirmations are complete.")}
    
    ${emailTransactionTable([
      { label: "Amount", value: isCrypto ? `${amount} ${asset}` : `${currencySymbol}${amount}` },
      { label: "Asset", value: asset },
      { label: "Status", value: emailBadge("Pending", "pending") },
      { label: "Required Confirmations", value: confirmationsRequired.toString() },
    ])}
    
    ${emailAlert("You will receive another email once the deposit is fully confirmed and credited to your account.", "info", "📧")}
    
    ${emailButton("Check Status", `${baseUrl}/dashboard`)}
    
    ${emailSignature()}
  `);

// ============================================================================
// ADMIN NOTIFICATION TEMPLATES
// ============================================================================

// User Role Update Template (for promotions/demotions)
export const roleUpdateTemplate = (
  userName: string,
  newRole: string,
  isPromotion: boolean = true
) =>
  emailTemplate(`
    ${emailHero(isPromotion ? "🎉" : "📋", isPromotion ? "Congratulations!" : "Role Update", `Your account role has been updated`, isPromotion ? "success" : "info")}
    
    ${emailGreeting(userName)}
    
    ${emailParagraph(`Your M4 Capital account role has been ${isPromotion ? "upgraded" : "updated"} to <strong>${newRole}</strong>.`)}
    
    ${isPromotion ? emailAlert("You now have access to additional administrative features and capabilities.", "success", "⭐") : emailAlert("Your account permissions have been updated accordingly.", "info", "ℹ️")}
    
    ${emailButton("View Dashboard", `${baseUrl}/dashboard`)}
    
    ${emailParagraph("If you have any questions about your new role or permissions, please contact the admin team.")}
    
    ${emailSignature()}
  `);

export const roleUpdateTextTemplate = (
  userName: string,
  newRole: string,
  isPromotion: boolean = true
) =>
  `Hi ${userName}, your M4 Capital account role has been ${isPromotion ? "upgraded" : "updated"} to ${newRole}. ${isPromotion ? "You now have access to additional administrative features and capabilities." : "Your account permissions have been updated accordingly."}`;

export const adminRoleNotificationTemplate = (
  userName: string,
  userEmail: string,
  userId: string,
  previousRole: string,
  newRole: string,
  isPromotion: boolean = true
) =>
  emailTemplate(`
    ${emailHero(isPromotion ? "⬆️" : "⬇️", isPromotion ? "Staff Promotion" : "Role Change", `A user's role has been ${isPromotion ? "upgraded" : "updated"}`, isPromotion ? "success" : "warning")}
    
    ${emailCard(`
      <table width="100%" cellpadding="8" cellspacing="0" border="0">
        <tr>
          <td width="120" style="color: ${colors.textMuted}; font-size: 14px;">Name:</td>
          <td style="color: ${colors.textPrimary}; font-size: 14px; font-weight: 600;">${userName}</td>
        </tr>
        <tr>
          <td width="120" style="color: ${colors.textMuted}; font-size: 14px;">Email:</td>
          <td style="color: ${colors.textPrimary}; font-size: 14px;">${userEmail}</td>
        </tr>
        <tr>
          <td width="120" style="color: ${colors.textMuted}; font-size: 14px;">User ID:</td>
          <td style="color: ${colors.textPrimary}; font-size: 14px; font-family: monospace;">${userId}</td>
        </tr>
        <tr>
          <td width="120" style="color: ${colors.textMuted}; font-size: 14px;">Previous Role:</td>
          <td>${emailBadge(previousRole, "info")}</td>
        </tr>
        <tr>
          <td width="120" style="color: ${colors.textMuted}; font-size: 14px;">New Role:</td>
          <td>${emailBadge(newRole, isPromotion ? "success" : "warning")}</td>
        </tr>
      </table>
    `)}
    
    ${emailAlert(`This is an automated notification. ${isPromotion ? "The user now has access to administrative features." : "The user's permissions have been adjusted accordingly."}`, "info", "🔔")}
    
    ${emailButton("View Users", `${baseUrl}/admin/users`)}
    
    ${emailSignature()}
  `);

export const adminRoleNotificationTextTemplate = (
  userName: string,
  userEmail: string,
  previousRole: string,
  newRole: string,
  isPromotion: boolean = true
) =>
  `A user has been ${isPromotion ? "promoted" : "updated"}: ${userName} (${userEmail}). Previous Role: ${previousRole}. New Role: ${newRole}.`;

// Crypto Swap/Convert Template
export const cryptoSwapTemplate = (
  fromAsset: string,
  toAsset: string,
  amount: number,
  receiveAmount: number,
  rate: number,
  feePercent: number,
  feeAmount: number,
  fromDisplayValue: string,
  toDisplayValue: string,
  currencySymbol: string
) =>
  emailTemplate(`
    ${emailHero("🔄", "Swap Completed!", `${fromAsset} → ${toAsset}`, "info")}
    
    ${emailCard(`
      <table width="100%" cellpadding="8" cellspacing="0" border="0">
        <tr>
          <td style="padding: 12px 0;">
            <div style="color: ${colors.danger}; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">FROM</div>
            <div style="color: ${colors.textPrimary}; font-size: 20px; font-weight: 700;">${amount.toFixed(8)} ${fromAsset}</div>
            <div style="color: ${colors.textMuted}; font-size: 14px; margin-top: 4px;">≈ ${currencySymbol}${fromDisplayValue}</div>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; padding: 8px 0;">
            <div style="display: inline-block; width: 40px; height: 40px; background: ${colors.primary}20; border-radius: 50%; line-height: 40px; font-size: 20px;">↓</div>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0;">
            <div style="color: ${colors.success}; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">TO</div>
            <div style="color: ${colors.textPrimary}; font-size: 20px; font-weight: 700;">${receiveAmount.toFixed(8)} ${toAsset}</div>
            <div style="color: ${colors.textMuted}; font-size: 14px; margin-top: 4px;">≈ ${currencySymbol}${toDisplayValue}</div>
          </td>
        </tr>
      </table>
    `, colors.info)}
    
    ${emailCard(`
      <table width="100%" cellpadding="8" cellspacing="0" border="0">
        <tr>
          <td style="color: ${colors.textMuted}; font-size: 14px; padding: 8px 0;">Exchange Rate</td>
          <td align="right" style="color: ${colors.textPrimary}; font-size: 14px; padding: 8px 0; font-weight: 600;">1 ${fromAsset} = ${rate.toFixed(8)} ${toAsset}</td>
        </tr>
        <tr>
          <td style="color: ${colors.textMuted}; font-size: 14px; padding: 8px 0;">Fee (${feePercent}%)</td>
          <td align="right" style="color: ${colors.textPrimary}; font-size: 14px; padding: 8px 0;">${feeAmount.toFixed(8)} ${toAsset}</td>
        </tr>
        <tr>
          <td style="color: ${colors.textMuted}; font-size: 14px; padding: 8px 0;">Status</td>
          <td align="right" style="padding: 8px 0;">${emailBadge("Completed", "success")}</td>
        </tr>
      </table>
    `)}
    
    ${emailButton("View Portfolio", `${baseUrl}/dashboard`)}
    
    ${emailSignature()}
  `);

export const cryptoSwapTextTemplate = (
  fromAsset: string,
  toAsset: string,
  amount: number,
  receiveAmount: number,
  rate: number,
  feeAmount: number
) =>
  `Swap Completed! You swapped ${amount.toFixed(8)} ${fromAsset} for ${receiveAmount.toFixed(8)} ${toAsset}. Exchange Rate: 1 ${fromAsset} = ${rate.toFixed(8)} ${toAsset}. Fee: ${feeAmount.toFixed(8)} ${toAsset}. Thank you for using M4 Capital!`;
