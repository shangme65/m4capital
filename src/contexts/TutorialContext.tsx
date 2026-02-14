"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";

export interface TutorialStep {
  id: string;
  target: string; // CSS selector or data-tutorial attribute
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  highlightPadding?: number;
}

// Define all tutorial steps
export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    target: "center",
    title: "Welcome to M4Capital! 🎉",
    description:
      "Let's take a quick tour to help you navigate the platform and unlock all features. This tour is required to ensure you understand how everything works.",
    position: "center",
  },
  {
    id: "portfolio-balance",
    target: '[data-tutorial="portfolio-balance"]',
    title: "Portfolio Value",
    description:
      "This displays your total portfolio value including all your crypto assets and available balance, converted to your preferred currency.",
    position: "bottom",
    highlightPadding: 12,
  },
  {
    id: "available-balance",
    target: '[data-tutorial="available-balance"]',
    title: "Available Balance",
    description:
      "Your available fiat balance for trading, buying crypto, or transferring to other users on the platform.",
    position: "bottom",
    highlightPadding: 12,
  },
  {
    id: "crypto-assets",
    target: '[data-tutorial="crypto-assets"]',
    title: "Your Crypto Assets",
    description:
      "View all your cryptocurrency holdings here with real-time prices and 24-hour price changes. Click any asset to see more details.",
    position: "top",
    highlightPadding: 12,
  },
  {
    id: "deposit-button",
    target: '[data-tutorial="deposit-button"]',
    title: "Deposit Funds",
    description:
      "Click here to add funds to your account. You can deposit using various cryptocurrencies through our secure payment system.",
    position: "bottom",
    highlightPadding: 8,
  },
  {
    id: "transfer-button",
    target: '[data-tutorial="transfer-button"]',
    title: "Transfer to Users",
    description:
      "Send funds to other M4Capital users using their email address or account number. You can transfer from your fiat balance or crypto assets.",
    position: "bottom",
    highlightPadding: 8,
  },
  {
    id: "withdraw-button",
    target: '[data-tutorial="withdraw-button"]',
    title: "Withdraw Funds",
    description:
      "Withdraw your funds from the platform to your external wallet or bank account.",
    position: "bottom",
    highlightPadding: 8,
  },
  {
    id: "asset-actions",
    target: '[data-tutorial="asset-actions"]',
    title: "Asset Actions",
    description:
      "When you click on an asset, you'll see these action buttons: Send (transfer to platform users), Receive (get crypto via deposit), Swap (exchange cryptos), Buy, and Sell.",
    position: "center",
  },
  {
    id: "sidebar-navigation",
    target: '[data-tutorial="sidebar"]',
    title: "Navigation Menu",
    description:
      "Access all platform features from here: Dashboard, Trade Room, Transaction History, Settings, and more. On mobile, tap the menu icon to open.",
    position: "right",
    highlightPadding: 8,
  },
  {
    id: "profile-settings",
    target: '[data-tutorial="profile-settings"]',
    title: "Profile & Settings",
    description:
      "Manage your account settings, security preferences, notification options, and complete your account verification here.",
    position: "bottom",
    highlightPadding: 8,
  },
  {
    id: "notifications",
    target: '[data-tutorial="notifications"]',
    title: "Notifications",
    description:
      "Stay updated with important alerts about your deposits, withdrawals, trades, and account activities. Enable browser notifications for real-time updates.",
    position: "bottom",
    highlightPadding: 8,
  },
  {
    id: "complete",
    target: "center",
    title: "You're All Set! 🚀",
    description:
      "Great job completing the tour! To unlock all features like deposits, transfers, and trading, you'll need to verify your account. Click 'Complete' to proceed to verification.",
    position: "center",
  },
];

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  currentStepData: TutorialStep | null;
  totalSteps: number;
  goNext: () => void;
  goPrevious: () => void;
  completeTutorial: () => Promise<void>;
  startTutorial: () => void;
  isLoading: boolean;
  tutorialCompleted: boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined
);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [tutorialCompleted, setTutorialCompleted] = useState(true); // Default to true to avoid flash

  // Check if user has completed tutorial on mount
  useEffect(() => {
    const checkTutorialStatus = async () => {
      if (status === "loading") return;

      if (!session?.user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/user/onboarding-status");
        if (response.ok) {
          const data = await response.json();
          setTutorialCompleted(data.tutorialCompleted);

          // Auto-start tutorial if not completed
          if (!data.tutorialCompleted) {
            setIsActive(true);
            setCurrentStep(0);
          }
        }
      } catch (error) {
        console.error("Failed to check tutorial status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkTutorialStatus();
  }, [session?.user?.email, status]);

  const currentStepData =
    currentStep < TUTORIAL_STEPS.length ? TUTORIAL_STEPS[currentStep] : null;

  const goNext = useCallback(() => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const goPrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const completeTutorial = useCallback(async () => {
    try {
      // Immediately restore UI interactivity
      setIsActive(false);
      setCurrentStep(0);
      document.body.style.overflow = "";

      const response = await fetch("/api/user/tutorial-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setTutorialCompleted(true);
      }
    } catch (error) {
      console.error("Failed to complete tutorial:", error);
    }
  }, []);

  const startTutorial = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
  }, []);

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        currentStepData,
        totalSteps: TUTORIAL_STEPS.length,
        goNext,
        goPrevious,
        completeTutorial,
        startTutorial,
        isLoading,
        tutorialCompleted,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
}
