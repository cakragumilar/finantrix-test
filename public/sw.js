/*
  Finantrix service worker.
  App shell: network-first navigation with offline fallback to cached shell.
  Static assets (_next/static, fonts, icons): stale-while-revalidate.
  Lesson DATA offline support comes from Firestore's IndexedDB persistence,
  not from this worker.
*/
const SHELL_CACHE = "fx-shell-v1";
const STATIC_CACHE = "fx-static-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((c) => c.addAll(["/"])).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => ![SHELL_CACHE, STATIC_CACHE].includes(k))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Never intercept Firebase/Google APIs
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put("/", copy));
          return res;
        })
        .catch(() => caches.match("/"))
    );
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request).then((res) => {
          cache.put(request, res.clone());
          return res;
        });
        return cached || network;
      })
    );
  }
});

/* Web Push: streak reminder payloads sent via FCM */
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Finantrix", {
      body: data.body || "Jaga streak kamu! Selesaikan satu pelajaran hari ini.",
      icon: "/icons/icon.svg",
      badge: "/icons/icon.svg",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow("/belajar"));
});
