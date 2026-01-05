import React from 'react'
import { X } from 'lucide-react'
import { confidenceToWords } from '../styles/tokens'

export type MonitorInsightType = 'persuasion' | 'ai' | 'repetition' | 'cognitive_load'

export type MonitorInsight = {
  id: string
  type: MonitorInsightType
  title: string
  explanation: string
  affectedText: string
  whatCouldBeWrong: string
  confidence01: number
  createdAtIso: string
}

function toneDot(type: MonitorInsightType): string {
  if (type === 'ai') return 'var(--pkf-secondary)'
  if (type === 'persuasion') return 'var(--pkf-neutral)'
  if (type === 'repetition') return 'var(--pkf-neutral)'
  return 'var(--pkf-healthy)'
}

// Calm design note: Toasts are small and dismissible, never blocking.
export function InsightToast(props: {
  insight: MonitorInsight
  onDismiss: () => void
}) {
  const { insight, onDismiss } = props

  const confidenceWords = confidenceToWords(insight.confidence01)

  return (
    <details className="pkf-card pkf-card-hover p-4">
      <summary className="pkf-focus cursor-pointer list-none">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="mt-1 h-2.5 w-2.5 rounded-full"
                style={{ background: toneDot(insight.type) }}
                aria-hidden
              />
              <div className="text-[14px] font-medium text-(--pkf-text-strong)">{insight.title}</div>
            </div>
            <div className="mt-1 text-[12px] text-(--pkf-text-muted)">{confidenceWords}</div>
          </div>

          <button
            type="button"
            className="pkf-focus rounded-lg p-1 text-(--pkf-text-muted) hover:text-(--pkf-text)"
            onClick={(ev) => {
              ev.preventDefault()
              ev.stopPropagation()
              onDismiss()
            }}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </summary>

      {/* Progressive disclosure: explanation and snippet only when expanded. */}
      <div className="mt-3 rounded-xl bg-(--pkf-overlay) p-3 text-[13px] text-(--pkf-text) ring-1 ring-(--pkf-border)">
        <div className="text-(--pkf-text-muted)">Why it was flagged</div>
        <div className="mt-1">{insight.explanation}</div>
      </div>

      <div className="mt-3 rounded-xl bg-(--pkf-overlay) p-3 text-[13px] text-(--pkf-text) ring-1 ring-(--pkf-border)">
        <div className="text-(--pkf-text-muted)">Affected text</div>
        <div className="mt-1">{insight.affectedText}</div>
      </div>

      <div className="mt-3 text-[12px] text-(--pkf-text-muted)">
        <span className="text-(--pkf-text)">What could be wrong:</span> {insight.whatCouldBeWrong}
      </div>
    </details>
  )
}
