import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Create and store a verification token with code
 */
export async function createVerificationToken(email: string): Promise<string> {
  const code = generateVerificationCode();
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + 15); // Code expires in 15 minutes

  // Delete any existing verification tokens for this email
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: email.toLowerCase(),
    },
  });

  // Create new verification token
  await prisma.verificationToken.create({
    data: {
      identifier: email.toLowerCase(),
      token: code,
      expires,
    },
  });

  return code;
}

/**
 * Verify a code for a given email
 */
export async function verifyCode(
  email: string,
  code: string
): Promise<{ valid: boolean; error?: string }> {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      identifier: email.toLowerCase(),
      token: code,
    },
  });

  if (!verificationToken) {
    return { valid: false, error: "Invalid verification code" };
  }

  if (verificationToken.expires < new Date()) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: {
        token: verificationToken.token,
      },
    });
    return { valid: false, error: "Verification code has expired" };
  }

  // Code is valid - delete the token so it can't be reused
  await prisma.verificationToken.delete({
    where: {
      token: verificationToken.token,
    },
  });

  return { valid: true };
}

/**
 * Check if a verification token exists and is not expired
 */
export async function hasValidVerificationToken(
  email: string
): Promise<boolean> {
  const token = await prisma.verificationToken.findFirst({
    where: {
      identifier: email.toLowerCase(),
      expires: {
        gt: new Date(),
      },
    },
  });

  return !!token;
}
