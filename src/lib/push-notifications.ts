import { prisma } from "@/lib/prisma";
import webpush from "web-push";

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || "mailto:support@m4capital.online";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

/**
 * Send web push notification to a specific user
 */
export async function sendWebPushToUser(
  userId: string,
  payload: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, unknown>;
    image?: string;
    actions?: Array<{ action: string; title: string; icon?: string }>;
    requireInteraction?: boolean;
    vibrate?: number[];
    renotify?: boolean;
    silent?: boolean;
  }
) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn("⚠️ VAPID keys not configured, skipping web push");
    return { sent: 0, failed: 0 };
  }

  // Get all push subscriptions for this user
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) {
    console.log(`📱 No push subscriptions found for user ${userId}`);
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;
  const failedEndpoints: string[] = [];

  // Send to all user's devices
  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(payload)
        );
        sent++;
        console.log(
          `✅ Push notification sent to ${subscription.endpoint.substring(
            0,
            50
          )}...`
        );
      } catch (error: unknown) {
        failed++;
        const err = error as { statusCode?: number };
        console.error(
          `❌ Failed to send push to ${subscription.endpoint.substring(
            0,
            50
          )}...`,
          err
        );

        // If subscription is no longer valid (410 Gone or 404), remove it
        if (err.statusCode === 410 || err.statusCode === 404) {
          failedEndpoints.push(subscription.endpoint);
        }
      }
    })
  );

  // Clean up invalid subscriptions
  if (failedEndpoints.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: {
        endpoint: { in: failedEndpoints },
      },
    });
    console.log(`🧹 Removed ${failedEndpoints.length} invalid subscriptions`);
  }

  return { sent, failed };
}

/**
 * Send push notification to a user by their ID (for server-side use)
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  message: string,
  options?: {
    type?: string;
    amount?: number;
    asset?: string;
    icon?: string;
    data?: Record<string, unknown>;
    url?: string;
  }
) {
  try {
    // Only send web push notification (in-app notification created separately by caller)
    const pushPayload = {
      title,
      body: message,
      icon: options?.icon || "/icons/icon-192.png",
      badge: "/icons/icon-96.png",
      tag: `m4capital-${options?.type || "notification"}-${Date.now()}`,
      data: {
        url: options?.url || "/dashboard",
        notificationId: `notif_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        type: options?.type || "notification",
        ...options?.data,
      },
      renotify: false,
      silent: false,
    };

    const result = await sendWebPushToUser(userId, pushPayload);
    return result;
  } catch (error) {
    console.error("Error in sendPushNotification:", error);
    throw error;
  }
}
