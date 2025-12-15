import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | M4 Capital",
  description:
    "Learn about M4 Capital, our mission, team, and commitment to empowering traders worldwide.",
  openGraph: {
    title: "About Us | M4 Capital",
    description:
      "Learn about M4 Capital, our mission, team, and commitment to empowering traders worldwide.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
