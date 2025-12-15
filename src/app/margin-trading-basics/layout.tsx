import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Margin Trading Basics - M4Capital",
  description:
    "Learn the fundamentals of margin trading, leverage, and risk management. Essential guide for traders.",
  keywords:
    "margin trading, leverage trading, trading education, risk management",
  openGraph: {
    title: "Margin Trading Basics - M4Capital",
    description:
      "Learn the fundamentals of margin trading, leverage, and risk management.",
    type: "website",
  },
};

export default function MarginTradingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
