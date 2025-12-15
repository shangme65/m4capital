import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Market News - M4Capital",
  description:
    "Real-time crypto, forex, and stock market news. Stay informed with the latest market analysis and trading insights.",
  keywords:
    "market news, crypto news, forex news, stock market, trading analysis",
  openGraph: {
    title: "Market News - M4Capital",
    description:
      "Real-time crypto, forex, and stock market news and trading insights.",
    type: "website",
  },
};

export default function NewsFeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
