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

// Only step in for full page navigations (typing the URL, refreshing) when
// the network is genuinely unreachable, so the person sees the app shell
// instead of the browser's bare "no internet" page. Every other request —
// API calls, JS/CSS bundles, images, fonts — is left completely alone and
// goes straight to the network, as if this file didn't exist.
//
// The previous version tried to cache/intercept every GET request, which
// meant a bundle or asset that simply hadn't been cached yet could come
// back as a synthetic 503 "Offline" response even while fully online —
// that's exactly the confusing second error in your console. This version
// cannot cause that anymore, because it never touches non-navigation
// requests at all.
self.addEventListener("fetch", (event) => {
    if (event.request.mode !== "navigate") return;

    event.respondWith(
        fetch(event.request).catch(async () => {
            const cached = await caches.match(OFFLINE_URL);
            return cached || new Response("You're offline.", { status: 503, statusText: "Offline" });
        })
    );
});