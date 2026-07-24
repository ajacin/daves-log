import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useIdeas } from '../lib/context/ideas'
import { useOnlineStatus } from './useOnlineStatus'
import {
  cacheShoppingFromServer,
  flushShoppingSync,
  getPendingSyncCount,
  loadCachedShopping,
  offlineAddShoppingItem,
  offlineDeleteShoppingItem,
  offlineToggleShoppingItem
} from '../lib/offline/shoppingSync'

export function useShoppingOffline () {
  const ideas = useIdeas()
  const isOnline = useOnlineStatus()

  const [cachedItems, setCachedItems] = useState([])
  const [cacheReady, setCacheReady] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const wasOffline = useRef(!navigator.onLine)

  const refreshCache = useCallback(async () => {
    const items = await loadCachedShopping()
    setCachedItems(items)
    const count = await getPendingSyncCount()
    setPendingCount(count)
    setCacheReady(true)
  }, [])

  const syncNow = useCallback(async () => {
    if (!isOnline || isSyncing) return { synced: 0 }
    setIsSyncing(true)
    try {
      const result = await flushShoppingSync(ideas)
      await refreshCache()
      return result
    } finally {
      setIsSyncing(false)
    }
  }, [ideas, isOnline, isSyncing, refreshCache])

  // Load cache immediately on mount
  useEffect(() => {
    refreshCache()
  }, [refreshCache])

  // Fetch from server when online
  useEffect(() => {
    if (!isOnline) return
    if (!ideas.current.length) {
      ideas.init()
    }
  }, [isOnline, ideas])

  // Persist server shopping items to cache when ideas update
  const taskCount = ideas.current.length
  useEffect(() => {
    if (!isOnline || !taskCount) return
    cacheShoppingFromServer(ideas.current).then(refreshCache)
  }, [isOnline, taskCount, refreshCache, ideas])

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && wasOffline.current) {
      wasOffline.current = false
      syncNow().then((result) => {
        if (result?.synced > 0) {
          toast.success(
            `Synced ${result.synced} shopping change${result.synced === 1 ? '' : 's'}`
          )
        }
      })
    }
    if (!isOnline) wasOffline.current = true
  }, [isOnline, syncNow])

  // Sync any pending ops on initial load when online
  useEffect(() => {
    if (!isOnline) return
    getPendingSyncCount().then((count) => {
      if (count > 0) syncNow()
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const shoppingItems = isOnline
    ? mergeOnlineAndLocal(ideas.current, cachedItems)
    : cachedItems

  const addItem = useCallback(async (payload) => {
    if (isOnline) {
      const success = await ideas.add(payload, { source: 'shopping-list' })
      if (success) await refreshCache()
      return success
    }

    await offlineAddShoppingItem(payload)
    await refreshCache()
    return true
  }, [ideas, isOnline, refreshCache])

  const toggleItem = useCallback(async (id) => {
    const item = shoppingItems.find((i) => i.$id === id)
    if (!item) return false

    const newCompleted = !item.completed

    if (isOnline && !isLocalIdCheck(id)) {
      const success = await ideas.toggleComplete(id)
      if (success) await refreshCache()
      return success
    }

    await offlineToggleShoppingItem(id, newCompleted)
    await refreshCache()
    return true
  }, [ideas, isOnline, shoppingItems, refreshCache])

  const deleteItem = useCallback(async (id) => {
    if (isOnline && !isLocalIdCheck(id)) {
      const success = await ideas.remove(id, { source: 'shopping-list' })
      if (success) await refreshCache()
      return success
    }

    await offlineDeleteShoppingItem(id)
    await refreshCache()
    return true
  }, [ideas, isOnline, refreshCache])

  const isLoading = !cacheReady && ideas.isLoading

  return {
    shoppingItems: shoppingItems.filter((t) => t.tags?.includes('shopping')),
    isOnline,
    isLoading,
    pendingCount,
    isSyncing,
    syncNow,
    addItem,
    toggleItem,
    deleteItem
  }
}

function isLocalIdCheck (id) {
  return typeof id === 'string' && id.startsWith('local_')
}

function mergeOnlineAndLocal (serverTasks, cached) {
  const shopping = serverTasks.filter((t) => t.tags?.includes('shopping'))
  const serverIds = new Set(shopping.map((t) => t.$id))
  const pendingLocal = cached.filter(
    (t) => t._pending && t.$id?.startsWith('local_') && !serverIds.has(t.$id)
  )
  return [...pendingLocal, ...shopping]
}
