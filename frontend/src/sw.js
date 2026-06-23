import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'
import { Queue } from 'workbox-background-sync'

self.skipWaiting()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// Reads: previously seen vehicle data/photos stay visible offline.
registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    (url.pathname.startsWith('/vehicles') || url.pathname.startsWith('/uploads/')),
  new NetworkFirst({ cacheName: 'truckscan-vehicles-data', networkTimeoutSeconds: 8 })
)

// Writes: queue + automatic retry when connectivity returns (Background Sync API,
// with Workbox's built-in fallback replay for browsers that lack it).
const vehiclesQueue = new Queue('vehicles-write-queue', {
  maxRetentionTime: 7 * 24 * 60, // minutes
  onSync: async ({ queue }) => {
    let entry
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request.clone())
        const clients = await self.clients.matchAll()
        for (const client of clients) {
          client.postMessage({ type: 'bg-sync-replayed', url: entry.request.url })
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
