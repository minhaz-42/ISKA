import React from 'react'

export type RouteKey = 'landing' | 'login' | 'register' | 'dashboard' | 'monitor' | 'documents' | 'insights' | 'settings'

function normalizeHash(hash: string): RouteKey {
  const cleaned = hash.replace(/^#\/?/, '').trim()
  const key = cleaned.split(/[/?#]/)[0]

  if (key === 'login') return 'login'
  if (key === 'register') return 'register'
  if (key === 'dashboard') return 'dashboard'
  if (key === 'monitor') return 'monitor'
  if (key === 'documents') return 'documents'
  if (key === 'insights') return 'insights'
  if (key === 'settings') return 'settings'
  return 'landing'
}

export function useHashRoute(): [RouteKey, (route: RouteKey) => void] {
  const [route, setRoute] = React.useState<RouteKey>(() => normalizeHash(window.location.hash))

  React.useEffect(() => {
    function onHashChange() {
      setRoute(normalizeHash(window.location.hash))
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = React.useCallback((next: RouteKey) => {
    window.location.hash = `/${next}`
  }, [])

  return [route, navigate]
}
