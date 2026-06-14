const CACHE_NAME = "copa2026-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico"
];

// Install event - caching shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate event - cleaning up older caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - cache strategy (stale-while-revalidate for assets, network-first for document/data)
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (e.g. Supabase updates)
  if (request.method !== "GET") {
    return;
  }

  // Network-First for main documents or Supabase queries to guarantee fresh data but fallback offline
  const isDataOrPage = 
    request.mode === "navigate" || 
    url.pathname.startsWith("/api") || 
    url.hostname.includes("supabase.co");

  if (isDataOrPage) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache the fresh copy
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, serve from cache
          return caches.match(request);
        })
    );
  } else {
    // Cache-First (Stale-While-Revalidate) for static bundles, images, icons, and fonts
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch updated version in background to refresh cache
          fetch(request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => {/* Ignore network error in background */});
          
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse.status === 200 || networkResponse.type === "opaque") {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        });
      })
    );
  }
});

// Skip waiting triggers reload of app tabs
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
