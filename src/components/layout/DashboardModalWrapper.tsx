"use client";

import { useModal } from "@/contexts/ModalContext";
import DepositModal from "../client/DepositModal";
import WithdrawModal from "../client/WithdrawModal";
import BuyModal from "../client/BuyModal";
import SellModal from "../client/SellModal";
import TransferModal from "../client/TransferModal";
import ConvertModal from "../client/ConvertModal";

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
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={closeWithdrawModal}
      />
      <BuyModal isOpen={isBuyModalOpen} onClose={closeBuyModal} />
      <SellModal isOpen={isSellModalOpen} onClose={closeSellModal} />
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={closeTransferModal}
      />
      <ConvertModal isOpen={isConvertModalOpen} onClose={closeConvertModal} />
    </>
  );
}
