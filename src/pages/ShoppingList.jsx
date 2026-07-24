import { useMemo, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faEye,
  faEyeSlash,
  faPlus,
  faShoppingCart,
  faSpinner,
  faTrash,
  faListUl
} from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-hot-toast'
import { useUser } from '../lib/context/user'
import { ConfirmationModal } from '../components/ConfirmationModal'
import { OfflineBanner } from '../components/OfflineBanner'
import { useShoppingOffline } from '../hooks/useShoppingOffline'

const STORE_TAGS = [
  'walmart',
  'costco',
  'dollarama',
  'foodco',
  'groceries',
  'pharmacy',
  'errands'
]

function getStoreGroup (task) {
  if (!task.tags?.length) return 'Other'
  const match = STORE_TAGS.find((store) => task.tags.includes(store))
  if (!match) return 'Other'
  return match.charAt(0).toUpperCase() + match.slice(1)
}

function ShoppingItem ({ item, isProcessing, onToggle, onDelete }) {
  const storeTags = (item.tags || []).filter(
    (tag) => tag !== 'shopping' && STORE_TAGS.includes(tag)
  )
  const isPending = item._pending

  return (
    <li
      className={`flex items-center gap-3 border-b border-td-border px-3 py-4 md:gap-2.5 md:px-3 md:py-2.5 ${
        item.completed ? 'opacity-50' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => onToggle(item.$id)}
        disabled={isProcessing}
        aria-label={item.completed ? `Uncheck ${item.title}` : `Check off ${item.title}`}
        className={`flex h-8 w-8 flex-shrink-0 touch-manipulation items-center justify-center rounded-full border-2 transition-colors md:h-5 md:w-5 md:border ${
          isProcessing
            ? 'cursor-not-allowed border-td-border opacity-50'
            : item.completed
              ? 'border-td-muted bg-td-muted'
              : 'border-td-border-strong hover:border-td-text'
        }`}
      >
        {item.completed && (
          <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-white md:h-2.5 md:w-2.5" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`text-xl leading-snug md:text-sm ${
            item.completed ? 'text-td-faint line-through' : 'text-td-text'
          }`}
        >
          {item.title}
          {isPending && (
            <span className="ml-2 text-sm text-amber-600 md:text-td-xs">pending</span>
          )}
        </p>
        {(item.description || storeTags.length > 0) && (
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {storeTags.map((tag) => (
              <span key={tag} className="text-sm text-td-muted md:text-td-xs">
                {tag}
              </span>
            ))}
            {item.description && (
              <span className="truncate text-sm text-td-faint md:text-td-xs">
                {item.description}
              </span>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDelete(item.$id)}
        disabled={isProcessing}
        aria-label={`Delete ${item.title}`}
        className="flex h-11 w-11 flex-shrink-0 touch-manipulation items-center justify-center text-td-faint hover:text-red-500 md:h-8 md:w-8"
      >
        <FontAwesomeIcon icon={faTrash} className="h-4 w-4 md:h-3 md:w-3" />
      </button>
    </li>
  )
}

export function ShoppingList () {
  const user = useUser()
  const inputRef = useRef(null)
  const {
    shoppingItems,
    isOnline,
    isLoading,
    pendingCount,
    isSyncing,
    addItem,
    toggleItem,
    deleteItem
  } = useShoppingOffline()

  const [newItem, setNewItem] = useState('')
  const [bulkMode, setBulkMode] = useState(false)
  const [hideCompleted, setHideCompleted] = useState(true)
  const [groupByStore, setGroupByStore] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [processingIds, setProcessingIds] = useState(new Set())
  const [deleteId, setDeleteId] = useState(null)
  const [clearCompletedOpen, setClearCompletedOpen] = useState(false)

  const visibleItems = useMemo(() => {
    if (hideCompleted) {
      return shoppingItems.filter((item) => !item.completed)
    }
    return shoppingItems
  }, [shoppingItems, hideCompleted])

  const pendingCountItems = useMemo(
    () => shoppingItems.filter((item) => !item.completed).length,
    [shoppingItems]
  )

  const completedCount = useMemo(
    () => shoppingItems.filter((item) => item.completed).length,
    [shoppingItems]
  )

  const groupedItems = useMemo(() => {
    if (!groupByStore) {
      return [{ name: null, items: visibleItems }]
    }

    const groups = {}
    visibleItems.forEach((item) => {
      const name = getStoreGroup(item)
      if (!groups[name]) groups[name] = []
      groups[name].push(item)
    })

    const order = [...STORE_TAGS.map((s) => s.charAt(0).toUpperCase() + s.slice(1)), 'Other']
    return order
      .filter((name) => groups[name]?.length)
      .map((name) => ({ name, items: groups[name] }))
  }, [visibleItems, groupByStore])

  const parseLines = (text) => {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const tags = ['shopping']
        let title = line
        const tagMatches = line.match(/#(\w+)/g)
        if (tagMatches) {
          tagMatches.forEach((raw) => {
            const tag = raw.slice(1).toLowerCase()
            if (tag !== 'shopping' && !tags.includes(tag)) {
              tags.push(tag)
            }
          })
          title = line.replace(/#\w+/g, '').replace(/\s+/g, ' ').trim()
        }
        return { title, tags }
      })
      .filter((item) => item.title.length > 0)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newItem.trim() || isAdding) return

    const items = parseLines(newItem)
    if (items.length === 0) return

    setIsAdding(true)
    let successCount = 0

    try {
      for (const item of items) {
        const success = await addItem({
          title: item.title,
          description: '',
          tags: item.tags,
          completed: false,
          dueDate: null,
          entryDate: new Date().toISOString(),
          userId: user.current.$id,
          userName: user.current.name
        })
        if (success) successCount++
      }

      if (successCount > 0) {
        toast.success(
          !isOnline
            ? `Saved ${successCount} item${successCount === 1 ? '' : 's'} offline`
            : successCount === 1
              ? 'Added to shopping list'
              : `Added ${successCount} items`
        )
        setNewItem('')
        setBulkMode(false)
        inputRef.current?.focus()
      } else {
        toast.error('Failed to add item')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to add item')
    } finally {
      setIsAdding(false)
    }
  }

  const handleToggle = async (id) => {
    if (processingIds.has(id)) return

    setProcessingIds((prev) => new Set([...prev, id]))
    try {
      const success = await toggleItem(id)
      if (!success) toast.error('Could not update item')
    } catch (err) {
      console.error(err)
      toast.error('Could not update item')
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    const id = deleteId
    setDeleteId(null)

    setProcessingIds((prev) => new Set([...prev, id]))
    try {
      const success = await deleteItem(id)
      if (success) {
        toast.success(isOnline ? 'Removed' : 'Removed offline')
      } else {
        toast.error('Failed to delete')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete')
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleClearCompleted = async () => {
    setClearCompletedOpen(false)
    const done = shoppingItems.filter((item) => item.completed)
    if (done.length === 0) return

    let cleared = 0
    for (const item of done) {
      const success = await deleteItem(item.$id)
      if (success) cleared++
    }

    if (cleared > 0) {
      toast.success(`Cleared ${cleared} completed item${cleared === 1 ? '' : 's'}`)
    }
  }

  if (isLoading && shoppingItems.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-td-muted">
        <FontAwesomeIcon icon={faSpinner} className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen max-w-xl bg-td-bg pb-24 md:pb-8">
      <OfflineBanner pendingCount={pendingCount} isSyncing={isSyncing} />

      <header className="sticky top-0 z-10 border-b border-td-border bg-td-bg/95 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 px-4 py-4 md:py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faShoppingCart} className="h-5 w-5 text-td-text md:h-4 md:w-4" />
              <h1 className="text-2xl font-semibold tracking-tight text-td-text md:text-lg">
                Shopping
              </h1>
            </div>
            <p className="mt-0.5 text-base text-td-muted md:text-td-sm">
              {pendingCountItems === 0
                ? 'List is clear'
                : `${pendingCountItems} item${pendingCountItems === 1 ? '' : 's'} left`}
              {completedCount > 0 && hideCompleted
                ? ` · ${completedCount} done`
                : ''}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setGroupByStore(!groupByStore)}
              className={`flex h-11 min-w-[44px] touch-manipulation items-center justify-center rounded-md px-2 text-sm md:h-8 md:text-td-xs ${
                groupByStore ? 'text-td-text font-medium' : 'text-td-muted'
              }`}
              title={groupByStore ? 'Show flat list' : 'Group by store'}
              aria-pressed={groupByStore}
            >
              <FontAwesomeIcon icon={faListUl} className="h-4 w-4 md:h-3.5 md:w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setHideCompleted(!hideCompleted)}
              className="flex h-11 min-w-[44px] touch-manipulation items-center justify-center rounded-md px-2 text-td-muted hover:text-td-text md:h-8"
              title={hideCompleted ? 'Show completed' : 'Hide completed'}
              aria-label={hideCompleted ? 'Show completed items' : 'Hide completed items'}
            >
              <FontAwesomeIcon
                icon={hideCompleted ? faEyeSlash : faEye}
                className="h-4 w-4 md:h-3.5 md:w-3.5"
              />
            </button>
          </div>
        </div>

        <form onSubmit={handleAdd} className="border-t border-td-border px-3 py-3 md:py-2">
          {bulkMode ? (
            <textarea
              ref={inputRef}
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={'One item per line\n#walmart milk\n#costco eggs'}
              rows={4}
              className="w-full resize-none border border-td-border bg-white px-3 py-3 text-xl leading-relaxed text-td-text placeholder:text-td-faint md:py-2 md:text-sm"
              disabled={isAdding}
            />
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add an item…"
              className="w-full border border-td-border bg-white px-3 py-3.5 text-xl text-td-text placeholder:text-td-faint md:py-2 md:text-sm"
              disabled={isAdding}
              autoComplete="off"
            />
          )}

          <div className="mt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setBulkMode(!bulkMode)}
              className="min-h-[44px] touch-manipulation px-1 text-base text-td-muted hover:text-td-text md:min-h-0 md:text-td-xs"
            >
              {bulkMode ? 'Single item' : 'Add multiple'}
            </button>

            <button
              type="submit"
              disabled={!newItem.trim() || isAdding}
              className="flex min-h-[48px] touch-manipulation items-center gap-2 rounded-md bg-td-text px-4 text-base font-medium text-white disabled:opacity-40 md:min-h-0 md:px-3 md:py-1.5 md:text-td-sm"
            >
              {isAdding ? (
                <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faPlus} className="h-4 w-4 md:h-3 md:w-3" />
              )}
              Add
            </button>
          </div>
        </form>
      </header>

      <div className="px-0">
        {visibleItems.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <FontAwesomeIcon
              icon={faShoppingCart}
              className="mb-3 h-10 w-10 text-td-border-strong md:h-8 md:w-8"
            />
            <p className="text-xl text-td-muted md:text-sm">
              {shoppingItems.length === 0
                ? 'Nothing on the list yet'
                : 'All caught up — everything is checked off'}
            </p>
            <p className="mt-2 text-base text-td-faint md:text-td-xs">
              Tip: use #walmart or #costco when adding items to group by store
            </p>
          </div>
        ) : (
          groupedItems.map((group) => (
            <section key={group.name || 'all'} className="mb-1">
              {group.name && (
                <h2 className="sticky top-[calc(8.5rem)] z-[5] border-b border-td-border bg-td-hover px-4 py-2 text-sm font-medium uppercase tracking-wider text-td-muted md:top-[7rem] md:py-1.5 md:text-td-xs">
                  {group.name}
                  <span className="ml-2 font-normal text-td-faint">
                    {group.items.filter((i) => !i.completed).length || group.items.length}
                  </span>
                </h2>
              )}
              <ul className="list-none">
                {group.items.map((item) => (
                  <ShoppingItem
                    key={item.$id}
                    item={item}
                    isProcessing={processingIds.has(item.$id)}
                    onToggle={handleToggle}
                    onDelete={setDeleteId}
                  />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      {completedCount > 0 && (
        <div className="px-4 pt-6">
          <button
            type="button"
            onClick={() => setClearCompletedOpen(true)}
            className="min-h-[48px] w-full touch-manipulation border border-td-border text-base text-td-muted hover:border-red-200 hover:text-red-600 md:min-h-0 md:py-2 md:text-td-sm"
          >
            Clear {completedCount} completed
          </button>
        </div>
      )}

      <ConfirmationModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove item?"
        message="This removes the item from your shopping list."
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
      />

      <ConfirmationModal
        isOpen={clearCompletedOpen}
        onClose={() => setClearCompletedOpen(false)}
        onConfirm={handleClearCompleted}
        title="Clear completed?"
        message={`Delete ${completedCount} checked-off item${completedCount === 1 ? '' : 's'} permanently?`}
        confirmText="Clear"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}
