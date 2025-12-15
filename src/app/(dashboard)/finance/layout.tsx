import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Finance | M4 Capital",
  description:
    "Track your financial performance, view transaction history, and manage deposits and withdrawals.",
  openGraph: {
    title: "Finance | M4 Capital",
    description:
      "Track your financial performance, view transaction history, and manage deposits and withdrawals.",
  },
};

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
