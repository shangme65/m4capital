import AuthProvider from "@/components/client/AuthProvider";
import { ModalProvider } from "@/contexts/ModalContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import MarketDataProvider from "@/components/client/MarketDataProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trade Room | M4 Capital",
  description:
    "Professional trading interface with real-time crypto prices, advanced charting, and one-click trading.",
  openGraph: {
    title: "Trade Room | M4 Capital",
    description:
      "Professional trading interface with real-time crypto prices, advanced charting, and one-click trading.",
  },
};

export default async function TraderoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  // Check if user is authenticated
  if (!session || !session.user) {
    redirect("/login");
  }

  // Only allow ADMIN and STAFF_ADMIN to access Traderoom (under development)
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF_ADMIN") {
    redirect("/dashboard");
  }

  return (
    <AuthProvider>
      <ModalProvider>
        <NotificationProvider>
          <MarketDataProvider>
            <div
              className="h-screen w-screen m-0 p-0 overflow-hidden"
              style={{ margin: 0, padding: 0 }}
            >
              {children}
            </div>
          </MarketDataProvider>
        </NotificationProvider>
      </ModalProvider>
    </AuthProvider>
  );
}
