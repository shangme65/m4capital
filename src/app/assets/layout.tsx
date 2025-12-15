import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tradable Assets - M4Capital",
  description:
    "Browse all forex pairs, cryptocurrencies, stocks, and commodities available for trading on M4Capital.",
  keywords:
    "trading assets, forex pairs, cryptocurrencies, stocks, commodities",
  openGraph: {
    title: "Tradable Assets - M4Capital",
    description:
      "Browse all forex, crypto, and stock assets available for trading.",
    type: "website",
  },
};

export default function AssetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
