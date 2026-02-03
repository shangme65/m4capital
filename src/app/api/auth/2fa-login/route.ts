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

      const baseUrl = process.env.NEXTAUTH_URL || "https://m4capital.online";

      // Send email with code
      await sendEmail({
        to: user.email!,
        subject: "M4Capital Login Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; padding: 0;">
            <!-- Header with Logo -->
            <div style="text-align: center; padding: 24px 20px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <img src="${baseUrl}/m4capitallogo1.png" alt="M4 Capital" width="140" style="display: inline-block; max-width: 140px; height: auto;" />
            </div>
            
            <!-- Content -->
            <div style="padding: 32px 24px;">
              <h2 style="color: #f97316; margin: 0 0 16px; font-size: 22px;">Login Verification Code</h2>
              <p style="color: #e2e8f0; margin: 0 0 20px; font-size: 15px;">Your login verification code is:</p>
              <div style="background: #1e293b; padding: 24px; border-radius: 12px; text-align: center; margin: 20px 0; border: 1px solid rgba(255, 255, 255, 0.1);">
                <span style="font-size: 36px; font-weight: bold; color: #f97316; letter-spacing: 10px;">${code}</span>
              </div>
              <p style="color: #94a3b8; margin: 0 0 8px; font-size: 14px;">This code will expire in 10 minutes.</p>
              <p style="color: #64748b; font-size: 13px; margin: 0;">If you didn't request this code, please secure your account immediately.</p>
            </div>
            
            <!-- Footer -->
            <div style="padding: 20px 24px; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">M4Capital Security Team</p>
            </div>
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
