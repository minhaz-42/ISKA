import React from 'react'
import { SubtleToggle, ReadingSignalBadge, CalmNotice, ExplanationBox } from '../design/components'
import { Eye } from 'lucide-react'

export function LiveMonitor() {
  const [enabled, setEnabled] = React.useState(true)
  const [showDensity, setShowDensity] = React.useState(true)
  const [showPatterns, setShowPatterns] = React.useState(true)
  const [showRepetition, setShowRepetition] = React.useState(false)

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-(--pkf-text-strong)">Live monitor</h1>
          <p className="mt-2 text-[14px] text-(--pkf-text-muted)">
            Subtle signals while you read, explanation first.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${enabled ? 'bg-(--pkf-success))' : 'bg-(--pkf-text-subtle)'}`}
          />
          <span className="text-[13px] text-(--pkf-text-muted)">
            {enabled ? 'Active' : 'Paused'}
          </span>
        </div>
      </div>

      {/* Main Toggle */}
      <div className="rounded-2xl bg-(--pkf-card)) p-6 ring-1 ring-(--pkf-border)">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--pkf-primary-subtle)">
              <Eye className="h-5 w-5 text-(--pkf-primary)" />
            </div>
            <div>
              <h2 className="text-[15px] font-medium text-(--pkf-text-strong)">
                Enable live monitor
              </h2>
              <p className="text-[13px] text-(--pkf-text-muted)">
                Show signals on pages you read
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
            className={`pkf-focus relative h-8 w-14 rounded-full transition-colors ${
              enabled
                ? 'bg-(--pkf-primary)'
                : 'bg-(--pkf-overlay) ring-1 ring-(--pkf-border)'
            }`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-all ${
                enabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Signal Types */}
      <section>
        <h2 className="mb-4 text-[16px] font-medium text-(--pkf-text-strong)">Signal types</h2>
        <div className="space-y-3">
          <SubtleToggle
            checked={showDensity}
            onChange={setShowDensity}
            label="Reading density"
            description="Highlights when text is denser than your usual reading patterns."
          />
          <SubtleToggle
            checked={showPatterns}
            onChange={setShowPatterns}
            label="Persuasion patterns"
            description="Notes when text uses common persuasive structures."
          />
          <SubtleToggle
            checked={showRepetition}
            onChange={setShowRepetition}
            label="Repetition detection"
            description="Flags content similar to things you've read before."
          />
        </div>
      </section>

      {/* Preview */}
      <section>
        <h2 className="mb-4 text-[16px] font-medium text-(--pkf-text-strong)">
          Signal preview
        </h2>

        <div className="rounded-2xl bg-(--pkf-surface) p-6 ring-1 ring-(--pkf-border)">
          <p className="text-[14px] text-(--pkf-text) leading-relaxed mb-4">
            This is an example paragraph. When signals are enabled, you might see subtle indicators
            like these:
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            <ReadingSignalBadge type="density" label="Higher density" />
            <ReadingSignalBadge type="pattern" label="Persuasive structure" />
            <ReadingSignalBadge type="ai" label="AI-like phrasing" />
            <ReadingSignalBadge type="repetition" label="Similar to recent" />
          </div>

          <ExplanationBox title="Why this signal?">
            Signals are based on patterns, not judgments. A "higher density" note simply means the
            text is more complex than average — which may be exactly what you want.
          </ExplanationBox>
        </div>
      </section>

      {/* Info Notice */}
      <CalmNotice tone="info">
        Signals appear inline while you browse with the extension. They're designed to be
        dismissible and never block your reading.
      </CalmNotice>
    </div>
  )
}
