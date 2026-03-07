"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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

// Poll interval for KYC status when pending/under review (10 seconds)
const KYC_POLL_INTERVAL = 10000;

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
  const previousKycStatus = useRef<string | null>(null);

  // Helper function to fetch verification status
  const fetchVerificationStatus = useCallback(async () => {
    if (!session?.user?.email) return null;

    try {
      const response = await fetch("/api/user/onboarding-status");
      if (response.ok) {
        const data = await response.json();
        return {
          isVerified: data.isVerified,
          tutorialCompleted: data.tutorialCompleted,
          kycStatus: data.kycStatus,
        };
      }
    } catch (error) {
      console.error("Failed to fetch verification status:", error);
    }
    return null;
  }, [session?.user?.email]);

  // Fetch verification status on mount and when session changes
  useEffect(() => {
    const fetchStatus = async () => {
      if (status === "loading") return;

      if (!session?.user?.email) {
        setIsLoading(false);
        return;
      }

      const data = await fetchVerificationStatus();
      if (data) {
        setVerificationStatus(data);
        previousKycStatus.current = data.kycStatus;
      }
      setIsLoading(false);
    };

    fetchStatus();
  }, [session?.user?.email, status, fetchVerificationStatus]);

  // Poll for KYC status updates when status is PENDING or UNDER_REVIEW
  useEffect(() => {
    const shouldPoll =
      verificationStatus.kycStatus === "PENDING" ||
      verificationStatus.kycStatus === "UNDER_REVIEW";

    if (!shouldPoll || !session?.user?.email) return;

    const pollStatus = async () => {
      // Only poll when document is visible
      if (document.visibilityState !== "visible") return;

      const data = await fetchVerificationStatus();
      if (data) {
        // Check if status changed from pending/under_review to approved/rejected
        const statusChanged =
          previousKycStatus.current !== data.kycStatus &&
          (data.kycStatus === "APPROVED" || data.kycStatus === "REJECTED");

        setVerificationStatus(data);
        previousKycStatus.current = data.kycStatus;

        // If status was just approved, close any open verification modals
        if (statusChanged && data.kycStatus === "APPROVED") {
          setShowVerificationModal(false);
        }
      }
    };

    // Set up polling interval
    const pollInterval = setInterval(pollStatus, KYC_POLL_INTERVAL);

    // Also poll on visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        pollStatus();
      }
    };

    // Poll on window focus
    const handleFocus = () => {
      pollStatus();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [
    verificationStatus.kycStatus,
    session?.user?.email,
    fetchVerificationStatus,
  ]);

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
