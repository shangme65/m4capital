import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { passwordResetTemplate } from "@/lib/email-templates";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists with this email, you will receive password reset instructions.",
      });
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires in 1 hour
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    // Delete any existing reset tokens for this user
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: `reset:${normalizedEmail}`,
      },
    });

    // Create new reset token
    await prisma.verificationToken.create({
      data: {
        identifier: `reset:${normalizedEmail}`,
        token: hashedToken,
        expires,
      },
    });

    // Generate reset URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(
      normalizedEmail
    )}`;

    // Send email
    const emailHtml = passwordResetTemplate(user.name || "User", resetUrl);

    await sendEmail({
      to: normalizedEmail,
      subject: "Password Reset Request - M4 Capital",
      html: emailHtml,
      text: `Hi ${
        user.name || "User"
      },\n\nYou requested to reset your password. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nM4 Capital Team`,
    });

    return NextResponse.json({
      success: true,
      message:
        "If an account exists with this email, you will receive password reset instructions.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process request. Please try again.",
      },
      { status: 500 }
    );
  }
}
