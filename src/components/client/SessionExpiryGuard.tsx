"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

/**
 * Auto-signs out non-admin users when their NextAuth session expires.
 * Backed server-side by a 24h cap on session.expires for non-admin roles.
 */
export default function SessionExpiryGuard() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.expires) return;

    // Admins are not subject to the 24h auto-expiry
    if ((session.user as any)?.role === "ADMIN") return;

    const expiresAt = new Date(session.expires).getTime();
    const now = Date.now();
    const msUntilExpiry = expiresAt - now;

    // If already expired, sign out immediately
    if (msUntilExpiry <= 0) {
      signOut({ callbackUrl: "/" });
      return;
    }

    // Otherwise schedule a sign-out at the exact expiry moment
    const timer = setTimeout(() => {
      signOut({ callbackUrl: "/" });
    }, msUntilExpiry);

    return () => clearTimeout(timer);
  }, [session?.expires, status, session?.user]);

  return null;
}
