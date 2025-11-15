"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
} from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const router = useRouter();

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

  // KYC state
  const [kycStatus, setKycStatus] = useState<
    "NOT_STARTED" | "PENDING" | "APPROVED" | "REJECTED"
  >("NOT_STARTED");
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
      alert("Failed to update email preferences. Please try again.");
    } finally {
      setSavingEmailPrefs(false);
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
    if (!confirm("Are you sure you want to unlink your Telegram account?")) {
      return;
    }

    try {
      const response = await fetch("/api/telegram/link", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to unlink Telegram account");
      }

      setTelegramLinked(false);
      setTelegramUsername(null);
      alert("Telegram account unlinked successfully");
    } catch (error: any) {
      alert(error.message || "Failed to unlink Telegram account");
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
        alert(
          "KYC verification submitted successfully! We'll review your documents within 24-48 hours."
        );
      } else {
        alert(data.error || "Failed to submit KYC verification");
      }
    } catch (error) {
      console.error("KYC submission error:", error);
      alert("Failed to submit KYC verification. Please try again.");
    } finally {
      setSubmittingKyc(false);
    }
  };

  // Simple accordion section component (local to this page)
  const AccordionSection = ({
    id,
    title,
    children,
    defaultOpen = false,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
  }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
      <section className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <button
          type="button"
          {...(open
            ? { "aria-expanded": "true" }
            : { "aria-expanded": "false" })}
          aria-controls={`${id}-content`}
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-gray-750 text-left"
        >
          <span className="text-base sm:text-lg font-semibold">{title}</span>
          <svg
            className={`h-5 w-5 transition-transform duration-200 ${
              open ? "rotate-180" : "rotate-0"
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <div
          id={`${id}-content`}
          className={`${open ? "block" : "hidden"} border-t border-gray-700`}
        >
          <div className="p-4 sm:p-6">{children}</div>
        </div>
      </section>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 sm:space-y-8">
      {/* Back button */}
      <div className="mb-2">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700"
        >
          <span aria-hidden>←</span>
          <span>Back</span>
        </button>
      </div>

      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400 text-sm">
          Manage your account preferences and platform experience.
        </p>
      </header>

      {/* Accordion: Profile */}
      <AccordionSection id="profile" title="Profile">
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
      </AccordionSection>

      {/* Accordion: Security */}
      <AccordionSection id="security" title="Security">
        <ul className="space-y-3 text-sm text-gray-300">
          <li>• Password change (coming soon)</li>
          <li>• Two-factor authentication (planned)</li>
          <li>• Active sessions / device management (planned)</li>
        </ul>
      </AccordionSection>

      {/* Accordion: KYC Verification */}
      <AccordionSection id="kyc" title="KYC Verification">
        <div className="space-y-6">
          {/* KYC Status Banner */}
          <div
            className={`rounded-lg p-4 border ${
              kycStatus === "APPROVED"
                ? "bg-green-900/20 border-green-700"
                : kycStatus === "PENDING"
                ? "bg-yellow-900/20 border-yellow-700"
                : kycStatus === "REJECTED"
                ? "bg-red-900/20 border-red-700"
                : "bg-blue-900/20 border-blue-700"
            }`}
          >
            <div className="flex items-start gap-3">
              {kycStatus === "APPROVED" && (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              )}
              {kycStatus === "PENDING" && (
                <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              )}
              {kycStatus === "REJECTED" && (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              {kycStatus === "NOT_STARTED" && (
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              )}

              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">
                  {kycStatus === "APPROVED" && "Verification Approved"}
                  {kycStatus === "PENDING" && "Verification Pending"}
                  {kycStatus === "REJECTED" && "Verification Rejected"}
                  {kycStatus === "NOT_STARTED" && "Verification Required"}
                </h3>
                <p className="text-sm text-gray-300">
                  {kycStatus === "APPROVED" &&
                    "Your identity has been verified. You have full access to all platform features."}
                  {kycStatus === "PENDING" &&
                    "We're reviewing your documents. This typically takes 24-48 hours."}
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
              {/* Personal Information */}
              <div>
                <h4 className="text-base font-semibold text-white mb-4">
                  Personal Information
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
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
                        setKycData({ ...kycData, firstName: e.target.value })
                      }
                      className="w-full bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="lastName"
                    >
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      value={kycData.lastName}
                      onChange={(e) =>
                        setKycData({ ...kycData, lastName: e.target.value })
                      }
                      className="w-full bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Doe"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
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
                        setKycData({ ...kycData, dateOfBirth: e.target.value })
                      }
                      className="w-full bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
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
                        setKycData({ ...kycData, nationality: e.target.value })
                      }
                      className="w-full bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="United States"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
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
                        setKycData({ ...kycData, phoneNumber: e.target.value })
                      }
                      className="w-full bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="text-base font-semibold text-white mb-4">
                  Address Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
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
                      className="w-full bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
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
                        className="w-full bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
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
                          setKycData({ ...kycData, postalCode: e.target.value })
                        }
                        className="w-full bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="10001"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Upload */}
              <div>
                <h4 className="text-base font-semibold text-white mb-4">
                  Document Upload
                </h4>
                <div className="space-y-4">
                  {/* ID Document */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
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
                      <label htmlFor="idDocument" className="cursor-pointer">
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
                    <label className="block text-sm font-medium mb-2">
                      Proof of Address * (Utility Bill, Bank Statement - less
                      than 3 months old)
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
                    <label className="block text-sm font-medium mb-2">
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
              </div>

              {/* Terms & Conditions */}
              <div className="bg-gray-700/30 rounded-lg p-4">
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
                    I certify that all information provided is accurate and
                    complete. I understand that providing false information may
                    result in account suspension or legal action.
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingKyc || kycStatus === "PENDING"}
                  className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  {submittingKyc
                    ? "Submitting..."
                    : kycStatus === "PENDING"
                    ? "Under Review"
                    : "Submit for Verification"}
                </button>
              </div>
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
      </AccordionSection>

      {/* Accordion: Email Notifications */}
      <AccordionSection id="notifications" title="Email Notifications">
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
      </AccordionSection>

      {/* Accordion: Telegram Integration */}
      <AccordionSection id="telegram" title="Telegram Integration">
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
                  <h4 className="font-medium text-white mb-3">How to link:</h4>
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
      </AccordionSection>

      {/* Accordion: Preferences */}
      <AccordionSection id="preferences" title="Preferences">
        <ul className="space-y-3 text-sm text-gray-300">
          <li>• Theme (light/dark/auto)</li>
          <li>• Default dashboard layout</li>
          <li>• Data refresh interval</li>
          <li>• Currency & locale formatting</li>
        </ul>
      </AccordionSection>

      {/* Accordion: Data & Privacy */}
      <AccordionSection id="data-privacy" title="Data & Privacy">
        <ul className="space-y-3 text-sm text-gray-300">
          <li>• Download account data (planned)</li>
          <li>• Delete account request (planned)</li>
          <li>• Consent & regulatory disclosures</li>
        </ul>
      </AccordionSection>

      {/* Logout */}
      <section className="flex justify-end">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-red-400 hover:text-red-300 font-medium"
        >
          Log out
        </button>
      </section>
    </div>
  );
}
