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
// with Workbox's built-in fallback replay for browsers that lack it). Shared between
// every module's write queue (vehicles, checklists, ...) — same retry/notify contract
// for all of them, so the app only needs one 'bg-sync-replayed'/'bg-sync-failed'
// listener (see lib/offlineQueue.js) regardless of how many modules use it.
function createWriteQueue(name) {
  return new Queue(name, {
    maxRetentionTime: 7 * 24 * 60, // minutes
    onSync: async ({ queue }) => {
      let entry
      while ((entry = await queue.shiftRequest())) {
        // Separate try/catch so network errors (fetch rejection) and server responses
        // are handled independently — avoiding a double-push-to-queue when we want to
        // requeue after a 5xx without triggering the network-error catch block.
        let response
        try {
          response = await fetch(entry.request.clone())
        } catch (networkError) {
          await queue.unshiftRequest(entry)
          throw networkError
        }

        const clients = await self.clients.matchAll()
        if (response.ok) {
          for (const client of clients) {
            client.postMessage({ type: 'bg-sync-replayed', url: entry.request.url })
          }
        } else if (response.status >= 500) {
          // Transient server error — put back and let background sync retry later.
          await queue.unshiftRequest(entry)
          throw new Error(`Server error ${response.status}`)
        } else {
          // Permanent client error (4xx) — read the body for a human-readable message
          // so the UI can show the user what actually went wrong instead of just a status code.
          let detail = `Error ${response.status}`
          try {
            const body = await response.json()
            if (typeof body.detail === 'string') detail = body.detail
            else if (typeof body.message === 'string') detail = body.message
          } catch {}
          for (const client of clients) {
            client.postMessage({ type: 'bg-sync-failed', url: entry.request.url, status: response.status, detail })
          }
        }
      }
    },
  })
}

function makeWriteHandler(queue) {
  return async function handleWrite({ event }) {
    try {
      return await fetch(event.request.clone())
    } catch (error) {
      await queue.pushRequest({ request: event.request })
      return new Response(JSON.stringify({ queued: true }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }
}

const vehiclesQueue = createWriteQueue('vehicles-write-queue')
const handleVehicleWrite = makeWriteHandler(vehiclesQueue)

// Excludes the bare POST /vehicles (create) endpoint on purpose: creating a brand-new
// inspection needs a server-assigned id before the app can navigate anywhere, so it
// isn't queued — it just fails fast offline and the user retries once they have signal.
// Everything that operates on an existing inspection id IS queued and retried automatically.
const isVehicleWrite = ({ url }) => /^\/vehicles\/[^/]+/.test(url.pathname)

registerRoute(isVehicleWrite, handleVehicleWrite, 'POST')
registerRoute(isVehicleWrite, handleVehicleWrite, 'PATCH')
registerRoute(isVehicleWrite, handleVehicleWrite, 'DELETE')

const checklistsQueue = createWriteQueue('checklists-write-queue')
const handleChecklistWrite = makeWriteHandler(checklistsQueue)

// Same reasoning as isVehicleWrite: the bare POST /checklists/submissions (create)
// needs a server-assigned id + folio before the app can navigate to the fill screen,
// so it fails fast offline instead of queuing. Everything scoped to an existing
// submission id (autosave PATCH, sign, submit) is queued and retried automatically.
const isChecklistWrite = ({ url }) => /^\/checklists\/submissions\/[^/]+/.test(url.pathname)

registerRoute(isChecklistWrite, handleChecklistWrite, 'PATCH')
registerRoute(isChecklistWrite, handleChecklistWrite, 'POST')
