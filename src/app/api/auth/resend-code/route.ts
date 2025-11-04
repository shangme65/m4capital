import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createVerificationToken,
  hasValidVerificationToken,
} from "@/lib/verification";
import { sendEmail } from "@/lib/email";
import { emailTemplate, verificationCodeTemplate } from "@/lib/email-templates";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return NextResponse.json(
        { success: false, error: "Email already verified" },
        { status: 400 }
      );
    }

    // Check if there's already a valid token (to prevent spam)
    const hasValidToken = await hasValidVerificationToken(normalizedEmail);
    if (hasValidToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A verification code was recently sent. Please check your email or wait before requesting a new code.",
        },
        { status: 429 } // Too Many Requests
      );
    }

    // Generate and send new verification code
    const verificationCode = await createVerificationToken(normalizedEmail);
    const emailContent = verificationCodeTemplate(
      user.name || "User",
      verificationCode
    );

    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: "Verify Your Email - M4 Capital",
      html: emailTemplate(emailContent),
      text: `Your M4 Capital verification code is: ${verificationCode}. This code will expire in 15 minutes.`,
    });

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send verification email. Please try again.",
        },
        { status: 500 }
      );
    }

    console.log(`Verification code resent to ${normalizedEmail}`);

    return NextResponse.json({
      success: true,
      message: "Verification code sent! Please check your email.",
    });
  } catch (error) {
    console.error("RESEND_CODE_ERROR", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
