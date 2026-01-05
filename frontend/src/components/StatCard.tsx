import React from 'react'
import type { LucideIcon } from 'lucide-react'

type Tone = 'neutral' | 'good' | 'warn' | 'bad' | 'info'

function toneClasses(tone: Tone): { icon: string; accent: string } {
  switch (tone) {
    case 'good':
      return { icon: 'text-emerald-300', accent: 'bg-emerald-500/10 border-emerald-500/20' }
    case 'warn':
      return { icon: 'text-amber-300', accent: 'bg-amber-500/10 border-amber-500/20' }
    case 'bad':
      return { icon: 'text-rose-300', accent: 'bg-rose-500/10 border-rose-500/20' }
    case 'info':
      return { icon: 'text-cyan-300', accent: 'bg-cyan-500/10 border-cyan-500/20' }
    default:
      return { icon: 'text-slate-300', accent: 'bg-white/5 border-white/10' }
  }
}

export function StatCard(props: {
  label: string
  value: React.ReactNode
  icon: LucideIcon
  tone?: Tone
  hint?: string
  progress?: number // 0..1
}) {
  const { label, value, icon: Icon, tone = 'neutral', hint, progress } = props
  const t = toneClasses(tone)

  const clamped = typeof progress === 'number' ? Math.max(0, Math.min(1, progress)) : undefined

  return (
    <div className={`pkf-glass pkf-hover rounded-2xl p-4 ${t.accent}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-slate-300/80">{label}</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
        </div>
        <div className={`pkf-ring rounded-xl p-2 ${t.icon}`} title={hint ?? label}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {typeof clamped === 'number' ? (
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500"
              style={{ width: `${Math.round(clamped * 100)}%` }}
              aria-label={`${label} ${Math.round(clamped * 100)}%`}
            />
          </div>
          <div className="mt-2 text-xs text-slate-400">{hint ?? `${Math.round(clamped * 100)}%`}</div>
        </div>
      ) : hint ? (
        <div className="mt-3 text-xs text-slate-400">{hint}</div>
      ) : null}
    </div>
  )
}
