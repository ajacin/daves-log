const UPDATE_EVENT = 'pwa-update-available'

export function onPwaUpdate (callback) {
  const handler = () => callback()
  window.addEventListener(UPDATE_EVENT, handler)
  return () => window.removeEventListener(UPDATE_EVENT, handler)
}

export function applyPwaUpdate () {
  navigator.serviceWorker.getRegistration().then((reg) => {
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  })

  navigator.serviceWorker.addEventListener(
    'controllerchange',
    () => window.location.reload(),
    { once: true }
  )
}

export async function registerServiceWorker () {
  if (!('serviceWorker' in navigator)) return

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js')

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (!newWorker) return

      newWorker.addEventListener('statechange', () => {
        if (
          newWorker.state === 'installed' &&
          navigator.serviceWorker.controller
        ) {
          window.dispatchEvent(new CustomEvent(UPDATE_EVENT))
        }
      })
    })

    if (registration.waiting && navigator.serviceWorker.controller) {
      window.dispatchEvent(new CustomEvent(UPDATE_EVENT))
    }
  } catch (error) {
    console.error('SW registration failed:', error)
  }
}
