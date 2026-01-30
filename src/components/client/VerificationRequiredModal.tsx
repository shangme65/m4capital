"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ShieldCheck, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface VerificationRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  action?: string | null;
  kycStatus?: string | null;
}

export default function VerificationRequiredModal({
  isOpen,
  onClose,
  action,
  kycStatus,
}: VerificationRequiredModalProps) {
  const router = useRouter();

  const getActionText = () => {
    switch (action) {
      case "deposit":
        return "make a deposit";
      case "withdraw":
        return "withdraw funds";
      case "transfer":
        return "transfer funds";
      case "send":
        return "send crypto";
      case "receive":
        return "receive crypto";
      case "buy":
        return "buy crypto";
      case "sell":
        return "sell crypto";
      case "swap":
        return "swap crypto";
      default:
        return "use this feature";
    }
  };

  const getStatusMessage = () => {
    switch (kycStatus) {
      case "PENDING":
        return {
          title: "Verification Pending",
          description:
            "Your verification documents are being reviewed. This usually takes 24-48 hours. We'll notify you once approved.",
          icon: ShieldAlert,
          iconColor: "text-yellow-500",
          bgColor: "from-yellow-500/20 to-orange-500/20",
          borderColor: "border-yellow-500/30",
          canSubmit: false,
        };
      case "UNDER_REVIEW":
        return {
          title: "Under Review",
          description:
            "Our team is currently reviewing your verification documents. You'll receive a notification once the review is complete.",
          icon: ShieldAlert,
          iconColor: "text-blue-500",
          bgColor: "from-blue-500/20 to-cyan-500/20",
          borderColor: "border-blue-500/30",
          canSubmit: false,
        };
      case "REJECTED":
        return {
          title: "Verification Rejected",
          description:
            "Your previous verification was rejected. Please submit new documents to verify your account and unlock all features.",
          icon: ShieldAlert,
          iconColor: "text-red-500",
          bgColor: "from-red-500/20 to-pink-500/20",
          borderColor: "border-red-500/30",
          canSubmit: true,
        };
      default:
        return {
          title: "Verification Required",
          description:
            "To ensure the security of your account and comply with regulations, please verify your identity to unlock all platform features.",
          icon: ShieldCheck,
          iconColor: "text-blue-500",
          bgColor: "from-blue-500/20 to-purple-500/20",
          borderColor: "border-blue-500/30",
          canSubmit: true,
        };
    }
  };

  const status = getStatusMessage();
  const StatusIcon = status.icon;

  const handleVerify = () => {
    onClose();
    router.push("/settings?tab=verification");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-[10000] flex items-center justify-center"
          >
            <div
              className={`w-full bg-gradient-to-br from-gray-800/98 to-gray-900/98 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(59,130,246,0.3)] border ${status.borderColor}`}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${status.bgColor} flex items-center justify-center`}
                >
                  <StatusIcon className={`w-8 h-8 sm:w-10 sm:h-10 ${status.iconColor}`} />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-2">
                {status.title}
              </h2>

              {/* Action attempted */}
              {action && (
                <p className="text-center text-gray-400 text-xs sm:text-sm mb-3">
                  You need to verify your account to{" "}
                  <span className="text-white font-medium">
                    {getActionText()}
                  </span>
                </p>
              )}

              {/* Description */}
              <p className="text-gray-300 text-center text-xs sm:text-sm leading-relaxed mb-4">
                {status.description}
              </p>

              {/* Features list */}
              <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 mb-4 border border-gray-700/50">
                <p className="text-gray-400 text-[10px] sm:text-xs font-medium mb-2 uppercase tracking-wider">
                  Verification unlocks:
                </p>
                <div className="space-y-1.5 sm:space-y-2">
                  {[
                    "Crypto deposits & withdrawals",
                    "P2P transfers to users",
                    "Buy, sell & swap crypto",
                    "Higher transaction limits",
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs sm:text-sm text-gray-300"
                    >
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-700/50 text-gray-300 font-medium text-sm sm:text-base rounded-xl hover:bg-gray-600/50 transition-all border border-gray-600/50"
                >
                  Cancel
                </button>
                {status.canSubmit && (
                  <button
                    onClick={handleVerify}
                    className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm sm:text-base rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-[0_4px_16px_rgba(59,130,246,0.4)]"
                  >
                    Verify Now
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
