"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import LoginModal from "../client/LoginModal";
import SignupModalIQ from "../client/SignupModalIQ";
import EmailSignupModal from "../client/EmailSignupModal";
import ForgotPasswordModal from "../client/ForgotPasswordModal";
import { ModalProvider, useModal } from "@/contexts/ModalContext";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    isLoginModalOpen,
    isSignupModalOpen,
    isEmailSignupModalOpen,
    isForgotPasswordModalOpen,
    openLoginModal,
    openSignupModal,
    closeLoginModal,
    closeSignupModal,
    closeEmailSignupModal,
    closeForgotPasswordModal,
    switchToSignup,
    switchToLogin,
    switchToForgotPassword,
    proceedWithEmail,
    goBackToSignup,
    goBackToLogin,
    switchFromForgotPasswordToSignup,
  } = useModal();

  // Check if the current path is a dashboard route
  const isDashboardRoute =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin") ||
    pathname === "/dashboard" ||
    pathname?.startsWith("/settings") ||
    pathname?.startsWith("/news") ||
    pathname?.startsWith("/trade") ||
    pathname?.startsWith("/traderoom");

  if (isDashboardRoute) {
    // For dashboard routes, don't show header and footer
    return <>{children}</>;
  }

  // For non-dashboard routes, show header and footer
  return (
    <>
      <Header onLoginClick={openLoginModal} onSignupClick={openSignupModal} />
      <main className="min-h-screen">{children}</main>
      <Footer />

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onSwitchToSignup={switchToSignup}
        onSwitchToForgotPassword={switchToForgotPassword}
      />
      <SignupModalIQ
        isOpen={isSignupModalOpen}
        onClose={closeSignupModal}
        onProceedWithEmail={proceedWithEmail}
        onSwitchToLogin={switchToLogin}
      />
      <EmailSignupModal
        isOpen={isEmailSignupModalOpen}
        onClose={closeEmailSignupModal}
        onGoBack={goBackToSignup}
        onSwitchToLogin={switchToLogin}
      />
      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={closeForgotPasswordModal}
        onGoBack={goBackToLogin}
        onSwitchToSignup={switchFromForgotPasswordToSignup}
      />
    </>
  );
}

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <LayoutContent>{children}</LayoutContent>
    </ModalProvider>
  );
}
