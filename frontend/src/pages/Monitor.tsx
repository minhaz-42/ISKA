import React from 'react'
import { InsightToast, type MonitorInsight } from '../components/InsightToast'
import { MonitorToggle } from '../components/MonitorToggle'
import { PKF_TOKENS } from '../styles/tokens'

function nowIso(): string {
  return new Date().toISOString()
}

function sampleInsights(): Omit<MonitorInsight, 'id' | 'createdAtIso'>[] {
  return [
    {
      type: 'persuasion',
      title: 'This content shows strong persuasion techniques',
      explanation: 'It uses emotionally loaded phrasing and urgent framing that can steer interpretation.',
      affectedText: '“You must act now — everyone is finally waking up.”',
      whatCouldBeWrong: 'Opinion writing and storytelling can legitimately use strong language.',
      confidence01: 0.6,
    },
    {
      type: 'ai',
      title: 'This text appears statistically similar to AI-generated writing',
      explanation: 'The phrasing is unusually uniform and uses repeated structure across sentences.',
      affectedText: '“In conclusion, it is important to note that…”',
      whatCouldBeWrong: 'Short snippets and formal writing can look templated even when human-written.',
      confidence01: 0.5,
    },
    {
      type: 'repetition',
      title: 'This looks similar to content you saw recently',
      explanation: 'Several phrases match wording patterns from other pages you viewed.',
      affectedText: '“The secret to success is consistency, consistency, consistency.”',
      whatCouldBeWrong: 'Repetition can be intentional (summaries, study materials, or recaps).',
      confidence01: 0.45,
    },
    {
      type: 'cognitive_load',
      title: 'This snippet may indicate higher cognitive load',
      explanation: 'Long sentences and dense concepts can increase effort and reduce retention.',
      affectedText: '“A multi-factorial, cross-disciplinary synthesis implies…”',
      whatCouldBeWrong: 'Dense text can be valuable; this is only a pacing hint.',
      confidence01: 0.4,
    },
  ]
}

export function Monitor() {
  const [enabled, setEnabled] = React.useState(false)
  const [toasts, setToasts] = React.useState<MonitorInsight[]>([])

  // UI-only simulation of incoming insights.
  React.useEffect(() => {
    if (!enabled) return

    const options = sampleInsights()
    let idx = 0

    const interval = window.setInterval(() => {
      const base = options[idx % options.length]
      idx += 1

      const next: MonitorInsight = {
        ...base,
        id: `${Date.now()}-${idx}`,
        createdAtIso: nowIso(),
      }

      setToasts((prev) => [next, ...prev].slice(0, PKF_TOKENS.limits.toastStack))

      // Auto-dismiss after 5 seconds (strict).
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== next.id))
      }, PKF_TOKENS.motionMs.toastTtl)
    }, PKF_TOKENS.motionMs.mockInsightCadence)

    return () => window.clearInterval(interval)
  }, [enabled])

  return (
    <div>
      <h2 className="text-[24px] font-medium text-(--pkf-text-strong)">Live monitor</h2>

      <div className="mt-4">
        <MonitorToggle enabled={enabled} onToggle={setEnabled} />
        <div className="mt-3 text-[13px] text-(--pkf-text-muted)">
          We only analyze visible content. Nothing is stored without your consent.
        </div>
      </div>

      <div className="mt-6 pkf-card p-6">
        <div className="text-[15px] font-medium text-(--pkf-text-strong)">How signals appear</div>
        <div className="mt-2 text-[14px] text-(--pkf-text)">
          When the monitor is on, you’ll see small toasts in the bottom-right. They never block your screen.
        </div>
        <div className="mt-2 text-[13px] text-(--pkf-text-muted)">
          Calm language only: signals describe patterns and include what could be wrong.
        </div>
      </div>

      {/* Toast stack: bottom-right, dismissible, auto-dismiss */}
      <div className="fixed bottom-5 right-5 z-50 w-90 max-w-[90vw] space-y-3">
        {toasts.map((insight) => (
          <InsightToast key={insight.id} insight={insight} onDismiss={() => setToasts((prev) => prev.filter((x) => x.id !== insight.id))} />
        ))}
      </div>
    </div>
  )
}
