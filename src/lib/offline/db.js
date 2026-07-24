const DB_NAME = 'falcons-offline'
const DB_VERSION = 1

function openDb () {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('shopping')) {
        db.createObjectStore('shopping', { keyPath: '$id' })
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function txDone (tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export async function getAllShoppingItems () {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('shopping', 'readonly')
    const store = tx.objectStore('shopping')
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => reject(req.error)
  })
}

export async function putShoppingItem (item) {
  const db = await openDb()
  const tx = db.transaction('shopping', 'readwrite')
  tx.objectStore('shopping').put(item)
  await txDone(tx)
}

export async function putShoppingItems (items) {
  const db = await openDb()
  const tx = db.transaction('shopping', 'readwrite')
  const store = tx.objectStore('shopping')
  items.forEach((item) => store.put(item))
  await txDone(tx)
}

export async function deleteShoppingItem (id) {
  const db = await openDb()
  const tx = db.transaction('shopping', 'readwrite')
  tx.objectStore('shopping').delete(id)
  await txDone(tx)
}

export async function clearShoppingStore () {
  const db = await openDb()
  const tx = db.transaction('shopping', 'readwrite')
  tx.objectStore('shopping').clear()
  await txDone(tx)
}

export async function getSyncQueue () {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('syncQueue', 'readonly')
    const req = tx.objectStore('syncQueue').getAll()
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => reject(req.error)
  })
}

export async function addSyncOp (op) {
  const db = await openDb()
  const tx = db.transaction('syncQueue', 'readwrite')
  tx.objectStore('syncQueue').add({ ...op, createdAt: Date.now() })
  await txDone(tx)
}

export async function removeSyncOp (id) {
  const db = await openDb()
  const tx = db.transaction('syncQueue', 'readwrite')
  tx.objectStore('syncQueue').delete(id)
  await txDone(tx)
}

export async function getPendingSyncCount () {
  const queue = await getSyncQueue()
  return queue.length
}

export function isLocalId (id) {
  return typeof id === 'string' && id.startsWith('local_')
}

export function createLocalId () {
  return `local_${crypto.randomUUID()}`
}
