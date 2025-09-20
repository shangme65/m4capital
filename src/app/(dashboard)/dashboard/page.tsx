import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import BalanceSummary from "@/components/client/BalanceSummary";
import PortfolioDistribution from "@/components/client/PortfolioDistribution";
import RecentTransactions from "@/components/client/RecentTransactions";

// This is a server component to fetch data
async function getPortfolioData(userId: string) {
  const portfolio = await prisma.portfolio.findUnique({
    where: { userId },
    include: {
      deposits: true,
      withdrawals: true,
    },
  });
  return portfolio;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const portfolio = await getPortfolioData(session.user.id);

  if (!portfolio) {
    return (
      <div className="text-white">
        No portfolio found. Please contact support.
      </div>
    );
  }

  const totalDeposits = portfolio.deposits.reduce(
    (acc, d) => acc + Number(d.amount),
    0
  );
  const totalWithdrawals = portfolio.withdrawals.reduce(
    (acc, w) => acc + Number(w.amount),
    0
  );
  // Placeholder for profit/loss calculation
  const profitLoss =
    Number(portfolio.balance) - totalDeposits + totalWithdrawals;

  return (
    <div className="space-y-8">
      <BalanceSummary
        balance={Number(portfolio.balance)}
        profitLoss={profitLoss}
        deposits={totalDeposits}
        withdrawals={totalWithdrawals}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PortfolioDistribution />
        </div>
        <div>
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
