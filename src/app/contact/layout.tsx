import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - M4Capital",
  description:
    "Get in touch with M4Capital support team. We're available 24/7 to help with your trading questions and account inquiries.",
  keywords: "contact M4Capital, trading support, customer service, help",
  openGraph: {
    title: "Contact Us - M4Capital",
    description:
      "Get in touch with M4Capital support team. We're available 24/7 to help with your trading questions.",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
