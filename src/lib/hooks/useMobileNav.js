import { useEffect, useState } from 'react'

const MOBILE_QUERY = '(max-width: 767px)'

function safeMatch (query) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }

  try {
    return window.matchMedia(query).matches
  } catch {
    return false
  }
}

function getIsMobileNav () {
  const isStandalone =
    safeMatch('(display-mode: standalone)') ||
    (typeof window !== 'undefined' && window.navigator?.standalone === true)

  const isMobileViewport = safeMatch(MOBILE_QUERY)

  return isMobileViewport || isStandalone
}

export function useMobileNav () {
  const [isMobileNav, setIsMobileNav] = useState(getIsMobileNav)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined
    }

    const mobileQuery = window.matchMedia(MOBILE_QUERY)
    let standaloneQuery = null

    try {
      standaloneQuery = window.matchMedia('(display-mode: standalone)')
    } catch {
      standaloneQuery = null
    }

    const update = () => setIsMobileNav(getIsMobileNav())

    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', update)
    }

    if (standaloneQuery && typeof standaloneQuery.addEventListener === 'function') {
      standaloneQuery.addEventListener('change', update)
    }

    return () => {
      if (typeof mobileQuery.removeEventListener === 'function') {
        mobileQuery.removeEventListener('change', update)
      }

      if (standaloneQuery && typeof standaloneQuery.removeEventListener === 'function') {
        standaloneQuery.removeEventListener('change', update)
      }
    }
  }, [])

  return isMobileNav
}
