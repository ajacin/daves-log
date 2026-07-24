import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faTimes } from '@fortawesome/free-solid-svg-icons'

const DISMISS_KEY = 'pwa-install-dismissed'

function isIos () {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone () {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
}

export function InstallPrompt () {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showIosHint, setShowIosHint] = useState(false)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === 'true'
  )

  useEffect(() => {
    if (isStandalone() || dismissed) return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)

    if (isIos() && !isStandalone()) {
      setShowIosHint(true)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [dismissed])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true')
    setDismissed(true)
    setDeferredPrompt(null)
    setShowIosHint(false)
  }

  const install = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    dismiss()
  }

  if (dismissed || isStandalone()) return null
  if (!deferredPrompt && !showIosHint) return null

  return (
    <div
      role="dialog"
      aria-label="Install app"
      className="fixed bottom-4 left-4 right-4 z-[1002] mx-auto max-w-md rounded-lg border border-td-border bg-white p-4 shadow-lg md:left-auto md:right-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-td-base font-medium text-td-text">Install 4292 Falcons</p>
          <p className="mt-1 text-td-sm text-td-muted">
            {showIosHint && !deferredPrompt
              ? 'Tap Share, then "Add to Home Screen" for quick access.'
              : 'Add to your home screen for offline shopping and faster access.'}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="shrink-0 p-1 text-td-faint hover:text-td-text"
        >
          <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
        </button>
      </div>
      {deferredPrompt && (
        <button
          type="button"
          onClick={install}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-td-text py-2.5 text-td-sm font-medium text-white"
        >
          <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
          Install
        </button>
      )}
    </div>
  )
}
