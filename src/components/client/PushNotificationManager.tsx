"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission | "unsupported";
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

export function usePushNotifications() {
  const { data: session, status } = useSession();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: "unsupported",
    isSubscribed: false,
    isLoading: true,
    error: null,
  });

  // Check if push notifications are supported
  const checkSupport = useCallback(() => {
    if (typeof window === "undefined") return false;

    const isSupported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    return isSupported;
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!checkSupport()) return null;

    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      console.log("✅ Service Worker registered:", registration.scope);
      return registration;
    } catch (error) {
      console.error("❌ Service Worker registration failed:", error);
      return null;
    }
  }, [checkSupport]);

  // Get VAPID public key from server
  const getVapidPublicKey = useCallback(async () => {
    try {
      const response = await fetch("/api/push/vapid-public-key");
      if (!response.ok) throw new Error("Failed to get VAPID key");
      const data = await response.json();
      return data.publicKey;
    } catch (error) {
      console.error("Error getting VAPID key:", error);
      return null;
    }
  }, []);

  // Convert URL base64 to Uint8Array (for VAPID key)
  const urlBase64ToUint8Array = useCallback((base64String: string) => {
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
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!session?.user?.id) {
      setState((prev) => ({
        ...prev,
        error: "You must be logged in to enable notifications",
      }));
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      setState((prev) => ({ ...prev, permission }));

      if (permission !== "granted") {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Notification permission denied",
        }));
        return false;
      }

      // Register service worker if not already registered
      let registration: ServiceWorkerRegistration | undefined =
        await navigator.serviceWorker.getRegistration();
      if (!registration) {
        const newRegistration = await registerServiceWorker();
        registration = newRegistration || undefined;
      }

      if (!registration) {
        throw new Error("Failed to register service worker");
      }

      // Get VAPID public key
      const vapidPublicKey = await getVapidPublicKey();
      if (!vapidPublicKey) {
        throw new Error("Push notifications not configured on server");
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to server
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      if (!response.ok) {
        throw new Error("Failed to save subscription on server");
      }

      console.log("✅ Push notification subscription successful");
      setState((prev) => ({
        ...prev,
        isSubscribed: true,
        isLoading: false,
        error: null,
      }));
      return true;
    } catch (error) {
      console.error("❌ Push subscription error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Subscription failed",
      }));
      return false;
    }
  }, [
    session,
    registerServiceWorker,
    getVapidPublicKey,
    urlBase64ToUint8Array,
  ]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        throw new Error("Service worker not registered");
      }

      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        // Unsubscribe from browser
        await subscription.unsubscribe();

        // Remove from server
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }

      console.log("✅ Push notification unsubscribed");
      setState((prev) => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
        error: null,
      }));
      return true;
    } catch (error) {
      console.error("❌ Push unsubscribe error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unsubscribe failed",
      }));
      return false;
    }
  }, []);

  // Check current subscription status
  const checkSubscription = useCallback(async () => {
    if (!checkSupport() || status !== "authenticated") {
      setState((prev) => ({
        ...prev,
        isSupported: checkSupport(),
        permission: checkSupport() ? Notification.permission : "unsupported",
        isLoading: false,
      }));
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = registration
        ? await registration.pushManager.getSubscription()
        : null;

      setState({
        isSupported: true,
        permission: Notification.permission,
        isSubscribed: !!subscription,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to check subscription status",
      }));
    }
  }, [checkSupport, status]);

  // Initialize on mount
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-subscribe when user logs in (if permission was already granted)
  useEffect(() => {
    const autoSubscribe = async () => {
      if (
        status === "authenticated" &&
        state.isSupported &&
        state.permission === "granted" &&
        !state.isSubscribed &&
        !state.isLoading
      ) {
        // Register service worker and check if we need to resubscribe
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          await registerServiceWorker();
        }

        // Check if subscription exists
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          if (!sub) {
            // Auto-subscribe since permission is already granted
            console.log("🔄 Auto-subscribing to push notifications...");
            await subscribe();
          }
        }
      }
    };

    autoSubscribe();
  }, [
    status,
    state.isSupported,
    state.permission,
    state.isSubscribed,
    state.isLoading,
    registerServiceWorker,
    subscribe,
  ]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    refresh: checkSubscription,
  };
}

// Component to show push notification toggle in settings
export function PushNotificationToggle() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="text-gray-500 text-sm">
        Push notifications are not supported in this browser
      </div>
    );
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-white font-medium">Push Notifications</h4>
        <p className="text-gray-400 text-sm">
          Receive notifications on your device even when the app is closed
        </p>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        {permission === "denied" && (
          <p className="text-yellow-400 text-xs mt-1">
            Notifications are blocked. Please enable them in your browser
            settings.
          </p>
        )}
      </div>
      <button
        onClick={handleToggle}
        disabled={isLoading || permission === "denied"}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          isSubscribed ? "bg-orange-500" : "bg-gray-600"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isSubscribed ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export default PushNotificationToggle;
