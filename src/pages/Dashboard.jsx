import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronRight,
  faCalendarDay,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons'
import { useUser } from '../lib/context/user'
import { useIdeas } from '../lib/context/ideas'
import { dashboardSections, dashboardSecondaryLinks } from '../lib/navigation'
import { useMobileNav } from '../lib/hooks/useMobileNav'

export function Dashboard () {
  const { current: user } = useUser()
  const ideas = useIdeas()
  const isMobileNav = useMobileNav()
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting('Good morning')
    } else if (hour < 18) {
      setGreeting('Good afternoon')
    } else {
      setGreeting('Good evening')
    }
  }, [])

  useEffect(() => {
    if (!ideas.current.length) {
      ideas.init()
    }
  }, [ideas])

  const snapshot = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const pendingTasks = ideas.current.filter((idea) => !idea.completed)
    const overdueTasks = pendingTasks.filter((idea) => {
      if (!idea.dueDate) return false
      const dueDate = new Date(idea.dueDate)
      return dueDate < today
    })
    const tasksDueToday = pendingTasks.filter((idea) => {
      if (!idea.dueDate) return false
      const dueDate = new Date(idea.dueDate)
      const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
      return dueDay.getTime() === today.getTime()
    })
    const shoppingItems = pendingTasks.filter((idea) => idea.tags?.includes('shopping'))

    return {
      pendingTasks: pendingTasks.length,
      overdueTasks: overdueTasks.length,
      tasksDueToday: tasksDueToday.length,
      shoppingItems: shoppingItems.length
    }
  }, [ideas])

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="mx-auto min-h-screen max-w-xl bg-td-bg pb-8">
      <header className="border-b border-td-border px-4 py-5 pt-[max(1rem,env(safe-area-inset-top))] md:pt-5">
        <p className="text-td-xs uppercase tracking-wider text-td-faint">{todayLabel}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-td-text md:text-xl">
          {greeting}, {user?.name || 'there'}
        </h1>
        <p className="mt-1 text-base text-td-muted md:text-td-sm">
          Jump to any section below
        </p>
      </header>

      {(snapshot.tasksDueToday > 0 || snapshot.overdueTasks > 0) && (
        <div className="mx-4 mt-4 space-y-2">
          {snapshot.tasksDueToday > 0 && (
            <Link
              to="/dashboard/ideas"
              className="flex items-center gap-3 border border-amber-200 bg-amber-50 px-3 py-3 text-td-sm text-amber-900 touch-manipulation hover:bg-amber-100"
            >
              <FontAwesomeIcon icon={faCalendarDay} className="h-4 w-4 shrink-0" />
              <span>
                {snapshot.tasksDueToday} task{snapshot.tasksDueToday !== 1 ? 's' : ''} due today
              </span>
              <FontAwesomeIcon icon={faChevronRight} className="ml-auto h-3 w-3 opacity-60" />
            </Link>
          )}
          {snapshot.overdueTasks > 0 && (
            <Link
              to="/dashboard/ideas"
              className="flex items-center gap-3 border border-red-200 bg-red-50 px-3 py-3 text-td-sm text-red-900 touch-manipulation hover:bg-red-100"
            >
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4 shrink-0" />
              <span>
                {snapshot.overdueTasks} overdue task{snapshot.overdueTasks !== 1 ? 's' : ''}
              </span>
              <FontAwesomeIcon icon={faChevronRight} className="ml-auto h-3 w-3 opacity-60" />
            </Link>
          )}
        </div>
      )}

      <section className="px-4 py-5">
        <h2 className="mb-3 text-td-xs font-medium uppercase tracking-wider text-td-faint">
          Main
        </h2>
        <ul className="grid gap-3">
          {dashboardSections.map((section) => (
            <li key={section.id}>
              <Link
                to={section.to}
                className="flex min-h-[72px] items-center gap-3 border border-td-border bg-td-bg px-4 py-3 touch-manipulation hover:bg-td-hover md:min-h-0"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${section.accent}`}
                >
                  <FontAwesomeIcon icon={section.icon} className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-td-base font-medium text-td-text">{section.title}</p>
                  <p className="text-td-xs text-td-faint">{section.description}</p>
                </div>
                <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3 shrink-0 text-td-faint" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-4 pb-6">
        <h2 className="mb-3 text-td-xs font-medium uppercase tracking-wider text-td-faint">
          At a glance
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/dashboard/ideas"
            className="border border-td-border px-3 py-3 touch-manipulation hover:bg-td-hover"
          >
            <p className="text-td-xs text-td-faint">Pending tasks</p>
            <p className="mt-1 text-2xl font-semibold text-td-text">{snapshot.pendingTasks}</p>
          </Link>
          <Link
            to="/dashboard/shopping"
            className="border border-td-border px-3 py-3 touch-manipulation hover:bg-td-hover"
          >
            <p className="text-td-xs text-td-faint">Shopping items</p>
            <p className="mt-1 text-2xl font-semibold text-td-text">{snapshot.shoppingItems}</p>
          </Link>
        </div>
      </section>

      {!isMobileNav && (
        <section className="px-4 pb-8">
          <h2 className="mb-3 text-td-xs font-medium uppercase tracking-wider text-td-faint">
            More
          </h2>
          <ul className="divide-y divide-td-border border border-td-border">
            {dashboardSecondaryLinks.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.to}
                  className="flex items-center gap-3 px-4 py-3 text-td-sm text-td-text hover:bg-td-hover"
                >
                  <FontAwesomeIcon icon={item.icon} className="h-4 w-4 text-td-muted" />
                  <span>{item.title}</span>
                  <FontAwesomeIcon icon={faChevronRight} className="ml-auto h-3 w-3 text-td-faint" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
