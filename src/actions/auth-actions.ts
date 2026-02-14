"use server";

import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/generate-id";
import { generateAccountNumber } from "@/lib/p2p-transfer-utils";
import { createVerificationToken, verifyCode } from "@/lib/verification";
import { sendEmail } from "@/lib/email";
import { emailTemplate, verificationCodeTemplate } from "@/lib/email-templates";
import bcrypt from "bcryptjs";

interface ActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Sign up action - Create a new user account
 * Can be used with form action={signUpAction}
 */
export async function signUpAction(formData: FormData): Promise<ActionResult> {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const preferredCurrency =
      (formData.get("preferredCurrency") as string) || "USD";
    const accountType = (formData.get("accountType") as string) || "INVESTOR";

    // Validation
    if (!name || !email || !password) {
      return { success: false, error: "All fields are required" };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: "Invalid email format" };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters",
      };
    }

    if (confirmPassword && password !== confirmPassword) {
      return { success: false, error: "Passwords do not match" };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with portfolio
    const user = await prisma.user.create({
      data: {
        id: generateId(),
        name,
        email: normalizedEmail,
        password: hashedPassword,
        preferredCurrency,
        accountType: accountType === "TRADER" ? "TRADER" : "INVESTOR",
        accountNumber: generateAccountNumber(),
        isEmailVerified: false,
        updatedAt: new Date(),
        Portfolio: {
          create: {
            id: generateId(),
          },
        },
      },
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: user.id,
        type: "INFO",
        title: "Welcome to M4Capital! \uD83C\uDFE6",
        message:
          "To unlock the full potential of your account, please complete your KYC verification and make your first deposit. Once set up, you'll have access to our full suite of investment tools and start earning right away.",
      },
    });

    // Send verification email
    try {
      const verificationCode = await createVerificationToken(normalizedEmail);
      const emailContent = verificationCodeTemplate(name, verificationCode);

      await sendEmail({
        to: normalizedEmail,
        subject: "Verify Your Email - M4 Capital",
        html: emailTemplate(emailContent),
        text: `Your M4 Capital verification code is: ${verificationCode}. This code will expire in 15 minutes.`,
      });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Don't fail signup if email fails
    }

    return {
      success: true,
      data: {
        email: normalizedEmail,
        requiresVerification: true,
      },
    };
  } catch (error) {
    console.error("Sign up action error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create account",
    };
  }
}

/**
 * Verify email action - Verify user's email with code
 */
export async function verifyEmailAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const email = formData.get("email") as string;
    const code = formData.get("code") as string;

    if (!email || !code) {
      return {
        success: false,
        error: "Email and verification code are required",
      };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify the code using existing verification lib
    const result = await verifyCode(normalizedEmail, code);

    if (!result.valid) {
      return {
        success: false,
        error: result.error || "Invalid verification code",
      };
    }

    // Update user as verified
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        isEmailVerified: true,
        emailVerified: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Verify email action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify email",
    };
  }
}

/**
 * Resend verification code action
 */
export async function resendVerificationAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const email = formData.get("email") as string;

    if (!email) {
      return { success: false, error: "Email is required" };
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.isEmailVerified) {
      return { success: false, error: "Email is already verified" };
    }

    // Generate new code
    const verificationCode = await createVerificationToken(normalizedEmail);

    // Send email
    try {
      const emailContent = verificationCodeTemplate(
        user.name || "User",
        verificationCode
      );
      await sendEmail({
        to: normalizedEmail,
        subject: "Verify Your Email - M4 Capital",
        html: emailTemplate(emailContent),
        text: `Your M4 Capital verification code is: ${verificationCode}. This code will expire in 15 minutes.`,
      });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      return { success: false, error: "Failed to send verification email" };
    }

    return {
      success: true,
      data: { message: "Verification code sent" },
    };
  } catch (error) {
    console.error("Resend verification action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to resend code",
    };
  }
}

/**
 * Forgot password action - Request password reset
 */
export async function forgotPasswordAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const email = formData.get("email") as string;

    if (!email) {
      return { success: false, error: "Email is required" };
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Don't reveal if user exists for security
    if (!user) {
      return {
        success: true,
        data: { message: "If an account exists, a reset link has been sent" },
      };
    }

    // Generate reset token using verification system
    const resetToken = await createVerificationToken(normalizedEmail);

    // TODO: Send reset email with token

    return {
      success: true,
      data: { message: "If an account exists, a reset link has been sent" },
    };
  } catch (error) {
    console.error("Forgot password action error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to process request",
    };
  }
}

/**
 * Reset password action - Set new password with token
 */
export async function resetPasswordAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const email = formData.get("email") as string;
    const token = formData.get("token") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!email || !token || !password) {
      return { success: false, error: "All fields are required" };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters",
      };
    }

    if (confirmPassword && password !== confirmPassword) {
      return { success: false, error: "Passwords do not match" };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify the token
    const result = await verifyCode(normalizedEmail, token);
    if (!result.valid) {
      return { success: false, error: "Invalid or expired reset token" };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Reset password action error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to reset password",
    };
  }
}

/**
 * Change password action - For logged-in users
 */
export async function changePasswordAction(params: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult> {
  try {
    const { userId, currentPassword, newPassword } = params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      return { success: false, error: "User not found" };
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    if (newPassword.length < 6) {
      return {
        success: false,
        error: "New password must be at least 6 characters",
      };
    }

    // Hash and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Change password action error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to change password",
    };
  }
}
