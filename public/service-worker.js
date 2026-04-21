importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
  // Cache Name
  const CACHE_NAME = 'daves-log-cache-v1';

  // Precaching core assets
  workbox.precaching.precacheAndRoute(
    [
      '/',
      '/index.html',
      '/manifest.json',
      '/static/js/bundle.js',
      '/static/css/main.css',
    ]
  );

  // Stale-While-Revalidate for main app assets and API-like requests
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'script' || request.destination === 'style',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: CACHE_NAME,
    })
  );

  // CacheFirst for images and icons
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: CACHE_NAME,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    })
  );

  // Fallback for offline requests (Network-first for HTML)
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({
      cacheName: CACHE_NAME,
    })
  );

  // Cleanup old caches on activation
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Clearing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });
} else {
  console.error('Workbox failed to load from CDN');
}
