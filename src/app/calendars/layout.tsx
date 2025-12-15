import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Economic Calendar - M4Capital",
  description:
    "Track upcoming economic events, earnings releases, and market-moving announcements. Plan your trades around key events.",
  keywords:
    "economic calendar, earnings calendar, forex events, market events, trading calendar",
  openGraph: {
    title: "Economic Calendar - M4Capital",
    description: "Track upcoming economic events and earnings releases.",
    type: "website",
  },
};

export default function CalendarsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
