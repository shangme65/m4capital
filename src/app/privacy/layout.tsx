import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - M4Capital",
  description:
    "Read M4Capital's privacy policy. Learn how we collect, use, and protect your personal data and trading information.",
  keywords: "privacy policy, data protection, GDPR, personal data, M4Capital",
  openGraph: {
    title: "Privacy Policy - M4Capital",
    description:
      "Learn how M4Capital protects your personal data and trading information.",
    type: "website",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
