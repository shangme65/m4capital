import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

// Generate a 6-digit code
function generateEmailCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { method } = await req.json();

    // Validate method
    if (!method || !["APP", "EMAIL"].includes(method)) {
      return NextResponse.json(
        { error: "Invalid 2FA method. Must be APP or EMAIL" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, twoFactorEnabled: true },
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

    if (method === "APP") {
      // Generate secret for authenticator app
      const secret = speakeasy.generateSecret({
        length: 20,
      });

      // Build the otpauth URL with all parameters for maximum compatibility
      const otpauthUrl = `otpauth://totp/M4Capital:${encodeURIComponent(user.email || "User")}?secret=${secret.base32}&issuer=M4Capital`;

      // Generate QR code with high quality settings for better scanning
      const qrCodeUrl = await QRCode.toDataURL(otpauthUrl, {
        errorCorrectionLevel: 'H',
        margin: 4,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Store secret temporarily (will be confirmed when user verifies)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorSecret: secret.base32,
          twoFactorMethod: "APP",
          twoFactorEnabled: false, // Not enabled until verified
        },
      });

      return NextResponse.json({
        success: true,
        method: "APP",
        secret: secret.base32,
        qrCode: qrCodeUrl,
        message:
          "Scan the QR code with your authenticator app, then verify the code to enable 2FA",
      });
    } else if (method === "EMAIL") {
      // Generate a verification code for email 2FA
      const verificationCode = generateEmailCode();
      const codeExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

      // Store the code and expiry temporarily using twoFactorSecret field
      // Format: "CODE:EXPIRY_TIMESTAMP"
      const secretWithExpiry = `${verificationCode}:${codeExpiry}`;

      // Store the code temporarily using twoFactorSecret field
      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorMethod: "EMAIL",
          twoFactorSecret: secretWithExpiry, // Store code with expiry
          twoFactorEnabled: false, // Not enabled until verified
        },
      });

      // Send the verification code via email
      try {
        const baseUrl = process.env.NEXTAUTH_URL || "https://m4capital.online";
        
        await sendEmail({
          to: user.email || "",
          subject: "Your M4Capital 2FA Verification Code",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; padding: 0;">
              <!-- Header with Logo -->
              <div style="text-align: center; padding: 24px 20px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                <img src="${baseUrl}/m4capitallogo1.png" alt="M4 Capital" width="140" style="display: inline-block; max-width: 140px; height: auto;" />
              </div>
              
              <!-- Content -->
              <div style="padding: 32px 24px;">
                <h2 style="color: #f97316; margin: 0 0 16px; font-size: 22px;">Enable Two-Factor Authentication</h2>
                <p style="color: #e2e8f0; margin: 0 0 12px; font-size: 15px;">Hello ${user.name || "there"},</p>
                <p style="color: #e2e8f0; margin: 0 0 20px; font-size: 15px;">You are setting up email-based two-factor authentication for your M4Capital account.</p>
                <p style="color: #e2e8f0; margin: 0 0 12px; font-size: 15px;">Your verification code is:</p>
                <div style="background: #1e293b; padding: 24px; border-radius: 12px; text-align: center; margin: 20px 0; border: 1px solid rgba(255, 255, 255, 0.1);">
                  <span style="font-size: 36px; font-weight: bold; color: #f97316; letter-spacing: 10px;">${verificationCode}</span>
                </div>
                <p style="color: #94a3b8; margin: 0 0 8px; font-size: 14px;">This code will expire in 10 minutes.</p>
                <p style="color: #64748b; font-size: 13px; margin: 0;">If you did not request this, please ignore this email.</p>
              </div>
              
              <!-- Footer -->
              <div style="padding: 20px 24px; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
                <p style="color: #64748b; font-size: 12px; margin: 0;">M4Capital Security Team</p>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send 2FA verification email:", emailError);
        return NextResponse.json(
          { error: "Failed to send verification email. Please try again." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        method: "EMAIL",
        requiresVerification: true,
        message: "Verification code sent to your email. Please enter the code to enable 2FA.",
      });
    }

    return NextResponse.json({ error: "Invalid 2FA method" }, { status: 400 });
  } catch (error) {
    console.error("Error setting up 2FA:", error);
    return NextResponse.json(
      { error: "Failed to setup two-factor authentication" },
      { status: 500 }
    );
  }
}
