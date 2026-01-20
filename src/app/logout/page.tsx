"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Sign out and redirect to setup-admin
    signOut({ 
      redirect: true,
      callbackUrl: "/setup-admin"
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-white">Signing out...</p>
      </div>
    </div>
  );
}
