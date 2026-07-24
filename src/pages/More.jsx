import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faPowerOff } from '@fortawesome/free-solid-svg-icons'
import { useUser } from '../lib/context/user'
import { dashboardSecondaryLinks } from '../lib/navigation'
import { useMobileNav } from '../lib/hooks/useMobileNav'

export function More () {
  const { logout, current: user } = useUser()
  const isMobileNav = useMobileNav()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className={`mx-auto min-h-screen max-w-xl bg-td-bg ${isMobileNav ? 'pb-24' : 'pb-8'}`}>
      <header className="border-b border-td-border px-4 py-5 pt-[max(1rem,env(safe-area-inset-top))] md:pt-5">
        <h1 className="text-2xl font-semibold tracking-tight text-td-text md:text-lg">More</h1>
        <p className="mt-0.5 text-base text-td-muted md:text-td-sm">
          Settings and secondary tools
        </p>
      </header>

      <div className="px-4 py-4">
        <p className="mb-3 text-td-xs uppercase tracking-wider text-td-faint">
          Signed in as {user?.name || 'User'}
        </p>

        <ul className="divide-y divide-td-border border border-td-border bg-td-bg">
          {dashboardSecondaryLinks.map((item) => (
            <li key={item.id}>
              <Link
                to={item.to}
                className="flex min-h-[56px] items-center gap-3 px-4 py-3 touch-manipulation hover:bg-td-hover md:min-h-0 md:py-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-td-hover text-td-muted">
                  <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-td-sm font-medium text-td-text">{item.title}</p>
                  <p className="text-td-xs text-td-faint">{item.description}</p>
                </div>
                <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3 shrink-0 text-td-faint" />
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 flex min-h-[48px] w-full items-center justify-center gap-2 border border-red-200 text-td-sm text-red-600 touch-manipulation hover:bg-red-50 md:min-h-0 md:py-2.5"
        >
          <FontAwesomeIcon icon={faPowerOff} className="h-3.5 w-3.5" />
          Log out
        </button>
      </div>
    </div>
  )
}
