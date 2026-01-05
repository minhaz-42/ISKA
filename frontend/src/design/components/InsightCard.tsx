import React from 'react'
import { ChevronDown } from 'lucide-react'

type InsightTone = 'neutral' | 'success' | 'warning' | 'info'

interface InsightCardProps {
  title: string
  summary: string
  explanation?: string
  tone?: InsightTone
  timestamp?: string
  expandable?: boolean
  actions?: React.ReactNode
}

const toneDot: Record<InsightTone, string> = {
  neutral: 'bg-[var(--pkf-text-subtle)]',
  success: 'bg-[var(--pkf-success)]',
  warning: 'bg-[var(--pkf-warning)]',
  info: 'bg-[var(--pkf-info)]',
}

export function InsightCard({
  title,
  summary,
  explanation,
  tone = 'neutral',
  timestamp,
  expandable = true,
  actions,
}: InsightCardProps) {
  const [open, setOpen] = React.useState(false)

  const content = (
    <>
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${toneDot[tone]}`} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-medium text-[var(--pkf-text-strong)] leading-snug">
            {title}
          </h3>
          <p className="mt-1 text-[13px] text-[var(--pkf-text-muted)] leading-relaxed">
            {summary}
          </p>
        </div>
        {timestamp && (
          <span className="shrink-0 text-[12px] text-[var(--pkf-text-subtle)]">{timestamp}</span>
        )}
      </div>

      {explanation && open && (
        <div className="mt-3 ml-5 rounded-xl bg-[var(--pkf-overlay)] p-3 text-[13px] text-[var(--pkf-text)] leading-relaxed ring-1 ring-[var(--pkf-border-subtle)]">
          {explanation}
        </div>
      )}

      {actions && <div className="mt-3 ml-5 flex items-center gap-2">{actions}</div>}
    </>
  )

  if (!expandable || !explanation) {
    return (
      <div className="rounded-2xl bg-[var(--pkf-card)] p-4 ring-1 ring-[var(--pkf-border)] transition-colors hover:bg-[var(--pkf-card-hover)]">
        {content}
      </div>
    )
  }

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="group rounded-2xl bg-[var(--pkf-card)] ring-1 ring-[var(--pkf-border)] transition-colors hover:bg-[var(--pkf-card-hover)]"
    >
      <summary className="cursor-pointer p-4 list-none outline-none pkf-focus rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${toneDot[tone]}`} />
            <div className="min-w-0">
              <h3 className="text-[14px] font-medium text-[var(--pkf-text-strong)] leading-snug">
                {title}
              </h3>
              <p className="mt-1 text-[13px] text-[var(--pkf-text-muted)] leading-relaxed">
                {summary}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-[var(--pkf-text-subtle)] transition-transform ${
              open ? 'rotate-180' : ''
            }`}
          />
        </div>
      </summary>
      <div className="px-4 pb-4">
        <div className="ml-5 rounded-xl bg-[var(--pkf-overlay)] p-3 text-[13px] text-[var(--pkf-text)] leading-relaxed ring-1 ring-[var(--pkf-border-subtle)]">
          {explanation}
        </div>
        {actions && <div className="mt-3 ml-5 flex items-center gap-2">{actions}</div>}
      </div>
    </details>
  )
}
