"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ModalContextType {
  isLoginModalOpen: boolean;
  isSignupModalOpen: boolean;
  isEmailSignupModalOpen: boolean;
  isForgotPasswordModalOpen: boolean;
  isDepositModalOpen: boolean;
  isWithdrawModalOpen: boolean;
  isBuyModalOpen: boolean;
  isSellModalOpen: boolean;
  isTransferModalOpen: boolean;
  isConvertModalOpen: boolean;
  openLoginModal: () => void;
  openSignupModal: () => void;
  openEmailSignupModal: () => void;
  openForgotPasswordModal: () => void;
  openDepositModal: () => void;
  openWithdrawModal: () => void;
  openBuyModal: () => void;
  openSellModal: () => void;
  openTransferModal: () => void;
  openConvertModal: () => void;
  closeLoginModal: () => void;
  closeSignupModal: () => void;
  closeEmailSignupModal: () => void;
  closeForgotPasswordModal: () => void;
  closeDepositModal: () => void;
  closeWithdrawModal: () => void;
  closeBuyModal: () => void;
  closeSellModal: () => void;
  closeTransferModal: () => void;
  closeConvertModal: () => void;
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
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const openSignupModal = () => setIsSignupModalOpen(true);
  const openEmailSignupModal = () => setIsEmailSignupModalOpen(true);
  const openForgotPasswordModal = () => setIsForgotPasswordModalOpen(true);
  const openDepositModal = () => setIsDepositModalOpen(true);
  const openWithdrawModal = () => setIsWithdrawModalOpen(true);
  const openBuyModal = () => setIsBuyModalOpen(true);
  const openSellModal = () => setIsSellModalOpen(true);
  const openTransferModal = () => setIsTransferModalOpen(true);
  const openConvertModal = () => setIsConvertModalOpen(true);

  const closeLoginModal = () => setIsLoginModalOpen(false);
  const closeSignupModal = () => setIsSignupModalOpen(false);
  const closeEmailSignupModal = () => setIsEmailSignupModalOpen(false);
  const closeForgotPasswordModal = () => setIsForgotPasswordModalOpen(false);
  const closeDepositModal = () => setIsDepositModalOpen(false);
  const closeWithdrawModal = () => setIsWithdrawModalOpen(false);
  const closeBuyModal = () => setIsBuyModalOpen(false);
  const closeSellModal = () => setIsSellModalOpen(false);
  const closeTransferModal = () => setIsTransferModalOpen(false);
  const closeConvertModal = () => setIsConvertModalOpen(false);

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
        isDepositModalOpen,
        isWithdrawModalOpen,
        isBuyModalOpen,
        isSellModalOpen,
        isTransferModalOpen,
        isConvertModalOpen,
        openLoginModal,
        openSignupModal,
        openEmailSignupModal,
        openForgotPasswordModal,
        openDepositModal,
        openWithdrawModal,
        openBuyModal,
        openSellModal,
        openTransferModal,
        openConvertModal,
        closeLoginModal,
        closeSignupModal,
        closeEmailSignupModal,
        closeForgotPasswordModal,
        closeDepositModal,
        closeWithdrawModal,
        closeBuyModal,
        closeSellModal,
        closeTransferModal,
        closeConvertModal,
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
