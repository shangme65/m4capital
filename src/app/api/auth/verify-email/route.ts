import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  isVerificationCodeExpired,
  isValidVerificationCodeFormat,
} from "@/lib/email-verification";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "Email and verification code are required" },
        { status: 400 }
      );
    }

    // Validate code format
    if (!isValidVerificationCodeFormat(code)) {
      return NextResponse.json(
        { success: false, message: "Invalid verification code format" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return NextResponse.json(
        { success: false, message: "Email already verified" },
        { status: 400 }
      );
    }

    // Check if code exists
    if (!user.emailVerificationCode) {
      return NextResponse.json(
        {
          success: false,
          message: "No verification code found. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // Check if code matches
    if (user.emailVerificationCode !== code) {
      return NextResponse.json(
        { success: false, message: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Check if code expired
    if (isVerificationCodeExpired(user.emailVerificationExpires)) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification code has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // Mark user as verified and clear verification code
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        isEmailVerified: true,
        emailVerificationCode: null,
        emailVerificationExpires: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You can now sign in.",
    });
  } catch (error) {
    console.error("EMAIL_VERIFICATION_ERROR", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
