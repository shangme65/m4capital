import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trading Specifications - M4Capital",
  description:
    "View trading specifications including spreads, leverage, margin requirements, and trading hours for all assets.",
  keywords:
    "trading specs, spreads, leverage, margin requirements, trading hours",
  openGraph: {
    title: "Trading Specifications - M4Capital",
    description:
      "Spreads, leverage, and trading hours for all tradable assets.",
    type: "website",
  },
};

export default function TradingSpecsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
