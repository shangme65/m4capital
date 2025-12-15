import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community | M4 Capital",
  description:
    "Connect with fellow traders, share insights, and join discussions in the M4 Capital community.",
  openGraph: {
    title: "Community | M4 Capital",
    description:
      "Connect with fellow traders, share insights, and join discussions in the M4 Capital community.",
  },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
