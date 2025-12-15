import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Awards & Recognition - M4Capital",
  description:
    "M4Capital's industry awards and recognition for trading excellence, platform innovation, and customer service.",
  keywords: "trading awards, industry recognition, best trading platform",
  openGraph: {
    title: "Awards & Recognition - M4Capital",
    description:
      "M4Capital's industry awards and recognition for trading excellence.",
    type: "website",
  },
};

export default function AwardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
