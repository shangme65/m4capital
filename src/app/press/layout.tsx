import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Press & Media - M4Capital",
  description:
    "M4Capital news coverage, press releases, and media resources. Get the latest company announcements and media kit.",
  keywords: "press releases, media coverage, news, M4Capital announcements",
  openGraph: {
    title: "Press & Media - M4Capital",
    description:
      "M4Capital news coverage, press releases, and media resources.",
    type: "website",
  },
};

export default function PressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
