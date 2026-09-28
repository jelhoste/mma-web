const CACHE_NAME = "mma-web-v2";
const APP_SHELL = ["./", "index.html", "manifest.json", "file-manifest.json", "grooves.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(APP_SHELL);
      try {
        const manifest = await (await fetch("file-manifest.json")).json();
        const paths = manifest.map((e) => e.path);
        await cache.addAll(paths);
      } catch (e) {
        // La mise en cache complète pourra se faire à l'usage si elle échoue ici.
      }
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      );
      self.clients.claim();
    })()
  );
});

// Stratégie : cache d'abord (app + MMA + CDN une fois chargés), réseau en secours,
// et mise en cache au vol de tout ce qui vient du CDN (Pyodide, abcjs) pour un
// fonctionnement hors-ligne après le tout premier chargement.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      try {
        const response = await fetch(event.request);
        if (response && response.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, response.clone());
        }
        return response;
      } catch (e) {
        if (cached) return cached;
        throw e;
      }
    })()
  );
});
