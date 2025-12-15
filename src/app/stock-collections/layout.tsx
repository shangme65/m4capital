import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stock Collections - M4Capital",
  description:
    "Curated stock collections and investment themes. Discover trending sectors, growth stocks, and dividend portfolios.",
  keywords:
    "stock collections, investment themes, growth stocks, dividend stocks, portfolio ideas",
  openGraph: {
    title: "Stock Collections - M4Capital",
    description:
      "Curated stock collections and investment themes for every strategy.",
    type: "website",
  },
};

export default function StockCollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
