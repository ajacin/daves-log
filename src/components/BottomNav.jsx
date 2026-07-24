import { useCallback, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import toast from 'react-hot-toast'
import { bottomNavItems } from '../lib/navigation'
import { useIdeas } from '../lib/context/ideas'
import { useUser } from '../lib/context/user'
import { AITaskGenerator } from './tasks/AITaskGenerator'

export function BottomNav () {
  const location = useLocation()
  const ideas = useIdeas()
  const { current: user } = useUser()
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)

  // The quick-add button parses into shopping items on the shopping list,
  // and into general tasks everywhere else.
  const quickAddMode = useMemo(
    () => (location.pathname.startsWith('/dashboard/shopping') ? 'shopping' : 'tasks'),
    [location.pathname]
  )

  const handleTasksApproved = useCallback(async (tasks) => {
    if (!user) return

    let successCount = 0
    for (const task of tasks) {
      const tags = task.tags || []
      // Guarantee the shopping tag so items land on the shopping list
      const finalTags =
        quickAddMode === 'shopping' && !tags.includes('shopping')
          ? ['shopping', ...tags]
          : tags

      try {
        const success = await ideas.add({
          userId: user.$id,
          userName: user.name,
          title: task.title,
          description: task.description || '',
          entryDate: new Date().toISOString(),
          tags: finalTags,
          completed: false,
          dueDate: task.dueDate || null
        }, { source: quickAddMode === 'shopping' ? 'shopping-quick-add' : 'ai-generator' })
        if (success) successCount += 1
      } catch (err) {
        console.error('Failed to add from quick add:', err)
      }
    }

    const noun = quickAddMode === 'shopping' ? 'item' : 'task'
    if (successCount > 0) {
      toast.success(`Added ${successCount} ${noun}${successCount !== 1 ? 's' : ''}`)
    } else {
      toast.error(`Failed to add ${noun}s`)
    }
  }, [ideas, user, quickAddMode])

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-[1000] border-t border-td-border bg-td-bg/95 backdrop-blur-sm md:hidden"
        aria-label="Main navigation"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1">
          {bottomNavItems.map((item) => {
            if (item.action === 'quick-add') {
              return (
                <li key={item.id} className="flex-1">
                  <button
                    type="button"
                    onClick={() => setIsQuickAddOpen(true)}
                    className="flex min-h-[52px] w-full flex-col items-center justify-center gap-0.5 px-1 text-td-muted touch-manipulation transition-colors hover:text-td-text"
                    aria-label={`Quick add ${quickAddMode === 'shopping' ? 'shopping items' : 'tasks'} with AI`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                      <FontAwesomeIcon icon={item.icon} className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[10px] leading-none">{item.label}</span>
                  </button>
                </li>
              )
            }

            const isActive = item.match(location.pathname)

            return (
              <li key={item.id} className="flex-1">
                <Link
                  to={item.to}
                  className={`flex min-h-[52px] flex-col items-center justify-center gap-0.5 px-1 touch-manipulation transition-colors ${
                    isActive ? 'text-td-text' : 'text-td-faint hover:text-td-muted'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                  <span className={`text-[10px] leading-none ${isActive ? 'font-medium' : ''}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Rendered above the nav (z-[1000]) so the modal and its backdrop cover it */}
      <div className="relative z-[1100]">
        <AITaskGenerator
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          onTasksApproved={handleTasksApproved}
          userId={user?.$id}
          mode={quickAddMode}
        />
      </div>
    </>
  )
}
