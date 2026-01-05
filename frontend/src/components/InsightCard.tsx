import React from 'react'
import { CheckCircle2, EyeOff } from 'lucide-react'

export type InsightCardConfidence = 'Low confidence' | 'Moderate confidence' | 'High confidence'

export function InsightCard(props: {
  title: string
  explanation: string
  confidence: InsightCardConfidence
  affectedText: string
  details: string
}) {
  const { title, explanation, confidence, affectedText, details } = props

  // Calm design note: We keep the first view light and sentence-based.
  // Details, highlights, and actions are shown only when expanded.
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div className="pkf-card p-5">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="pkf-focus w-full text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[15px] font-medium text-(--pkf-text-strong)">{title}</div>
            <div className="mt-1 text-[13px] text-(--pkf-text)">{explanation}</div>
          </div>

          <div className="shrink-0 rounded-full bg-(--pkf-overlay) px-3 py-1 text-[12px] text-(--pkf-text-muted) ring-1 ring-(--pkf-border)">
            {confidence}
          </div>
        </div>
      </button>

      {expanded ? (
        <div className="mt-4">
          <div className="rounded-xl bg-(--pkf-overlay) p-3 text-[13px] text-(--pkf-text) ring-1 ring-(--pkf-border)">
            <div className="text-(--pkf-text-muted)">Affected text</div>
            <div className="mt-1 underline decoration-(--pkf-secondary-muted) decoration-2 underline-offset-4">
              {affectedText}
            </div>
          </div>

          <div className="mt-3 rounded-xl bg-(--pkf-overlay) p-3 text-[13px] text-(--pkf-text) ring-1 ring-(--pkf-border)">
            <div className="text-(--pkf-text-muted)">Details</div>
            <div className="mt-1">{details}</div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="pkf-focus inline-flex items-center gap-2 rounded-xl bg-(--pkf-primary) px-4 py-2 text-[13px] font-medium text-(--pkf-text-strong) transition hover:brightness-105 active:translate-y-px"
              onClick={() => {
                // UI-only action.
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark as helpful
            </button>

            <button
              type="button"
              className="pkf-focus inline-flex items-center gap-2 rounded-xl bg-(--pkf-overlay) px-4 py-2 text-[13px] font-medium text-(--pkf-text) ring-1 ring-(--pkf-border) transition hover:bg-(--pkf-overlay-hover) active:translate-y-px"
              onClick={() => {
                // UI-only action.
              }}
            >
              <EyeOff className="h-4 w-4" />
              Ignore this pattern
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
