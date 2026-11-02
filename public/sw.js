/**
 * TinyKite Desktop Stopwatch, Timer, Alarm & World Clock - PWA Service Worker
 * Cache Name: tinykite-stopwatch-offline-v1
 *
 * Implements offline-first caching for static assets, 2.5s network-first with
 * cache fallback for navigation requests, and safe non-blocking responses for
 * cross-origin font/icon assets.
 */

const CACHE_NAME = 'tinykite-stopwatch-offline-v3';

const PRECACHE_URLS = [
  './',
  '/stopwatch/',
  '/stopwatch',
  '/clock/',
  '/clock',
  '/favicon.svg',
  '/favicon.png',
  '/brand/k-tile.svg',
  '/brand/k-tile-cream.svg',
  '/stopwatch.webmanifest',
  '/stopwatch/manifest.webmanifest',
  '/stopwatch/icon.svg',
  '/stopwatch/icon-192.png',
  '/stopwatch/icon-512.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const tasks = PRECACHE_URLS.map(async (url) => {
        try {
          const response = await fetch(url, { cache: 'no-cache' });
          if (response && response.status === 200) {
            await cache.put(url, response);
          }
        } catch {
          // Pre-caching single URL failures (e.g. subpath hosting) must not abort install
        }
      });
      await Promise.allSettled(tasks);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_URLS' && Array.isArray(event.data.urls)) {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const tasks = event.data.urls.map(async (url) => {
          try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (res && res.status === 200) {
              await cache.put(url, res.clone());

              // Normalize slash for pathname if applicable
              if (typeof url === 'string') {
                try {
                  const parsed = new URL(url, self.location.href);
                  if (parsed.origin === self.location.origin) {
                    const alt = parsed.pathname.endsWith('/')
                      ? `${parsed.origin}${parsed.pathname.slice(0, -1)}${parsed.search}`
                      : `${parsed.origin}${parsed.pathname}/${parsed.search}`;
                    await cache.put(alt, res.clone());
                  }
                } catch {
                  // Ignore invalid URL
                }
              }
            }
          } catch {
            // Ignore fetch errors during runtime caching
          }
        });
        await Promise.allSettled(tasks);
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      })()
    );
  }
});

function timeoutFetch(request, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Network timeout')), ms);
    fetch(request)
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only intercept GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // 1. Cross-origin requests (e.g. Google Fonts / Fontshare)
  if (url.origin !== self.location.origin) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        if (cached) {
          return cached;
        }

        try {
          const response = await fetch(request);
          if (response && (response.status === 200 || response.type === 'opaque')) {
            await cache.put(request, response.clone());
          }
          return response;
        } catch {
          // Return empty CSS / font response so offline mode never blocks rendering
          return new Response('', {
            status: 200,
            headers: { 'Content-Type': 'text/css' },
          });
        }
      })()
    );
    return;
  }

  // 2. Same-origin navigation requests (HTML documents)
  const isNavigate =
    request.mode === 'navigate' ||
    (request.headers.get('accept') && request.headers.get('accept').includes('text/html'));

  if (isNavigate) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const normalizedUrl = url.pathname.endsWith('/')
          ? url.href
          : `${url.origin}${url.pathname}/${url.search}`;
        const unnormalizedUrl = url.pathname.endsWith('/')
          ? `${url.origin}${url.pathname.slice(0, -1)}${url.search}`
          : url.href;

        try {
          const networkResponse = await timeoutFetch(request.clone(), 2500);
          if (networkResponse && networkResponse.status === 200) {
            await Promise.allSettled([
              cache.put(request, networkResponse.clone()),
              cache.put(normalizedUrl, networkResponse.clone()),
              cache.put(unnormalizedUrl, networkResponse.clone()),
            ]);
          }
          return networkResponse;
        } catch {
          // Network failed or offline - match cache with fallbacks
          const cached =
            (await cache.match(request, { ignoreSearch: true })) ||
            (await cache.match(normalizedUrl, { ignoreSearch: true })) ||
            (await cache.match(unnormalizedUrl, { ignoreSearch: true })) ||
            (await cache.match('./', { ignoreSearch: true })) ||
            (await cache.match('/stopwatch/', { ignoreSearch: true })) ||
            (await cache.match('/stopwatch', { ignoreSearch: true })) ||
            (await caches.match(request, { ignoreSearch: true }));

          if (cached) {
            return cached;
          }

          return new Response('Offline - TinyKite Stopwatch', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' },
          });
        }
      })()
    );
    return;
  }

  // 3. Same-origin static assets (_astro, images, fonts, icons, manifest)
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request, { ignoreSearch: true });
      if (cached) {
        return cached;
      }

      try {
        const response = await fetch(request);
        if (response && response.status === 200) {
          await cache.put(request, response.clone());
        }
        return response;
      } catch (err) {
        const fallback = await caches.match(request, { ignoreSearch: true });
        if (fallback) {
          return fallback;
        }
        throw err;
      }
    })()
  );
});
