"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  ChevronLeft,
} from "lucide-react";
import Image from "next/image";

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

export default function KycManagementPage() {
  const { data: session } = useSession();
  const router = useRouter();
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

    setReviewing(true);
    try {
      const response = await fetch("/api/admin/kyc/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kycId: selectedSubmission.id,
          status: reviewAction,
          rejectionReason: reviewAction === "REJECTED" ? rejectionReason : null,
          adminNotes: adminNotes || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`KYC ${reviewAction.toLowerCase()} successfully!`);
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
    const styles = {
      PENDING: "bg-yellow-900/30 text-yellow-400 border-yellow-700",
      APPROVED: "bg-green-900/30 text-green-400 border-green-700",
      REJECTED: "bg-red-900/30 text-red-400 border-red-700",
      UNDER_REVIEW: "bg-blue-900/30 text-blue-400 border-blue-700",
    };
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
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "REJECTED":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "PENDING":
      case "UNDER_REVIEW":
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return null;
    }
  };

  if (selectedSubmission) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Back Button */}
        <button
          onClick={() => setSelectedSubmission(null)}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to List</span>
        </button>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedSubmission.firstName} {selectedSubmission.lastName}
              </h2>
              <p className="text-gray-400">{selectedSubmission.user.email}</p>
            </div>
            {getStatusBadge(selectedSubmission.status)}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Full Name:</span>
                  <span className="text-white font-medium">
                    {selectedSubmission.firstName} {selectedSubmission.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date of Birth:</span>
                  <span className="text-white font-medium">
                    {new Date(
                      selectedSubmission.dateOfBirth
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Nationality:</span>
                  <span className="text-white font-medium">
                    {selectedSubmission.nationality}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone:</span>
                  <span className="text-white font-medium">
                    {selectedSubmission.phoneNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Address:</span>
                  <span className="text-white font-medium text-right max-w-[200px]">
                    {selectedSubmission.address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">City:</span>
                  <span className="text-white font-medium">
                    {selectedSubmission.city}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Postal Code:</span>
                  <span className="text-white font-medium">
                    {selectedSubmission.postalCode}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submitted Documents */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Submitted Documents
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {/* ID Document */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-2">
                  Government ID
                </h4>
                <div className="relative aspect-video bg-gray-900 rounded overflow-hidden mb-2">
                  <Image
                    src={selectedSubmission.idDocumentUrl}
                    alt="ID Document"
                    fill
                    className="object-contain"
                  />
                </div>
                <a
                  href={selectedSubmission.idDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>

              {/* Proof of Address */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-2">
                  Proof of Address
                </h4>
                <div className="relative aspect-video bg-gray-900 rounded overflow-hidden mb-2">
                  <Image
                    src={selectedSubmission.proofOfAddressUrl}
                    alt="Proof of Address"
                    fill
                    className="object-contain"
                  />
                </div>
                <a
                  href={selectedSubmission.proofOfAddressUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>

              {/* Selfie */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-2">
                  Selfie with ID
                </h4>
                <div className="relative aspect-video bg-gray-900 rounded overflow-hidden mb-2">
                  <Image
                    src={selectedSubmission.selfieUrl}
                    alt="Selfie"
                    fill
                    className="object-contain"
                  />
                </div>
                <a
                  href={selectedSubmission.selfieUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          </div>

          {/* Review Section */}
          {selectedSubmission.status !== "APPROVED" && (
            <div className="bg-gray-700/30 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Review Submission
              </h3>

              <div>
                <label className="block text-sm font-medium mb-2">Action</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setReviewAction("APPROVED")}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      reviewAction === "APPROVED"
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setReviewAction("UNDER_REVIEW")}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      reviewAction === "UNDER_REVIEW"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Under Review
                  </button>
                  <button
                    onClick={() => setReviewAction("REJECTED")}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      reviewAction === "REJECTED"
                        ? "bg-red-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>

              {reviewAction === "REJECTED" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Rejection Reason <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                    placeholder="Explain why this submission is being rejected..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={2}
                  placeholder="Internal notes..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleReview}
                  disabled={reviewing}
                  className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                  {reviewing ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>
          )}

          {/* Review Info */}
          {selectedSubmission.reviewedAt && (
            <div className="bg-gray-700/30 rounded-lg p-4 mt-4">
              <h3 className="text-sm font-semibold text-white mb-2">
                Review Information
              </h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p>
                  Reviewed:{" "}
                  {new Date(selectedSubmission.reviewedAt).toLocaleString()}
                </p>
                {selectedSubmission.rejectionReason && (
                  <p className="text-red-400">
                    Reason: {selectedSubmission.rejectionReason}
                  </p>
                )}
                {selectedSubmission.adminNotes && (
                  <p className="text-gray-400">
                    Notes: {selectedSubmission.adminNotes}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">KYC Management</h1>
          <p className="text-gray-400 mt-1">
            Review and manage user verification submissions
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        {(
          ["ALL", "PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"] as const
        ).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === status
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            {status.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-4">Loading submissions...</p>
        </div>
      ) : !submissions || submissions.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No KYC submissions found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(submission.status)}
                    <h3 className="text-lg font-semibold text-white">
                      {submission.firstName} {submission.lastName}
                    </h3>
                    {getStatusBadge(submission.status)}
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {submission.user.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Submitted:{" "}
                      {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                    <p className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {submission.nationality} • {submission.city}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSubmission(submission)}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
