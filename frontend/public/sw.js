const CACHE_NAME = "hcm-lite-shell-v2";
const OFFLINE_URL = "/index.html";

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((c) => c.add(OFFLINE_URL)).catch(() => { }));
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.mode !== "navigate") return;

    event.respondWith(
        fetch(event.request).catch(async () => {
            const cached = await caches.match(OFFLINE_URL);
            return cached || new Response("You're offline.", { status: 503, statusText: "Offline" });
        })
    );
});