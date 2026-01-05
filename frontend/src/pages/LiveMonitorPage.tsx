import React from 'react'

export type LiveInsight = {
  id: string
  type: 'misinformation' | 'ai' | 'repetition' | 'cognitive_load'
  confidence: number
  explanation: string
  affected_text: string
  created_at: string
}

type Toast = {
  key: string
  insight: LiveInsight
  createdAtMs: number
}

function confidenceLabel(conf: number): { label: string; title: string } {
  const c = Number.isFinite(conf) ? Math.max(0, Math.min(1, conf)) : 0
  if (c >= 0.75) return { label: 'higher confidence', title: `Confidence: ${Math.round(c * 100)}%` }
  if (c >= 0.45) return { label: 'moderate confidence', title: `Confidence: ${Math.round(c * 100)}%` }
  return { label: 'lower confidence', title: `Confidence: ${Math.round(c * 100)}%` }
}

function toneForType(type: LiveInsight['type']): { dot: string; title: string } {
  if (type === 'ai') return { dot: 'var(--pkf-secondary)', title: 'Shows signals that may resemble AI-written text' }
  if (type === 'misinformation') return { dot: 'var(--pkf-neutral)', title: 'Shows signals of persuasion techniques' }
  if (type === 'repetition') return { dot: 'var(--pkf-neutral)', title: 'Appears similar to recently seen content' }
  return { dot: 'var(--pkf-healthy)', title: 'May indicate higher cognitive load' }
}

function headline(e: LiveInsight): string {
  if (e.type === 'ai') return 'This text shows signals that may resemble AI writing'
  if (e.type === 'misinformation') return 'This page shows signals of persuasion techniques'
  if (e.type === 'repetition') return 'This looks similar to content you saw recently'
  return 'This snippet may indicate higher cognitive load'
}

function whatCouldBeWrong(e: LiveInsight): string {
  if (e.type === 'ai') return 'Short snippets can look templated even when written by a person.'
  if (e.type === 'misinformation') return 'Strong language can be normal in opinion or storytelling contexts.'
  if (e.type === 'repetition') return 'Repetition can be intentional (summaries, recaps, or study materials).'
  return 'Dense text can be valuable; this is only a pacing hint.'
}

export function LiveMonitorPage(props: {
  enabled: boolean
  onToggle: (next: boolean) => void
  events: LiveInsight[]
  error: string | null
}) {
  const { enabled, onToggle, events, error } = props

  // Toasts: bottom-right, dismissible, auto-fade.
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const seen = React.useRef<Set<string>>(new Set())

  React.useEffect(() => {
    const next: Toast[] = []
    for (const e of events) {
      if (seen.current.has(e.id)) continue
      seen.current.add(e.id)
      next.push({ key: `${e.id}`, insight: e, createdAtMs: Date.now() })
    }
    if (next.length) setToasts((prev) => [...next, ...prev].slice(0, 6))
  }, [events])

  React.useEffect(() => {
    if (!toasts.length) return
    const t = window.setInterval(() => {
      const now = Date.now()
      setToasts((prev) => prev.filter((x) => now - x.createdAtMs < 9000))
    }, 600)
    return () => window.clearInterval(t)
  }, [toasts.length])

  return (
    <div>
      <h2 className="text-[24px] font-medium text-slate-100">Live monitor</h2>
      <p className="mt-2 text-[15px] font-normal text-slate-300">
        We only watch what’s visible. Nothing is stored without your consent.
      </p>

      <div className="mt-6 pkf-card p-6">
        <button
          type="button"
          className={
            'pkf-focus w-full rounded-2xl px-5 py-4 text-left text-[15px] font-medium transition active:translate-y-px ' +
            (enabled
              ? 'bg-(--pkf-primary) text-white ring-1 ring-white/15 hover:brightness-105'
              : 'bg-white/5 text-slate-200 ring-1 ring-(--pkf-border) hover:bg-(--pkf-card-hover)')
          }
          onClick={() => onToggle(!enabled)}
          aria-pressed={enabled}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div>Live Monitor is {enabled ? 'ON' : 'OFF'}</div>
              <div className={'mt-1 text-[13px] font-normal ' + (enabled ? 'text-white/80' : 'text-slate-400')}>
                {enabled
                  ? 'You’ll see calm, dismissible signals when patterns appear.'
                  : 'Turn on to receive gentle, explanation-first signals.'}
              </div>
            </div>
          </div>
        </button>

        <div className="mt-4 text-[13px] text-slate-400">
          Promise: we only analyze visible paragraphs. Nothing is saved unless you choose to save.
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl bg-white/5 p-4 text-[13px] text-slate-200 ring-1 ring-(--pkf-border)">
          {error}
        </div>
      ) : null}

      <div className="mt-6 pkf-card p-6">
        <div className="text-[15px] font-medium text-slate-200">What to expect</div>
        <div className="mt-2 text-[14px] text-slate-300">
          Signals appear as small toasts in the bottom-right. They never block your screen.
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[13px] text-slate-400">
          <li>Each signal includes a reason and a confidence range.</li>
          <li>Every signal includes what could be wrong.</li>
          <li>Dismiss anything that is not helpful.</li>
        </ul>

        {!enabled ? (
          <div className="mt-4 rounded-xl bg-white/5 p-4 text-[13px] text-slate-300 ring-1 ring-(--pkf-border)">
            Live monitor is off.
          </div>
        ) : null}
      </div>

      <div className="fixed bottom-5 right-5 z-50 w-90 max-w-[90vw] space-y-3">
        {toasts.map((t) => {
          const e = t.insight
          const conf = confidenceLabel(e.confidence)
          const tone = toneForType(e.type)
          return (
            <details key={t.key} className="pkf-card pkf-card-hover p-4" style={{ background: 'var(--pkf-card)' }}>
              <summary className="pkf-focus cursor-pointer list-none">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full" style={{ background: tone.dot }} aria-hidden />
                      <div className="text-[14px] font-medium text-slate-100" title={tone.title}>
                        {headline(e)}
                      </div>
                    </div>
                    <div className="mt-1 text-[12px] text-slate-400" title={conf.title}>
                      {conf.label}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="pkf-focus rounded-lg px-2 py-1 text-[12px] text-(--pkf-attention) hover:brightness-110"
                    onClick={(ev) => {
                      ev.preventDefault()
                      ev.stopPropagation()
                      setToasts((prev) => prev.filter((x) => x.key !== t.key))
                    }}
                    aria-label="Dismiss"
                  >
                    Dismiss
                  </button>
                </div>
              </summary>

              <div className="mt-3 rounded-xl bg-white/5 p-3 text-[13px] text-slate-200 ring-1 ring-(--pkf-border)">
                <div className="text-slate-300">Why it was flagged</div>
                <div className="mt-1 text-slate-200">{e.explanation}</div>
              </div>

              <div className="mt-3 rounded-xl bg-white/5 p-3 text-[13px] text-slate-200 ring-1 ring-(--pkf-border)">
                <div className="text-slate-300">Snippet</div>
                <div className="mt-1 text-slate-200">{e.affected_text}</div>
              </div>

              <div className="mt-3 text-[12px] text-slate-400">
                <span className="text-slate-300">What could be wrong:</span> {whatCouldBeWrong(e)}
              </div>
            </details>
          )
        })}
      </div>
    </div>
  )
}
