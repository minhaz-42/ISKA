import React from 'react'

export function RingMeter(props: {
  label: string
  value: number // 0..1
  tone: 'calm' | 'warn' | 'risk'
  description: string
}) {
  const { label, value, tone, description } = props
  const v = Math.max(0, Math.min(1, value))

  const stroke = 10
  const r = 34
  const c = 2 * Math.PI * r
  const dash = c * v
  const gap = c - dash

  // Strict status colors (muted only)
  const strokeColor =
    tone === 'calm' ? 'var(--pkf-healthy)' : tone === 'warn' ? 'var(--pkf-neutral)' : 'var(--pkf-attention)'

  const labelText = tone === 'calm' ? 'calm' : tone === 'warn' ? 'needs a pause' : 'ask why'

  return (
    <div className="pkf-card pkf-card-hover group p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[15px] font-medium text-slate-100">{label}</div>
          <div className="mt-1 text-[12px] font-normal text-slate-400">Hover or tap for meaning</div>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[12px] text-slate-300 ring-1 ring-(--pkf-border)">
            <span className="h-2 w-2 rounded-full" style={{ background: strokeColor }} aria-hidden />
            <span>{labelText}</span>
          </div>
        </div>

        <svg width="88" height="88" viewBox="0 0 88 88" role="img" aria-label={`${label} ring`}>
          <circle
            cx="44"
            cy="44"
            r={r}
            stroke="var(--pkf-border)"
            strokeWidth={stroke}
            fill="none"
            opacity="0.9"
          />
          <circle
            cx="44"
            cy="44"
            r={r}
            stroke={strokeColor}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            transform="rotate(-90 44 44)"
          />
        </svg>
      </div>

      {/* Progressive disclosure: details only on hover */}
      <div className="mt-4 hidden rounded-xl bg-white/5 p-4 text-[14px] font-normal text-slate-200 ring-1 ring-(--pkf-border) group-hover:block">
        {description}
      </div>
    </div>
  )
}
