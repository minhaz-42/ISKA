import React from 'react'
import { PKF_TOKENS } from '../styles/tokens'

type RingTone = 'healthy' | 'neutral' | 'attention'

function ringColor(tone: RingTone): string {
  if (tone === 'healthy') return 'var(--pkf-healthy)'
  if (tone === 'neutral') return 'var(--pkf-neutral)'
  return 'var(--pkf-attention)'
}

function SoftRing(props: {
  label: string
  tone: RingTone
  // No numeric display; this is only a soft visual cue.
  progress01: number
  help: string
}) {
  const { label, tone, progress01, help } = props

  const size = PKF_TOKENS.ring.sizePx
  const strokeWidth = PKF_TOKENS.ring.strokeWidthPx
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(1, progress01))
  const dash = circumference * clamped

  // Calm design note: we use a small tooltip (not a modal)
  // and keep the ring non-quantitative (no numbers shown).
  return (
    <div className="relative">
      <div className="group rounded-2xl bg-(--pkf-overlay) p-4 ring-1 ring-(--pkf-border)">
        <div className="flex items-center gap-4">
          <div className="relative" style={{ width: size, height: size }} aria-hidden>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="transparent"
                stroke="var(--pkf-border)"
                strokeWidth={strokeWidth}
                opacity={0.7}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="transparent"
                stroke={ringColor(tone)}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference}`}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="text-[14px] font-medium text-(--pkf-text-strong)">{label}</div>
            <div className="mt-1 text-[13px] text-(--pkf-text-muted)">Hover or focus for an explanation.</div>
          </div>
        </div>

        {/* Tooltip */}
        <div className="pointer-events-none absolute left-0 top-full z-10 mt-2 hidden w-[min(320px,90vw)) rounded-2xl bg-(--pkf-card) p-4 text-[13px] text-(--pkf-text) ring-1 ring-(--pkf-border) group-hover:block group-focus-within:block">
          {help}
        </div>
      </div>
    </div>
  )
}

export function Home() {
  return (
    <div>
      <h2 className="text-[24px] font-medium text-(--pkf-text-strong)">Your information diet</h2>

      <div className="mt-6 pkf-card p-6">
        <div className="text-[15px] font-medium text-(--pkf-text-strong)">Status</div>
        <div className="mt-2 text-[14px] text-(--pkf-text)">
          Your recent reading is mostly diverse, with some emotionally loaded content.
        </div>
        <div className="mt-3 text-[13px] text-(--pkf-text-muted)">
          Calm note: these are signals, not judgments.
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <SoftRing
          label="Novelty"
          tone="healthy"
          progress01={PKF_TOKENS.ring.demoProgress.novelty}
          help="Novelty estimates how often you’re encountering new ideas versus repeated phrasing. Higher novelty can support learning and curiosity."
        />
        <SoftRing
          label="Cognitive load"
          tone="neutral"
          progress01={PKF_TOKENS.ring.demoProgress.cognitiveLoad}
          help="Cognitive load reflects how dense or demanding a snippet feels. Dense text can still be valuable; this signal simply suggests pacing and breaks."
        />
        <SoftRing
          label="Misinformation signals"
          tone="attention"
          progress01={PKF_TOKENS.ring.demoProgress.misinformationSignals}
          help="These signals look for patterns that sometimes correlate with persuasion techniques. It does not claim something is true or false; it invites a second look."
        />
      </div>
    </div>
  )
}
