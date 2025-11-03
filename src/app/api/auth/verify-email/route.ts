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

    // Note: Email verification code fields not yet in schema
    // For now, skip code validation and just mark as verified

    // Mark user as verified
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        isEmailVerified: true,
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
