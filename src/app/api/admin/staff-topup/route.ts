import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/generate-id";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staffAdmin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!staffAdmin || staffAdmin.role !== "STAFF_ADMIN") {
      return NextResponse.json(
        { error: "Only staff admins can perform manual top-ups" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, amount, currency = "USD", description } = body;

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid user ID and amount are required" },
        { status: 400 }
      );
    }

    // Verify user is assigned to this staff admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        assignedStaffId: true,
        Portfolio: {
          select: {
            id: true,
            balance: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.assignedStaffId !== staffAdmin.id) {
      return NextResponse.json(
        { error: "You can only top up users assigned to you" },
        { status: 403 }
      );
    }

    // Ensure user has a portfolio
    let portfolioId = user.Portfolio?.id;
    if (!portfolioId) {
      const newPortfolio = await prisma.portfolio.create({
        data: {
          id: generateId(),
          userId: user.id,
          balance: 0,
          assets: [],
        },
      });
      portfolioId = newPortfolio.id;
    }

    // Create deposit record
    const deposit = await prisma.deposit.create({
      data: {
        id: generateId(),
        portfolioId: portfolioId,
        userId: user.id,
        amount: parseFloat(amount.toString()),
        currency,
        status: "COMPLETED",
        method: "STAFF_MANUAL_TOPUP",
        updatedAt: new Date(),
        metadata: {
          staffAdminId: staffAdmin.id,
          description: description || "Manual top-up by staff admin",
          timestamp: new Date().toISOString(),
        },
      },
    });

    // Update portfolio balance
    const currentBalance = user.Portfolio?.balance || 0;
    const newBalance =
      parseFloat(currentBalance.toString()) + parseFloat(amount.toString());

    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: { balance: newBalance },
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: user.id,
        type: "DEPOSIT",
        title: "Account Credited",
        message: `Your account has been credited with ${currency} ${amount.toLocaleString()}.`,
        amount: parseFloat(amount.toString()),
        metadata: {
          staffAdminId: staffAdmin.id,
          depositId: deposit.id,
          currency,
        },
      },
    });

    // Log the activity
    await prisma.userActivity.create({
      data: {
        id: generateId(),
        userId: user.id,
        activityType: "DEPOSIT",
        ipAddress:
          req.headers.get("x-forwarded-for") ||
          req.headers.get("x-real-ip") ||
          "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
        metadata: {
          depositId: deposit.id,
          staffAdminId: staffAdmin.id,
          method: "STAFF_MANUAL_TOPUP",
          description: `Manual top-up by staff admin: ${currency} ${amount}`,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Top-up completed successfully",
      deposit: {
        id: deposit.id,
        amount: deposit.amount,
        currency: deposit.currency,
        status: deposit.status,
      },
      newBalance,
    });
  } catch (error) {
    console.error("Error processing manual top-up:", error);
    return NextResponse.json(
      { error: "Failed to process top-up" },
      { status: 500 }
    );
  }
}
