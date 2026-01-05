import React from 'react'
import { Flame, Shield } from 'lucide-react'

export function Header(props: { apiBaseUrl: string }) {
  const { apiBaseUrl } = props

  return (
    <header className="relative overflow-hidden rounded-2xl pkf-glass p-6">
      <div className="absolute -top-24 left-0 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />
      <div className="absolute -top-28 right-0 h-72 w-72 rounded-full bg-red-500/15 blur-3xl" />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-3">
            <div className="pkf-ring inline-flex items-center justify-center rounded-xl bg-linear-to-br from-orange-400/20 to-red-500/20 p-2 text-orange-200">
              <Shield className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Personal Knowledge Firewall</h1>
          </div>
          <p className="mt-2 text-sm text-slate-300/80">A fiery shield for your knowledge intake.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200 ring-1 ring-white/10">
            <Flame className="h-4 w-4 text-orange-200" />
            API:
            <a className="font-mono text-slate-200 underline decoration-white/20 underline-offset-4 hover:decoration-white/40" href={apiBaseUrl} target="_blank" rel="noreferrer">
              {apiBaseUrl}
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
