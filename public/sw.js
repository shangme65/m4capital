// M4Capital Service Worker for Push Notifications
// This service worker handles push notifications even when the app is closed

const CACHE_NAME = "m4capital-v1";

// Install event - cache essential assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Push event - handle incoming push notifications
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push received");

  let data = {
    title: "M4Capital",
    body: "You have a new notification",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-96.png",
    tag: "m4capital-notification",
    data: {},
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || payload.message || data.body,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        tag: payload.tag || `m4capital-${Date.now()}`,
        data: payload.data || {},
        image: payload.image,
        actions: payload.actions || [],
        requireInteraction: payload.requireInteraction || false,
        vibrate: payload.vibrate,
        renotify: payload.renotify !== undefined ? payload.renotify : true,
        silent: payload.silent || false,
      };
    } catch (e) {
      console.log("[Service Worker] Push data parse error:", e);
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data,
    requireInteraction: data.requireInteraction,
    actions: data.actions,
    renotify: data.renotify,
    silent: data.silent,
  };

  // Only add vibrate if not silent
  if (!data.silent && data.vibrate) {
    options.vibrate = data.vibrate;
  }

  if (data.image) {
    options.image = data.image;
  }

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click event - handle user interaction
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification clicked:", event.notification.tag);

  event.notification.close();

  const notificationData = event.notification.data || {};
  let urlToOpen = notificationData.url || "/dashboard";

  // Handle action buttons
  if (event.action) {
    switch (event.action) {
      case "view":
        urlToOpen = notificationData.viewUrl || "/dashboard";
        break;
      case "dismiss":
        return;
      default:
        break;
    }
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open a new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Notification close event
self.addEventListener("notificationclose", (event) => {
  console.log("[Service Worker] Notification closed:", event.notification.tag);
});

// Push subscription change event
self.addEventListener("pushsubscriptionchange", (event) => {
  console.log("[Service Worker] Push subscription changed");

  event.waitUntil(
    fetch("/api/push/resubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oldEndpoint: event.oldSubscription
          ? event.oldSubscription.endpoint
          : null,
        newSubscription: event.newSubscription
          ? event.newSubscription.toJSON()
          : null,
      }),
    })
  );
});

// Background sync (for offline support)
self.addEventListener("sync", (event) => {
  console.log("[Service Worker] Background sync:", event.tag);

  if (event.tag === "sync-notifications") {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  try {
    const response = await fetch("/api/notifications/sync");
    if (response.ok) {
      console.log("[Service Worker] Notifications synced");
    }
  } catch (error) {
    console.error("[Service Worker] Sync failed:", error);
  }
}

console.log("[Service Worker] Loaded successfully");
