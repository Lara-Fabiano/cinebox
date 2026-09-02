const CACHE_NAME = "cinebox-v1";

const FILES = [
    "./",
    "./index.html",
    "./perfil.html",
    "./avaliar.html",
    "./style.css",
    "./supabase.js",
    "./filmes.js",
    "./avaliar.js",
    "./perfil.js",
    "./manifest.json",
    "./icon.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(FILES);
            })
    );

    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        self.clients.claim()
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
