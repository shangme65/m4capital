import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { validateTransferPin } from "@/lib/p2p-transfer-utils";

/**
 * POST /api/p2p-transfer/set-pin
 * Set or update transfer PIN
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { pin, currentPin } = body;

    if (!pin) {
      return NextResponse.json({ error: "PIN is required" }, { status: 400 });
    }

    if (!validateTransferPin(pin)) {
      return NextResponse.json(
        { error: "PIN must be exactly 4 digits" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.isDeleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If user already has a PIN, verify current PIN
    if (user.transferPin && currentPin) {
      const isCurrentPinValid = await bcrypt.compare(
        currentPin,
        user.transferPin
      );
      if (!isCurrentPinValid) {
        return NextResponse.json(
          { error: "Current PIN is incorrect" },
          { status: 401 }
        );
      }
    } else if (user.transferPin && !currentPin) {
      return NextResponse.json(
        { error: "Current PIN is required to change PIN" },
        { status: 400 }
      );
    }

    // Hash the new PIN
    const hashedPin = await bcrypt.hash(pin, 10);

    // Update user with new PIN
    await prisma.user.update({
      where: { id: user.id },
      data: { transferPin: hashedPin },
    });

    return NextResponse.json({
      success: true,
      message: user.transferPin
        ? "Transfer PIN updated successfully"
        : "Transfer PIN set successfully",
    });
  } catch (error) {
    console.error("Error setting transfer PIN:", error);
    return NextResponse.json(
      { error: "Failed to set transfer PIN" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/p2p-transfer/set-pin
 * Check if user has a transfer PIN set
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { transferPin: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      hasPinSet: !!user.transferPin,
    });
  } catch (error) {
    console.error("Error checking transfer PIN:", error);
    return NextResponse.json(
      { error: "Failed to check transfer PIN status" },
      { status: 500 }
    );
  }
}
