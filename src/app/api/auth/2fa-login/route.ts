import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/email";

// Generate a 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if 2FA is enabled
    if (!(user as any).twoFactorEnabled) {
      return NextResponse.json(
        { error: "2FA is not enabled for this account" },
        { status: 400 }
      );
    }

    const twoFactorMethod = (user as any).twoFactorMethod;

    // If email 2FA, generate and send code
    if (twoFactorMethod === "EMAIL") {
      const code = generateCode();
      const timestamp = Date.now().toString();
      const loginCode = `${code}:${timestamp}`;

      // Store the login code
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorLoginCode: loginCode } as any,
      });

      // Send email with code
      await sendEmail({
        to: user.email!,
        subject: "M4Capital Login Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h3 style="color: #f97316;">Login Verification Code</h3>
            <p>Your login verification code is:</p>
            <div style="background-color: #1f1f1f; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #f97316; letter-spacing: 8px;">${code}</span>
            </div>
            <p style="color: #666;">This code will expire in 10 minutes.</p>
            <p style="color: #666; font-size: 12px;">If you didn't request this code, please secure your account immediately.</p>
          </div>
        `,
      });

      return NextResponse.json({
        success: true,
        method: "email",
        message: "Verification code sent to your email",
      });
    }

    // For APP method, just confirm it's required (code verification happens in signIn)
    if (twoFactorMethod === "APP") {
      return NextResponse.json({
        success: true,
        method: "authenticator",
        message: "Enter the code from your authenticator app",
      });
    }

    return NextResponse.json(
      { error: "Unknown 2FA method" },
      { status: 400 }
    );
  } catch (error) {
    console.error("2FA login error:", error);
    return NextResponse.json(
      { error: "Failed to process 2FA login" },
      { status: 500 }
    );
  }
}
