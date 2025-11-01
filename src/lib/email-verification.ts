import { sendEmail } from "./email";
import { emailTemplate, verificationCodeTemplate } from "./email-templates";

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Calculate verification code expiration time (15 minutes from now)
 */
export function getVerificationExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 15);
  return expiry;
}

/**
 * Send email verification code to user
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  code: string
): Promise<boolean> {
  try {
    const subject = "Verify Your Email - M4 Capital";
    const html = emailTemplate(verificationCodeTemplate(name, code));
    const text = `
Welcome to M4 Capital, ${name}!

Your verification code is: ${code}

This code will expire in 15 minutes.

If you didn't create an account with M4 Capital, you can safely ignore this email.

Security Tip: Never share this code with anyone. M4 Capital will never ask you for this code.
    `.trim();

    await sendEmail({ to: email, subject, html, text });
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
}

/**
 * Check if verification code has expired
 */
export function isVerificationCodeExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true;
  return new Date() > expiresAt;
}

/**
 * Validate verification code format
 */
export function isValidVerificationCodeFormat(code: string): boolean {
  return /^\d{6}$/.test(code);
}
