import React from 'react'
import { useHashRoute } from './hooks/useHashRoute'
import { CalmShell } from './ui/CalmShell'
import { LandingPage } from './pages/LandingPage'
import { AuthForm } from './pages/AuthForm'
import { Dashboard } from './pages/Dashboard'
import { LiveMonitor } from './pages/LiveMonitor'
import { Documents } from './pages/Documents'
import { Insights } from './pages/Insights'
import { Settings } from './pages/Settings'
import { auth, type AuthUser } from './services/auth'

export function App() {
  const [route, navigate] = useHashRoute()
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [checking, setChecking] = React.useState(true)
  const [authError, setAuthError] = React.useState('')

  React.useEffect(() => {
    let alive = true

    async function boot() {
      const token = auth.getToken()
      if (!token) {
        if (alive) {
          setUser(null)
          setChecking(false)
        }
        return
      }

      try {
        const me = await auth.me()
        if (!alive) return
        setUser(me)
      } catch {
        auth.clearToken()
        if (!alive) return
        setUser(null)
      } finally {
        if (alive) setChecking(false)
      }
    }

    void boot()
    return () => {
      alive = false
    }
  }, [])

  const authed = Boolean(user)

  React.useEffect(() => {
    if (checking) return

    const publicRoutes = new Set(['landing', 'login', 'register'] as const)

    if (!authed && !publicRoutes.has(route as any)) {
      navigate('landing')
      return
    }

    if (authed && publicRoutes.has(route as any)) {
      navigate('dashboard')
    }
  }, [authed, checking, route, navigate])

  async function onLogout() {
    await auth.logout()
    setUser(null)
    navigate('landing')
  }

  async function handleLogin(email: string, password: string) {
    setAuthError('')
    try {
      const user = await auth.login({ username: email, password })
      setUser(user)
      navigate('dashboard')
    } catch (e: any) {
      setAuthError(e.message || 'Login failed')
    }
  }

  async function handleRegister(email: string, password: string) {
    setAuthError('')
    try {
      const user = await auth.register({ username: email, email, password })
      setUser(user)
      navigate('dashboard')
    } catch (e: any) {
      setAuthError(e.message || 'Registration failed')
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--pkf-bg)]">
        <div className="text-[14px] text-[var(--pkf-text-muted)]">Loading…</div>
      </div>
    )
  }

  if (!authed) {
    if (route === 'login') {
      return (
        <AuthForm
          mode="login"
          onSubmit={handleLogin}
          onToggleMode={() => navigate('register')}
          error={authError}
        />
      )
    }
    if (route === 'register') {
      return (
        <AuthForm
          mode="register"
          onSubmit={handleRegister}
          onToggleMode={() => navigate('login')}
          error={authError}
        />
      )
    }
    return <LandingPage onNavigate={navigate} />
  }

  function renderPage() {
    switch (route) {
      case 'monitor':
        return <LiveMonitor />
      case 'documents':
        return <Documents />
      case 'insights':
        return <Insights />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <CalmShell route={route} onNavigate={navigate} user={user} onLogout={onLogout}>
      {renderPage()}
    </CalmShell>
  )
}
