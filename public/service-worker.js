/* eslint-disable no-undef, no-restricted-globals */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js')

const CACHE_NAME = 'falcons-shell-v2'
const OFFLINE_URL = '/offline.html'

const SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/dashboard/shopping'
]

if (workbox) {
  workbox.setConfig({ debug: false })

  // Precache shell + production assets from asset-manifest.json
  self.addEventListener('install', (event) => {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE_NAME)
        await cache.addAll(SHELL_URLS)

        try {
          const res = await fetch('/asset-manifest.json', { cache: 'no-store' })
          if (res.ok) {
            const manifest = await res.json()
            const assets = new Set()

            if (manifest.entrypoints) {
              manifest.entrypoints.forEach((p) => assets.add(`/${p}`))
            }
            if (manifest.files) {
              Object.values(manifest.files).forEach((url) => {
                if (typeof url === 'string' && !url.endsWith('.map')) {
                  assets.add(url)
                }
              })
            }

            await Promise.allSettled(
              [...assets].map((url) => cache.add(url).catch(() => {}))
            )
          }
        } catch {
          // Dev mode — shell URLs are enough
        }

        await self.skipWaiting()
      })()
    )
  })

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      (async () => {
        const keys = await caches.keys()
        await Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
        await self.clients.claim()
      })()
    )
  })

  // App navigation — network first, fall back to cached shell / offline page
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    async ({ event }) => {
      try {
        const response = await fetch(event.request)
        return response
      } catch {
        const cache = await caches.open(CACHE_NAME)
        const cached =
          (await cache.match('/index.html')) ||
          (await cache.match('/')) ||
          (await cache.match(OFFLINE_URL))
        return cached || Response.error()
      }
    }
  )

  // JS & CSS — stale while revalidate
  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === 'script' || request.destination === 'style',
    new workbox.strategies.StaleWhileRevalidate({ cacheName: CACHE_NAME })
  )

  // Images & icons — cache first
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: CACHE_NAME,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60
        })
      ]
    })
  )

  // Shopping page route — cache first when offline
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/dashboard/shopping'),
    new workbox.strategies.NetworkFirst({
      cacheName: CACHE_NAME,
      networkTimeoutSeconds: 3
    })
  )

  self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
      self.skipWaiting()
    }
  })
} else {
  console.error('[SW] Workbox failed to load')
}
