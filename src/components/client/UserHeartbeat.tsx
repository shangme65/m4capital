"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

const HEARTBEAT_INTERVAL_MS = 60_000; // 60 seconds
const INITIAL_DELAY_MS = 3_000; // wait 3s after mount before first ping

/**
 * Invisible component — pings /api/user/heartbeat every 60 seconds
 * while the dashboard is open and the tab is visible.
 * Pauses automatically when the tab is hidden and resumes on visibility change.
 */
export default function UserHeartbeat() {
  const { data: session, status } = useSession();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(true);

  const ping = async () => {
    if (!isMounted.current) return;
    try {
      await fetch("/api/user/heartbeat", { method: "POST" });
    } catch {
      // Silently ignore network errors
    }
  };

  const startInterval = () => {
    if (intervalRef.current) return; // already running
    intervalRef.current = setInterval(ping, HEARTBEAT_INTERVAL_MS);
  };

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    isMounted.current = true;

    if (status !== "authenticated" || !session?.user?.id) return;

    // Initial ping after a short delay so we don't fire on every page navigation
    const initialTimer = setTimeout(() => {
      ping();
      if (!document.hidden) startInterval();
    }, INITIAL_DELAY_MS);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopInterval();
      } else {
        ping(); // immediate ping on return
        startInterval();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted.current = false;
      clearTimeout(initialTimer);
      stopInterval();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.user?.id]);

  return null; // renders nothing
}
