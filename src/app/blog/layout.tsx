import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trading Blog - M4Capital",
  description:
    "Market insights, trading strategies, and educational content. Learn from expert traders and improve your trading skills.",
  keywords:
    "trading blog, market analysis, trading strategies, trading education",
  openGraph: {
    title: "Trading Blog - M4Capital",
    description:
      "Market insights, trading strategies, and educational content for traders.",
    type: "website",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
