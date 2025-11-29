"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/client/ConfirmDialog";
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Trash2,
  RefreshCw,
  Lock,
  User,
  Mail,
  Key,
  Server,
  Activity,
  Zap,
  XCircle,
  ArrowRight,
  Terminal,
  Database,
  Eye,
  EyeOff,
} from "lucide-react";

interface AdminSetupClientProps {
  adminExists: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export default function AdminSetupClient({
  adminExists,
  isAuthenticated,
  isAdmin,
}: AdminSetupClientProps) {
  const [initLoading, setInitLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const initializeAdmin = async () => {
    setInitLoading(true);
    setError(null);
    setResult(null);
    setActiveStep(1);

    try {
      const response = await fetch("/api/init-admin");
      const data = await response.json();

      if (data.success) {
        setResult(data);
        showSuccess(data.message || "Admin initialized successfully!");

        // Redirect to login page after successful initialization
        if (data.action === "created" || data.action === "updated") {
          showSuccess(data.message + " Redirecting to login...");
          setTimeout(() => {
            window.location.href = "/?login=true";
          }, 2000);
        }
      } else {
        setError(data.error || "Failed to initialize admin");
        showError(data.error || "Failed to initialize admin");
      }
    } catch (err) {
      const errorMsg =
        "Network error: " +
        (err instanceof Error ? err.message : "Unknown error");
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setInitLoading(false);
      setActiveStep(null);
    }
  };

  const removeOtherAdmins = async () => {
    setRemoveLoading(true);
    setError(null);
    setActiveStep(2);

    try {
      const response = await fetch("/api/admin/remove-other-admins", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        setResult(data);
        showSuccess(data.message || "Origin admin removed successfully!");
      } else {
        setError(data.error || "Failed to remove origin admin");
        showError(data.error || "Failed to remove origin admin");
      }
    } catch (err) {
      const errorMsg =
        "Network error: " +
        (err instanceof Error ? err.message : "Unknown error");
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setRemoveLoading(false);
      setActiveStep(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      ></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 pt-24 sm:pt-28">
        <div
          className={`w-full max-w-4xl transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-2xl mb-3 animate-pulse">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
              Admin <span className="text-purple-400">Setup</span>
            </h1>
            <p className="text-gray-400 text-base">
              Initialize and manage your super admin account
            </p>

            {/* Status Badges */}
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              {isAuthenticated && isAdmin && (
                <div className="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">
                    Authenticated as Admin
                  </span>
                </div>
              )}
              {adminExists && !isAuthenticated && (
                <div className="inline-flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Not Logged In</span>
                </div>
              )}
              {!adminExists && (
                <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Server className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">First-Time Setup</span>
                </div>
              )}
            </div>
          </div>

          {/* Alert Banners */}
          {!adminExists && (
            <div className="mb-4 bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-blue-300 font-semibold text-base mb-1">
                    First-Time Setup Detected
                  </h3>
                  <p className="text-blue-200/80 text-xs leading-relaxed">
                    No admin account exists yet. This page is publicly
                    accessible for initial setup. After creating an admin, this
                    page will require admin authentication for security.
                  </p>
                </div>
              </div>
            </div>
          )}

          {adminExists && !isAuthenticated && (
            <div className="mb-4 bg-yellow-500/10 backdrop-blur-xl border border-yellow-500/20 rounded-xl p-4 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-yellow-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-yellow-300 font-semibold text-base mb-1">
                    Admin Already Exists
                  </h3>
                  <p className="text-yellow-200/80 text-xs leading-relaxed">
                    An admin account exists in the database. You can still
                    reinitialize or update the origin admin from your .env file.
                    For security operations,{" "}
                    <a
                      href="/?login=true"
                      className="underline font-semibold hover:text-yellow-300 transition-colors"
                    >
                      login as admin
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-4 mb-4">
            {/* Initialize Admin Card */}
            <div
              className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02] ${
                activeStep === 1 ? "ring-2 ring-purple-500" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    Initialize Origin Admin
                  </h2>
                </div>
                {result?.action && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
              </div>

              <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                Create or update the super admin account using credentials from
                your environment configuration.
              </p>

              <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-purple-300">
                    Required Environment Variables
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <code className="text-gray-300 font-mono text-xs">
                      ORIGIN_ADMIN_EMAIL
                    </code>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Key className="w-4 h-4 text-gray-400" />
                    <code className="text-gray-300 font-mono text-xs">
                      ORIGIN_ADMIN_PASSWORD
                    </code>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <code className="text-gray-300 font-mono text-xs">
                      ORIGIN_ADMIN_NAME
                    </code>
                  </div>
                </div>
              </div>

              <button
                onClick={initializeAdmin}
                disabled={initLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2 group"
              >
                {initLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Initializing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>Initialize Admin</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Remove Admin Card */}
            <div
              className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-2xl hover:shadow-red-500/20 transition-all duration-300 hover:scale-[1.02] ${
                activeStep === 2 ? "ring-2 ring-red-500" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    Remove Origin Admin
                  </h2>
                </div>
                <div className="px-2 py-0.5 bg-orange-500/20 border border-orange-500/30 rounded-full">
                  <span className="text-xs font-semibold text-orange-400">
                    Optional
                  </span>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                Remove the origin admin account if you want to clean up or start
                fresh. This operation is reversible.
              </p>

              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-300 font-semibold text-xs mb-0.5">
                      Caution
                    </p>
                    <p className="text-red-200/80 text-xs leading-relaxed">
                      This will soft-delete the admin account specified in{" "}
                      <code className="bg-red-900/30 px-1.5 py-0.5 rounded text-xs font-mono">
                        ORIGIN_ADMIN_EMAIL
                      </code>
                      . The account can be restored if needed.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowConfirmDialog(true)}
                disabled={removeLoading}
                className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-5 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 group text-sm"
              >
                {removeLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    <span>Remove Origin Admin</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Display */}
          {result && (
            <div className="mb-4 bg-green-500/10 backdrop-blur-xl border border-green-500/20 rounded-xl p-4 shadow-xl animate-slideIn">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-green-300 font-semibold text-base mb-1">
                    Operation Successful
                  </h3>
                  <p className="text-green-200/80 text-xs">{result.message}</p>
                </div>
              </div>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 mb-3 text-sm"
              >
                {showDetails ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide Details</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </>
                )}
              </button>

              {showDetails && (
                <div className="bg-black/30 rounded-lg p-3 overflow-auto max-h-48 animate-slideDown">
                  <pre className="text-green-300 text-xs font-mono">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}

              {result.action === "created" && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => router.push("/?login=true")}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-green-500/50 flex items-center justify-center gap-2 text-sm"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Go to Login</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-4 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-xl p-4 shadow-xl animate-shake">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-red-300 font-semibold text-base mb-1">
                    Error Occurred
                  </h3>
                  <p className="text-red-200/80 text-xs leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Instructions Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <Database className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Setup Guide</h3>
            </div>

            <div className="space-y-2">
              {[
                {
                  step: "1",
                  text: "Ensure ORIGIN_ADMIN_EMAIL and ORIGIN_ADMIN_PASSWORD are set in your .env file",
                  icon: Terminal,
                },
                {
                  step: "2",
                  text: 'Click "Initialize Admin" to create or update the super admin account',
                  icon: Zap,
                },
                {
                  step: "3",
                  text: "The admin will be automatically verified (no email verification required)",
                  icon: CheckCircle,
                },
                {
                  step: "4",
                  text: "Login using the credentials from your .env file",
                  icon: Lock,
                },
                {
                  step: "5",
                  text: 'Optional: Use "Remove Origin Admin" to clean up if needed',
                  icon: Trash2,
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2.5 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-blue-400 font-bold text-xs">
                        {item.step}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 flex-1">
                      <Icon className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300 text-xs leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showConfirmDialog && (
        <ConfirmDialog
          title="Remove Origin Admin"
          message="This will remove the origin admin account. Continue?"
          confirmText="Remove Admin"
          cancelText="Cancel"
          variant="danger"
          onConfirm={removeOtherAdmins}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}

      <style jsx global>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
