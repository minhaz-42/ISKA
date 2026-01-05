import React from 'react'
import type { RouteKey } from '../hooks/useHashRoute'

export function Landing(props: { onNavigate: (route: RouteKey) => void }) {
  return (
    <div className="min-h-screen bg-(--pkf-bg)">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-10">
        <header className="rounded-2xl bg-(--pkf-surface) p-6 ring-1 ring-(--pkf-border)">
          <h1 className="text-[32px] font-semibold tracking-tight text-(--pkf-text-strong)">
            Personal Knowledge Firewall
          </h1>
          <p className="mt-2 text-[15px] text-(--pkf-text)">A mindful assistant for your attention.</p>
          <p className="mt-1 text-[13px] text-(--pkf-text-muted)">
            Explanations before metrics. No blocking. No opinion policing.
          </p>
        </header>

        <main className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <section className="pkf-card p-6">
            <h2 className="text-[16px] font-semibold text-(--pkf-text-strong)">What it does</h2>
            <p className="mt-2 text-[14px] text-(--pkf-text)">
              PKF helps you notice patterns in what you read and keep a calmer relationship with information.
            </p>
            <ul className="mt-4 space-y-2 text-[14px] text-(--pkf-text)">
              <li className="pkf-ring rounded-2xl bg-(--pkf-overlay) p-3">
                Gentle signals while you read — explanation first.
              </li>
              <li className="pkf-ring rounded-2xl bg-(--pkf-overlay) p-3">
                Summaries and calm notes, based on visible text.
              </li>
              <li className="pkf-ring rounded-2xl bg-(--pkf-overlay) p-3">
                Your content stays yours — no blocking or judgment.
              </li>
            </ul>
          </section>

          <section className="pkf-card p-6">
            <h2 className="text-[16px] font-semibold text-(--pkf-text-strong)">Get started</h2>
            <p className="mt-2 text-[14px] text-(--pkf-text)">
              Create an account to keep your documents and insights tied to you.
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => props.onNavigate('login')}
                className="pkf-focus rounded-2xl bg-(--pkf-primary) px-4 py-3 text-left text-[14px] font-semibold text-(--pkf-text-strong) ring-1 ring-white/10 hover:brightness-[1.04]"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => props.onNavigate('register')}
                className="pkf-focus rounded-2xl bg-(--pkf-overlay) px-4 py-3 text-left text-[14px] font-semibold text-(--pkf-text-strong) ring-1 ring-(--pkf-border) hover:bg-(--pkf-overlay-hover)"
              >
                Create account
              </button>

              <div className="mt-2 text-[12px] text-(--pkf-text-muted)">
                Tip: you can also use the Chrome extension for live browsing signals.
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-6 text-[12px] text-(--pkf-text-muted)">
          PKF is designed to be calm by default: no urgency language and no attention traps.
        </footer>
      </div>
    </div>
  )
}
