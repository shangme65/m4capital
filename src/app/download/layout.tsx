import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download Trading App - M4Capital",
  description:
    "Download M4Capital's mobile and desktop trading applications. Trade forex, crypto, and stocks on iOS, Android, Windows, and Mac.",
  keywords:
    "download trading app, mobile trading, iOS app, Android app, desktop trading, M4Capital",
  openGraph: {
    title: "Download Trading App - M4Capital",
    description:
      "Download M4Capital's mobile and desktop trading applications for iOS, Android, Windows, and Mac.",
    type: "website",
  },
};

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
