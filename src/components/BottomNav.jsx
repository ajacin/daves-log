import { Link, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { bottomNavItems } from '../lib/navigation'

export function BottomNav () {
  const location = useLocation()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[1000] border-t border-td-border bg-td-bg/95 backdrop-blur-sm md:hidden"
      aria-label="Main navigation"
    >
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
  )
}
