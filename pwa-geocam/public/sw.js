const CACHE_NAME = "pwa-geocam-v1";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./public/manifest.json"
];

self.addEventListener("install", evt => {
  evt.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", evt => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => {
      if (key !== CACHE_NAME) return caches.delete(key);
    })))
  );
  self.clients.claim();
});

self.addEventListener("fetch", evt => {
  if (evt.request.method !== "GET") return;
  evt.respondWith(
    caches.match(evt.request).then(resp => resp || fetch(evt.request).then(res => {
      return caches.open(CACHE_NAME).then(cache => {
        cache.put(evt.request, res.clone());
        return res;
      });
    })).catch(() => caches.match("./index.html"))
  );
});
 