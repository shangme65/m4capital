import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/generate-id";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const { depositId } = await req.json();

    if (!depositId) {
      return NextResponse.json(
        { success: false, error: "Deposit ID is required" },
        { status: 400 }
      );
    }

    // Find the deposit and verify it belongs to the user
    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
    });

    if (!deposit) {
      return NextResponse.json(
        { success: false, error: "Deposit not found" },
        { status: 404 }
      );
    }

    if (deposit.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to cancel this deposit" },
        { status: 403 }
      );
    }

    // Only allow cancelling pending deposits
    if (deposit.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot cancel deposit with status: ${deposit.status}`,
        },
        { status: 400 }
      );
    }

    // Update deposit status to CANCELLED
    const updatedDeposit = await prisma.deposit.update({
      where: { id: depositId },
      data: {
        status: "CANCELLED",
        updatedAt: new Date(),
      },
    });

    // Create notification for the user
    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: user.id,
        type: "INFO",
        title: "Deposit Cancelled",
        message: `Your deposit of ${deposit.amount} ${deposit.currency} has been cancelled`,
        amount: deposit.amount,
        asset: deposit.currency,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Deposit cancelled successfully",
      data: {
        deposit: updatedDeposit,
      },
    });
  } catch (error) {
    console.error("Error cancelling deposit:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to cancel deposit",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
