import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { token, email, password } = await request.json();

    if (!token || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Hash the token to match what's stored in the database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find the reset token
    const resetToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: `reset:${normalizedEmail}`,
          token: hashedToken,
        },
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (new Date() > resetToken.expires) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: `reset:${normalizedEmail}`,
            token: hashedToken,
          },
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: "Reset token has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

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

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { password: hashedPassword },
    });

    // Delete the used reset token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: `reset:${normalizedEmail}`,
          token: hashedToken,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to reset password. Please try again.",
      },
      { status: 500 }
    );
  }
}
