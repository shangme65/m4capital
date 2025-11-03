import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminSetupClient from "./AdminSetupClient";

// Force dynamic rendering to avoid static generation errors
export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  // Check if any admin exists in the database
  const adminExists = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
      isDeleted: false,
    },
  });

  // If admin exists, require authentication
  if (adminExists) {
    const session = await getServerSession(authOptions);

    // Not logged in - redirect to login
    if (!session) {
      redirect("/login?callbackUrl=/setup-admin");
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

  // Allow access if no admin exists (first-time setup) OR user is admin
  return <AdminSetupClient adminExists={!!adminExists} />;
}
