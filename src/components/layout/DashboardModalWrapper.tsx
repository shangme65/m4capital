"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useModal } from "@/contexts/ModalContext";

// Lazy load modal components for better initial bundle size
const DepositModal = dynamic(() => import("../client/DepositModalNew"), {
  ssr: false,
});
const WithdrawModalNew = dynamic(() => import("../client/WithdrawModalNew"), {
  ssr: false,
});
const BuyModalNew = dynamic(() => import("../client/BuyModalNew"), {
  ssr: false,
});
const SellModalNew = dynamic(() => import("../client/SellModalNew"), {
  ssr: false,
});
const TransferModalNew = dynamic(() => import("../client/TransferModalNew"), {
  ssr: false,
});
const ConvertModalNew = dynamic(() => import("../client/ConvertModalNew"), {
  ssr: false,
});

export function DashboardModalWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    isDepositModalOpen,
    isWithdrawModalOpen,
    isBuyModalOpen,
    isSellModalOpen,
    isTransferModalOpen,
    isConvertModalOpen,
    closeDepositModal,
    closeWithdrawModal,
    closeBuyModal,
    closeSellModal,
    closeTransferModal,
    closeConvertModal,
  } = useModal();

  return (
    <>
      {children}

      {/* Dashboard Modals - Lazy loaded */}
      {isDepositModalOpen && (
        <Suspense fallback={null}>
          <DepositModal isOpen={isDepositModalOpen} onClose={closeDepositModal} />
        </Suspense>
      )}
      {isWithdrawModalOpen && (
        <Suspense fallback={null}>
          <WithdrawModalNew
            isOpen={isWithdrawModalOpen}
            onClose={closeWithdrawModal}
          />
        </Suspense>
      )}
      {isBuyModalOpen && (
        <Suspense fallback={null}>
          <BuyModalNew isOpen={isBuyModalOpen} onClose={closeBuyModal} />
        </Suspense>
      )}
      {isSellModalOpen && (
        <Suspense fallback={null}>
          <SellModalNew isOpen={isSellModalOpen} onClose={closeSellModal} />
        </Suspense>
      )}
      {isTransferModalOpen && (
        <Suspense fallback={null}>
          <TransferModalNew
            isOpen={isTransferModalOpen}
            onClose={closeTransferModal}
          />
        </Suspense>
      )}
      {isConvertModalOpen && (
        <Suspense fallback={null}>
          <ConvertModalNew
            isOpen={isConvertModalOpen}
            onClose={closeConvertModal}
          />
        </Suspense>
      )}
    </>
  );
}
