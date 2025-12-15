import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Market News | M4 Capital",
  description:
    "Stay updated with the latest cryptocurrency and financial market news, analysis, and insights.",
  openGraph: {
    title: "Market News | M4 Capital",
    description:
      "Stay updated with the latest cryptocurrency and financial market news, analysis, and insights.",
  },
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
