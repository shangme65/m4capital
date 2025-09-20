"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Transaction {
  id: string;
  type: "Deposit" | "Withdrawal" | "Trade";
  amount: number;
  status: "Completed" | "Pending" | "Failed";
  date: string;
}

const transactions: Transaction[] = [
  {
    id: "1",
    type: "Deposit",
    amount: 5000,
    status: "Completed",
    date: "2023-10-26",
  },
  {
    id: "2",
    type: "Trade",
    amount: -250,
    status: "Completed",
    date: "2023-10-25",
  },
  {
    id: "3",
    type: "Withdrawal",
    amount: -1000,
    status: "Pending",
    date: "2023-10-24",
  },
  {
    id: "4",
    type: "Deposit",
    amount: 2000,
    status: "Completed",
    date: "2023-10-22",
  },
];

const RecentTransactions = () => {
  return (
    <motion.div
      className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
        <a
          href="#"
          className="text-sm text-indigo-400 hover:underline flex items-center"
        >
          View All <ArrowRight size={16} className="ml-1" />
        </a>
      </div>
      <ul className="space-y-3">
        {transactions.map((tx) => (
          <li key={tx.id} className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-white">{tx.type}</p>
              <p className="text-sm text-gray-400">{tx.date}</p>
            </div>
            <div className="text-right">
              <p
                className={`font-semibold ${
                  tx.amount > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {tx.amount > 0 ? "+" : ""}$
                {Math.abs(tx.amount).toLocaleString()}
              </p>
              <p
                className={`text-sm ${
                  tx.status === "Completed"
                    ? "text-green-400"
                    : tx.status === "Pending"
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {tx.status}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default RecentTransactions;
