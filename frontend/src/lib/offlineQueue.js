import { openDB } from 'idb'

const DB_NAME = 'truckscan-offline'
const STORE = 'pending'

let dbPromise = null
function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

const listeners = new Set()

async function notify() {
  const counts = await getCounts()
  listeners.forEach((cb) => cb(counts))
}

// url identifies which queued request this pending entry corresponds to, so it can be
// resolved once the service worker confirms whether it actually synced or was rejected.
export async function addPending(url, summary) {
  const db = await getDb()
  const id = crypto.randomUUID()
  await db.put(STORE, { id, url, summary, failed: false, createdAt: Date.now() })
  notify()
  return id
}

export async function removePendingByUrl(url) {
  const db = await getDb()
  const all = await db.getAll(STORE)
  const matches = all.filter((p) => p.url === url)
  await Promise.all(matches.map((p) => db.delete(STORE, p.id)))
  if (matches.length) notify()
}

// The service worker successfully replayed the request, but the server rejected it
// (e.g. a real validation error) — mark it failed instead of clearing it silently,
// so the UI can flag that this change never actually made it.
export async function markFailedByUrl(url, status, detail) {
  const db = await getDb()
  const all = await db.getAll(STORE)
  const matches = all.filter((p) => p.url === url)
  await Promise.all(matches.map((p) => db.put(STORE, { ...p, failed: true, status, detail })))
  if (matches.length) notify()
}

export async function getCounts() {
  const all = await getPending()
  return {
    pending: all.filter((p) => !p.failed).length,
    failed: all.filter((p) => p.failed).length,
  }
}

export async function getPending() {
  const db = await getDb()
  return db.getAll(STORE)
}

export async function dismiss(id) {
  const db = await getDb()
  await db.delete(STORE, id)
  notify()
}

// Subscribes to { pending, failed } count changes; calls cb immediately with the current counts.
export function subscribe(cb) {
  listeners.add(cb)
  getCounts().then(cb)
  return () => listeners.delete(cb)
}

// Kick the background sync queue manually — useful when the browser's native
// Background Sync API hasn't fired yet after a reconnect (common on mobile).
export async function triggerSync() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
  try {
    const reg = await navigator.serviceWorker.ready
    if ('sync' in reg) await reg.sync.register('workbox-background-sync:vehicles-write-queue')
  } catch {}
}

if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'bg-sync-replayed' && event.data.url) {
      removePendingByUrl(event.data.url)
    } else if (event.data?.type === 'bg-sync-failed' && event.data.url) {
      markFailedByUrl(event.data.url, event.data.status, event.data.detail)
    }
  })
}

// Proactively trigger sync when connectivity returns — don't wait for the browser
// to decide when to fire the Background Sync event (unreliable on mobile).
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { triggerSync() })
}
