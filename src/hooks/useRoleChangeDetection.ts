"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * Hook to periodically check if user's role has changed
 * and automatically refresh the session + redirect if needed
 */
export function useRoleChangeDetection(checkInterval = 60000) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const lastRoleRef = useRef(session?.user?.role);

  useEffect(() => {
    if (!session?.user?.email) return;

    const checkRoleChange = async () => {
      try {
        const response = await fetch("/api/auth/refresh-session", {
          method: "POST",
        });

        if (response.ok) {
          const data = await response.json();

          if (data.success && data.user) {
            const currentRole = session.user.role;
            const newRole = data.user.role;

            // If role has changed, update session and redirect
            if (currentRole !== newRole) {
              console.log(`🔄 Role changed from ${currentRole} to ${newRole}`);

              // Update the session with new user data
              await update({
                ...session,
                user: {
                  ...session.user,
                  role: newRole,
                },
              });

              lastRoleRef.current = newRole;

              // Redirect based on new role
              if (
                newRole === "USER" &&
                (currentRole === "STAFF_ADMIN" || currentRole === "ADMIN")
              ) {
                // Demoted to user - redirect to dashboard
                console.log("🚀 Redirecting to dashboard (demoted to USER)");
                router.push("/dashboard");
                router.refresh();
              } else if (newRole === "STAFF_ADMIN" && currentRole === "USER") {
                // Promoted to staff admin - no redirect needed, just refresh
                console.log("🎉 Promoted to STAFF_ADMIN - refreshing page");
                router.refresh();
              } else if (newRole === "ADMIN" && currentRole !== "ADMIN") {
                // Promoted to admin - refresh
                console.log("🎉 Promoted to ADMIN - refreshing page");
                router.refresh();
              }
            }
          }
        }
      } catch (error) {
        console.error("Role change detection error:", error);
      }
    };

    // Check immediately on mount
    checkRoleChange();

    // Then check periodically
    const interval = setInterval(checkRoleChange, checkInterval);

    return () => clearInterval(interval);
  }, [session, update, router, checkInterval]);
}
