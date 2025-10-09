"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ModalContextType {
  isLoginModalOpen: boolean;
  isSignupModalOpen: boolean;
  isEmailSignupModalOpen: boolean;
  isForgotPasswordModalOpen: boolean;
  openLoginModal: () => void;
  openSignupModal: () => void;
  openEmailSignupModal: () => void;
  openForgotPasswordModal: () => void;
  closeLoginModal: () => void;
  closeSignupModal: () => void;
  closeEmailSignupModal: () => void;
  closeForgotPasswordModal: () => void;
  switchToSignup: () => void;
  switchToLogin: () => void;
  switchToForgotPassword: () => void;
  proceedWithEmail: () => void;
  goBackToSignup: () => void;
  goBackToLogin: () => void;
  switchFromForgotPasswordToSignup: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isEmailSignupModalOpen, setIsEmailSignupModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const openSignupModal = () => setIsSignupModalOpen(true);
  const openEmailSignupModal = () => setIsEmailSignupModalOpen(true);
  const openForgotPasswordModal = () => setIsForgotPasswordModalOpen(true);

  const closeLoginModal = () => setIsLoginModalOpen(false);
  const closeSignupModal = () => setIsSignupModalOpen(false);
  const closeEmailSignupModal = () => setIsEmailSignupModalOpen(false);
  const closeForgotPasswordModal = () => setIsForgotPasswordModalOpen(false);

  const switchToSignup = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };

  const switchToLogin = () => {
    setIsSignupModalOpen(false);
    setIsEmailSignupModalOpen(false);
    setIsForgotPasswordModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const switchToForgotPassword = () => {
    setIsLoginModalOpen(false);
    setIsForgotPasswordModalOpen(true);
  };

  const proceedWithEmail = () => {
    setIsSignupModalOpen(false);
    setIsEmailSignupModalOpen(true);
  };

  const goBackToSignup = () => {
    setIsEmailSignupModalOpen(false);
    setIsSignupModalOpen(true);
  };

  const goBackToLogin = () => {
    setIsForgotPasswordModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const switchFromForgotPasswordToSignup = () => {
    setIsForgotPasswordModalOpen(false);
    setIsSignupModalOpen(true);
  };
  return (
    <ModalContext.Provider
      value={{
        isLoginModalOpen,
        isSignupModalOpen,
        isEmailSignupModalOpen,
        isForgotPasswordModalOpen,
        openLoginModal,
        openSignupModal,
        openEmailSignupModal,
        openForgotPasswordModal,
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
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
