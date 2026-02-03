import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Check if user needs 2FA before actual login
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

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        password: true,
        twoFactorEnabled: true,
        twoFactorMethod: true,
        isEmailVerified: true,
        role: true,
        createdAt: true,
      },
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

    // Check email verification
    const emailVerificationStartDate = new Date("2025-11-01");
    if (
      user.role !== "ADMIN" &&
      !user.isEmailVerified &&
      user.createdAt >= emailVerificationStartDate
    ) {
      return NextResponse.json(
        { requiresEmailVerification: true },
        { status: 200 }
      );
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled && user.twoFactorMethod) {
      return NextResponse.json(
        {
          requires2FA: true,
          method: user.twoFactorMethod,
        },
        { status: 200 }
      );
    }

    // No 2FA required, proceed with login
    return NextResponse.json(
      { requires2FA: false },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login check error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
