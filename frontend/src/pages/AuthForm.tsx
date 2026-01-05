import React from 'react'
import { SoftButton } from '../design/components'

interface AuthFormProps {
  mode: 'login' | 'register'
  onSubmit: (email: string, password: string) => Promise<void>
  onToggleMode: () => void
  error?: string
}

export function AuthForm({ mode, onSubmit, onToggleMode, error }: AuthFormProps) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(email, password)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--pkf-bg)] px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[24px] font-semibold text-[var(--pkf-text-strong)]">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="mt-2 text-[14px] text-[var(--pkf-text-muted)]">
            {mode === 'login'
              ? 'Sign in to your PKF account'
              : 'Start your calm reading journey'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-[13px] font-medium text-[var(--pkf-text)] mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="pkf-focus w-full rounded-xl bg-[var(--pkf-surface)] px-4 py-3 text-[14px] text-[var(--pkf-text-strong)] ring-1 ring-[var(--pkf-border)] placeholder:text-[var(--pkf-text-subtle)] focus:ring-[var(--pkf-border-focus)]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[13px] font-medium text-[var(--pkf-text)] mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={8}
              className="pkf-focus w-full rounded-xl bg-[var(--pkf-surface)] px-4 py-3 text-[14px] text-[var(--pkf-text-strong)] ring-1 ring-[var(--pkf-border)] placeholder:text-[var(--pkf-text-subtle)] focus:ring-[var(--pkf-border-focus)]"
              placeholder="••••••••"
            />
            {mode === 'register' && (
              <p className="mt-2 text-[12px] text-[var(--pkf-text-muted)]">
                At least 8 characters
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-xl bg-[var(--pkf-warning-subtle)] px-4 py-3 text-[13px] text-[var(--pkf-warning)]">
              {error}
            </div>
          )}

          <SoftButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
          >
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </SoftButton>
        </form>

        {/* Toggle */}
        <p className="mt-6 text-center text-[13px] text-[var(--pkf-text-muted)]">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={onToggleMode}
            className="text-[var(--pkf-primary)] hover:underline"
          >
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>

        {/* Back to Landing */}
        <div className="mt-8 text-center">
          <a
            href="#"
            className="text-[13px] text-[var(--pkf-text-subtle)] hover:text-[var(--pkf-text-muted)]"
          >
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  )
}
