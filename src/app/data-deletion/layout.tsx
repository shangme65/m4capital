import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Deletion Request - M4Capital",
  description:
    "Request deletion of your personal data from M4Capital. GDPR compliant data removal process.",
  keywords: "data deletion, GDPR, data removal, personal data, privacy",
  robots: "noindex, nofollow",
  openGraph: {
    title: "Data Deletion Request - M4Capital",
    description: "Request deletion of your personal data from M4Capital.",
    type: "website",
  },
};

export default function DataDeletionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
