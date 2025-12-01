"use client";

import { useModal } from "@/contexts/ModalContext";
import DepositModal from "../client/DepositModalNew";
import WithdrawModalNew from "../client/WithdrawModalNew";
import BuyModalNew from "../client/BuyModalNew";
import SellModalNew from "../client/SellModalNew";
import TransferModalNew from "../client/TransferModalNew";
import ConvertModalNew from "../client/ConvertModalNew";

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

      {/* Dashboard Modals */}
      <DepositModal isOpen={isDepositModalOpen} onClose={closeDepositModal} />
      <WithdrawModalNew
        isOpen={isWithdrawModalOpen}
        onClose={closeWithdrawModal}
      />
      <BuyModalNew isOpen={isBuyModalOpen} onClose={closeBuyModal} />
      <SellModalNew isOpen={isSellModalOpen} onClose={closeSellModal} />
      <TransferModalNew
        isOpen={isTransferModalOpen}
        onClose={closeTransferModal}
      />
      <ConvertModalNew
        isOpen={isConvertModalOpen}
        onClose={closeConvertModal}
      />
    </>
  );
}
