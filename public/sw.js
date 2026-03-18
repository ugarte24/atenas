/* ATENAS — service worker ligero (caché de shell + red primero) */
const CACHE = 'atenas-shell-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(['/', '/index.html', '/manifest.webmanifest']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok && (url.pathname === '/' || url.pathname === '/index.html')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('/index.html', copy));
        }
        return res;
      })
      .catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
  );
});
