import React from 'react'
import type { LucideIcon } from 'lucide-react'

export type StatTone = 'neutral' | 'good' | 'warn' | 'bad'

function toneClasses(tone: StatTone): { icon: string; ring: string; value: string } {
  switch (tone) {
    case 'good':
      return {
        icon: 'text-emerald-400',
        ring: 'ring-1 ring-emerald-400/25',
        value: 'text-slate-50',
      }
    case 'warn':
      return {
        icon: 'text-amber-400',
        ring: 'ring-1 ring-amber-400/20',
        value: 'text-slate-50',
      }
    case 'bad':
      return {
        icon: 'text-rose-400',
        ring: 'ring-1 ring-rose-400/20',
        value: 'text-slate-50',
      }
    default:
      return {
        icon: 'text-cyan-300',
        ring: 'ring-1 ring-white/10',
        value: 'text-slate-50',
      }
  }
}

export function StatCard(props: {
  label: string
  value: React.ReactNode
  icon: LucideIcon
  tone?: StatTone
  hint?: string
  meter?: { value: number; label?: string }
}) {
  const Icon = props.icon
  const tone = toneClasses(props.tone ?? 'neutral')

  const meterValue = props.meter ? Math.max(0, Math.min(1, props.meter.value)) : null

  return (
    <div className={`pkf-card pkf-hover ${tone.ring} p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-300">{props.label}</p>
            {props.hint ? (
              <span
                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/5 text-[11px] text-slate-200 ring-1 ring-white/10"
                title={props.hint}
                aria-label={props.hint}
              >
                ?
              </span>
            ) : null}
          </div>
          <div className={`mt-2 font-mono text-2xl font-semibold tracking-tight ${tone.value}`}>{props.value}</div>
        </div>

        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 ${tone.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {meterValue !== null ? (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">{props.meter?.label ?? 'Average'}</p>
            <p className="text-xs font-mono text-slate-300">{Math.round(meterValue * 100)}%</p>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-white/5 ring-1 ring-white/10">
            <div
              className="h-2 rounded-full bg-linear-to-r from-orange-400 to-rose-500"
              style={{ width: `${Math.round(meterValue * 100)}%` }}
              aria-hidden
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
