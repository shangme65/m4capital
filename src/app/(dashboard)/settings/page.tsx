"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/contexts/ToastContext";
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

export default function SettingsPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { showSuccess, showError, showWarning, showInfo } = useToast();

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
  const [verificationCode, setVerificationCode] = useState("");
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

  // Placeholder handlers (extend later)
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // TODO: implement profile update API
    setTimeout(() => setSaving(false), 800);
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
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify code");
      }

      setTwoFactorEnabled(true);
      setTwoFactorMethod("APP");
      setShow2FASetup(false);
      setVerificationCode("");
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
      if (documents.idDocument)
        formData.append("idDocument", documents.idDocument);
      if (documents.proofOfAddress)
        formData.append("proofOfAddress", documents.proofOfAddress);
      if (documents.selfie) formData.append("selfie", documents.selfie);

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

  // Modal component for full-screen settings sections - 3D Dark Theme
  const SettingsModal = useMemo(
    () =>
      ({
        isOpen,
        onClose,
        title,
        children,
      }: {
        isOpen: boolean;
        onClose: () => void;
        title: string;
        children: React.ReactNode;
      }) => {
        if (!isOpen) return null;

        return (
          <div
            className="fixed inset-0 z-50"
            style={{
              background: "linear-gradient(180deg, #0f172a 0%, #020617 100%)",
            }}
          >
            <div className="h-full overflow-y-auto">
              {/* Header with 3D styling */}
              <div
                className="sticky top-0 z-10"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
                }}
              >
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95"
                    style={{
                      background:
                        "linear-gradient(145deg, #374151 0%, #1f2937 100%)",
                      boxShadow:
                        "0 4px 12px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h2 className="text-xl font-bold text-white">{title}</h2>
                </div>
              </div>

              {/* Content with 3D card styling */}
              <div className="max-w-4xl mx-auto px-4 py-6">
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
                  {/* Subtle glow effect */}
                  <div
                    className="absolute inset-0 opacity-20 rounded-2xl pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse at 30% 0%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
                    }}
                  />
                  <div className="relative z-10">{children}</div>
                </div>
              </div>
            </div>
          </div>
        );
      },
    []
  );

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
        <header className="mobile:px-4 mobile:pt-6 mobile:pb-4">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/m4capitallogo1.png"
              alt="M4Capital"
              width={80}
              height={80}
              className="drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2 text-center">
            Settings
          </h1>
          <p className="text-gray-400 text-sm text-center">
            Manage your account preferences and platform experience.
          </p>
        </header>

        {/* Settings Menu */}
        <div className="mobile:space-y-0 space-y-3 mobile:px-0">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModal(item.id)}
                className="group relative w-full mobile:rounded-none rounded-xl mobile:border-b-2 mobile:border-x-0 mobile:border-t-0 border-2 bg-gradient-to-br from-gray-800/80 to-gray-900/80 hover:from-gray-800 hover:to-gray-900 mobile:p-4 p-5 transition-all duration-300 transform mobile:hover:scale-100 hover:scale-[1.02] active:scale-[0.98] mobile:border-gray-700/30 border-gray-700/50 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10 flex items-center"
                style={{
                  transformStyle: "preserve-3d",
                  perspective: "1000px",
                }}
              >
                {/* 3D Glow Effect on Hover */}
                <div className="absolute inset-0 mobile:rounded-none rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-xl -z-10" />

                <div className="flex items-center gap-4 flex-1">
                  {/* 3D Icon Container */}
                  <div
                    className="mobile:w-11 mobile:h-11 w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 relative"
                    style={{
                      boxShadow:
                        "0 4px 16px rgba(99,102,241,0.4), 0 2px 8px rgba(99,102,241,0.6), inset 0 1px 2px rgba(255,255,255,0.2)",
                    }}
                  >
                    {/* Inner glow */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                    <Icon className="mobile:w-5 mobile:h-5 w-6 h-6 text-white relative z-10 drop-shadow-lg" />
                  </div>

                  <div className="text-left flex-1">
                    <h3 className="mobile:text-sm text-base font-bold text-white group-hover:text-white transition-colors">
                      {item.title}
                    </h3>
                    <p className="mobile:text-xs text-sm text-gray-400 mobile:leading-tight">
                      {item.description}
                    </p>
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
                htmlFor="accountNumber"
              >
                Account Number
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="accountNumber"
                  type="text"
                  disabled
                  value={accountNumber || "Loading..."}
                  className="flex-1 bg-gray-700 rounded-lg px-3 py-2 opacity-70 cursor-not-allowed font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={copyAccountNumber}
                  disabled={!accountNumber}
                  className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  title="Copy account number"
                >
                  {copiedAccountNumber ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Share this number with others to receive P2P transfers
              </p>
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

        {/* Security Modal */}
        <SettingsModal
          isOpen={activeModal === "security"}
          onClose={closeModal}
          title="Security"
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
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
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
                            verifying2FA || verificationCode.length !== 6
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
                            setVerificationCode("");
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
                          kycStatus === "UNDER_REVIEW"
                        }
                        className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        {submittingKyc
                          ? "Submitting..."
                          : kycStatus === "PENDING" ||
                            kycStatus === "UNDER_REVIEW"
                          ? "Under Review"
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
        >
          <div className="space-y-6">
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
                <li>• Theme customization (light/dark/auto)</li>
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
      </div>
    </>
  );
}
