import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Licenses & Safeguards - M4Capital",
  description:
    "M4Capital regulatory compliance, licenses, and client fund protection. Your funds are secure with segregated accounts.",
  keywords:
    "trading license, regulatory compliance, fund protection, segregated accounts",
  openGraph: {
    title: "Licenses & Safeguards - M4Capital",
    description:
      "Regulatory compliance and client fund protection at M4Capital.",
    type: "website",
  },
};

export default function LicensesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
