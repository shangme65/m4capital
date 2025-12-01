"use client";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface BalanceCardProps {
  title: string;
  amount: number;
  change?: number;
  isCurrency?: boolean;
}

const BalanceCard = ({
  title,
  amount,
  change,
  isCurrency = true,
}: BalanceCardProps) => {
  const { formatAmount } = useCurrency();
  const formattedAmount = isCurrency
    ? formatAmount(amount, 2)
    : amount.toLocaleString();

  return (
    <motion.div
      className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-white">{formattedAmount}</p>
      {change !== undefined && (
        <div
          className={`mt-2 flex items-center text-sm ${
            change >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {change >= 0 ? (
            <ArrowUpRight className="w-4 h-4 mr-1" />
          ) : (
            <ArrowDownLeft className="w-4 h-4 mr-1" />
          )}
          <span>{Math.abs(change)}%</span>
          <span className="text-gray-500 ml-2">vs last month</span>
        </div>
      )}
    </motion.div>
  );
};

const BalanceSummary = ({
  balance,
  profitLoss,
  deposits,
  withdrawals,
}: {
  balance: number;
  profitLoss: number;
  deposits: number;
  withdrawals: number;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <BalanceCard title="Total Balance" amount={balance} />
      <BalanceCard title="24h Profit / Loss" amount={profitLoss} />
      <BalanceCard title="Total Deposits" amount={deposits} />
      <BalanceCard title="Total Withdrawals" amount={withdrawals} />
    </div>
  );
};

export default BalanceSummary;
