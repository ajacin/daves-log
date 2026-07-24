import { Navigate } from 'react-router-dom'
import { useUser } from '../lib/context/user'
import AppDrawer from './drawer/Drawer'
import { BottomNav } from './BottomNav'
import { useMobileNav } from '../lib/hooks/useMobileNav'
import { InstallPrompt } from './InstallPrompt'
import { PwaUpdatePrompt } from './PwaUpdatePrompt'

export function ProtectedLayout ({ children }) {
  const { current: user } = useUser()
  const isMobileNav = useMobileNav()

  if (!user) {
    return <Navigate to="/" replace />
  }

  return (
    <div
      className={`min-h-screen bg-td-bg ${
        isMobileNav ? 'pb-[calc(3.75rem+env(safe-area-inset-bottom))]' : ''
      }`}
    >
      {!isMobileNav && <AppDrawer />}
      <main className="app-main">
        {children}
      </main>
      {isMobileNav && <BottomNav />}
      <InstallPrompt />
      <PwaUpdatePrompt />
    </div>
  )
}
