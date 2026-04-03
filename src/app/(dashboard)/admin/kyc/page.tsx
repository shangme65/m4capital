"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  User,
  Calendar,
  MapPin,
  Phone,
  Globe,
  Download,
  ArrowLeft,
  ZoomIn,
  X,
  ExternalLink,
  Sparkles,
  AlertCircle,
} from "lucide-react";

// Success Modal Component with 3D styling
function SuccessModal({
  isOpen,
  onClose,
  action,
  isDark = true,
}: {
  isOpen: boolean;
  onClose: () => void;
  action: "APPROVED" | "REJECTED" | "UNDER_REVIEW";
  isDark?: boolean;
}) {
  if (!isOpen) return null;

  const config = {
    APPROVED: {
      icon: CheckCircle,
      color: "green",
      title: "KYC Approved!",
      message: "The user's verification has been approved successfully.",
      gradient: "from-green-500 to-emerald-600",
      glow: "rgba(34, 197, 94, 0.4)",
    },
    REJECTED: {
      icon: XCircle,
      color: "red",
      title: "KYC Rejected",
      message: "The user's verification has been rejected.",
      gradient: "from-red-500 to-rose-600",
      glow: "rgba(239, 68, 68, 0.4)",
    },
    UNDER_REVIEW: {
      icon: Clock,
      color: "blue",
      title: "Under Review",
      message: "The KYC submission has been marked for further review.",
      gradient: "from-blue-500 to-indigo-600",
      glow: "rgba(59, 130, 246, 0.4)",
    },
  };

  const { icon: Icon, title, message, gradient, glow } = config[action];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-sm rounded-2xl overflow-hidden ${isDark ? "bg-gray-900" : "bg-white"}`}
        style={{
          boxShadow: `0 25px 50px -12px ${glow}, 0 0 0 1px ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
          transform: "perspective(1000px) rotateX(2deg)",
        }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${gradient} opacity-30 blur-3xl animate-pulse`}
          />
          <div
            className={`absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-3xl animate-pulse delay-500`}
          />
        </div>

        {/* Content */}
        <div className="relative p-6 text-center">
          {/* 3D Icon */}
          <div className="relative mx-auto w-20 h-20 mb-4">
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-b ${gradient}`}
              style={{
                boxShadow: `0 10px 30px ${glow}, inset 0 -5px 20px rgba(0,0,0,0.3)`,
              }}
            />
            <div
              className={`absolute inset-2 rounded-full flex items-center justify-center ${isDark ? "bg-gray-900" : "bg-gray-100"}`}
              style={{ boxShadow: "inset 0 5px 15px rgba(0,0,0,0.5)" }}
            >
              <Icon className={`w-8 h-8 ${isDark ? "text-white" : "text-gray-900"}`} />
            </div>
            {/* Sparkle effects */}
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
          </div>

          {/* Title */}
          <h2 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h2>
          <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{message}</p>

          {/* Button */}
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${gradient} transition-all hover:scale-[1.02] active:scale-[0.98]`}
            style={{
              boxShadow: `0 4px 15px ${glow}`,
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

interface KycSubmission {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  idDocumentUrl: string;
  idDocumentBackUrl?: string;
  proofOfAddressUrl: string;
  selfieUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW";
  submittedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  adminNotes: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    accountType: string;
  };
}

// Helper to check if URL is base64 data URL
const isBase64DataUrl = (url: string) => url?.startsWith("data:");

// Helper to check if URL is a Cloudinary URL
const isCloudinaryUrl = (url: string) => url?.includes("cloudinary.com") || url?.includes("res.cloudinary");

// Helper to get file extension from URL (supports base64 and Cloudinary)
const getFileExtension = (url: string): string => {
  if (!url) return "file";
  
  // Handle base64 data URLs
  if (isBase64DataUrl(url)) {
    const match = url.match(/data:([^;]+)/);
    if (match) {
      const mimeType = match[1];
      if (mimeType.includes("pdf")) return "pdf";
      if (mimeType.includes("png")) return "png";
      if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
    }
    return "file";
  }
  
  // Handle external URLs (Cloudinary, etc.)
  const urlPath = url.split("?")[0]; // Remove query params
  if (urlPath.toLowerCase().endsWith(".pdf")) return "pdf";
  if (urlPath.toLowerCase().endsWith(".png")) return "png";
  if (urlPath.toLowerCase().endsWith(".jpg") || urlPath.toLowerCase().endsWith(".jpeg")) return "jpg";
  if (urlPath.toLowerCase().endsWith(".webp")) return "webp";
  
  return "jpg"; // Default to jpg for Cloudinary images
};

// Helper to check if it's a PDF
const isPdf = (url: string): boolean => {
  if (!url) return false;
  return url.includes("application/pdf") || url.toLowerCase().includes(".pdf");
};

// Download handler - supports both base64 and external URLs
const downloadFile = async (url: string, filename: string) => {
  if (isBase64DataUrl(url)) {
    // Direct download for base64
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // Fetch and download for external URLs (Cloudinary)
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab
      window.open(url, "_blank");
    }
  }
};

// Document Preview Component
function DocumentPreview({
  url,
  title,
  onClose,
  isDark = true,
}: {
  url: string;
  title: string;
  onClose: () => void;
  isDark?: boolean;
}) {
  const isPdfFile = isPdf(url);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className={`relative w-full max-w-5xl max-h-[90vh] rounded-xl overflow-hidden ${isDark ? "bg-gray-900" : "bg-white"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
          <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                downloadFile(
                  url,
                  `${title.replace(/\s+/g, "_")}.${getFileExtension(url)}`
                )
              }
              className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm font-medium transition-colors text-white"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors text-white"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`overflow-auto max-h-[calc(90vh-80px)] p-4 flex items-center justify-center ${isDark ? "bg-gray-950" : "bg-gray-100"}`}>
          {isPdfFile ? (
            <iframe
              src={url}
              className="w-full h-[70vh] rounded-lg"
              title={title}
            />
          ) : (
            <img
              src={url}
              alt={title}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Document Card Component
function DocumentCard({
  title,
  url,
  onView,
  isDark = true,
}: {
  title: string;
  url: string;
  onView: () => void;
  isDark?: boolean;
}) {
  const isPdfFile = isPdf(url);
  const filename = `${title.replace(/\s+/g, "_")}.${getFileExtension(url)}`;

  return (
    <div className={`rounded-lg p-4 ${isDark ? "bg-gray-700/50" : "bg-gray-100"}`}>
      <h4 className={`text-sm font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h4>
      <div
        className={`relative aspect-video rounded overflow-hidden mb-3 group cursor-pointer ${isDark ? "bg-gray-900" : "bg-gray-200"}`}
        onClick={onView}
      >
        {isPdfFile ? (
          <div className={`absolute inset-0 flex flex-col items-center justify-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            <FileText className="w-12 h-12 mb-2" />
            <span className="text-sm">PDF Document</span>
          </div>
        ) : (
          <img src={url} alt={title} className="w-full h-full object-contain" />
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex items-center gap-2 text-white font-medium">
            <ZoomIn className="w-5 h-5" />
            <span>View Full Size</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onView}
          className={`flex-1 flex items-center justify-center gap-2 text-sm py-2 rounded-lg transition-colors ${isDark ? "text-blue-400 hover:text-blue-300 bg-gray-700 hover:bg-gray-600" : "text-blue-600 hover:text-blue-500 bg-gray-200 hover:bg-gray-300"}`}
        >
          <Eye className="w-4 h-4" />
          View
        </button>
        <button
          onClick={() => downloadFile(url, filename)}
          className={`flex-1 flex items-center justify-center gap-2 text-sm py-2 rounded-lg transition-colors ${isDark ? "text-orange-400 hover:text-orange-300 bg-gray-700 hover:bg-gray-600" : "text-orange-600 hover:text-orange-500 bg-gray-200 hover:bg-gray-300"}`}
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  );
}

export default function KycManagementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = mounted ? resolvedTheme === "dark" : true;
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("ALL");
  const [selectedSubmission, setSelectedSubmission] =
    useState<KycSubmission | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [reviewAction, setReviewAction] = useState<
    "APPROVED" | "REJECTED" | "UNDER_REVIEW"
  >("APPROVED");
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [previewDocument, setPreviewDocument] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    action: "APPROVED" | "REJECTED" | "UNDER_REVIEW";
  }>({ isOpen: false, action: "APPROVED" });

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/kyc/list?status=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      console.error("Failed to fetch KYC submissions:", error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedSubmission) return;

    if (reviewAction === "REJECTED" && !rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    // Map frontend action to API action
    const actionMap: Record<string, string> = {
      APPROVED: "APPROVE",
      REJECTED: "REJECT",
      UNDER_REVIEW: "UNDER_REVIEW",
    };

    setReviewing(true);
    try {
      const response = await fetch("/api/admin/kyc/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kycId: selectedSubmission.id,
          action: actionMap[reviewAction] || reviewAction,
          rejectionReason: reviewAction === "REJECTED" ? rejectionReason : null,
          adminNotes: adminNotes || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessModal({ isOpen: true, action: reviewAction });
        setSelectedSubmission(null);
        setRejectionReason("");
        setAdminNotes("");
        fetchSubmissions();
      } else {
        alert(data.error || "Failed to review KYC");
      }
    } catch (error) {
      console.error("Review error:", error);
      alert("Failed to submit review");
    } finally {
      setReviewing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const darkStyles = {
      PENDING: "bg-yellow-900/30 text-yellow-400 border-yellow-700",
      APPROVED: "bg-green-900/30 text-green-400 border-green-700",
      REJECTED: "bg-red-900/30 text-red-400 border-red-700",
      UNDER_REVIEW: "bg-blue-900/30 text-blue-400 border-blue-700",
    };
    const lightStyles = {
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-300",
      APPROVED: "bg-green-100 text-green-700 border-green-300",
      REJECTED: "bg-red-100 text-red-700 border-red-300",
      UNDER_REVIEW: "bg-blue-100 text-blue-700 border-blue-300",
    };
    const styles = isDark ? darkStyles : lightStyles;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold border ${
          styles[status as keyof typeof styles]
        }`}
      >
        {status}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className={`w-5 h-5 ${isDark ? "text-green-400" : "text-green-600"}`} />;
      case "REJECTED":
        return <XCircle className={`w-5 h-5 ${isDark ? "text-red-400" : "text-red-600"}`} />;
      case "PENDING":
      case "UNDER_REVIEW":
        return <Clock className={`w-5 h-5 ${isDark ? "text-yellow-400" : "text-yellow-600"}`} />;
      default:
        return null;
    }
  };

  if (selectedSubmission) {
    return (
      <div className={`fixed inset-0 top-20 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        {/* Success Modal */}
        <SuccessModal
          isOpen={successModal.isOpen}
          onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
          action={successModal.action}
          isDark={isDark}
        />

        {/* Document Preview Modal */}
        {previewDocument && (
          <DocumentPreview
            url={previewDocument.url}
            title={previewDocument.title}
            onClose={() => setPreviewDocument(null)}
            isDark={isDark}
          />
        )}

        {/* Mobile Header */}
        <div className={`sticky top-0 z-[75] backdrop-blur-sm px-4 py-4 ${isDark ? "bg-gray-900/100 border-b border-gray-700" : "bg-white/100 border-b border-gray-200"}`}>
          <div className="mb-3">
            <h2 className="text-base xs:text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Admin Control Panel
            </h2>
            <p className={`text-[10px] xs:text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Complete administrative dashboard
            </p>
          </div>
          <button
            onClick={() => setSelectedSubmission(null)}
            className={`flex items-center gap-2 transition-colors ${isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          <div className="flex items-center justify-between mt-4">
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-bold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                {selectedSubmission.firstName} {selectedSubmission.lastName}
              </h3>
              <p className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {selectedSubmission.user.email}
              </p>
            </div>
            <div className="ml-3">
              {getStatusBadge(selectedSubmission.status)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 pb-32">
          {/* Personal Information */}
          <div className={`rounded-xl p-4 border ${isDark ? "bg-gray-800 border-gray-700 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)]" : "bg-white border-gray-200 shadow-[0_4px_0_0_#e5e7eb,0_6px_12px_rgba(0,0,0,0.1)]"}`}>
            <h3 className={`text-base font-semibold flex items-center gap-2 mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
              <User className="w-4 h-4 text-orange-500" />
              Personal Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className={`flex justify-between py-2 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>Full Name</span>
                <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                  {selectedSubmission.firstName} {selectedSubmission.lastName}
                </span>
              </div>
              <div className={`flex justify-between py-2 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>Date of Birth</span>
                <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                  {new Date(
                    selectedSubmission.dateOfBirth
                  ).toLocaleDateString()}
                </span>
              </div>
              <div className={`flex justify-between py-2 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>Nationality</span>
                <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                  {selectedSubmission.nationality}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>Phone</span>
                <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                  {selectedSubmission.phoneNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className={`rounded-xl p-4 border ${isDark ? "bg-gray-800 border-gray-700 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)]" : "bg-white border-gray-200 shadow-[0_4px_0_0_#e5e7eb,0_6px_12px_rgba(0,0,0,0.1)]"}`}>
            <h3 className={`text-base font-semibold flex items-center gap-2 mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
              <MapPin className="w-4 h-4 text-orange-500" />
              Address Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className={`flex justify-between py-2 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>Address</span>
                <span className={`font-medium text-right max-w-[180px] ${isDark ? "text-white" : "text-gray-900"}`}>
                  {selectedSubmission.address}
                </span>
              </div>
              <div className={`flex justify-between py-2 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>City</span>
                <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                  {selectedSubmission.city}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>Postal Code</span>
                <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                  {selectedSubmission.postalCode}
                </span>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className={`rounded-xl p-4 border ${isDark ? "bg-gray-800 border-gray-700 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)]" : "bg-white border-gray-200 shadow-[0_4px_0_0_#e5e7eb,0_6px_12px_rgba(0,0,0,0.1)]"}`}>
            <h3 className={`text-base font-semibold flex items-center gap-2 mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
              <FileText className="w-4 h-4 text-orange-500" />
              Documents
            </h3>
            <div className="space-y-3">
              <DocumentCard
                title="Government ID (Front)"
                url={selectedSubmission.idDocumentUrl}
                onView={() =>
                  setPreviewDocument({
                    url: selectedSubmission.idDocumentUrl,
                    title: "Government ID (Front)",
                  })
                }
                isDark={isDark}
              />
              {selectedSubmission.idDocumentBackUrl && (
                <DocumentCard
                  title="Government ID (Back)"
                  url={selectedSubmission.idDocumentBackUrl}
                  onView={() =>
                    setPreviewDocument({
                      url: selectedSubmission.idDocumentBackUrl!,
                      title: "Government ID (Back)",
                    })
                  }
                  isDark={isDark}
                />
              )}
              <DocumentCard
                title="Proof of Address"
                url={selectedSubmission.proofOfAddressUrl}
                onView={() =>
                  setPreviewDocument({
                    url: selectedSubmission.proofOfAddressUrl,
                    title: "Proof of Address",
                  })
                }
                isDark={isDark}
              />
              <DocumentCard
                title="Selfie with ID"
                url={selectedSubmission.selfieUrl}
                onView={() =>
                  setPreviewDocument({
                    url: selectedSubmission.selfieUrl,
                    title: "Selfie with ID",
                  })
                }
                isDark={isDark}
              />
            </div>
          </div>

          {/* Review Info (if already reviewed) */}
          {selectedSubmission.reviewedAt && (
            <div className={`rounded-xl p-4 border ${isDark ? "bg-gray-800 border-gray-700 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)]" : "bg-white border-gray-200 shadow-[0_4px_0_0_#e5e7eb,0_6px_12px_rgba(0,0,0,0.1)]"}`}>
              <h3 className={`text-base font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                Review Information
              </h3>
              <div className={`text-sm space-y-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                <p>
                  <span className={isDark ? "text-gray-400" : "text-gray-500"}>Reviewed:</span>{" "}
                  {new Date(selectedSubmission.reviewedAt).toLocaleString()}
                </p>
                {selectedSubmission.rejectionReason && (
                  <p className="text-red-400">
                    <span className={isDark ? "text-gray-400" : "text-gray-500"}>Reason:</span>{" "}
                    {selectedSubmission.rejectionReason}
                  </p>
                )}
                {selectedSubmission.adminNotes && (
                  <p>
                    <span className={isDark ? "text-gray-400" : "text-gray-500"}>Notes:</span>{" "}
                    {selectedSubmission.adminNotes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Review Section (if not approved) */}
          {selectedSubmission.status !== "APPROVED" && (
            <div className={`rounded-xl p-4 border ${isDark ? "bg-gray-800 border-gray-700 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)]" : "bg-white border-gray-200 shadow-[0_4px_0_0_#e5e7eb,0_6px_12px_rgba(0,0,0,0.1)]"}`}>
              <h3 className={`text-base font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Review Submission
              </h3>

              {/* Action Buttons */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Action
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setReviewAction("APPROVED")}
                    className={`py-2.5 px-3 rounded-lg font-medium text-sm transition-colors ${
                      reviewAction === "APPROVED"
                        ? "bg-green-600 text-white"
                        : isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setReviewAction("UNDER_REVIEW")}
                    className={`py-2.5 px-3 rounded-lg font-medium text-sm transition-colors ${
                      reviewAction === "UNDER_REVIEW"
                        ? "bg-blue-600 text-white"
                        : isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Review
                  </button>
                  <button
                    onClick={() => setReviewAction("REJECTED")}
                    className={`py-2.5 px-3 rounded-lg font-medium text-sm transition-colors ${
                      reviewAction === "REJECTED"
                        ? "bg-red-600 text-white"
                        : isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>

              {reviewAction === "REJECTED" && (
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Rejection Reason <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 border ${isDark ? "bg-gray-700 text-white border-gray-600" : "bg-gray-50 text-gray-900 border-gray-200"}`}
                    rows={3}
                    placeholder="Explain why this submission is being rejected..."
                  />
                </div>
              )}

              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 border ${isDark ? "bg-gray-700 text-white border-gray-600" : "bg-gray-50 text-gray-900 border-gray-200"}`}
                  rows={2}
                  placeholder="Internal notes..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom Submit Button */}
        {selectedSubmission.status !== "APPROVED" && (
          <div className={`fixed bottom-0 left-0 right-0 p-4 border-t ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
            <button
              onClick={handleReview}
              disabled={reviewing}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-colors ${
                reviewAction === "APPROVED"
                  ? "bg-green-600 hover:bg-green-500"
                  : reviewAction === "REJECTED"
                  ? "bg-red-600 hover:bg-red-500"
                  : "bg-orange-600 hover:bg-orange-500"
              } disabled:opacity-50`}
            >
              {reviewing
                ? "Submitting..."
                : `Submit ${reviewAction.replace("_", " ")}`}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 top-20 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        action={successModal.action}
        isDark={isDark}
      />

      {/* Mobile Header */}
      <div className={`sticky top-0 z-[75] backdrop-blur-sm px-4 py-4 ${isDark ? "bg-gray-900/100 border-b border-gray-700" : "bg-white/100 border-b border-gray-200"}`}>
        <div className="mb-3">
          <h2 className="text-base xs:text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Admin Control Panel
          </h2>
          <p className={`text-[10px] xs:text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Complete administrative dashboard
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-2 transition-colors p-2 rounded-lg -ml-2 mb-3 ${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800/50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>
        <div>
          <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>KYC Management</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Review user verification submissions
          </p>
        </div>
      </div>

      {/* Filter Tabs - Scrollable */}
      <div className={`sticky top-[168px] z-[74] backdrop-blur-sm overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isDark ? "bg-gray-900/100 border-b border-gray-700" : "bg-white/100 border-b border-gray-200"}`}>
        <div className="flex w-full">
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`flex-1 px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                filter === status
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className={`mt-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Loading submissions...</p>
          </div>
        ) : !submissions || submissions.length === 0 ? (
          <div className={`text-center py-12 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <FileText className={`w-12 h-12 mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>No KYC submissions found</p>
          </div>
        ) : (
          submissions.map((submission) => (
            <button
              key={submission.id}
              onClick={() => setSelectedSubmission(submission)}
              className={`w-full rounded-xl p-4 border text-left transition-all ${isDark ? "bg-gray-800 border-gray-700 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_2px_0_0_#1f2937,0_4px_8px_rgba(0,0,0,0.3)] active:shadow-[0_0px_0_0_#1f2937]" : "bg-white border-gray-200 shadow-[0_4px_0_0_#e5e7eb,0_6px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_0_0_#e5e7eb,0_4px_8px_rgba(0,0,0,0.1)] active:shadow-[0_0px_0_0_#e5e7eb]"} hover:translate-y-0.5 active:translate-y-1`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(submission.status)}
                    <h3 className={`text-base font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                      {submission.firstName} {submission.lastName}
                    </h3>
                  </div>
                  <p className={`text-sm truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {submission.user.email}
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(submission.status)}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
