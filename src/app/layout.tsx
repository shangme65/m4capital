import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "m4capital - The Future of Forex Trading",
  description: "High-performance and user-friendly Forex trading website with dynamic designs.",
  keywords: "Forex, Trading, Crypto, Investment, m4capital",
  openGraph: {
    title: "m4capital - The Future of Forex Trading",
    description: "Join the next generation of trading.",
    url: "https://your-domain.com", // Replace with your domain
    siteName: "m4capital",
    images: [
      {
        url: "https://your-domain.com/og-image.png", // Replace with your OG image URL
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
    description: "High-performance and user-friendly Forex trading website with dynamic designs.",
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
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}