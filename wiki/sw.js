// sw.js – single cache, refreshes from network at most once per 24 h, never caches its own script or HTML shell
const CACHE = 'docs.ccxt.com';
const ONE_DAY = 24 * 3600 * 1000;
let lastRefresh = 0;

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) {
    return; // let the browser handle cross-origin normally
  }

  // Never cache the service worker itself or navigation requests (the HTML shell).
  // This guarantees that updates to sw.js or index.html are never delayed by the cache.
  if (url.pathname.endsWith('/sw.js') || event.request.mode === 'navigate') {
    return;
  }

  if (event.request.method !== 'GET') return;

  // Use a query-free key so that any query params are ignored for caching purposes.
  const cacheKey = new URL(event.request.url);
  cacheKey.search = '';

  event.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(cacheKey);
      const now = Date.now();

      // Serve from the single cache unless we have never refreshed or > 24 h have passed.
      if (cached && now - lastRefresh < ONE_DAY) {
        return cached;
      }

      try {
        const fresh = await fetch(event.request, { cache: 'reload' });
        lastRefresh = now;
        cache.put(cacheKey, fresh.clone());
        return fresh;
      } catch {
        return cached || new Response('Offline', { status: 503 });
      }
    })
  );
});