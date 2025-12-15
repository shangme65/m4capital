import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academy | M4 Capital",
  description:
    "Learn about cryptocurrency trading, investment strategies, and financial markets with our educational resources.",
  openGraph: {
    title: "Academy | M4 Capital",
    description:
      "Learn about cryptocurrency trading, investment strategies, and financial markets with our educational resources.",
  },
};

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
