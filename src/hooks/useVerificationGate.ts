"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface VerificationStatus {
  isVerified: boolean;
  tutorialCompleted: boolean;
  kycStatus: "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW" | null;
}

interface UseVerificationGateReturn {
  isVerified: boolean;
  isLoading: boolean;
  tutorialCompleted: boolean;
  kycStatus: string | null;
  checkVerification: () => Promise<boolean>;
  requireVerification: (action: string) => boolean;
  showVerificationModal: boolean;
  setShowVerificationModal: (show: boolean) => void;
  pendingAction: string | null;
}

export function useVerificationGate(): UseVerificationGateReturn {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>({
      isVerified: false,
      tutorialCompleted: false,
      kycStatus: null,
    });
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  // Fetch verification status on mount and when session changes
  useEffect(() => {
    const fetchStatus = async () => {
      if (status === "loading") return;

      if (!session?.user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/user/onboarding-status");
        if (response.ok) {
          const data = await response.json();
          setVerificationStatus({
            isVerified: data.isVerified,
            tutorialCompleted: data.tutorialCompleted,
            kycStatus: data.kycStatus,
          });
        }
      } catch (error) {
        console.error("Failed to fetch verification status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [session?.user?.email, status]);

  // Check verification and return status
  const checkVerification = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/user/onboarding-status");
      if (response.ok) {
        const data = await response.json();
        setVerificationStatus({
          isVerified: data.isVerified,
          tutorialCompleted: data.tutorialCompleted,
          kycStatus: data.kycStatus,
        });
        return data.isVerified;
      }
      return false;
    } catch (error) {
      console.error("Failed to check verification:", error);
      return false;
    }
  }, []);

  // Require verification before allowing an action
  // Returns true if verified (action can proceed), false if not (shows modal)
  const requireVerification = useCallback(
    (action: string): boolean => {
      // If tutorial not completed, they shouldn't be able to do anything
      if (!verificationStatus.tutorialCompleted) {
        return false;
      }

      // If verified, allow the action
      if (verificationStatus.isVerified) {
        return true;
      }

      // Not verified - show modal and block action
      setPendingAction(action);
      setShowVerificationModal(true);
      return false;
    },
    [verificationStatus.isVerified, verificationStatus.tutorialCompleted]
  );

  return {
    isVerified: verificationStatus.isVerified,
    isLoading,
    tutorialCompleted: verificationStatus.tutorialCompleted,
    kycStatus: verificationStatus.kycStatus,
    checkVerification,
    requireVerification,
    showVerificationModal,
    setShowVerificationModal,
    pendingAction,
  };
}
