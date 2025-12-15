import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | M4 Capital",
  description:
    "Manage your account settings, security preferences, notification options, and personal information.",
  openGraph: {
    title: "Settings | M4 Capital",
    description:
      "Manage your account settings, security preferences, notification options, and personal information.",
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
