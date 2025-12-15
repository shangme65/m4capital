import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Industries & Sectors - M4Capital",
  description:
    "Explore stock market sectors and industries available for trading on M4Capital. Invest in technology, healthcare, finance, and more.",
  keywords:
    "stock sectors, industries, technology stocks, healthcare stocks, finance sector",
  openGraph: {
    title: "Industries & Sectors - M4Capital",
    description:
      "Explore stock market sectors and industries available for trading.",
    type: "website",
  },
};

export default function IndustriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
