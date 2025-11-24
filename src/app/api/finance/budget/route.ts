import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/finance/budget
 * Fetch user budget and cash flow data from transactions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        Portfolio: true,
        Deposit: {
          where: { status: "COMPLETED" },
          orderBy: { createdAt: "desc" },
        },
        Withdrawal: {
          where: { status: "COMPLETED" },
          orderBy: { createdAt: "desc" },
        },
        Trade: {
          orderBy: { createdAt: "desc" },
          take: 100,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate income from deposits
    const deposits = user.Deposit || [];
    const monthlyDeposits = calculateMonthlyTotals(
      deposits.map((d) => ({
        amount: parseFloat(d.amount.toString()),
        date: d.createdAt,
      }))
    );

    // Calculate expenses from withdrawals and trading fees
    const withdrawals = user.Withdrawal || [];
    const trades = user.Trade || [];

    const monthlyWithdrawals = calculateMonthlyTotals(
      withdrawals.map((w) => ({
        amount: parseFloat(w.amount.toString()),
        date: w.createdAt,
      }))
    );

    const tradingFees = trades.reduce(
      (sum, t) => sum + parseFloat(t.commission.toString()),
      0
    );

    // Budget categories based on actual transaction data
    const budgetCategories = [
      {
        id: "income",
        name: "Deposits & Income",
        icon: "TrendingUp",
        budgeted: monthlyDeposits.average,
        spent: monthlyDeposits.current,
        remaining: monthlyDeposits.average - monthlyDeposits.current,
        type: "income",
        color: "#10B981",
      },
      {
        id: "trading",
        name: "Trading & Investments",
        icon: "Activity",
        budgeted: monthlyDeposits.average * 0.7, // Suggested 70% for trading
        spent: calculateTradingSpent(trades),
        remaining: 0,
        type: "expense",
        color: "#3B82F6",
      },
      {
        id: "withdrawals",
        name: "Withdrawals & Expenses",
        icon: "CreditCard",
        budgeted: monthlyWithdrawals.average,
        spent: monthlyWithdrawals.current,
        remaining: monthlyWithdrawals.average - monthlyWithdrawals.current,
        type: "expense",
        color: "#EF4444",
      },
      {
        id: "fees",
        name: "Trading Fees",
        icon: "Receipt",
        budgeted: monthlyDeposits.average * 0.05, // Suggested 5% for fees
        spent: tradingFees,
        remaining: 0,
        type: "expense",
        color: "#F59E0B",
      },
    ];

    // Calculate savings goals based on portfolio balance
    const currentBalance = user.Portfolio
      ? parseFloat(user.Portfolio.balance.toString())
      : 0;
    const savingsGoals = [
      {
        id: "emergency",
        name: "Emergency Fund",
        target: 10000,
        current: Math.min(currentBalance * 0.3, 10000),
        deadline: "2025-12-31",
        color: "#EF4444",
      },
      {
        id: "investment",
        name: "Investment Portfolio",
        target: 50000,
        current: currentBalance,
        deadline: "2026-12-31",
        color: "#3B82F6",
      },
    ];

    // Calculate cash flow projections (next 6 months)
    const cashFlowProjections = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);

      cashFlowProjections.push({
        month: date.toISOString().split("T")[0].substring(0, 7),
        income: monthlyDeposits.average,
        expenses: monthlyWithdrawals.average + tradingFees / 12,
        savings:
          monthlyDeposits.average -
          monthlyWithdrawals.average -
          tradingFees / 12,
        netFlow:
          monthlyDeposits.average -
          monthlyWithdrawals.average -
          tradingFees / 12,
        cumulativeBalance:
          currentBalance +
          (monthlyDeposits.average -
            monthlyWithdrawals.average -
            tradingFees / 12) *
            (i + 1),
      });
    }

    return NextResponse.json({
      success: true,
      budget: {
        categories: budgetCategories,
        savingsGoals,
        cashFlowProjections,
        summary: {
          totalIncome: monthlyDeposits.total,
          totalExpenses: monthlyWithdrawals.total + tradingFees,
          netSavings:
            monthlyDeposits.total - monthlyWithdrawals.total - tradingFees,
          savingsRate:
            monthlyDeposits.total > 0
              ? ((monthlyDeposits.total -
                  monthlyWithdrawals.total -
                  tradingFees) /
                  monthlyDeposits.total) *
                100
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching budget data:", error);
    return NextResponse.json(
      { error: "Failed to fetch budget data" },
      { status: 500 }
    );
  }
}

function calculateMonthlyTotals(
  transactions: { amount: number; date: Date }[]
) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTotal = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Calculate average based on months of data
  const oldestDate =
    transactions.length > 0
      ? new Date(transactions[transactions.length - 1].date)
      : now;
  const monthsOfData = Math.max(
    1,
    Math.ceil(
      (now.getTime() - oldestDate.getTime()) / (30 * 24 * 60 * 60 * 1000)
    )
  );

  return {
    total,
    current: currentMonthTotal,
    average: total / monthsOfData,
  };
}

function calculateTradingSpent(trades: any[]) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return trades
    .filter((t) => {
      const d = new Date(t.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, t) => {
      const entryValue =
        parseFloat(t.entryPrice.toString()) * parseFloat(t.quantity.toString());
      return sum + entryValue;
    }, 0);
}
