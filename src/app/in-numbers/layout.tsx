import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "M4Capital in Numbers",
  description:
    "Company statistics, user base, trading volumes, and platform performance metrics. See why traders choose M4Capital.",
  keywords:
    "company statistics, trading volume, platform stats, M4Capital numbers",
  openGraph: {
    title: "M4Capital in Numbers",
    description: "Company statistics, user base, and trading volume metrics.",
    type: "website",
  },
};

export default function InNumbersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
