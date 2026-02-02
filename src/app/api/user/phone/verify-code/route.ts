import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { phoneNumber, code } = await request.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: "Phone number and verification code are required" },
        { status: 400 }
      );
    }

    // Find the verification record
    const verification = await prisma.phoneVerification.findFirst({
      where: {
        phoneNumber,
        userId: session.user.id,
        verified: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "No verification code found. Please request a new code." },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (new Date() > verification.expiresAt) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Check if max attempts exceeded
    if (verification.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        {
          error:
            "Maximum verification attempts exceeded. Please request a new code.",
        },
        { status: 400 }
      );
    }

    // Increment attempts
    await prisma.phoneVerification.update({
      where: { id: verification.id },
      data: { attempts: verification.attempts + 1 },
    });

    // Check if code matches
    if (verification.code !== code) {
      const attemptsLeft = MAX_ATTEMPTS - (verification.attempts + 1);
      return NextResponse.json(
        {
          error: `Invalid verification code. ${attemptsLeft} attempts remaining.`,
        },
        { status: 400 }
      );
    }

    // Code is correct! Update verification record and user
    await prisma.$transaction([
      prisma.phoneVerification.update({
        where: { id: verification.id },
        data: { verified: true },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          phoneNumber,
          phoneVerified: true,
          phoneVerifiedAt: new Date(),
        },
      }),
    ]);

    // Delete old verification codes for this phone number
    await prisma.phoneVerification.deleteMany({
      where: {
        phoneNumber,
        id: { not: verification.id },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully!",
    });
  } catch (error) {
    console.error("Phone verification verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify code" },
      { status: 500 }
    );
  }
}
