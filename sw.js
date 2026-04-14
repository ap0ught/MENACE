const CACHE_VERSION = "menace-pwa-v2";

const SW_DIR = new URL(".", self.location.href).href;
function asset(rel) {
  return new URL(rel, SW_DIR).href;
}

const ASSETS = [
  asset("index.html"),
  asset("styles.css"),
  asset("manifest.webmanifest"),
  asset("icons/icon-192.png"),
  asset("icons/icon-512.png"),
  asset("icons/icon-maskable-512.png"),
  asset("icons/icon.svg"),
  asset("js/menace-state.js"),
  asset("js/menace-utils.js"),
  asset("js/menace-rules.js"),
  asset("js/menace-plot.js"),
  asset("js/menace-ui-summary.js"),
  asset("js/menace-ui-panel.js"),
  asset("js/menace-engine.js"),
  asset("js/menace-persistence.js"),
  asset("js/menace-opponents.js"),
  asset("js/menace-game.js"),
  asset("js/menace-init.js"),
  asset("js/pwa-register.js"),
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      if (request.mode === "navigate") {
        return caches.match(asset("index.html")).then((doc) => {
          if (doc) return doc;
          return fetch(request);
        });
      }
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const copy = response.clone();
        event.waitUntil(
          caches
            .open(CACHE_VERSION)
            .then((cache) => cache.put(request, copy))
            .catch(() => {}),
        );
        return response;
      });
    }),
  );
});
