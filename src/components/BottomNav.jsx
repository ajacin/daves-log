import { useCallback, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
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

  const handleTasksApproved = useCallback(async (tasks) => {
    if (!user) return

    let successCount = 0
    for (const task of tasks) {
      try {
        const success = await ideas.add({
          userId: user.$id,
          userName: user.name,
          title: task.title,
          description: task.description || '',
          entryDate: new Date().toISOString(),
          tags: task.tags || [],
          completed: false,
          dueDate: task.dueDate || null
        }, { source: 'ai-generator' })
        if (success) successCount += 1
      } catch (err) {
        console.error('Failed to add task from quick add:', err)
      }
    }

    if (successCount > 0) {
      toast.success(`Added ${successCount} task${successCount !== 1 ? 's' : ''}`)
    } else {
      toast.error('Failed to add tasks')
    }
  }, [ideas, user])

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-[1000] border-t border-td-border bg-td-bg/95 backdrop-blur-sm md:hidden"
        aria-label="Main navigation"
      >
        {/* Center floating quick-add FAB — opens the AI parsing modal */}
        <button
          type="button"
          onClick={() => setIsQuickAddOpen(true)}
          className="absolute bottom-full left-1/2 mb-3 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg ring-4 ring-td-bg transition-transform touch-manipulation active:scale-95 hover:bg-emerald-600"
          aria-label="Quick add task with AI"
        >
          <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
        </button>

        <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1">
          {bottomNavItems.map((item) => {
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
        />
      </div>
    </>
  )
}
