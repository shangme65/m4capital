import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminSetupClient from "./AdminSetupClient";
import { ToastProvider } from "@/contexts/ToastContext";

// Force dynamic rendering to avoid static generation errors
export const dynamic = "force-dynamic";

// Client component for database error retry
function DatabaseErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 text-center">
        <h1 className="text-2xl font-bold text-amber-600 mb-4">
          Database Connection Issue
        </h1>
        <p className="text-gray-600 mb-6">
          Unable to connect to the database. This may be a temporary issue with
          serverless cold starts.
        </p>
        <a
          href="/setup-admin"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold"
        >
          Try Again
        </a>
      </div>
    </div>
  );
}

export default async function AdminSetupPage() {
  let adminExists = null;
  let session = null;
  let dbError = false;

  // Try to check if admin exists in database
  try {
    adminExists = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
        isDeleted: false,
      },
    });
  } catch (error) {
    console.error("Database connection error:", error);
    dbError = true;
  }

  // Try to get current session
  try {
    session = await getServerSession(authOptions);
    
    // If session exists, verify the user still exists in database and is not deleted
    if (session?.user?.email) {
      const sessionUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true, isDeleted: true },
      });
      
      // If user doesn't exist or is deleted, force logout
      if (!sessionUser || sessionUser.isDeleted) {
        redirect("/logout");
      }
    }
  } catch (error) {
    console.error("Session error:", error);
  }

  // If database error, show a retry option
  if (dbError) {
    return <DatabaseErrorPage />;
  }

  // SECURITY: If admin exists, ONLY allow current admin to access
  if (adminExists) {
    // Not logged in - deny access completely
    if (!session) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-6">
              Admin already exists. You must be logged in as an admin to access
              this page.
            </p>
            <div className="space-y-3">
              <a
                href="/?auth=login"
                className="block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Login as Admin
              </a>
              <a
                href="/"
                className="block bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold"
              >
                Go to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Logged in but not an admin - deny access
    if (session.user.role !== "ADMIN") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-6">
              You must be an admin to access this page.
            </p>
            <a
              href="/"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Go to Home
            </a>
          </div>
        </div>
      );
    }
  }

  // Allow access ONLY if: no admin exists (first-time setup) OR user is logged in as admin
  return (
    <ToastProvider>
      <AdminSetupClient
        adminExists={!!adminExists}
        isAuthenticated={!!session}
        isAdmin={session?.user.role === "ADMIN"}
      />
    </ToastProvider>
  );
}
