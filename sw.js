const CACHE = "rk-member-v13";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./offline.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);

      if (cached) return cached;

      if (event.request.mode === "navigate") {
        return caches.match("./offline.html");
      }

      return new Response("Offline", {
        status: 503,
        statusText: "Offline"
      });
    })
  );
});
