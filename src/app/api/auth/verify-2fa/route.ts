import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";

// Verify 2FA code before actual login
export async function POST(request: NextRequest) {
  try {
    const { email, password, code, method } = await request.json();

    if (!email || !password || !code) {
      return NextResponse.json(
        { error: "Email, password, and code are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify 2FA
    if (method === "APP") {
      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret || "",
        encoding: "base32",
        token: code,
        window: 2,
      });

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid verification code" },
          { status: 400 }
        );
      }
    } else if (method === "EMAIL") {
      const storedData = (user as any).twoFactorLoginCode;
      if (!storedData) {
        return NextResponse.json(
          { error: "Verification code expired. Please request a new one." },
          { status: 400 }
        );
      }

      const [storedCode, timestamp] = storedData.split(":");
      const codeAge = Date.now() - parseInt(timestamp);
      const maxAge = 10 * 60 * 1000; // 10 minutes

      if (codeAge > maxAge) {
        return NextResponse.json(
          { error: "Verification code expired. Please request a new one." },
          { status: 400 }
        );
      }

      if (storedCode !== code) {
        return NextResponse.json(
          { error: "Invalid verification code" },
          { status: 400 }
        );
      }

      // Clear the login code after successful verification
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorLoginCode: null } as any,
      });
    }

    // 2FA verified successfully
    return NextResponse.json(
      { verified: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("2FA verify error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
