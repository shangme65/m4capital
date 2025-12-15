import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Historical Quotes - M4Capital",
  description:
    "Access historical price data for forex, cryptocurrencies, and stocks. Analyze past market trends and performance.",
  keywords:
    "historical prices, market data, price history, forex history, crypto charts",
  openGraph: {
    title: "Historical Quotes - M4Capital",
    description: "Access historical price data for forex, crypto, and stocks.",
    type: "website",
  },
};

export default function HistoricalQuotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
