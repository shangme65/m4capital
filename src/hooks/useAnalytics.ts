import { useCallback } from "react";

export type ActivityType =
  | "PAGE_VIEW"
  | "BUTTON_CLICK"
  | "API_CALL"
  | "TELEGRAM_COMMAND"
  | "TELEGRAM_MESSAGE"
  | "LOGIN"
  | "LOGOUT"
  | "SIGNUP"
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "TRADE"
  | "KYC_SUBMISSION"
  | "SETTINGS_UPDATE"
  | "ERROR";

interface TrackActivityParams {
  activityType: ActivityType;
  page?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export function useAnalytics() {
  const trackActivity = useCallback(async (params: TrackActivityParams) => {
    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
    } catch (error) {
      // Fail silently for analytics
      console.error("Failed to track activity:", error);
    }
  }, []);

  const trackPageView = useCallback(
    (page: string) => {
      trackActivity({
        activityType: "PAGE_VIEW",
        page,
      });
    },
    [trackActivity]
  );

  const trackButtonClick = useCallback(
    (action: string, page?: string, metadata?: Record<string, any>) => {
      trackActivity({
        activityType: "BUTTON_CLICK",
        page,
        action,
        metadata,
      });
    },
    [trackActivity]
  );

  const trackError = useCallback(
    (error: string, page?: string, metadata?: Record<string, any>) => {
      trackActivity({
        activityType: "ERROR",
        page,
        action: error,
        metadata,
      });
    },
    [trackActivity]
  );

  return {
    trackActivity,
    trackPageView,
    trackButtonClick,
    trackError,
  };
}
