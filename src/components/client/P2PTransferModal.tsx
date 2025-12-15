"use client";
import { useState, useEffect, useOptimistic, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/contexts/ToastContext";
import { sendP2PTransferAction } from "@/actions/p2p-actions";
import { usePortfolio } from "@/lib/usePortfolio";
import {
  X,
  User,
  Mail,
  CreditCard,
  DollarSign,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface P2PTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = "identifier" | "amount" | "confirm" | "pin" | "success";

interface ReceiverInfo {
  id: string;
  name: string;
  email: string;
  accountNumber: string;
}

export default function P2PTransferModal({
  isOpen,
  onClose,
  onSuccess,
}: P2PTransferModalProps) {
  const { data: session } = useSession();
  const { showSuccess, showError } = useToast();
  const { portfolio, refetch } = usePortfolio();

  const [currentStep, setCurrentStep] = useState<Step>("identifier");
  const [identifierType, setIdentifierType] = useState<"email" | "account">(
    "email"
  );
  const [identifier, setIdentifier] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [pin, setPin] = useState("");
  const [receiver, setReceiver] = useState<ReceiverInfo | null>(null);
  const [isPending, startTransition] = useTransition();
  const [hasPinSet, setHasPinSet] = useState(false);
  const [transferResult, setTransferResult] = useState<any>(null);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [settingUpPin, setSettingUpPin] = useState(false);

  const availableBalance = portfolio?.portfolio?.balance || 0;
  const [optimisticBalance, setOptimisticBalance] =
    useOptimistic(availableBalance);

  // Check if user has PIN set
  useEffect(() => {
    if (isOpen) {
      checkPinStatus();
    }
  }, [isOpen]);

  const checkPinStatus = async () => {
    try {
      const response = await fetch("/api/p2p-transfer/set-pin");
      const data = await response.json();
      setHasPinSet(data.hasPinSet);
    } catch (error) {
      console.error("Error checking PIN status:", error);
    }
  };

  const lookupReceiver = async () => {
    if (!identifier.trim()) {
      showError("Please enter an email or account number");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/p2p-transfer/lookup-receiver?identifier=${encodeURIComponent(
            identifier
          )}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to find user");
        }

        setReceiver(data.receiver);
        setCurrentStep("amount");
        showSuccess(`Receiver found: ${data.receiver.name}`);
      } catch (error: any) {
        showError(error.message || "User not found");
      }
    });
  };

  const validateAmount = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      showError("Please enter a valid amount");
      return false;
    }
    return true;
  };

  const handleAmountNext = () => {
    if (validateAmount()) {
      setCurrentStep("confirm");
    }
  };

  const handleConfirmNext = () => {
    if (!hasPinSet) {
      setShowPinSetup(true);
      return;
    }
    setCurrentStep("pin");
  };

  const handleSetupPin = async () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      showError("PIN must be exactly 4 digits");
      return;
    }

    if (newPin !== confirmNewPin) {
      showError("PINs do not match");
      return;
    }

    setSettingUpPin(true);
    try {
      const response = await fetch("/api/p2p-transfer/set-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: newPin }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to set PIN");
      }

      setHasPinSet(true);
      setShowPinSetup(false);
      setNewPin("");
      setConfirmNewPin("");
      showSuccess("Transfer PIN set successfully!");
      setCurrentStep("pin");
    } catch (error: any) {
      showError(error.message || "Failed to set PIN");
    } finally {
      setSettingUpPin(false);
    }
  };

  const processTransfer = async () => {
    if (pin.length !== 4) {
      showError("Please enter your 4-digit PIN");
      return;
    }

    const transferAmount = parseFloat(amount);

    // Optimistic update: deduct amount from balance immediately
    setOptimisticBalance(availableBalance - transferAmount);

    startTransition(async () => {
      try {
        const result = await sendP2PTransferAction(
          identifier,
          transferAmount,
          pin,
          description || undefined
        );

        if (result.success && result.data) {
          setTransferResult(result.data);
          setCurrentStep("success");
          showSuccess("Transfer completed successfully!");

          if (onSuccess) {
            onSuccess();
          }

          // Refresh portfolio data
          await refetch();

          // Reload page after delay to show updated transaction history
          setTimeout(() => {
            window.location.reload();
          }, 2500);
        } else {
          throw new Error(result.error || "Transfer failed");
        }
      } catch (error: any) {
        showError(error.message || "Transfer failed");
        // Reset optimistic balance on error
        setOptimisticBalance(availableBalance);
      }
    });
  };

  const resetForm = () => {
    setCurrentStep("identifier");
    setIdentifier("");
    setAmount("");
    setDescription("");
    setPin("");
    setReceiver(null);
    setTransferResult(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Send Money</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        {currentStep !== "success" && (
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between mb-2">
              {["identifier", "amount", "confirm", "pin"].map((step, index) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      currentStep === step
                        ? "bg-blue-500 text-white"
                        : index <
                          ["identifier", "amount", "confirm", "pin"].indexOf(
                            currentStep
                          )
                        ? "bg-green-500 text-white"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        index <
                        ["identifier", "amount", "confirm", "pin"].indexOf(
                          currentStep
                        )
                          ? "bg-green-500"
                          : "bg-gray-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Enter Identifier */}
          {currentStep === "identifier" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Send To
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setIdentifierType("email")}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      identifierType === "email"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </button>
                  <button
                    onClick={() => setIdentifierType("account")}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      identifierType === "account"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 inline mr-2" />
                    Account
                  </button>
                </div>
                <input
                  type={identifierType === "email" ? "email" : "text"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    identifierType === "email"
                      ? "Enter recipient's email"
                      : "Enter account number"
                  }
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  onKeyPress={(e) => e.key === "Enter" && lookupReceiver()}
                />
              </div>

              <button
                onClick={lookupReceiver}
                disabled={isPending || !identifier.trim()}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>Processing...</>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 2: Enter Amount */}
          {currentStep === "amount" && receiver && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{receiver.name}</p>
                    <p className="text-sm text-gray-400">{receiver.email}</p>
                    <p className="text-xs text-gray-500">
                      {receiver.accountNumber}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount ({session?.user?.preferredCurrency || "USD"})
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this for?"
                  rows={3}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep("identifier")}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleAmountNext}
                  disabled={!amount}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm Transfer */}
          {currentStep === "confirm" && receiver && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Transfer Summary
                </h3>

                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">To</span>
                  <div className="text-right">
                    <p className="text-white font-medium">{receiver.name}</p>
                    <p className="text-sm text-gray-400">{receiver.email}</p>
                  </div>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Account Number</span>
                  <span className="text-white font-medium">
                    {receiver.accountNumber}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-white font-bold text-lg">
                    {parseFloat(amount).toFixed(2)}{" "}
                    {session?.user?.preferredCurrency || "USD"}
                  </span>
                </div>

                {description && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400">Description</span>
                    <span className="text-white">{description}</span>
                  </div>
                )}
              </div>

              {!hasPinSet && (
                <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-500 font-medium">
                      Transfer PIN Required
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Please set up your 4-digit transfer PIN in settings before
                      proceeding.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep("amount")}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleConfirmNext}
                  disabled={!hasPinSet}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Enter PIN */}
          {currentStep === "pin" && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Enter Transfer PIN
                </h3>
                <p className="text-sm text-gray-400">
                  Please enter your 4-digit PIN to authorize this transfer
                </p>
              </div>

              <div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) =>
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="Enter 4-digit PIN"
                  className="w-full bg-gray-800 text-white text-center text-2xl tracking-widest rounded-lg px-4 py-4 border border-gray-700 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep("confirm")}
                  disabled={isPending}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={processTransfer}
                  disabled={isPending || pin.length !== 4}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  {isPending ? "Processing..." : "Send Money"}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {currentStep === "success" && transferResult && (
            <div className="space-y-4 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>

              <h3 className="text-2xl font-bold text-white">
                Transfer Successful!
              </h3>

              <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Amount Sent</span>
                  <span className="text-white font-bold">
                    {parseFloat(transferResult.amount).toFixed(2)}{" "}
                    {transferResult.currency}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">To</span>
                  <span className="text-white">
                    {transferResult.receiverName}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Reference</span>
                  <span className="text-white font-mono text-sm">
                    {transferResult.transactionReference}
                  </span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PIN Setup Modal */}
      {showPinSetup && (
        <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm z-10 flex items-center justify-center p-6">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Lock className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Set Transfer PIN
                </h3>
                <p className="text-sm text-gray-400">
                  Required for P2P transfers
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-300">
                Create a 4-digit PIN to secure your transfers. You'll need this
                PIN for all P2P transactions.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) =>
                    setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  className="w-full bg-gray-700 text-white text-center text-2xl tracking-widest rounded-lg px-4 py-4 border border-gray-600 focus:outline-none focus:border-orange-500"
                  placeholder="••••"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={confirmNewPin}
                  onChange={(e) =>
                    setConfirmNewPin(
                      e.target.value.replace(/\D/g, "").slice(0, 4)
                    )
                  }
                  className="w-full bg-gray-700 text-white text-center text-2xl tracking-widest rounded-lg px-4 py-4 border border-gray-600 focus:outline-none focus:border-orange-500"
                  placeholder="••••"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowPinSetup(false);
                    setNewPin("");
                    setConfirmNewPin("");
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetupPin}
                  disabled={
                    settingUpPin ||
                    newPin.length !== 4 ||
                    confirmNewPin.length !== 4
                  }
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  {settingUpPin ? "Setting..." : "Set PIN"}
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                You can change your PIN later in Settings → Security
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
