"use client";

import { useModal } from "@/contexts/ModalContext";
import DepositModal from "./DepositModal";
import WithdrawModal from "./WithdrawModal";
import BuyModal from "./BuyModal";
import TransferModal from "./TransferModal";
import ConvertModal from "./ConvertModal";
import SellModal from "./SellModal";

export default function DashboardModalWrapper() {
  const {
    isDepositModalOpen,
    closeDepositModal,
    isWithdrawModalOpen,
    closeWithdrawModal,
    isBuyModalOpen,
    closeBuyModal,
    isTransferModalOpen,
    closeTransferModal,
    isConvertModalOpen,
    closeConvertModal,
    isSellModalOpen,
    closeSellModal,
  } = useModal();

  return (
    <>
      <DepositModal isOpen={isDepositModalOpen} onClose={closeDepositModal} />
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={closeWithdrawModal}
      />
      <BuyModal isOpen={isBuyModalOpen} onClose={closeBuyModal} />
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={closeTransferModal}
      />
      <ConvertModal isOpen={isConvertModalOpen} onClose={closeConvertModal} />
      <SellModal isOpen={isSellModalOpen} onClose={closeSellModal} />
    </>
  );
}
