import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video Tutorials - M4Capital",
  description:
    "Watch trading video tutorials and courses. Learn technical analysis, trading strategies, and platform features.",
  keywords:
    "trading tutorials, video courses, trading education, technical analysis, learn trading",
  openGraph: {
    title: "Video Tutorials - M4Capital",
    description:
      "Watch trading video tutorials and courses to improve your skills.",
    type: "website",
  },
};

export default function VideoTutorialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
