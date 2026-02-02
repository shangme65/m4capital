"use client";
import React from "react";
import ReactDOM from "react-dom";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/contexts/ToastContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSidebar } from "@/components/client/SidebarContext";
import ConfirmModal from "@/components/client/ConfirmModal";
import CurrencySelector from "@/components/client/CurrencySelector";
import Image from "next/image";
import {
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Bell,
  Mail,
  MessageCircle,
  Copy,
  Check,
  ChevronRight,
  X,
  User,
  Shield,
  FileCheck,
  Settings as SettingsIcon,
  Database,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  Lock,
  Loader2,
  Sun,
  Moon,
  Monitor,
  Globe,
  ArrowLeft,
  Menu,
} from "lucide-react";

// Full-screen KYC Submission Loading Modal
function KycSubmissionLoadingModal() {
  return (
    <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-center px-6">
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-orange-500/10 rounded-full blur-[80px] animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm text-center">
        {/* 3D Animated Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto relative">
            {/* Outer ring with 3D shadow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-green-400 to-green-600 shadow-[0_10px_30px_rgba(34,197,94,0.4),inset_0_-5px_20px_rgba(0,0,0,0.3)] animate-pulse" />
            {/* Inner ring */}
            <div className="absolute inset-2 rounded-full bg-gray-900 flex items-center justify-center shadow-[inset_0_5px_15px_rgba(0,0,0,0.5)]">
              {/* Spinning loader */}
              <Loader2 className="w-10 h-10 text-green-400 animate-spin" />
            </div>
            {/* Orbiting dot */}
            <div className="absolute inset-0 animate-[spin_2s_linear_infinite]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-3">
          Submitting Your Documents
        </h2>
        <p className="text-gray-400 text-sm mb-8">
          Please wait while we securely upload and process your verification
          documents...
        </p>

        {/* 3D Progress Bar */}
        <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
          {/* Animated gradient bar */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div
              className="h-full bg-gradient-to-r from-green-600 via-green-400 to-green-600 rounded-full animate-[progressSlide_2s_ease-in-out_infinite]"
              style={{
                backgroundSize: "200% 100%",
              }}
            />
          </div>
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
          {/* Moving glow */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
          </div>
        </div>

        {/* Status dots */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <span className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Encrypting
          </span>
          <span className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-300" />
            Uploading
          </span>
          <span className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-500" />
            Verifying
          </span>
        </div>

        {/* Security note */}
        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-gray-500">
          <Shield className="w-4 h-4" />
          <span>Your data is encrypted and secure</span>
        </div>
      </div>

      {/* CSS for custom animations */}
      <style jsx>{`
        @keyframes progressSlide {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(400%);
          }
        }
      `}</style>
    </div>
  );
}

// Modal component for full-screen settings sections - 3D Dark Theme
// IMPORTANT: Defined outside SettingsPage to prevent re-creation on state changes
function SettingsModal({
  isOpen,
  onClose,
  title,
  children,
  toggleSidebar,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  toggleSidebar: () => void;
}) {
  // Handle browser back button
  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = () => {
      onClose();
    };

    // Push a state when modal opens
    window.history.pushState({ modal: true }, "");
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed top-0 left-0 right-0 bottom-0 z-[100] min-h-screen w-screen"
      style={{
        background: "linear-gradient(180deg, #0f172a 0%, #020617 100%)",
      }}
    >
      <div className="h-full overflow-y-auto">
        {/* Custom Header for Modal */}
        <div className="sticky top-0 z-10 bg-gray-900/100 backdrop-blur-sm">
          <div className="flex justify-between items-center p-3 sm:p-6">
            <Image
              src="/m4capitallogo1.png"
              alt="M4 Capital Logo"
              width={120}
              height={40}
              className="object-contain mobile:w-20 w-24 md:w-auto"
              priority
            />
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="relative text-gray-400 hover:text-white transition-colors"
                title="Notifications"
              >
                <Bell size={18} className="mobile:w-[18px] mobile:h-[18px] sm:w-6 sm:h-6" />
              </button>
              <button
                type="button"
                onClick={toggleSidebar}
                className="flex items-center cursor-pointer p-1 sm:p-2 rounded-lg transition-colors focus:outline-none hover:bg-white/5"
                aria-label="Open sidebar"
              >
                <Menu size={20} className="mobile:w-5 mobile:h-5 sm:w-[22px] sm:h-[22px] text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Back Button - Outside of cards */}
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
        </div>

        {/* Content area with card wrapper */}
        <div className="max-w-4xl mx-auto px-4 pt-4 pb-4 space-y-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { language, setLanguage, languages, currentLanguage } = useLanguage();
  const { toggleSidebar } = useSidebar();

  // Phone number placeholder mapping based on country
  const getPhoneNumberPlaceholder = (countryName: string | null | undefined): string => {
    if (!countryName) return "+1 (555) 123-4567";
    
    const phoneFormats: Record<string, string> = {
      "Brazil": "+55 (11) 98765-4321",
      "United States": "+1 (555) 123-4567",
      "United Kingdom": "+44 20 7123 4567",
      "Canada": "+1 (555) 123-4567",
      "Nigeria": "+234 802 123 4567",
      "South Africa": "+27 82 123 4567",
      "India": "+91 98765 43210",
      "Australia": "+61 4 1234 5678",
      "Germany": "+49 151 23456789",
      "France": "+33 6 12 34 56 78",
      "Spain": "+34 612 34 56 78",
      "Italy": "+39 312 345 6789",
      "Mexico": "+52 55 1234 5678",
      "Argentina": "+54 9 11 1234-5678",
      "China": "+86 138 0000 0000",
      "Japan": "+81 90-1234-5678",
      "South Korea": "+82 10-1234-5678",
      "Russia": "+7 (999) 123-45-67",
      "Turkey": "+90 532 123 45 67",
      "Netherlands": "+31 6 12345678",
      "Belgium": "+32 470 12 34 56",
      "Switzerland": "+41 76 123 45 67",
      "Sweden": "+46 70 123 45 67",
      "Norway": "+47 412 34 567",
      "Denmark": "+45 12 34 56 78",
      "Finland": "+358 40 123 4567",
      "Poland": "+48 512 345 678",
      "Portugal": "+351 912 345 678",
      "Greece": "+30 691 234 5678",
      "Egypt": "+20 100 123 4567",
      "Kenya": "+254 712 345678",
      "Ghana": "+233 24 123 4567",
      "Saudi Arabia": "+966 50 123 4567",
      "United Arab Emirates": "+971 50 123 4567",
      "Singapore": "+65 8123 4567",
      "Malaysia": "+60 12-345 6789",
      "Thailand": "+66 81 234 5678",
      "Vietnam": "+84 91 234 56 78",
      "Philippines": "+63 917 123 4567",
      "Indonesia": "+62 812-3456-7890",
      "New Zealand": "+64 21 123 4567",
      "Ireland": "+353 85 123 4567",
      "Israel": "+972 50-123-4567",
      "Chile": "+56 9 1234 5678",
      "Colombia": "+57 312 345 6789",
      "Peru": "+51 987 654 321",
      "Venezuela": "+58 412-1234567",
      "Pakistan": "+92 300 1234567",
      "Bangladesh": "+880 1712-345678",
      "Czech Republic": "+420 601 234 567",
      "Austria": "+43 664 123456",
      "Hungary": "+36 20 123 4567",
      "Romania": "+40 712 345 678",
      "Ukraine": "+380 67 123 4567",
    };
    
    return phoneFormats[countryName] || "+1 (555) 123-4567";
  };

  // Format phone number based on country
  const formatPhoneNumber = (value: string, countryName: string | null | undefined): string => {
    // Remove all non-numeric characters except +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    if (!countryName || !cleaned) return cleaned;

    // Extract just the digits (no +)
    const digits = cleaned.replace(/\+/g, '');

    // Format patterns for each country
    const formatPatterns: Record<string, (digits: string) => string> = {
      "Brazil": (d) => {
        // +55 (11) 98765-4321
        if (d.length <= 2) return `+${d}`;
        if (d.length <= 4) return `+${d.slice(0, 2)} (${d.slice(2)}`;
        if (d.length <= 9) return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4)}`;
        return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9, 13)}`;
      },
      "United States": (d) => {
        // +1 (555) 123-4567
        if (d.length <= 1) return `+${d}`;
        if (d.length <= 4) return `+${d.slice(0, 1)} (${d.slice(1)}`;
        if (d.length <= 7) return `+${d.slice(0, 1)} (${d.slice(1, 4)}) ${d.slice(4)}`;
        return `+${d.slice(0, 1)} (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 11)}`;
      },
      "Canada": (d) => {
        // Same as US: +1 (555) 123-4567
        if (d.length <= 1) return `+${d}`;
        if (d.length <= 4) return `+${d.slice(0, 1)} (${d.slice(1)}`;
        if (d.length <= 7) return `+${d.slice(0, 1)} (${d.slice(1, 4)}) ${d.slice(4)}`;
        return `+${d.slice(0, 1)} (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 11)}`;
      },
      "Nigeria": (d) => {
        // +234 802 123 4567
        if (d.length <= 3) return `+${d}`;
        if (d.length <= 6) return `+${d.slice(0, 3)} ${d.slice(3)}`;
        if (d.length <= 9) return `+${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
        return `+${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9, 13)}`;
      },
      "United Kingdom": (d) => {
        // +44 20 7123 4567
        if (d.length <= 2) return `+${d}`;
        if (d.length <= 4) return `+${d.slice(0, 2)} ${d.slice(2)}`;
        if (d.length <= 8) return `+${d.slice(0, 2)} ${d.slice(2, 4)} ${d.slice(4)}`;
        return `+${d.slice(0, 2)} ${d.slice(2, 4)} ${d.slice(4, 8)} ${d.slice(8, 12)}`;
      },
    };

    const formatter = formatPatterns[countryName];
    if (formatter) {
      return formatter(digits);
    }

    // Default: just add + at the start
    return `+${digits}`;
  };

  // Handle phone number input with formatting
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value, session?.user?.country);
    setPhoneNumber(formatted);
  };


  // Modal state
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Confirm modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "warning" as "danger" | "warning" | "info",
  });

  // Email notification preferences state
  const [emailPreferences, setEmailPreferences] = useState({
    emailNotifications: true,
    kycNotifications: true,
    tradingNotifications: true,
    securityNotifications: true,
  });
  const [loadingEmailPrefs, setLoadingEmailPrefs] = useState(true);
  const [savingEmailPrefs, setSavingEmailPrefs] = useState(false);

  // Telegram linking state
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState<string | null>(null);
  const [linkCode, setLinkCode] = useState("");
  const [linkingTelegram, setLinkingTelegram] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState(false);
  const [loadingTelegram, setLoadingTelegram] = useState(true);

  // Account number state
  const [accountNumber, setAccountNumber] = useState<string | null>(null);
  const [copiedAccountNumber, setCopiedAccountNumber] = useState(false);

  // Profile edit state
  const [profileName, setProfileName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [showReVerifyModal, setShowReVerifyModal] = useState(false);
  const [showPersonalDataModal, setShowPersonalDataModal] = useState(false);
  const [showAccountNumberModal, setShowAccountNumberModal] = useState(false);
  
  // Contact info state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [citizenship, setCitizenship] = useState("");
  
  // Phone verification state
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [devVerificationCode, setDevVerificationCode] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<string | null>(null);
  const [settingUp2FA, setSettingUp2FA] = useState(false);
  const [twoFactorQRCode, setTwoFactorQRCode] = useState<string | null>(null);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [verifying2FA, setVerifying2FA] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [disabling2FA, setDisabling2FA] = useState(false);
  const [disable2FAPassword, setDisable2FAPassword] = useState("");
  const [showDisable2FA, setShowDisable2FA] = useState(false);

  // Transfer PIN state
  const [hasTransferPin, setHasTransferPin] = useState(false);
  const [showTransferPinSetup, setShowTransferPinSetup] = useState(false);
  const [transferPin, setTransferPin] = useState("");
  const [confirmTransferPin, setConfirmTransferPin] = useState("");
  const [currentTransferPin, setCurrentTransferPin] = useState("");
  const [settingTransferPin, setSettingTransferPin] = useState(false);
  const [transferPinError, setTransferPinError] = useState<string | null>(null);
  const [transferPinSuccess, setTransferPinSuccess] = useState(false);

  // KYC state
  const [kycStatus, setKycStatus] = useState<
    "NOT_STARTED" | "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW"
  >("NOT_STARTED");
  const [kycStage, setKycStage] = useState(1); // 1: Personal Info, 2: Address Info, 3: Documents
  const [documents, setDocuments] = useState({
    idDocument: null as File | null,
    proofOfAddress: null as File | null,
    selfie: null as File | null,
  });
  const [kycData, setKycData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    address: "",
    city: "",
    postalCode: "",
    phoneNumber: "",
  });
  const [submittingKyc, setSubmittingKyc] = useState(false);
  const [loadingKyc, setLoadingKyc] = useState(true);

  // Currency preference state
  const [preferredCurrency, setPreferredCurrency] = useState("USD");
  const [loadingCurrency, setLoadingCurrency] = useState(true);
  const [savingCurrency, setSavingCurrency] = useState(false);

  // Fetch email preferences on mount
  useEffect(() => {
    const fetchEmailPrefs = async () => {
      try {
        const response = await fetch("/api/user/email-preferences");
        if (response.ok) {
          const data = await response.json();
          setEmailPreferences(data);
        }
      } catch (error) {
        console.error("Error fetching email preferences:", error);
      } finally {
        setLoadingEmailPrefs(false);
      }
    };
    fetchEmailPrefs();
  }, []);

  // Fetch KYC status on mount
  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        const response = await fetch("/api/kyc/status");
        if (response.ok) {
          const data = await response.json();
          if (data.kycVerification) {
            const kyc = data.kycVerification;
            setKycStatus(kyc.status);
            setKycData({
              firstName: kyc.firstName || "",
              lastName: kyc.lastName || "",
              dateOfBirth: kyc.dateOfBirth
                ? new Date(kyc.dateOfBirth).toISOString().split("T")[0]
                : "",
              nationality: kyc.nationality || "",
              address: kyc.address || "",
              city: kyc.city || "",
              postalCode: kyc.postalCode || "",
              phoneNumber: kyc.phoneNumber || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch KYC status:", error);
      } finally {
        setLoadingKyc(false);
      }
    };

    fetchKycStatus();
  }, []);

  // Fetch Telegram linking status on mount
  useEffect(() => {
    const fetchTelegramStatus = async () => {
      try {
        const response = await fetch("/api/telegram/link");
        if (response.ok) {
          const data = await response.json();
          if (data.linked) {
            setTelegramLinked(true);
            setTelegramUsername(data.telegramUsername);
          }
        }
      } catch (error) {
        console.error("Failed to fetch Telegram status:", error);
      } finally {
        setLoadingTelegram(false);
      }
    };
    fetchTelegramStatus();
  }, []);

  // Fetch 2FA status and account number on mount
  useEffect(() => {
    const fetch2FAStatus = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setTwoFactorEnabled(data.twoFactorEnabled || false);
          setTwoFactorMethod(data.twoFactorMethod || null);
          setAccountNumber(data.accountNumber || null);
        }
      } catch (error) {
        console.error("Failed to fetch 2FA status:", error);
      }
    };
    fetch2FAStatus();
  }, []);

  // Fetch transfer PIN status on mount
  useEffect(() => {
    const fetchTransferPinStatus = async () => {
      try {
        const response = await fetch("/api/p2p-transfer/set-pin");
        if (response.ok) {
          const data = await response.json();
          setHasTransferPin(data.hasPinSet || false);
        }
      } catch (error) {
        console.error("Failed to fetch transfer PIN status:", error);
      }
    };
    fetchTransferPinStatus();
  }, []);

  // Fetch currency preference on mount
  useEffect(() => {
    const fetchCurrencyPreference = async () => {
      try {
        const response = await fetch("/api/user/preferences");
        if (response.ok) {
          const data = await response.json();
          setPreferredCurrency(data.preferredCurrency || "USD");
        }
      } catch (error) {
        console.error("Failed to fetch currency preference:", error);
      } finally {
        setLoadingCurrency(false);
      }
    };
    fetchCurrencyPreference();
  }, []);

  // Copy account number to clipboard
  const copyAccountNumber = async () => {
    if (!accountNumber) return;
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopiedAccountNumber(true);
      showSuccess("Account number copied to clipboard!");
      setTimeout(() => setCopiedAccountNumber(false), 2000);
    } catch (error) {
      showError("Failed to copy account number");
    }
  };

  // Initialize profile name and country from session
  useEffect(() => {
    if (session?.user?.name) {
      setProfileName(session.user.name);
      setOriginalName(session.user.name);
    }
    if (session?.user?.country) {
      setCountry(session.user.country);
    }
  }, [session?.user?.name, session?.user?.country]);

  // Load phone verification status
  useEffect(() => {
    const loadPhoneStatus = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          if (data.phoneNumber) {
            setPhoneNumber(data.phoneNumber);
          }
          if (data.phoneVerified) {
            setPhoneVerified(true);
          }
        }
      } catch (error) {
        console.error("Failed to load phone status:", error);
      }
    };

    loadPhoneStatus();
  }, [session?.user?.id]);

  // Send phone verification code
  const handleSendVerificationCode = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      showError("Please enter a valid phone number");
      return;
    }

    setSendingCode(true);
    setVerificationError(null);

    try {
      const response = await fetch("/api/user/phone/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send verification code");
      }

      setCodeSent(true);
      setShowPhoneVerification(true);
      
      // In development, store the code for easy testing
      if (data.devCode) {
        setDevVerificationCode(data.devCode);
        showInfo(`Development code: ${data.devCode}`);
      }
      
      showSuccess("Verification code sent to your phone number");
    } catch (error: any) {
      showError(error.message || "Failed to send verification code");
      setVerificationError(error.message);
    } finally {
      setSendingCode(false);
    }
  };

  // Verify phone code
  const handleVerifyPhoneCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      showError("Please enter the 6-digit verification code");
      return;
    }

    setVerifyingCode(true);
    setVerificationError(null);

    try {
      const response = await fetch("/api/user/phone/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify code");
      }

      setPhoneVerified(true);
      setShowPhoneVerification(false);
      setVerificationCode("");
      setCodeSent(false);
      showSuccess("Phone number verified successfully!");
      
      // Update session
      await updateSession();
    } catch (error: any) {
      showError(error.message || "Failed to verify code");
      setVerificationError(error.message);
    } finally {
      setVerifyingCode(false);
    }
  };


  // Check if profile has been modified
  const hasProfileChanges = useMemo(() => {
    return (
      (profileName !== originalName && profileName.trim() !== "") ||
      phoneNumber.trim() !== "" ||
      dateOfBirth.trim() !== "" ||
      country.trim() !== "" ||
      timezone.trim() !== "" ||
      citizenship.trim() !== ""
    );
  }, [profileName, originalName, phoneNumber, dateOfBirth, country, timezone, citizenship]);

  // Handle profile save - shows re-verification modal
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasProfileChanges) return;
    setShowReVerifyModal(true);
  };

  // Confirm profile save and reset KYC
  const confirmProfileSave = async () => {
    setSaving(true);
    setShowReVerifyModal(false);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: profileName, 
          phoneNumber,
          dateOfBirth,
          country,
          timezone,
          citizenship,
          resetKyc: true 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setOriginalName(profileName);
      setKycStatus("NOT_STARTED");
      showSuccess("Profile updated. Please re-submit your KYC documents.");
    } catch (error) {
      showError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Email preferences handler
  const handleEmailPreferenceChange = async (
    key: keyof typeof emailPreferences,
    value: boolean
  ) => {
    setSavingEmailPrefs(true);

    // Optimistically update UI
    const newPreferences = { ...emailPreferences, [key]: value };

    // If turning off master switch, turn off all sub-switches
    if (key === "emailNotifications" && !value) {
      newPreferences.kycNotifications = false;
      newPreferences.tradingNotifications = false;
      newPreferences.securityNotifications = false;
    }

    setEmailPreferences(newPreferences);

    try {
      const response = await fetch("/api/user/email-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });

      if (!response.ok) {
        throw new Error("Failed to update preferences");
      }

      const data = await response.json();
      setEmailPreferences(data.preferences);
    } catch (error) {
      console.error("Error updating email preferences:", error);
      // Revert on error
      setEmailPreferences(emailPreferences);
      showError("Failed to update email preferences. Please try again.");
    } finally {
      setSavingEmailPrefs(false);
    }
  };

  // Currency preference handler
  const handleCurrencyChange = async (currency: string) => {
    setSavingCurrency(true);
    const previousCurrency = preferredCurrency;

    // Optimistically update UI
    setPreferredCurrency(currency);

    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredCurrency: currency }),
      });

      if (!response.ok) {
        throw new Error("Failed to update currency preference");
      }

      showSuccess(`Currency preference updated to ${currency}`);

      // Dispatch event to notify all components of currency change
      window.dispatchEvent(
        new CustomEvent("currencyChanged", { detail: { currency } })
      );

      // Optionally reload after a short delay to ensure all state is updated
      // Remove the reload if you want instant updates without page refresh
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error updating currency preference:", error);
      // Revert on error
      setPreferredCurrency(previousCurrency);
      showError("Failed to update currency preference. Please try again.");
    } finally {
      setSavingCurrency(false);
    }
  };

  // Handle Telegram linking with code
  const handleTelegramLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkingTelegram(true);
    setLinkError(null);
    setLinkSuccess(false);

    try {
      const response = await fetch("/api/telegram/link", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: linkCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to link Telegram account");
      }

      setTelegramLinked(true);
      setTelegramUsername(data.telegramUsername);
      setLinkSuccess(true);
      setLinkCode("");

      // Hide success message after 5 seconds
      setTimeout(() => setLinkSuccess(false), 5000);
    } catch (error: any) {
      setLinkError(error.message || "Failed to link Telegram account");
    } finally {
      setLinkingTelegram(false);
    }
  };

  // Handle unlinking Telegram
  const handleTelegramUnlink = async () => {
    setConfirmModalConfig({
      title: "Unlink Telegram Account",
      message:
        "Are you sure you want to unlink your Telegram account? You will no longer receive notifications via Telegram.",
      variant: "warning",
      onConfirm: async () => {
        try {
          const response = await fetch("/api/telegram/link", {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to unlink Telegram account");
          }

          setTelegramLinked(false);
          setTelegramUsername(null);
        } catch (error: any) {
          setLinkError(error.message || "Failed to unlink Telegram account");
        }
      },
    });
    setShowConfirmModal(true);
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Hide success message after 5 seconds
      setTimeout(() => setPasswordSuccess(false), 5000);
    } catch (error: any) {
      setPasswordError(error.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!session?.user?.email) {
      return;
    }

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });

      if (response.ok) {
        showSuccess(
          "Password reset instructions have been sent to your email address."
        );
      } else {
        showError("Failed to send password reset email. Please try again.");
      }
    } catch (error) {
      showError("An error occurred. Please try again.");
    }
  };

  // Handle 2FA setup
  const handle2FASetup = async (method: "APP" | "EMAIL") => {
    setTwoFactorError(null);
    setSettingUp2FA(true);

    try {
      const response = await fetch("/api/user/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to setup 2FA");
      }

      if (method === "APP") {
        setTwoFactorQRCode(data.qrCode);
        setTwoFactorSecret(data.secret);
        setShow2FASetup(true);
      } else {
        setTwoFactorMethod("EMAIL");
        setTwoFactorEnabled(true);
        showSuccess(data.message);
      }
    } catch (error: any) {
      setTwoFactorError(error.message || "Failed to setup 2FA");
    } finally {
      setSettingUp2FA(false);
    }
  };

  // Handle 2FA verification
  const handle2FAVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorError(null);
    setVerifying2FA(true);

    try {
      const response = await fetch("/api/user/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFactorCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify code");
      }

      setTwoFactorEnabled(true);
      setTwoFactorMethod("APP");
      setShow2FASetup(false);
      setTwoFactorCode("");
      setTwoFactorQRCode(null);
      setTwoFactorSecret(null);
      showSuccess("Two-factor authentication enabled successfully!");
    } catch (error: any) {
      setTwoFactorError(error.message || "Failed to verify code");
    } finally {
      setVerifying2FA(false);
    }
  };

  // Handle 2FA disable
  const handle2FADisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorError(null);
    setDisabling2FA(true);

    try {
      const response = await fetch("/api/user/2fa/disable", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: disable2FAPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to disable 2FA");
      }

      setTwoFactorEnabled(false);
      setTwoFactorMethod(null);
      setShowDisable2FA(false);
      setDisable2FAPassword("");
      showSuccess("Two-factor authentication disabled successfully!");
    } catch (error: any) {
      setTwoFactorError(error.message || "Failed to disable 2FA");
    } finally {
      setDisabling2FA(false);
    }
  };

  // Handle transfer PIN setup/change
  const handleTransferPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferPinError(null);
    setTransferPinSuccess(false);

    // Validate PIN
    if (transferPin.length !== 4 || !/^\d{4}$/.test(transferPin)) {
      setTransferPinError("PIN must be exactly 4 digits");
      return;
    }

    if (transferPin !== confirmTransferPin) {
      setTransferPinError("PINs do not match");
      return;
    }

    // If changing PIN, verify current PIN
    if (hasTransferPin && !currentTransferPin) {
      setTransferPinError("Please enter your current PIN");
      return;
    }

    setSettingTransferPin(true);

    try {
      const body: any = { pin: transferPin };
      if (hasTransferPin) {
        body.currentPin = currentTransferPin;
      }

      const response = await fetch("/api/p2p-transfer/set-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to set transfer PIN");
      }

      setHasTransferPin(true);
      setShowTransferPinSetup(false);
      setTransferPin("");
      setConfirmTransferPin("");
      setCurrentTransferPin("");
      setTransferPinSuccess(true);
      showSuccess(
        hasTransferPin
          ? "Transfer PIN changed successfully!"
          : "Transfer PIN set successfully!"
      );

      // Hide success message after 3 seconds
      setTimeout(() => setTransferPinSuccess(false), 3000);
    } catch (error: any) {
      setTransferPinError(error.message || "Failed to set transfer PIN");
    } finally {
      setSettingTransferPin(false);
    }
  };

  const handleFileChange = (
    type: "idDocument" | "proofOfAddress" | "selfie",
    file: File | null
  ) => {
    setDocuments((prev) => ({ ...prev, [type]: file }));
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all documents are uploaded
    if (!documents.idDocument) {
      showError("Please upload your government-issued ID document");
      return;
    }
    if (!documents.proofOfAddress) {
      showError("Please upload your proof of address document");
      return;
    }
    if (!documents.selfie) {
      showError("Please upload your selfie");
      return;
    }
    
    // Validate required fields
    if (!kycData.firstName || !kycData.lastName || !kycData.dateOfBirth || 
        !kycData.nationality || !kycData.phoneNumber || !kycData.address || 
        !kycData.city || !kycData.postalCode) {
      showError("Please fill in all required fields");
      return;
    }
    
    setSubmittingKyc(true);

    try {
      const formData = new FormData();

      // Add text fields
      formData.append("firstName", kycData.firstName);
      formData.append("lastName", kycData.lastName);
      formData.append("dateOfBirth", kycData.dateOfBirth);
      formData.append("nationality", kycData.nationality);
      formData.append("phoneNumber", kycData.phoneNumber);
      formData.append("address", kycData.address);
      formData.append("city", kycData.city);
      formData.append("postalCode", kycData.postalCode);
      formData.append("country", kycData.nationality); // Using nationality as country for now

      // Add files
      formData.append("idDocument", documents.idDocument);
      formData.append("proofOfAddress", documents.proofOfAddress);
      formData.append("selfie", documents.selfie);

      const response = await fetch("/api/kyc/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setKycStatus("PENDING");
        showSuccess(
          "KYC verification submitted successfully! We'll review your documents within 24-48 hours."
        );
      } else {
        showError(data.error || "Failed to submit KYC verification");
      }
    } catch (error) {
      console.error("KYC submission error:", error);
      showError("Failed to submit KYC verification. Please try again.");
    } finally {
      setSubmittingKyc(false);
    }
  };

  // Memoize close modal callback
  const closeModal = useCallback(() => setActiveModal(null), []);

  // Settings menu items
  const settingsItems = [
    {
      id: "profile",
      title: "Profile",
      description: "Manage your personal information",
      icon: User,
    },
    {
      id: "security",
      title: "Security",
      description: "Password and authentication settings",
      icon: Shield,
    },
    {
      id: "kyc",
      title: "KYC Verification",
      description: "Identity verification and documents",
      icon: FileCheck,
    },
    {
      id: "notifications",
      title: "Email Notifications",
      description: "Control your email preferences",
      icon: Mail,
    },
    {
      id: "telegram",
      title: "Telegram Integration",
      description: "Link your Telegram account",
      icon: MessageCircle,
    },
    {
      id: "preferences",
      title: "Preferences",
      description: "Customize your experience",
      icon: SettingsIcon,
    },
    {
      id: "data-privacy",
      title: "Data & Privacy",
      description: "Manage your data and privacy settings",
      icon: Database,
    },
  ];

  return (
    <>
      {/* Full-screen KYC Submission Loading Modal */}
      {submittingKyc && <KycSubmissionLoadingModal />}

      <div className="mobile:max-w-full max-w-4xl mx-auto mobile:p-0 p-6 space-y-6">
        <header className="mobile:px-4 mobile:pt-2 mobile:pb-4">
          <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
          <p className="text-gray-400 text-sm">
            Manage your account preferences and platform experience.
          </p>
        </header>

        {/* Back Button */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded-lg mobile:mx-2"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        {/* Settings Menu - Enhanced 3D Cards */}
        <div className="mobile:px-3 px-0 space-y-2">
          {settingsItems.map((item, index) => {
            const Icon = item.icon;
            // Different gradient colors for each card
            const gradientColors = [
              {
                from: "from-blue-500",
                to: "to-cyan-500",
                shadow: "rgba(59,130,246,0.4)",
                glow: "rgba(59,130,246,0.2)",
              },
              {
                from: "from-purple-500",
                to: "to-pink-500",
                shadow: "rgba(168,85,247,0.4)",
                glow: "rgba(168,85,247,0.2)",
              },
              {
                from: "from-green-500",
                to: "to-emerald-500",
                shadow: "rgba(34,197,94,0.4)",
                glow: "rgba(34,197,94,0.2)",
              },
              {
                from: "from-orange-500",
                to: "to-amber-500",
                shadow: "rgba(249,115,22,0.4)",
                glow: "rgba(249,115,22,0.2)",
              },
              {
                from: "from-cyan-500",
                to: "to-blue-500",
                shadow: "rgba(6,182,212,0.4)",
                glow: "rgba(6,182,212,0.2)",
              },
              {
                from: "from-indigo-500",
                to: "to-purple-500",
                shadow: "rgba(99,102,241,0.4)",
                glow: "rgba(99,102,241,0.2)",
              },
              {
                from: "from-rose-500",
                to: "to-pink-500",
                shadow: "rgba(244,63,94,0.4)",
                glow: "rgba(244,63,94,0.2)",
              },
            ];
            const colors = gradientColors[index % gradientColors.length];

            return (
              <button
                key={item.id}
                onClick={() => setActiveModal(item.id)}
                className="group relative w-full text-left"
              >
                {/* Main Card Container with 3D Effect */}
                <div
                  className="relative rounded-xl p-2.5 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1a2332 100%)",
                    boxShadow: `
                      0 10px 20px -10px rgba(0, 0, 0, 0.5),
                      0 4px 8px -2px rgba(0, 0, 0, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.06),
                      inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                    `,
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  {/* Top highlight edge for 3D effect */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[1px]"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                    }}
                  />

                  {/* Glow effect on hover */}
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at 30% 0%, ${colors.glow} 0%, transparent 60%)`,
                    }}
                  />

                  {/* Bottom shadow gradient for depth */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.2), transparent)",
                    }}
                  />

                  <div className="relative z-10 flex items-center gap-2.5">
                    {/* 3D Icon Container */}
                    <div className="relative">
                      {/* Icon glow/shadow underneath */}
                      <div
                        className="absolute inset-0 rounded-lg blur-md opacity-50 group-hover:opacity-70 transition-opacity"
                        style={{
                          background: `linear-gradient(135deg, ${colors.shadow}, transparent)`,
                          transform: "translateY(3px)",
                        }}
                      />
                      <div
                        className={`relative w-9 h-9 rounded-lg bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5`}
                        style={{
                          boxShadow: `
                            0 4px 12px -2px ${colors.shadow},
                            0 2px 6px -1px ${colors.shadow},
                            inset 0 1px 2px rgba(255,255,255,0.2),
                            inset 0 -1px 2px rgba(0,0,0,0.15)
                          `,
                        }}
                      >
                        {/* Inner shine */}
                        <div
                          className="absolute inset-0 rounded-lg overflow-hidden"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)",
                          }}
                        />
                        <Icon className="w-4 h-4 text-white relative z-10 drop-shadow-md" />
                      </div>
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white group-hover:text-white transition-colors truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Profile Modal */}
        <SettingsModal
          isOpen={activeModal === "profile"}
          onClose={closeModal}
          title="Profile"
          toggleSidebar={toggleSidebar}
        >
          {/* Personal Data Card Button */}
          <button
            onClick={() => setShowPersonalDataModal(true)}
            className="group relative w-full text-left"
          >
            <div
              className="relative rounded-xl p-2.5 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] overflow-hidden"
              style={{
                background:
                  "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1a2332 100%)",
                boxShadow: `
                  0 10px 20px -10px rgba(0, 0, 0, 0.5),
                  0 4px 8px -2px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.06),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                `,
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div className="relative z-10 flex items-center gap-2.5">
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-lg blur-md opacity-50 group-hover:opacity-70 transition-opacity"
                    style={{
                      background: `linear-gradient(135deg, rgba(59,130,246,0.4), transparent)`,
                      transform: "translateY(3px)",
                    }}
                  />
                  <div
                    className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5"
                    style={{
                      boxShadow: `
                        0 4px 12px -2px rgba(59,130,246,0.4),
                        0 2px 6px -1px rgba(59,130,246,0.4),
                        inset 0 1px 2px rgba(255,255,255,0.2),
                        inset 0 -1px 2px rgba(0,0,0,0.15)
                      `,
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-lg overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)",
                      }}
                    />
                    <User className="w-4 h-4 text-white relative z-10 drop-shadow-md" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white group-hover:text-white transition-colors truncate">
                    Personal Data
                  </h3>
                  <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors line-clamp-1">
                    Manage your personal information
                  </p>
                </div>
              </div>
            </div>
          </button>

          {/* Personal Data Inner Modal */}
          {showPersonalDataModal && ReactDOM.createPortal(
            <div
              className="fixed top-0 left-0 right-0 bottom-0 z-[110] min-h-screen w-screen"
              style={{
                background: "linear-gradient(180deg, #0f172a 0%, #020617 100%)",
              }}
            >
              <div className="h-full overflow-y-auto">
                {/* Dashboard Header */}
                <div className="sticky top-0 z-10 bg-gray-900/100 backdrop-blur-sm">
                  <div className="flex justify-between items-center p-3 sm:p-6">
                    <Image
                      src="/m4capitallogo1.png"
                      alt="M4 Capital Logo"
                      width={120}
                      height={40}
                      className="object-contain mobile:w-20 w-24 md:w-auto"
                      priority
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowPersonalDataModal(false)}
                        className="relative text-gray-400 hover:text-white transition-colors"
                        title="Notifications"
                      >
                        <Bell size={18} className="mobile:w-[18px] mobile:h-[18px] sm:w-6 sm:h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={toggleSidebar}
                        className="flex items-center cursor-pointer p-1 sm:p-2 rounded-lg transition-colors focus:outline-none hover:bg-white/5"
                        aria-label="Open sidebar"
                      >
                        <Menu size={20} className="mobile:w-5 mobile:h-5 sm:w-[22px] sm:h-[22px] text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Back Button */}
                <div className="max-w-4xl mx-auto px-4 pt-4">
                  <button
                    onClick={() => setShowPersonalDataModal(false)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft size={20} />
                    <span className="text-sm font-medium">Back to Profile</span>
                  </button>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto px-4 pt-4 pb-4">
                  <div
                    className="relative rounded-2xl p-5 overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                      boxShadow:
                        "0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 10px 20px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <form onSubmit={handleProfileSave} className="space-y-4 max-w-md">
                      <div>
                        <label
                          className="block text-sm font-medium text-gray-300 mb-1"
                          htmlFor="name"
                        >
                          Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full bg-gray-700/80 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-600/50"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm font-medium text-gray-300 mb-1"
                          htmlFor="email"
                        >
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          disabled
                          defaultValue={session?.user?.email || ""}
                          className="w-full bg-gray-700/80 text-gray-300 rounded-lg px-3 py-2.5 opacity-70 cursor-not-allowed border border-gray-600/50"
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm font-medium text-gray-300 mb-1"
                          htmlFor="accountType"
                        >
                          Account Type
                        </label>
                        <input
                          id="accountType"
                          type="text"
                          disabled
                          value={
                            session?.user?.accountType
                              ? session.user.accountType.charAt(0) +
                                session.user.accountType.slice(1).toLowerCase()
                              : "Investor"
                          }
                          className="w-full bg-gray-700/80 text-gray-300 rounded-lg px-3 py-2.5 opacity-70 cursor-not-allowed border border-gray-600/50"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Account type is chosen at signup. Contact support to change.
                        </p>
                      </div>

                      {/* Phone Number Section */}
                      <div className="pt-4 border-t border-gray-700">
                        <label
                          className="block text-sm font-medium text-gray-300 mb-1"
                          htmlFor="phoneNumber"
                        >
                          Phone Number
                        </label>
                        <input
                          id="phoneNumber"
                          type="tel"
                          value={phoneNumber}
                          onChange={handlePhoneNumberChange}
                          disabled={phoneVerified}
                          className={`w-full rounded-lg px-3 py-2.5 border ${
                            phoneVerified
                              ? "bg-gray-700/80 text-gray-300 opacity-70 cursor-not-allowed border-gray-600/50"
                              : "bg-gray-700/80 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-600/50"
                          }`}
                          placeholder={getPhoneNumberPlaceholder(session?.user?.country)}
                        />
                        {phoneVerified ? (
                          <div className="flex items-center gap-2 mt-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-green-500 font-medium">
                              Phone number verified
                            </span>
                          </div>
                        ) : phoneNumber.length >= 10 ? (
                          <button
                            type="button"
                            onClick={handleSendVerificationCode}
                            disabled={sendingCode}
                            className="mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                          >
                            {sendingCode ? "Sending..." : "Verify Phone Number"}
                          </button>
                        ) : (
                          <p className="text-xs text-gray-500 mt-1">
                            Increase account security by verifying your phone number
                          </p>
                        )}
                      </div>

                      {/* Contact Info Section */}
                      <div className="pt-4 border-t border-gray-700">
                        <h3 className="text-base font-semibold text-white mb-4">Contact info:</h3>
                        <div className="space-y-4">
                          <div>
                            <label
                              className="block text-sm font-medium text-gray-300 mb-1"
                              htmlFor="dateOfBirth"
                            >
                              Date of Birth
                            </label>
                            <input
                              id="dateOfBirth"
                              type="date"
                              value={dateOfBirth}
                              onChange={(e) => setDateOfBirth(e.target.value)}
                              className="w-full bg-gray-700/80 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-600/50"
                            />
                          </div>
                          <div>
                            <label
                              className="block text-sm font-medium text-gray-300 mb-1"
                              htmlFor="country"
                            >
                              Country
                            </label>
                            <input
                              id="country"
                              type="text"
                              disabled
                              value={country || "Not set"}
                              className="w-full bg-gray-700/80 text-gray-300 rounded-lg px-3 py-2.5 opacity-70 cursor-not-allowed border border-gray-600/50"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Country is set during account creation. Contact support to change.
                            </p>
                          </div>
                          <div>
                            <label
                              className="block text-sm font-medium text-gray-300 mb-1"
                              htmlFor="timezone"
                            >
                              Timezone
                            </label>
                            <input
                              id="timezone"
                              type="text"
                              value={timezone}
                              onChange={(e) => setTimezone(e.target.value)}
                              className="w-full bg-gray-700/80 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-600/50"
                              placeholder="e.g., America/Sao_Paulo"
                            />
                          </div>
                          <div>
                            <label
                              className="block text-sm font-medium text-gray-300 mb-1"
                              htmlFor="citizenship"
                            >
                              Citizenship
                            </label>
                            <input
                              id="citizenship"
                              type="text"
                              value={citizenship}
                              onChange={(e) => setCitizenship(e.target.value)}
                              className="w-full bg-gray-700/80 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-600/50"
                              placeholder="Enter citizenship"
                            />
                          </div>
                        </div>
                      </div>

                      {hasProfileChanges && (
                        <button
                          type="submit"
                          disabled={saving}
                          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors w-full"
                        >
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Re-verification Warning Modal */}
          {showReVerifyModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div
                className="mx-4 max-w-sm w-full rounded-2xl p-6"
                style={{
                  background:
                    "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Re-verification Required
                  </h3>
                </div>
                <p className="text-gray-300 text-sm mb-6">
                  Changing your name requires you to re-verify your account by
                  submitting new KYC documents. Your current verification status
                  will be reset.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReVerifyModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmProfileSave}
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 transition-colors"
                  >
                    {saving ? "Saving..." : "Continue"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Account Number Card Button */}
          <button
            onClick={() => setShowAccountNumberModal(true)}
            className="group relative w-full text-left"
          >
            <div
              className="relative rounded-xl p-2.5 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] overflow-hidden"
              style={{
                background:
                  "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1a2332 100%)",
                boxShadow: `
                  0 10px 20px -10px rgba(0, 0, 0, 0.5),
                  0 4px 8px -2px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.06),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                `,
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div className="relative z-10 flex items-center gap-2.5">
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-lg blur-md opacity-50 group-hover:opacity-70 transition-opacity"
                    style={{
                      background: `linear-gradient(135deg, rgba(249,115,22,0.4), transparent)`,
                      transform: "translateY(3px)",
                    }}
                  />
                  <div
                    className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5"
                    style={{
                      boxShadow: `
                        0 4px 12px -2px rgba(249,115,22,0.4),
                        0 2px 6px -1px rgba(249,115,22,0.4),
                        inset 0 1px 2px rgba(255,255,255,0.2),
                        inset 0 -1px 2px rgba(0,0,0,0.15)
                      `,
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-lg overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)",
                      }}
                    />
                    <Copy className="w-4 h-4 text-white relative z-10 drop-shadow-md" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white group-hover:text-white transition-colors truncate">
                    Account Number
                  </h3>
                  <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors line-clamp-1">
                    Share to receive P2P transfers
                  </p>
                </div>
              </div>
            </div>
          </button>

          {/* Account Number Popup Modal */}
          {showAccountNumberModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div
                className="mx-4 max-w-md w-full rounded-2xl p-6"
                style={{
                  background:
                    "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                        boxShadow:
                          "0 6px 16px -3px rgba(249,115,22,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
                      }}
                    >
                      <Copy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Account Number
                      </h3>
                      <p className="text-xs text-gray-400">
                        Share to receive P2P transfers
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAccountNumberModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    disabled
                    value={accountNumber || "Loading..."}
                    className="w-full bg-gray-900/80 text-white rounded-lg px-2 py-3 cursor-not-allowed font-mono text-lg font-bold border border-gray-600/50 text-center"
                    style={{ letterSpacing: '0.5em' }}
                  />
                  <button
                    type="button"
                    onClick={copyAccountNumber}
                    disabled={!accountNumber}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                    title="Copy account number"
                  >
                    {copiedAccountNumber ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Account Number</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </SettingsModal>

        {/* Security Modal */}
        <SettingsModal
          isOpen={activeModal === "security"}
          onClose={closeModal}
          title="Security"
          toggleSidebar={toggleSidebar}
        >
          <div className="space-y-6 max-w-2xl">
            {/* Password Change Section */}
            <div className="border-b border-gray-700 pb-6">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-white">
                  Change Password
                </h3>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label
                    className="block text-sm font-medium mb-1 text-gray-300"
                    htmlFor="currentPassword"
                  >
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-gray-700 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label
                    className="block text-sm font-medium mb-1 text-gray-300"
                    htmlFor="newPassword"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-gray-700 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                      placeholder="Enter new password (min 8 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    className="block text-sm font-medium mb-1 text-gray-300"
                    htmlFor="confirmPassword"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-gray-700 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error/Success Messages */}
                {passwordError && (
                  <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                    <p className="text-sm text-red-400">{passwordError}</p>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-3">
                    <p className="text-sm text-green-400">
                      Password changed successfully!
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                  >
                    {changingPassword ? "Changing..." : "Change Password"}
                  </button>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            </div>

            {/* Two-Factor Authentication Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-white">
                  Two-Factor Authentication
                </h3>
              </div>

              {!twoFactorEnabled ? (
                !show2FASetup ? (
                  /* 2FA Not Enabled - Show Options */
                  <div className="space-y-4">
                    <p className="text-sm text-gray-300">
                      Add an extra layer of security to your account by enabling
                      two-factor authentication.
                    </p>

                    <div className="space-y-3">
                      <button
                        onClick={() => handle2FASetup("APP")}
                        disabled={settingUp2FA}
                        className="w-full flex items-center gap-3 bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-colors text-left"
                      >
                        <Smartphone className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="font-medium text-white">
                            Authenticator App
                          </p>
                          <p className="text-xs text-gray-400">
                            Use Google Authenticator, Authy, or similar apps
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handle2FASetup("EMAIL")}
                        disabled={settingUp2FA}
                        className="w-full flex items-center gap-3 bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-colors text-left"
                      >
                        <Mail className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="font-medium text-white">Email</p>
                          <p className="text-xs text-gray-400">
                            Receive verification codes via email
                          </p>
                        </div>
                      </button>
                    </div>

                    {twoFactorError && (
                      <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                        <p className="text-sm text-red-400">{twoFactorError}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 2FA Setup in Progress (APP method) */
                  <div className="space-y-4">
                    <p className="text-sm text-gray-300">
                      Scan this QR code with your authenticator app:
                    </p>

                    {twoFactorQRCode && (
                      <div className="flex justify-center bg-white p-4 rounded-lg">
                        <img
                          src={twoFactorQRCode}
                          alt="2FA QR Code"
                          className="w-48 h-48"
                        />
                      </div>
                    )}

                    {twoFactorSecret && (
                      <div className="bg-gray-700 p-3 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">
                          Or enter this code manually:
                        </p>
                        <p className="text-sm font-mono text-white break-all">
                          {twoFactorSecret}
                        </p>
                      </div>
                    )}

                    <form
                      onSubmit={handle2FAVerification}
                      className="space-y-4"
                    >
                      <div>
                        <label
                          className="block text-sm font-medium mb-1 text-gray-300"
                          htmlFor="verificationCode"
                        >
                          Verification Code
                        </label>
                        <input
                          id="verificationCode"
                          type="text"
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value)}
                          className="w-full bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-center text-lg tracking-widest"
                          placeholder="000000"
                          maxLength={6}
                          pattern="[0-9]{6}"
                        />
                      </div>

                      {twoFactorError && (
                        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                          <p className="text-sm text-red-400">
                            {twoFactorError}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <button
                          type="submit"
                          disabled={
                            verifying2FA || twoFactorCode.length !== 6
                          }
                          className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                        >
                          {verifying2FA ? "Verifying..." : "Enable 2FA"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShow2FASetup(false);
                            setTwoFactorQRCode(null);
                            setTwoFactorSecret(null);
                            setTwoFactorCode("");
                            setTwoFactorError(null);
                          }}
                          className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )
              ) : /* 2FA Enabled */
              !showDisable2FA ? (
                <div className="space-y-4">
                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <p className="text-sm text-green-400 font-medium">
                        Two-Factor Authentication is Enabled
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Method:{" "}
                      {twoFactorMethod === "APP"
                        ? "Authenticator App"
                        : "Email"}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowDisable2FA(true)}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                  >
                    Disable 2FA
                  </button>
                </div>
              ) : (
                /* Disable 2FA Form */
                <div className="space-y-4">
                  <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                    <p className="text-sm text-yellow-400">
                      Warning: Disabling two-factor authentication will make
                      your account less secure.
                    </p>
                  </div>

                  <form onSubmit={handle2FADisable} className="space-y-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-1 text-gray-300"
                        htmlFor="disable2FAPassword"
                      >
                        Confirm Password
                      </label>
                      <input
                        id="disable2FAPassword"
                        type="password"
                        value={disable2FAPassword}
                        onChange={(e) => setDisable2FAPassword(e.target.value)}
                        className="w-full bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                        placeholder="Enter your password"
                      />
                    </div>

                    {twoFactorError && (
                      <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                        <p className="text-sm text-red-400">{twoFactorError}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={disabling2FA}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                      >
                        {disabling2FA ? "Disabling..." : "Confirm Disable"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDisable2FA(false);
                          setDisable2FAPassword("");
                          setTwoFactorError(null);
                        }}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Transfer PIN Section */}
            <div className="border-t border-gray-700 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-white">
                  Transfer PIN
                </h3>
              </div>

              {!showTransferPinSetup ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-300">
                    {hasTransferPin
                      ? "Your transfer PIN is set. You can change it here."
                      : "Set up a 4-digit PIN to secure your P2P transfers and withdrawals."}
                  </p>

                  {hasTransferPin && (
                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <p className="text-sm text-green-400 font-medium">
                          Transfer PIN is Set
                        </p>
                      </div>
                    </div>
                  )}

                  {transferPinSuccess && (
                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-3">
                      <p className="text-sm text-green-400">
                        {hasTransferPin
                          ? "Transfer PIN changed successfully!"
                          : "Transfer PIN set successfully!"}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setShowTransferPinSetup(true)}
                    className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                  >
                    {hasTransferPin
                      ? "Change Transfer PIN"
                      : "Set Transfer PIN"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-300">
                    {hasTransferPin
                      ? "Enter your current PIN and choose a new 4-digit PIN."
                      : "Choose a 4-digit PIN for securing your transfers."}
                  </p>

                  <form
                    onSubmit={handleTransferPinSubmit}
                    className="space-y-4"
                  >
                    {hasTransferPin && (
                      <div>
                        <label
                          className="block text-sm font-medium mb-1 text-gray-300"
                          htmlFor="currentTransferPin"
                        >
                          Current PIN
                        </label>
                        <input
                          id="currentTransferPin"
                          type="password"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={4}
                          value={currentTransferPin}
                          onChange={(e) =>
                            setCurrentTransferPin(
                              e.target.value.replace(/\D/g, "").slice(0, 4)
                            )
                          }
                          className="w-full bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-center text-lg tracking-widest"
                          placeholder="••••"
                        />
                      </div>
                    )}

                    <div>
                      <label
                        className="block text-sm font-medium mb-1 text-gray-300"
                        htmlFor="transferPin"
                      >
                        {hasTransferPin ? "New PIN" : "PIN"}
                      </label>
                      <input
                        id="transferPin"
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        value={transferPin}
                        onChange={(e) =>
                          setTransferPin(
                            e.target.value.replace(/\D/g, "").slice(0, 4)
                          )
                        }
                        className="w-full bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-center text-lg tracking-widest"
                        placeholder="••••"
                        required
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1 text-gray-300"
                        htmlFor="confirmTransferPin"
                      >
                        Confirm PIN
                      </label>
                      <input
                        id="confirmTransferPin"
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        value={confirmTransferPin}
                        onChange={(e) =>
                          setConfirmTransferPin(
                            e.target.value.replace(/\D/g, "").slice(0, 4)
                          )
                        }
                        className="w-full bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-center text-lg tracking-widest"
                        placeholder="••••"
                        required
                      />
                    </div>

                    {transferPinError && (
                      <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                        <p className="text-sm text-red-400">
                          {transferPinError}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={
                          settingTransferPin ||
                          transferPin.length !== 4 ||
                          confirmTransferPin.length !== 4
                        }
                        className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                      >
                        {settingTransferPin
                          ? "Setting..."
                          : hasTransferPin
                          ? "Change PIN"
                          : "Set PIN"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowTransferPinSetup(false);
                          setTransferPin("");
                          setConfirmTransferPin("");
                          setCurrentTransferPin("");
                          setTransferPinError(null);
                        }}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </SettingsModal>

        {/* KYC Modal */}
        <SettingsModal
          isOpen={activeModal === "kyc"}
          onClose={closeModal}
          title="KYC Verification"
          toggleSidebar={toggleSidebar}
        >
          <form onSubmit={handleProfileSave} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                defaultValue={session?.user?.name || ""}
                className="w-full bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                disabled
                defaultValue={session?.user?.email || ""}
                className="w-full bg-gray-700 rounded-lg px-3 py-2 opacity-70 cursor-not-allowed"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="accountType"
              >
                Account Type
              </label>
              <input
                id="accountType"
                type="text"
                disabled
                value={
                  session?.user?.accountType
                    ? session.user.accountType.charAt(0) +
                      session.user.accountType.slice(1).toLowerCase()
                    : "Investor"
                }
                className="w-full bg-gray-700 rounded-lg px-3 py-2 opacity-70 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">
                Account type is chosen at signup. Contact support to change.
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </SettingsModal>

        {/* KYC Modal */}
        <SettingsModal
          isOpen={activeModal === "kyc"}
          onClose={closeModal}
          title="KYC Verification"
          toggleSidebar={toggleSidebar}
        >
          <div className="space-y-6">
            {/* KYC Status Banner */}
            <div
              className={`rounded-lg p-4 border ${
                kycStatus === "APPROVED"
                  ? "bg-green-900/20 border-green-700"
                  : kycStatus === "PENDING"
                  ? "bg-yellow-900/20 border-yellow-700"
                  : kycStatus === "UNDER_REVIEW"
                  ? "bg-blue-900/20 border-blue-700"
                  : kycStatus === "REJECTED"
                  ? "bg-red-900/20 border-red-700"
                  : "bg-gray-900/20 border-gray-700"
              }`}
            >
              <div className="flex items-start gap-3">
                {kycStatus === "APPROVED" && (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                )}
                {kycStatus === "PENDING" && (
                  <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                )}
                {kycStatus === "UNDER_REVIEW" && (
                  <Eye className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                )}
                {kycStatus === "REJECTED" && (
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                {kycStatus === "NOT_STARTED" && (
                  <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                )}

                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">
                    {kycStatus === "APPROVED" && "Verification Approved"}
                    {kycStatus === "PENDING" && "Verification Pending"}
                    {kycStatus === "UNDER_REVIEW" && "Under Review"}
                    {kycStatus === "REJECTED" && "Verification Rejected"}
                    {kycStatus === "NOT_STARTED" && "Verification Required"}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {kycStatus === "APPROVED" &&
                      "Your identity has been verified. You have full access to all platform features."}
                    {kycStatus === "PENDING" &&
                      "We're reviewing your documents. This typically takes 24-48 hours."}
                    {kycStatus === "UNDER_REVIEW" &&
                      "Your documents are being carefully reviewed by our team. We'll notify you once complete."}
                    {kycStatus === "REJECTED" &&
                      "Your verification was rejected. Please review the feedback and resubmit."}
                    {kycStatus === "NOT_STARTED" &&
                      "Complete KYC verification to unlock full trading capabilities and higher limits."}
                  </p>
                </div>
              </div>
            </div>

            {/* KYC Form (only show if not approved) */}
            {kycStatus !== "APPROVED" && (
              <form onSubmit={handleKycSubmit} className="space-y-6">
                {/* Stage Indicator */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        kycStage >= 1
                          ? "bg-orange-500 text-white"
                          : "bg-gray-600 text-gray-400"
                      }`}
                    >
                      {kycStage > 1 ? "✓" : "1"}
                    </div>
                    <div
                      className={`h-1 w-16 ${
                        kycStage >= 2 ? "bg-orange-500" : "bg-gray-600"
                      }`}
                    />
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        kycStage >= 2
                          ? "bg-orange-500 text-white"
                          : "bg-gray-600 text-gray-400"
                      }`}
                    >
                      {kycStage > 2 ? "✓" : "2"}
                    </div>
                    <div
                      className={`h-1 w-16 ${
                        kycStage >= 3 ? "bg-orange-500" : "bg-gray-600"
                      }`}
                    />
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        kycStage >= 3
                          ? "bg-orange-500 text-white"
                          : "bg-gray-600 text-gray-400"
                      }`}
                    >
                      3
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    {kycStage === 1 && "Step 1 of 3: Personal Information"}
                    {kycStage === 2 && "Step 2 of 3: Address Information"}
                    {kycStage === 3 && "Step 3 of 3: Document Upload"}
                  </p>
                </div>

                {/* Stage 1: Personal Information */}
                {kycStage === 1 && (
                  <div>
                    <h4 className="text-base font-semibold text-white mb-4">
                      Personal Information
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                          htmlFor="firstName"
                        >
                          First Name *
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          required
                          value={kycData.firstName}
                          onChange={(e) =>
                            setKycData({
                              ...kycData,
                              firstName: e.target.value,
                            })
                          }
                          className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-300 dark:border-gray-600"
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                          htmlFor="lastName"
                        >
                          Last Name (Surname) *
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          required
                          value={kycData.lastName}
                          onChange={(e) =>
                            setKycData({ ...kycData, lastName: e.target.value })
                          }
                          className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-300 dark:border-gray-600"
                          placeholder="Enter your surname"
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                          htmlFor="dateOfBirth"
                        >
                          Date of Birth *
                        </label>
                        <input
                          id="dateOfBirth"
                          type="date"
                          required
                          value={kycData.dateOfBirth}
                          onChange={(e) =>
                            setKycData({
                              ...kycData,
                              dateOfBirth: e.target.value,
                            })
                          }
                          className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                          htmlFor="nationality"
                        >
                          Nationality *
                        </label>
                        <input
                          id="nationality"
                          type="text"
                          required
                          value={kycData.nationality}
                          onChange={(e) =>
                            setKycData({
                              ...kycData,
                              nationality: e.target.value,
                            })
                          }
                          className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-300 dark:border-gray-600"
                          placeholder="e.g., United States, Canada, United Kingdom, etc."
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                          htmlFor="phoneNumber"
                        >
                          Phone Number *
                        </label>
                        <input
                          id="phoneNumber"
                          type="tel"
                          required
                          value={kycData.phoneNumber}
                          onChange={(e) =>
                            setKycData({
                              ...kycData,
                              phoneNumber: e.target.value,
                            })
                          }
                          className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-300 dark:border-gray-600"
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-end mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          // Validate all required fields
                          if (!kycData.firstName.trim()) {
                            showWarning("Please enter your First Name");
                            return;
                          }
                          if (!kycData.lastName.trim()) {
                            showWarning(
                              "Please enter your Last Name (Surname)"
                            );
                            return;
                          }
                          if (!kycData.dateOfBirth) {
                            showWarning("Please select your Date of Birth");
                            return;
                          }
                          if (!kycData.nationality.trim()) {
                            showWarning("Please enter your Nationality");
                            return;
                          }
                          if (!kycData.phoneNumber.trim()) {
                            showWarning("Please enter your Phone Number");
                            return;
                          }
                          setKycStage(2);
                        }}
                        className="bg-orange-600 hover:bg-orange-500 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Stage 2: Address Information */}
                {kycStage === 2 && (
                  <div>
                    <h4 className="text-base font-semibold text-white mb-4">
                      Address Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label
                          className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                          htmlFor="address"
                        >
                          Street Address *
                        </label>
                        <input
                          id="address"
                          type="text"
                          required
                          value={kycData.address}
                          onChange={(e) =>
                            setKycData({ ...kycData, address: e.target.value })
                          }
                          className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-300 dark:border-gray-600"
                          placeholder="e.g., 123 Main Street, Apt 4B"
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                            htmlFor="city"
                          >
                            City *
                          </label>
                          <input
                            id="city"
                            type="text"
                            required
                            value={kycData.city}
                            onChange={(e) =>
                              setKycData({ ...kycData, city: e.target.value })
                            }
                            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-300 dark:border-gray-600"
                            placeholder="e.g., New York, London, Toronto"
                          />
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                            htmlFor="postalCode"
                          >
                            Postal Code *
                          </label>
                          <input
                            id="postalCode"
                            type="text"
                            required
                            value={kycData.postalCode}
                            onChange={(e) =>
                              setKycData({
                                ...kycData,
                                postalCode: e.target.value,
                              })
                            }
                            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-300 dark:border-gray-600"
                            placeholder="e.g., 10001, 100001, SW1A 1AA"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-6">
                      <button
                        type="button"
                        onClick={() => setKycStage(1)}
                        className="bg-gray-700 hover:bg-gray-600 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // Validate all required address fields
                          if (!kycData.address.trim()) {
                            showWarning("Please enter your Street Address");
                            return;
                          }
                          if (!kycData.city.trim()) {
                            showWarning("Please enter your City");
                            return;
                          }
                          if (!kycData.postalCode.trim()) {
                            showWarning("Please enter your Postal Code");
                            return;
                          }
                          setKycStage(3);
                        }}
                        className="bg-orange-600 hover:bg-orange-500 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Stage 3: Document Upload */}
                {kycStage === 3 && (
                  <div>
                    <h4 className="text-base font-semibold text-white mb-4">
                      Document Upload
                    </h4>
                    <div className="space-y-4">
                      {/* ID Document */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Government-Issued ID * (Passport, Driver's License, or
                          National ID)
                        </label>
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) =>
                              handleFileChange(
                                "idDocument",
                                e.target.files?.[0] || null
                              )
                            }
                            className="hidden"
                            id="idDocument"
                            required
                          />
                          <label
                            htmlFor="idDocument"
                            className="cursor-pointer"
                          >
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-300">
                              {documents.idDocument
                                ? documents.idDocument.name
                                : "Click to upload or drag and drop"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG or PDF (max 10MB)
                            </p>
                          </label>
                        </div>
                      </div>

                      {/* Proof of Address */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Proof of Address * (Utility Bill, Bank Statement -
                          less than 3 months old)
                        </label>
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) =>
                              handleFileChange(
                                "proofOfAddress",
                                e.target.files?.[0] || null
                              )
                            }
                            className="hidden"
                            id="proofOfAddress"
                            required
                          />
                          <label
                            htmlFor="proofOfAddress"
                            className="cursor-pointer"
                          >
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-300">
                              {documents.proofOfAddress
                                ? documents.proofOfAddress.name
                                : "Click to upload or drag and drop"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG or PDF (max 10MB)
                            </p>
                          </label>
                        </div>
                      </div>

                      {/* Selfie */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Selfie with ID * (Hold your ID next to your face)
                        </label>
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileChange(
                                "selfie",
                                e.target.files?.[0] || null
                              )
                            }
                            className="hidden"
                            id="selfie"
                            required
                          />
                          <label htmlFor="selfie" className="cursor-pointer">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-300">
                              {documents.selfie
                                ? documents.selfie.name
                                : "Click to upload or drag and drop"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG or JPG (max 10MB)
                            </p>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="bg-gray-700/30 rounded-lg p-4 mt-6">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="kycTerms"
                          required
                          className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-700 focus:ring-2 focus:ring-orange-500"
                        />
                        <label
                          htmlFor="kycTerms"
                          className="text-sm text-gray-300 flex-1"
                        >
                          I certify that all information provided is accurate
                          and complete. I understand that providing false
                          information may result in account suspension or legal
                          action.
                        </label>
                      </div>
                    </div>

                    {/* Navigation Buttons with Submit */}
                    <div className="flex justify-between mt-6">
                      <button
                        type="button"
                        onClick={() => setKycStage(2)}
                        className="bg-gray-700 hover:bg-gray-600 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                        Previous
                      </button>
                      <button
                        type="submit"
                        disabled={
                          submittingKyc ||
                          kycStatus === "PENDING" ||
                          kycStatus === "UNDER_REVIEW" ||
                          !documents.idDocument ||
                          !documents.proofOfAddress ||
                          !documents.selfie
                        }
                        className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        {submittingKyc
                          ? "Submitting..."
                          : kycStatus === "PENDING" ||
                            kycStatus === "UNDER_REVIEW"
                          ? "Under Review"
                          : !documents.idDocument || !documents.proofOfAddress || !documents.selfie
                          ? "Upload All Documents"
                          : "Submit for Verification"}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}

            {/* Approved Status */}
            {kycStatus === "APPROVED" && (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  You're all set!
                </h3>
                <p className="text-gray-400">
                  Your account is fully verified and you have access to all
                  features.
                </p>
              </div>
            )}
          </div>
        </SettingsModal>

        {/* Email Notifications Modal */}
        <SettingsModal
          isOpen={activeModal === "notifications"}
          onClose={closeModal}
          title="Email Notifications"
          toggleSidebar={toggleSidebar}
        >
          {loadingEmailPrefs ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-gray-300 mb-4">
                Control which email notifications you receive from M4 Capital.
              </p>

              {/* Master toggle */}
              <div className="flex items-start justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-indigo-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-white">
                      Email Notifications
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Receive all email notifications. Turning this off will
                      disable all email alerts.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={emailPreferences.emailNotifications}
                    onChange={(e) =>
                      handleEmailPreferenceChange(
                        "emailNotifications",
                        e.target.checked
                      )
                    }
                    disabled={savingEmailPrefs}
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Sub-toggles */}
              <div className="space-y-3 pl-4 border-l-2 border-gray-700">
                {/* KYC Notifications */}
                <div className="flex items-start justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white text-sm">
                      KYC Verification
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Updates about your identity verification status
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={emailPreferences.kycNotifications}
                      onChange={(e) =>
                        handleEmailPreferenceChange(
                          "kycNotifications",
                          e.target.checked
                        )
                      }
                      disabled={
                        savingEmailPrefs || !emailPreferences.emailNotifications
                      }
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-disabled:opacity-50"></div>
                  </label>
                </div>

                {/* Trading Notifications */}
                <div className="flex items-start justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white text-sm">
                      Trading & Transactions
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Alerts for deposits, withdrawals, and trade executions
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={emailPreferences.tradingNotifications}
                      onChange={(e) =>
                        handleEmailPreferenceChange(
                          "tradingNotifications",
                          e.target.checked
                        )
                      }
                      disabled={
                        savingEmailPrefs || !emailPreferences.emailNotifications
                      }
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-disabled:opacity-50"></div>
                  </label>
                </div>

                {/* Security Notifications */}
                <div className="flex items-start justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white text-sm">
                      Security Alerts
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Important security notifications and account changes
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={emailPreferences.securityNotifications}
                      onChange={(e) =>
                        handleEmailPreferenceChange(
                          "securityNotifications",
                          e.target.checked
                        )
                      }
                      disabled={
                        savingEmailPrefs || !emailPreferences.emailNotifications
                      }
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-disabled:opacity-50"></div>
                  </label>
                </div>
              </div>

              {savingEmailPrefs && (
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                  Saving preferences...
                </div>
              )}
            </div>
          )}
        </SettingsModal>

        {/* Telegram Integration Modal */}
        <SettingsModal
          isOpen={activeModal === "telegram"}
          onClose={closeModal}
          title="Telegram Integration"
          toggleSidebar={toggleSidebar}
        >
          {loadingTelegram ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-blue-400 mt-1" />
                <div className="flex-1">
                  <h3 className="font-medium text-white mb-2">
                    Connect your Telegram account
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Link your M4 Capital account to Telegram to receive instant
                    notifications, view your portfolio, and get real-time price
                    alerts directly in Telegram.
                  </p>
                </div>
              </div>

              {!telegramLinked ? (
                <>
                  {/* Linking Instructions */}
                  <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <h4 className="font-medium text-white mb-3">
                      How to link:
                    </h4>
                    <ol className="space-y-2 text-sm text-gray-300">
                      <li className="flex gap-2">
                        <span className="font-semibold text-blue-400">1.</span>
                        <span>
                          Open Telegram and search for{" "}
                          <span className="font-mono bg-gray-800 px-2 py-0.5 rounded">
                            @M4CapitalBot
                          </span>
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-blue-400">2.</span>
                        <span>
                          Send the command{" "}
                          <span className="font-mono bg-gray-800 px-2 py-0.5 rounded">
                            /link
                          </span>
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-blue-400">3.</span>
                        <span>Copy the 6-digit code you receive</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-blue-400">4.</span>
                        <span>Enter the code below</span>
                      </li>
                    </ol>
                  </div>

                  {/* Code Input Form */}
                  <form onSubmit={handleTelegramLink} className="space-y-4">
                    <div>
                      <label
                        htmlFor="linkCode"
                        className="block text-sm font-medium mb-2"
                      >
                        Enter your 6-digit linking code
                      </label>
                      <div className="flex gap-3">
                        <input
                          id="linkCode"
                          type="text"
                          value={linkCode}
                          onChange={(e) => setLinkCode(e.target.value)}
                          placeholder="123456"
                          maxLength={6}
                          pattern="[0-9]{6}"
                          required
                          className="flex-1 bg-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg tracking-wider"
                          disabled={linkingTelegram}
                        />
                        <button
                          type="submit"
                          disabled={linkingTelegram || linkCode.length !== 6}
                          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          {linkingTelegram ? "Linking..." : "Link Account"}
                        </button>
                      </div>
                    </div>

                    {/* Error Message */}
                    {linkError && (
                      <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-300">{linkError}</p>
                      </div>
                    )}

                    {/* Success Message */}
                    {linkSuccess && (
                      <div className="bg-green-900/20 border border-green-700 rounded-lg p-3 flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-300">
                          Telegram account linked successfully!
                        </p>
                      </div>
                    )}
                  </form>
                </>
              ) : (
                <>
                  {/* Linked Status */}
                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">
                          Telegram Connected
                        </h3>
                        <p className="text-sm text-gray-300">
                          Your account is linked to{" "}
                          {telegramUsername ? (
                            <span className="font-mono bg-gray-800 px-2 py-0.5 rounded">
                              @{telegramUsername}
                            </span>
                          ) : (
                            "Telegram"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Features Available */}
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-3">
                      What you can do in Telegram:
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span>View your portfolio balance and holdings</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span>
                          Receive instant deposit & withdrawal notifications
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span>Get real-time crypto price updates</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span>Set custom price alerts</span>
                      </li>
                    </ul>
                  </div>

                  {/* Unlink Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleTelegramUnlink}
                      className="text-sm text-red-400 hover:text-red-300 font-medium"
                    >
                      Unlink Telegram Account
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </SettingsModal>

        {/* Preferences Modal */}
        <SettingsModal
          isOpen={activeModal === "preferences"}
          onClose={closeModal}
          title="Preferences"
          toggleSidebar={toggleSidebar}
        >
          <div className="space-y-6">
            {/* Theme Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 ${
                    theme === "light"
                      ? "bg-blue-500/20 border-2 border-blue-500 text-white"
                      : "bg-gray-800/50 border-2 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300"
                  }`}
                >
                  <Sun className="w-6 h-6" />
                  <span className="text-xs font-medium">Light</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 ${
                    theme === "dark"
                      ? "bg-blue-500/20 border-2 border-blue-500 text-white"
                      : "bg-gray-800/50 border-2 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300"
                  }`}
                >
                  <Moon className="w-6 h-6" />
                  <span className="text-xs font-medium">Dark</span>
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 ${
                    theme === "system"
                      ? "bg-blue-500/20 border-2 border-blue-500 text-white"
                      : "bg-gray-800/50 border-2 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300"
                  }`}
                >
                  <Monitor className="w-6 h-6" />
                  <span className="text-xs font-medium">System</span>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {theme === "system"
                  ? `Using system preference (currently ${resolvedTheme})`
                  : `Currently using ${theme} theme`}
              </p>
            </div>

            {/* Language Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Preferred Language
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    showSuccess("Language preference updated");
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white appearance-none cursor-pointer focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
                <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                This will be used for displaying content throughout the
                platform.
              </p>
            </div>

            {/* Currency Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Preferred Currency
              </label>
              {loadingCurrency ? (
                <div className="animate-pulse bg-gray-700 h-10 rounded-lg"></div>
              ) : (
                <CurrencySelector
                  value={preferredCurrency}
                  onChange={handleCurrencyChange}
                  disabled={savingCurrency}
                />
              )}
              <p className="text-xs text-gray-400 mt-2">
                This will be used for displaying balances and portfolio values
                throughout the platform.
              </p>
            </div>

            {/* Coming Soon Features */}
            <div className="border-t border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-400 mb-3">
                Coming Soon
              </h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>• Default dashboard layout</li>
                <li>• Data refresh interval</li>
              </ul>
            </div>
          </div>
        </SettingsModal>

        {/* Data & Privacy Modal */}
        <SettingsModal
          isOpen={activeModal === "data-privacy"}
          onClose={closeModal}
          title="Data & Privacy"
          toggleSidebar={toggleSidebar}
        >
          <ul className="space-y-3 text-sm text-gray-300">
            <li>• Download account data (planned)</li>
            <li>• Delete account request (planned)</li>
            <li>• Consent & regulatory disclosures</li>
          </ul>
        </SettingsModal>

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={confirmModalConfig.onConfirm}
          title={confirmModalConfig.title}
          message={confirmModalConfig.message}
          variant={confirmModalConfig.variant}
        />

        {/* Phone Verification Modal */}
        {showPhoneVerification &&
          ReactDOM.createPortal(
            <div className="fixed top-0 left-0 right-0 bottom-0 z-[120] min-h-screen w-screen bg-gray-900 flex items-center justify-center px-4">
              <div className="w-full max-w-md">
                {/* Card */}
                <div
                  className="relative rounded-2xl p-6 overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                    boxShadow:
                      "0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 10px 20px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {/* Close Button */}
                  <button
                    onClick={() => {
                      setShowPhoneVerification(false);
                      setVerificationCode("");
                      setVerificationError(null);
                    }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Verify Phone Number
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Enter the 6-digit code sent to
                    </p>
                    <p className="text-white font-medium mt-1">{phoneNumber}</p>
                  </div>

                  {devVerificationCode && (
                    <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-xs text-yellow-500 text-center">
                        Development Mode: Code is <strong>{devVerificationCode}</strong>
                      </p>
                    </div>
                  )}

                  {/* Verification Code Input */}
                  <div className="mb-6">
                    <label
                      className="block text-sm font-medium text-gray-300 mb-2 text-center"
                      htmlFor="verificationCode"
                    >
                      Verification Code
                    </label>
                    <input
                      id="verificationCode"
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setVerificationCode(value);
                        setVerificationError(null);
                      }}
                      className="w-full bg-gray-700/80 text-white rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-600/50"
                      placeholder="000000"
                      autoFocus
                    />
                    {verificationError && (
                      <p className="text-red-500 text-xs mt-2 text-center">
                        {verificationError}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={handleVerifyPhoneCode}
                      disabled={verifyingCode || verificationCode.length !== 6}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-3 rounded-lg font-medium text-white transition-colors"
                    >
                      {verifyingCode ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Verifying...
                        </span>
                      ) : (
                        "Verify Code"
                      )}
                    </button>

                    <button
                      onClick={handleSendVerificationCode}
                      disabled={sendingCode}
                      className="w-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
                    >
                      {sendingCode ? "Sending..." : "Resend Code"}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Didn't receive the code? Check your phone and try resending.
                  </p>
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
    </>
  );
}
