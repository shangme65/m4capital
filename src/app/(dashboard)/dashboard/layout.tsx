import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | M4 Capital",
  description:
    "View your portfolio, track crypto assets, and manage your investments in real-time.",
  openGraph: {
    title: "Dashboard | M4 Capital",
    description:
      "View your portfolio, track crypto assets, and manage your investments in real-time.",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
