import React from 'react'
import type { DashboardStats } from '../services/types'
import { RingMeter } from '../ui/RingMeter'

function statusFrom(stats: DashboardStats): { label: string; tone: 'calm' | 'warn' | 'risk' } {
  const redundancy = stats.recent_redundancies
  const contradictions = stats.recent_contradictions

  if (contradictions > 0) return { label: 'Emotionally loaded or conflicting', tone: 'risk' }
  if (redundancy > 0) return { label: 'Slightly repetitive', tone: 'warn' }
  return { label: 'Mostly diverse', tone: 'calm' }
}

export function HomePage(props: {
  stats: DashboardStats | null
  loading: boolean
  error: string | null
}) {
  const { stats, loading, error } = props

  const status = stats ? statusFrom(stats) : { label: '—', tone: 'calm' as const }

  const toneColor =
    status.tone === 'calm' ? 'var(--pkf-healthy)' : status.tone === 'warn' ? 'var(--pkf-neutral)' : 'var(--pkf-attention)'

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-medium text-slate-100">Your information diet</h2>
          <p className="mt-2 text-[15px] font-normal text-slate-300">Calm signals to help you reflect.</p>
        </div>
      </div>

      <div className="mt-6 pkf-card p-6">
        <div className="text-[15px] font-medium text-slate-200">Status</div>
        <div className="mt-2 text-[15px] font-normal text-slate-200">
          Your recent reading is mostly{' '}
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: toneColor }} aria-hidden />
            <span className="font-medium text-slate-100">{status.label}</span>
          </span>
        </div>
        <div className="mt-2 text-[13px] font-normal text-slate-400">
          Explanations come first. Open Documents & insights to see what drove this.
        </div>
      </div>

      <div className="mt-5">
        {loading ? <div className="text-[13px] text-slate-400">Loading…</div> : null}
        {error ? (
          <div className="mt-3 rounded-xl bg-white/5 p-4 text-[13px] text-slate-200 ring-1 ring-(--pkf-border)">
            {error}
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <RingMeter
          label="Novelty"
          value={stats ? stats.avg_novelty : 0}
          tone={stats && stats.avg_novelty >= 0.6 ? 'calm' : stats && stats.avg_novelty >= 0.35 ? 'warn' : 'risk'}
          description="Higher novelty means you’re encountering more new ideas and concepts (not necessarily ‘true’—just less repetitive)."
        />

        <RingMeter
          label="Cognitive load"
          value={stats ? Math.min(1, Math.max(0, 1 - stats.avg_depth)) : 0.35}
          tone={stats && stats.avg_depth >= 0.7 ? 'warn' : 'calm'}
          description="High cognitive load means the content may require more mental effort. That’s not bad—just something to pace."
        />

        <RingMeter
          label="Misinformation signals"
          value={stats ? Math.min(1, stats.recent_contradictions / 5) : 0}
          tone={stats && stats.recent_contradictions > 0 ? 'warn' : 'calm'}
          description="We do not claim truth. We only flag patterns that resemble persuasion/manipulation, contradictions, or suspicious structure."
        />
      </div>
    </div>
  )
}
