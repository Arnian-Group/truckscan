import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'
import { Queue } from 'workbox-background-sync'

self.skipWaiting()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// A single vehicle's detail GET backs permission checks (editor_ids) and the
// damages/photos shown in Detalle/Inspección — silently serving a stale cached
// copy here (the old behavior) made devices on flaky connections show "no eres
// editor" after access was already granted, or an empty inspection after photos
// were already saved server-side. So this route gets its own handler below that
// notifies the page when it falls back to cache, instead of NetworkFirst's
// default of swapping in stale data with no signal that it happened.
function isVehicleDetail(url) {
  return /^\/vehicles\/[^/]+$/.test(url.pathname) && url.pathname !== '/vehicles/editor-candidates'
}

// Reads: previously seen vehicle list/photos stay visible offline.
registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    (url.pathname.startsWith('/uploads/') ||
      (url.pathname.startsWith('/vehicles') && !isVehicleDetail(url))),
  new NetworkFirst({ cacheName: 'truckscan-vehicles-data', networkTimeoutSeconds: 8 })
)

const vehicleDetailCache = 'truckscan-vehicle-detail'

async function networkFirstNotifyStale(event) {
  const cache = await caches.open(vehicleDetailCache)
  const networkPromise = fetch(event.request.clone())
    .then((response) => {
      if (response.ok) cache.put(event.request, response.clone())
      return response
    })
    .catch(() => null)
  const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 8000))
  const response = await Promise.race([networkPromise, timeoutPromise])
  if (response) return response

  const cached = await cache.match(event.request)
  if (!cached) return networkPromise.then((r) => r || Response.error())

  const clients = await self.clients.matchAll()
  for (const client of clients) {
    client.postMessage({ type: 'stale-vehicle-data', url: event.request.url })
  }
  return cached
}

registerRoute(
  ({ url, request }) => request.method === 'GET' && isVehicleDetail(url),
  networkFirstNotifyStale
)

// Writes: queue + automatic retry when connectivity returns (Background Sync API,
// with Workbox's built-in fallback replay for browsers that lack it).
const vehiclesQueue = new Queue('vehicles-write-queue', {
  maxRetentionTime: 7 * 24 * 60, // minutes
  onSync: async ({ queue }) => {
    let entry
    while ((entry = await queue.shiftRequest())) {
      try {
        const response = await fetch(entry.request.clone())
        const clients = await self.clients.matchAll()
        // A resolved fetch isn't necessarily a success — the server can still reject
        // the replayed request (e.g. a real validation error). Only clear it from the
        // UI as "synced" when it actually succeeded; otherwise tell the page it failed
        // instead of silently dropping it.
        const message = response.ok
          ? { type: 'bg-sync-replayed', url: entry.request.url }
          : { type: 'bg-sync-failed', url: entry.request.url, status: response.status }
        for (const client of clients) {
          client.postMessage(message)
        }
      } catch (error) {
        await queue.unshiftRequest(entry)
        throw error
      }
    }
  },
})

async function handleVehicleWrite({ event }) {
  try {
    return await fetch(event.request.clone())
  } catch (error) {
    await vehiclesQueue.pushRequest({ request: event.request })
    return new Response(JSON.stringify({ queued: true }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// Excludes the bare POST /vehicles (create) endpoint on purpose: creating a brand-new
// inspection needs a server-assigned id before the app can navigate anywhere, so it
// isn't queued — it just fails fast offline and the user retries once they have signal.
// Everything that operates on an existing inspection id IS queued and retried automatically.
const isVehicleWrite = ({ url }) => /^\/vehicles\/[^/]+/.test(url.pathname)

registerRoute(isVehicleWrite, handleVehicleWrite, 'POST')
registerRoute(isVehicleWrite, handleVehicleWrite, 'PATCH')
registerRoute(isVehicleWrite, handleVehicleWrite, 'DELETE')
