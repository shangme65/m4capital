import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://m4capital-fqpoqgx2h-shang-team.vercel.app"),
  title: "m4capital - The Future of Forex Trading",
  description:
    "High-performance and user-friendly Forex trading website with dynamic designs.",
  keywords: "Forex, Trading, Crypto, Investment, m4capital",
  icons: {
    icon: [
      { url: "/icons/icon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/icons/icon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icons/icon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/icons/icon-64.png", type: "image/png", sizes: "64x64" },
      { url: "/icons/icon-96.png", type: "image/png", sizes: "96x96" },
      { url: "/icons/icon-128.png", type: "image/png", sizes: "128x128" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-256.png", type: "image/png", sizes: "256x256" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/icons/icon-120.png", sizes: "120x120", type: "image/png" },
      { url: "/icons/icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-167.png", sizes: "167x167", type: "image/png" },
      { url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/icons/icon-96.png"],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "The Future of Forex Trading - M4 Capital",
    description: "Join the next generation of trading.",
    url: "https://m4capital-fqpoqgx2h-shang-team.vercel.app",
    siteName: "m4capital",
    images: [
      {
        url: "/og-image.png", // Hosted at the root
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "m4capital - The Future of Forex Trading",
    description:
      "High-performance and user-friendly Forex trading website with dynamic designs.",
    // creator: "@yourtwitterhandle", // Replace with your Twitter handle
    images: ["https://your-domain.com/og-image.png"], // Replace
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
