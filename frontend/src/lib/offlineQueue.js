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
  const count = await getPendingCount()
  listeners.forEach((cb) => cb(count))
}

// url identifies which queued request this pending entry corresponds to,
// so it can be cleared once the service worker confirms it replayed successfully.
export async function addPending(url, summary) {
  const db = await getDb()
  const id = crypto.randomUUID()
  await db.put(STORE, { id, url, summary, createdAt: Date.now() })
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

export async function getPendingCount() {
  const db = await getDb()
  return db.count(STORE)
}

export async function getPending() {
  const db = await getDb()
  return db.getAll(STORE)
}

// Subscribes to pending-count changes; calls cb immediately with the current count.
export function subscribe(cb) {
  listeners.add(cb)
  getPendingCount().then(cb)
  return () => listeners.delete(cb)
}

if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'bg-sync-replayed' && event.data.url) {
      removePendingByUrl(event.data.url)
    }
  })
}
