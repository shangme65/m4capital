import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password - M4Capital",
  description:
    "Reset your M4Capital account password securely. Enter your email to receive a password reset link.",
  keywords: "reset password, forgot password, account recovery",
  robots: "noindex, nofollow",
  openGraph: {
    title: "Reset Password - M4Capital",
    description: "Reset your M4Capital account password securely.",
    type: "website",
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
