import { useEffect, useState } from 'react'
import { applyPwaUpdate, onPwaUpdate } from '../serviceWorkerRegistration'

export function PwaUpdatePrompt () {
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    return onPwaUpdate(() => setShowUpdate(true))
  }, [])

  if (!showUpdate) return null

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 right-4 z-[1002] mx-auto flex max-w-md items-center justify-between gap-3 rounded-lg border border-td-border bg-white px-4 py-3 shadow-lg md:left-auto md:right-4"
    >
      <p className="text-td-sm text-td-text">A new version is ready.</p>
      <button
        type="button"
        onClick={() => applyPwaUpdate()}
        className="shrink-0 rounded-md bg-td-text px-3 py-1.5 text-td-sm font-medium text-white"
      >
        Update
      </button>
    </div>
  )
}
