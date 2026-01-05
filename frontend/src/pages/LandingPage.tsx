import React from 'react'
import { SoftButton } from '../design/components'

interface LandingProps {
  onNavigate: (route: 'login' | 'register') => void
}

export function LandingPage({ onNavigate }: LandingProps) {
  return (
    <div className="min-h-screen bg-(--pkf-bg)">
      {/* Hero Section */}
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <header className="text-center">
          <h1 className="text-[36px] sm:text-[42px] font-semibold tracking-tight text-(--pkf-text-strong) leading-tight">
            Personal Knowledge Firewall
          </h1>
          <p className="mt-4 text-[18px] text-(--pkf-text) leading-relaxed">
            A mindful assistant for your attention.
          </p>
        </header>

        {/* Description Card */}
        <div className="mt-12 rounded-3xl bg-(--pkf-card)) p-8 ring-1 ring-(--pkf-border)">
          <p className="text-[15px] text-(--pkf-text) leading-relaxed text-center max-w-xl mx-auto">
            PKF helps you notice patterns in what you read and keep a calmer relationship with
            information.
          </p>

          {/* Key Points */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-(--pkf-surface) p-5 ring-1 ring-(--pkf-border-subtle)">
              <div className="mb-3 h-8 w-8 rounded-xl bg-(--pkf-primary-subtle) flex items-center justify-center">
                <span className="text-(--pkf-primary)">○</span>
              </div>
              <h3 className="text-[14px] font-medium text-(--pkf-text-strong)">
                Gentle signals
              </h3>
              <p className="mt-2 text-[13px] text-(--pkf-text-muted) leading-relaxed">
                Explanation first, while you read.
              </p>
            </div>

            <div className="rounded-2xl bg-(--pkf-surface) p-5 ring-1 ring-(--pkf-border-subtle)">
              <div className="mb-3 h-8 w-8 rounded-xl bg-(--pkf-secondary-subtle)) flex items-center justify-center">
                <span className="text-(--pkf-secondary))">◇</span>
              </div>
              <h3 className="text-[14px] font-medium text-(--pkf-text-strong)">
                Calm summaries
              </h3>
              <p className="mt-2 text-[13px] text-(--pkf-text-muted) leading-relaxed">
                Notes based on visible text.
              </p>
            </div>

            <div className="rounded-2xl bg-(--pkf-surface) p-5 ring-1 ring-(--pkf-border-subtle)">
              <div className="mb-3 h-8 w-8 rounded-xl bg-(--pkf-success-subtle)) flex items-center justify-center">
                <span className="text-(--pkf-success))">◌</span>
              </div>
              <h3 className="text-[14px] font-medium text-(--pkf-text-strong)">
                Your content
              </h3>
              <p className="mt-2 text-[13px] text-(--pkf-text-muted) leading-relaxed">
                No blocking, no judgment.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <SoftButton variant="primary" size="lg" onClick={() => onNavigate('register')}>
              Create account
            </SoftButton>
            <SoftButton variant="secondary" size="lg" onClick={() => onNavigate('login')}>
              Log in
            </SoftButton>
          </div>

          <p className="mt-6 text-center text-[13px] text-(--pkf-text-subtle)">
            You can also use the Chrome extension for live browsing signals.
          </p>
        </div>

        {/* Footer Note */}
        <footer className="mt-12 text-center">
          <p className="text-[13px] text-(--pkf-text-muted) leading-relaxed max-w-md mx-auto">
            PKF is designed to be calm by default — no urgency language and no attention traps.
          </p>
        </footer>
      </div>
    </div>
  )
}
