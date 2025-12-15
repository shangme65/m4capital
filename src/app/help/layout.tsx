import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center - M4Capital",
  description:
    "Find answers to common questions about trading on M4Capital. Browse FAQs, tutorials, and guides.",
  keywords: "help center, FAQ, trading questions, support, M4Capital guides",
  openGraph: {
    title: "Help Center - M4Capital",
    description: "Find answers to common questions about trading on M4Capital.",
    type: "website",
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
