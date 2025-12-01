"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

/**
 * PushNotificationProvider
 *
 * This component handles automatic registration of service worker
 * and push notification subscription when user is logged in.
 *
 * Include this component in your layout to enable push notifications.
 */
export function PushNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const initialized = useRef(false);

  useEffect(() => {
    // Only run once per session
    if (initialized.current || status !== "authenticated" || !session?.user) {
      return;
    }

    // Check if push notifications are supported
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      console.log("📱 Push notifications not supported in this browser");
      return;
    }

    const initializePush = async () => {
      try {
        // Register service worker
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        console.log("✅ Service Worker registered for push notifications");

        // Check if permission is already granted
        if (Notification.permission === "granted") {
          // Check if we already have a subscription
          const existingSubscription =
            await registration.pushManager.getSubscription();

          if (!existingSubscription) {
            // Get VAPID public key
            const vapidResponse = await fetch("/api/push/vapid-public-key");
            if (!vapidResponse.ok) {
              console.warn("⚠️ Push notifications not configured on server");
              return;
            }
            const { publicKey } = await vapidResponse.json();

            // Convert VAPID key
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

            // Subscribe to push
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(publicKey),
            });

            // Send subscription to server
            await fetch("/api/push/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ subscription: subscription.toJSON() }),
            });

            console.log("✅ Push notification subscription restored");
          } else {
            // Ensure server has our subscription
            await fetch("/api/push/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                subscription: existingSubscription.toJSON(),
              }),
            });
            console.log("✅ Push notification subscription verified");
          }
        }

        initialized.current = true;
      } catch (error) {
        console.error("❌ Error initializing push notifications:", error);
      }
    };

    initializePush();
  }, [session, status]);

  return <>{children}</>;
}

export default PushNotificationProvider;
