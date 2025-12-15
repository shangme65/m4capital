import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions - M4Capital",
  description:
    "M4Capital terms of service, trading conditions, and user agreement. Read our policies before trading.",
  keywords: "terms of service, user agreement, trading conditions, M4Capital",
  openGraph: {
    title: "Terms & Conditions - M4Capital",
    description:
      "M4Capital terms of service, trading conditions, and user agreement.",
    type: "website",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
