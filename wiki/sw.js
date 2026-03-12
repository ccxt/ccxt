// sw.js – works perfectly offline, no cache-busting needed long-term, but safe if you keep it
const CACHE = 'docs.ccxt.com';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  if (new URL(event.request.url).origin !== self.location.origin) {
    // Forward directly to network without modification if cors
    event.respondWith(fetch(event.request));
    return;
  }

  // 1. Only apply cache-busting to same-origin requests
  if (requestUrl.origin === self.location.origin) {
    requestUrl.search += (requestUrl.search ? '&' : '?') + 'cache-bust=' + Date.now();
  }

  // 2. Create a clean version for caching (ignore all query parameters)
  const cacheKey = new URL(event.request.url);
  cacheKey.search = '';   // strip any query string, including cache-bust

  event.respondWith(
    caches.open(CACHE).then(cache => {
      return cache.match(cacheKey).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;   // offline → serve clean version

        // online → fetch the (possibly cache-busted) URL
        return fetch(requestUrl).then(networkResponse => {
          cache.put(cacheKey, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});