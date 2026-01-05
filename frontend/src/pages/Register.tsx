import React from 'react'
import type { RouteKey } from '../hooks/useHashRoute'
import { auth, type AuthUser } from '../services/auth'

export function Register(props: {
  onNavigate: (route: RouteKey) => void
  onAuthed: (user: AuthUser) => void
}) {
  const [username, setUsername] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)

    try {
      const user = await auth.register({ username: username.trim(), email: email.trim(), password })
      props.onAuthed(user)
      props.onNavigate('dashboard')
    } catch (err) {
      setError(String(err && (err as any).message ? (err as any).message : err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-(--pkf-bg)">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-10">
        <header className="rounded-2xl bg-(--pkf-surface) p-6 ring-1 ring-(--pkf-border)">
          <h1 className="text-[26px] font-semibold tracking-tight text-(--pkf-text-strong)">Create account</h1>
          <p className="mt-2 text-[13px] text-(--pkf-text-muted)">
            A short setup so your documents and insights can stay yours.
          </p>
        </header>

        <main className="mt-6 pkf-card p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <div className="text-[13px] font-semibold text-(--pkf-text)">Username</div>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pkf-focus mt-2 w-full rounded-2xl border border-(--pkf-border) bg-(--pkf-overlay) px-4 py-3 text-[14px] text-(--pkf-text-strong)"
                autoComplete="username"
              />
            </label>

            <label className="block">
              <div className="text-[13px] font-semibold text-(--pkf-text)">Email (optional)</div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pkf-focus mt-2 w-full rounded-2xl border border-(--pkf-border) bg-(--pkf-overlay) px-4 py-3 text-[14px] text-(--pkf-text-strong)"
                autoComplete="email"
              />
            </label>

            <label className="block">
              <div className="text-[13px] font-semibold text-(--pkf-text)">Password</div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="pkf-focus mt-2 w-full rounded-2xl border border-(--pkf-border) bg-(--pkf-overlay) px-4 py-3 text-[14px] text-(--pkf-text-strong)"
                autoComplete="new-password"
              />
              <div className="mt-2 text-[12px] text-(--pkf-text-muted)">Use 8+ characters.</div>
            </label>

            {error ? (
              <div className="pkf-ring rounded-2xl bg-(--pkf-overlay) p-3 text-[12px] text-(--pkf-text)">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={busy || username.trim().length < 3 || password.length < 8}
              className={
                'pkf-focus w-full rounded-2xl px-4 py-3 text-left text-[14px] font-semibold ring-1 ring-white/10 ' +
                (busy || username.trim().length < 3 || password.length < 8
                  ? 'bg-(--pkf-primary-muted) text-(--pkf-text-muted)'
                  : 'bg-(--pkf-primary) text-(--pkf-text-strong) hover:brightness-[1.04]')
              }
            >
              {busy ? 'Creating…' : 'Create account'}
            </button>

            <div className="flex items-center justify-between gap-3 text-[13px] text-(--pkf-text-muted)">
              <button
                type="button"
                className="pkf-focus rounded-xl px-2 py-1 hover:bg-(--pkf-overlay-hover)"
                onClick={() => props.onNavigate('landing')}
              >
                Back
              </button>
              <button
                type="button"
                className="pkf-focus rounded-xl px-2 py-1 text-(--pkf-text) hover:bg-(--pkf-overlay-hover)"
                onClick={() => props.onNavigate('login')}
              >
                I already have an account
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
