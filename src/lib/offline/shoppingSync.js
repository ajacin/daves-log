import {
  addSyncOp,
  createLocalId,
  deleteShoppingItem,
  getAllShoppingItems,
  getPendingSyncCount,
  getSyncQueue,
  isLocalId,
  putShoppingItem,
  putShoppingItems,
  removeSyncOp
} from './db'

export async function cacheShoppingFromServer (tasks) {
  const shopping = tasks.filter((t) => t.tags?.includes('shopping'))
  if (shopping.length === 0) return
  await putShoppingItems(shopping)
}

export async function loadCachedShopping () {
  const items = await getAllShoppingItems()
  return items.sort(
    (a, b) => new Date(b.$createdAt || b.entryDate || 0) - new Date(a.$createdAt || a.entryDate || 0)
  )
}

export async function offlineAddShoppingItem (payload) {
  const localId = createLocalId()
  const now = new Date().toISOString()
  const item = {
    $id: localId,
    ...payload,
    completed: false,
    entryDate: now,
    $createdAt: now,
    $updatedAt: now,
    _pending: true
  }
  await putShoppingItem(item)
  await addSyncOp({ op: 'create', localId, payload })
  return item
}

export async function offlineToggleShoppingItem (id, completed) {
  const items = await getAllShoppingItems()
  const item = items.find((i) => i.$id === id)
  if (!item) return null

  const now = new Date().toISOString()
  const updated = {
    ...item,
    completed,
    completedAt: completed ? now : null,
    $updatedAt: now,
    _pending: true
  }
  await putShoppingItem(updated)

  if (isLocalId(id)) {
    const queue = await getSyncQueue()
    for (const entry of queue) {
      if (entry.localId === id) await removeSyncOp(entry.id)
    }
    await addSyncOp({
      op: 'create',
      localId: id,
      payload: {
        title: updated.title,
        description: updated.description || '',
        tags: updated.tags,
        completed: updated.completed,
        completedAt: updated.completedAt,
        dueDate: updated.dueDate || null,
        entryDate: updated.entryDate,
        userId: updated.userId,
        userName: updated.userName
      }
    })
  } else {
    await addSyncOp({
      op: 'update',
      taskId: id,
      updates: { completed, completedAt: completed ? now : null }
    })
  }

  return updated
}

export async function offlineDeleteShoppingItem (id) {
  await deleteShoppingItem(id)
  if (isLocalId(id)) {
    const queue = await getSyncQueue()
    for (const entry of queue) {
      if (entry.localId === id) {
        await removeSyncOp(entry.id)
      }
    }
  } else {
    await addSyncOp({ op: 'delete', taskId: id })
  }
}

export async function flushShoppingSync (ideas) {
  if (!navigator.onLine || !ideas) return { synced: 0, failed: 0 }

  const queue = await getSyncQueue()
  if (queue.length === 0) return { synced: 0, failed: 0 }

  let synced = 0
  let failed = 0

  for (const entry of queue) {
    try {
      if (entry.op === 'create') {
        const success = await ideas.add(entry.payload, { source: 'offline-sync' })
        if (success) {
          if (entry.localId) await deleteShoppingItem(entry.localId)
          await removeSyncOp(entry.id)
          synced++
        } else {
          failed++
        }
      } else if (entry.op === 'update') {
        const success = await ideas.update(entry.taskId, entry.updates, { source: 'offline-sync' })
        if (success) {
          await removeSyncOp(entry.id)
          synced++
        } else {
          failed++
        }
      } else if (entry.op === 'delete') {
        const success = await ideas.remove(entry.taskId, { source: 'offline-sync' })
        if (success) {
          await removeSyncOp(entry.id)
          synced++
        } else {
          failed++
        }
      }
    } catch (err) {
      console.error('[offline sync]', entry.op, err)
      failed++
    }
  }

  if (synced > 0) {
    await ideas.init()
    await cacheShoppingFromServer(ideas.current)
  }

  return { synced, failed }
}

export { getPendingSyncCount }
