/* ATENAS — service worker (caché shell + red primero, respeta subpath GitHub Pages) */
const CACHE = 'atenas-shell-v4';

function basePath() {
  const path = new URL(self.location.href).pathname;
  return path.replace(/sw\.js(\?.*)?$/, '');
}

function shellUrls() {
  const base = basePath();
  return [base || '/', `${base}index.html`, `${base}manifest.webmanifest`, `${base}offline.html`];
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(shellUrls().filter(Boolean)).catch(() => undefined)
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith('atenas-shell-') && k !== CACHE).map((k) => caches.delete(k))
        )
      )
      .then(() => {
        const base = basePath();
        return caches.open(CACHE).then((cache) =>
          cache.delete(`${base}version.json`).catch(() => undefined)
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.endsWith('/version.json')) {
    event.respondWith(
      fetch(new Request(request, { cache: 'no-store' })).catch(() =>
        fetch(`${url.origin}${url.pathname}?t=${Date.now()}`, { cache: 'no-store' })
      )
    );
    return;
  }

  const base = basePath();
  const indexUrl = `${base}index.html`;
  const offlineUrl = `${base}offline.html`;

  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const path = url.pathname;
          if (path === base || path === `${base}index.html` || path.endsWith('/index.html')) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(indexUrl, copy));
          }
        }
        return res;
      })
      .catch(() =>
        caches.match(request).then(
          (r) =>
            r ||
            caches.match(indexUrl).then((idx) => idx || caches.match(offlineUrl).then((o) => o || caches.match('/')))
        )
      )
  );
});
