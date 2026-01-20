"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
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
  Zap,
  XCircle,
  ArrowRight,
  Terminal,
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
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Subscribe admin to push notifications
  const subscribeAdminToPush = async () => {
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      await navigator.serviceWorker.ready;

      // Get VAPID public key
      const vapidResponse = await fetch("/api/push/vapid-public-key");
      if (!vapidResponse.ok) {
        throw new Error("Failed to get VAPID key");
      }
      const { publicKey } = await vapidResponse.json();

      // Convert VAPID key to Uint8Array
      const convertedVapidKey = urlBase64ToUint8Array(publicKey);

      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      // Send subscription to server (wrapped in subscription object)
      const subscribeResponse = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      if (!subscribeResponse.ok) {
        throw new Error("Failed to subscribe to push notifications");
      }

      console.log("✅ Admin subscribed to push notifications");
    } catch (error) {
      console.error("Push subscription error:", error);
    }
  };

  // Convert URL base64 to Uint8Array for VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const initializeAdmin = async () => {
    setInitLoading(true);
    setError(null);
    setResult(null);
    setActiveStep(1);

    try {
      const response = await fetch("/api/init-admin");
      const data = await response.json();

      if (data.success) {
        // Don't store the full result (contains credentials)
        // Just store a sanitized version for display
        setResult({ success: true, message: data.message });
        showSuccess(data.message || "Admin initialized successfully!");

        // Auto-login after successful initialization
        const credentials = data.data?._credentials;
        console.log("🔍 Auto-login check:", {
          action: data.data?.action,
          hasCredentials: !!credentials,
          email: credentials?.email,
        });

        if (
          (data.data?.action === "created" ||
            data.data?.action === "updated") &&
          credentials
        ) {
          showSuccess("Admin initialized! Logging in automatically...");

          console.log("🔐 Attempting auto-login with:", credentials.email);

          const signInResult = await signIn("credentials", {
            email: credentials.email,
            password: credentials.password,
            redirect: false,
          });

          console.log("🔐 SignIn result:", {
            ok: signInResult?.ok,
            error: signInResult?.error,
            status: signInResult?.status,
          });

          if (signInResult?.ok) {
            showSuccess("Logged in successfully!");

            // Subscribe to push notifications if already granted
            try {
              if (
                "Notification" in window &&
                Notification.permission === "granted"
              ) {
                // Already granted, just subscribe
                await subscribeAdminToPush();
                console.log("✅ Auto-subscribed to push notifications");
              }
              // If not granted, the NotificationPermissionPrompt component
              // in the dashboard layout will show a custom UI prompt
            } catch (notifError) {
              console.error("Notification setup error:", notifError);
              // Don't block dashboard redirect on notification error
            }

            showSuccess("Redirecting to dashboard...");
            setTimeout(() => {
              // Use window.location for full page reload to ensure session is fresh
              window.location.href = "/dashboard";
            }, 1500);
          } else {
            // Fallback to manual login if auto-login fails
            showError(
              "Auto-login failed. Please login manually with your credentials."
            );
            setTimeout(() => {
              window.location.href = "/?auth=login";
            }, 2000);
          }
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

        // Clear all local storage data
        if (typeof window !== "undefined") {
          localStorage.clear();
          sessionStorage.clear();
        }

        // Sign out the user
        // This clears the NextAuth session cookie and database session
        await signOut({ redirect: false });

        // Redirect to setup page after a brief delay to show success message
        // Use window.location for full page reload to clear all cached session data
        setTimeout(() => {
          window.location.href = "/setup-admin";
        }, 1500);
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

          {/* Main Content */}
          <div className="mb-4">
            {/* Initialize Admin Card */}
            <div
              className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 ${
                activeStep === 1 ? "ring-2 ring-purple-500" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
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

              <div className="space-y-3">
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

                <button
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={removeLoading}
                  className="w-full bg-gradient-to-r from-red-500/80 to-orange-600/80 hover:from-red-600 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 group text-sm"
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
          </div>

          {/* Result Display */}
          {result && (
            <div className="mb-4 bg-green-500/10 backdrop-blur-xl border border-green-500/20 rounded-xl p-4 shadow-xl animate-slideIn">
              <div className="flex items-start gap-3">
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
