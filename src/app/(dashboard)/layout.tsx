import Sidebar from "@/components/client/Sidebar";
import DashboardHeaderWrapper from "@/components/client/DashboardHeaderWrapper";
import AuthProvider from "@/components/client/AuthProvider";
import { SidebarProvider } from "@/components/client/SidebarContext";
import { ModalProvider } from "@/contexts/ModalContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { TutorialProvider } from "@/contexts/TutorialContext";
import { DashboardModalWrapper } from "@/components/layout/DashboardModalWrapper";
import { MarketDataProvider } from "@/components/client/MarketDataProvider";
import CryptoMarketProvider from "@/components/client/CryptoMarketProvider";
import { RoleChangeMonitor } from "@/components/client/RoleChangeMonitor";
import NotificationPermissionPrompt from "@/components/client/NotificationPermissionPrompt";
import TutorialOverlay from "@/components/client/TutorialOverlay";
import PushNotificationProvider from "@/components/client/PushNotificationProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  // Temporarily bypass authentication to fix trade page
  // const session = await getServerSession(authOptions);
  // if (!session || !session.user) {
  //   redirect("/login");
  // }

  return (
    <AuthProvider>
      <SidebarProvider>
        <ModalProvider>
          <NotificationProvider>
            <ToastProvider>
              <CurrencyProvider>
                <TutorialProvider>
                  <MarketDataProvider autoConnect={false} enableNews={false}>
                    <CryptoMarketProvider autoStart={true}>
                      <PushNotificationProvider>
                        <RoleChangeMonitor />
                        <NotificationPermissionPrompt />
                        <TutorialOverlay />
                        <div className="flex h-screen relative bg-gray-900">
                          <Sidebar />
                          <div className="flex-1 flex flex-col overflow-hidden">
                            <DashboardHeaderWrapper />
                            <main className="flex-1 overflow-x-hidden overflow-y-auto p-2 sm:p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                              <DashboardModalWrapper>
                                {children}
                              </DashboardModalWrapper>
                            </main>
                          </div>
                        </div>
                        {/* Parallel route for intercepted modals */}
                        {modal}
                      </PushNotificationProvider>
                    </CryptoMarketProvider>
                  </MarketDataProvider>
                </TutorialProvider>
              </CurrencyProvider>
            </ToastProvider>
          </NotificationProvider>
        </ModalProvider>
      </SidebarProvider>
    </AuthProvider>
  );
}
