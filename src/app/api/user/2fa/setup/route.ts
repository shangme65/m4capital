import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

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
        name: `M4Capital (${user.email})`,
        issuer: "M4Capital",
        length: 32,
      });

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || "");

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
      // For email 2FA, we'll generate a code when needed
      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorMethod: "EMAIL",
          twoFactorEnabled: false, // Not enabled until verified
        },
      });

      return NextResponse.json({
        success: true,
        method: "EMAIL",
        message:
          "Email 2FA method set. You'll receive a verification code on your next login.",
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
