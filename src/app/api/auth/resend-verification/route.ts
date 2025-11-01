import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateVerificationCode,
  getVerificationExpiry,
  sendVerificationEmail,
} from "@/lib/email-verification";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
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

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationExpires = getVerificationExpiry();

    // Update user with new code
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        emailVerificationCode: verificationCode,
        emailVerificationExpires: verificationExpires,
      },
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(
      normalizedEmail,
      user.name || "User",
      verificationCode
    );

    if (!emailSent) {
      console.error("Failed to send verification email to:", normalizedEmail);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send verification email. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("RESEND_VERIFICATION_ERROR", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
