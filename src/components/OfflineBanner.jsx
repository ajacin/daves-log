import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudArrowUp, faWifi } from '@fortawesome/free-solid-svg-icons'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

export function OfflineBanner ({ pendingCount = 0, isSyncing = false }) {
  const isOnline = useOnlineStatus()

  if (isOnline && pendingCount === 0 && !isSyncing) return null

  return (
    <div
      role="status"
      className={`sticky top-0 z-[1001] flex items-center justify-center gap-2 px-4 py-2 text-td-sm ${
        isOnline
          ? 'bg-amber-50 text-amber-800 border-b border-amber-200'
          : 'bg-slate-800 text-white'
      }`}
    >
      {!isOnline ? (
        <>
          <FontAwesomeIcon icon={faWifi} className="h-3.5 w-3.5 opacity-70" />
          <span>Offline — shopping list works, changes sync when back online</span>
        </>
      ) : isSyncing ? (
        <>
          <FontAwesomeIcon icon={faCloudArrowUp} className="h-3.5 w-3.5" />
          <span>Syncing {pendingCount > 0 ? `${pendingCount} change${pendingCount === 1 ? '' : 's'}` : '…'}</span>
        </>
      ) : (
        <>
          <FontAwesomeIcon icon={faCloudArrowUp} className="h-3.5 w-3.5" />
          <span>{pendingCount} change{pendingCount === 1 ? '' : 's'} waiting to sync</span>
        </>
      )}
    </div>
  )
}
