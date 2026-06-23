// Notifies pages when the service worker had to fall back to a cached GET
// response for a vehicle detail (see isVehicleDetail/networkFirstNotifyStale in
// sw.js) instead of real-time data, so the UI can warn instead of presenting it
// as current.
const listeners = new Set()

export function subscribeStaleVehicle(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'stale-vehicle-data' && event.data.url) {
      listeners.forEach((cb) => cb(event.data.url))
    }
  })
}
