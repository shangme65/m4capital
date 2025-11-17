import { generateId } from "@/lib/generate-id";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import speakeasy from "speakeasy";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();

    // Validation
    if (!code) {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        twoFactorSecret: true,
        twoFactorMethod: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "Two-factor authentication is already enabled" },
        { status: 400 }
      );
    }

    if (!user.twoFactorSecret || !user.twoFactorMethod) {
      return NextResponse.json(
        { error: "Please setup 2FA first before verifying" },
        { status: 400 }
      );
    }

    // Verify code based on method
    if (user.twoFactorMethod === "APP") {
      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: code,
        window: 2, // Allow 2 time steps before/after for clock drift
      });

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid verification code" },
          { status: 400 }
        );
      }
    } else if (user.twoFactorMethod === "EMAIL") {
      // For email method, code validation would happen during login
      // For now, we'll just enable it
      return NextResponse.json(
        { error: "Email 2FA is automatically enabled on login" },
        { status: 400 }
      );
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    });

    // Create notification
    await prisma.notification.create({
      data: {
            id: generateId(),
        userId: user.id,
        type: "INFO",
        title: "Two-Factor Authentication Enabled",
        message: `You have successfully enabled ${
          user.twoFactorMethod === "APP" ? "authenticator app" : "email"
        } two-factor authentication for your account. Your account is now more secure.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Two-factor authentication enabled successfully",
      method: user.twoFactorMethod,
    });
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    return NextResponse.json(
      { error: "Failed to verify two-factor authentication" },
      { status: 500 }
    );
  }
}
