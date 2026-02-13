import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/payment/manual-credit
 * Manually credit a deposit (admin only - for debugging)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { depositId } = await request.json();

    if (!depositId) {
      return NextResponse.json(
        { error: "depositId required" },
        { status: 400 }
      );
    }

    console.log("🔧 Manual credit triggered by admin:", user.email);
    console.log("🔧 Deposit ID:", depositId);

    // Find the deposit
    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      include: { User: { include: { Portfolio: true } } },
    });

    if (!deposit) {
      return NextResponse.json(
        { error: "Deposit not found" },
        { status: 404 }
      );
    }

    console.log("🔧 Deposit found:", deposit.id);
    console.log("🔧 Current status:", deposit.status);
    console.log("🔧 Amount:", deposit.amount, deposit.currency);

    if (deposit.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Deposit already completed" },
        { status: 400 }
      );
    }

    if (!deposit.User) {
      return NextResponse.json(
        { error: "Deposit has no user" },
        { status: 400 }
      );
    }

    // Get or create portfolio
    let portfolio = deposit.User.Portfolio;
    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          id: require("@/lib/generate-id").generateId(),
          userId: deposit.User.id,
          balance: 0,
          traderoomBalance: 0,
          assets: [],
        },
      });
    }

    const depositAmount = parseFloat(deposit.amount.toString());
    const depositCurrency = deposit.currency || "USD";

    console.log("🔧 Crediting user:", deposit.User.email);

    // Check if traderoom deposit
    if (deposit.targetAsset === "TRADEROOM") {
      const currentBalance = parseFloat(
        (portfolio.traderoomBalance || 0).toString()
      );
      const newBalance = currentBalance + depositAmount;

      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          traderoomBalance: newBalance,
        },
      });

      console.log("✅ Traderoom credited:", newBalance);
    } else {
      const currentBalance = parseFloat(portfolio.balance.toString());
      const newBalance = currentBalance + depositAmount;

      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          balance: newBalance,
          balanceCurrency: depositCurrency,
        },
      });

      console.log("✅ Balance credited:", newBalance);
    }

    // Update deposit status
    await prisma.deposit.update({
      where: { id: deposit.id },
      data: {
        status: "COMPLETED",
      },
    });

    // Create notification
    const { getCurrencySymbol } = require("@/lib/currencies");
    const { generateId } = require("@/lib/generate-id");

    const userCurrency = deposit.User.preferredCurrency || depositCurrency;
    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: deposit.User.id,
        type: "DEPOSIT",
        title: `${userCurrency} Deposit Completed`,
        message: `Your deposit of ${getCurrencySymbol(userCurrency)}${
          deposit.amount
        } has been successfully credited to your account.`,
        amount: deposit.amount,
        asset: userCurrency,
        metadata: {
          depositId: deposit.id,
          manualCredit: true,
          creditedBy: user.email,
        },
      },
    });

    console.log("✅ Manual credit completed");

    return NextResponse.json({
      success: true,
      message: "Deposit credited successfully",
      deposit: {
        id: deposit.id,
        amount: deposit.amount,
        currency: deposit.currency,
        status: "COMPLETED",
      },
    });
  } catch (error) {
    console.error("Manual credit error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to credit deposit",
      },
      { status: 500 }
    );
  }
}
