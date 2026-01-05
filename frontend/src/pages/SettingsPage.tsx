import React from 'react'

type ToggleKey = 'ai' | 'misinfo' | 'emotion'

type Toggles = Record<ToggleKey, boolean>

function ToggleRow(props: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  const { label, description, checked, onChange } = props
  return (
    <div className="pkf-card pkf-card-hover flex items-start justify-between gap-4 p-6">
      <div>
        <div className="text-[15px] font-medium text-slate-100">{label}</div>
        <div className="mt-2 text-[14px] font-normal text-slate-300">{description}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={
          'pkf-focus h-8 w-14 rounded-full p-1 ring-1 transition ' +
          (checked
            ? 'bg-[rgba(122,162,247,0.25)) ring-[rgba(122,162,247,0.35))'
            : 'bg-white/5 ring-(--pkf-border)')
        }
        aria-pressed={checked}
      >
        <span
          className={
            'block h-6 w-6 rounded-full bg-slate-100/90 shadow-sm transition ' +
            (checked ? 'translate-x-6 ring-1 ring-[rgba(122,162,247,0.35))' : 'translate-x-0 ring-1 ring-(--pkf-border)')
          }
        />
      </button>
    </div>
  )
}

export function SettingsPage() {
  const [toggles, setToggles] = React.useState<Toggles>(() => {
    const raw = localStorage.getItem('pkf:toggles')
    if (raw) {
      try {
        return JSON.parse(raw) as Toggles
      } catch {
        // ignore
      }
    }
    return { ai: true, misinfo: true, emotion: true }
  })

  React.useEffect(() => {
    localStorage.setItem('pkf:toggles', JSON.stringify(toggles))
  }, [toggles])

  return (
    <div>
      <h2 className="text-[24px] font-medium text-slate-100">Settings & transparency</h2>
      <p className="mt-2 text-[15px] font-normal text-slate-300">
        PKF should feel trustworthy. Here’s what it does, what it never does, and how signals are produced.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4">
        <div className="pkf-card p-6">
          <div className="text-[15px] font-medium text-slate-100">What PKF analyzes</div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-[14px] text-slate-300">
            <li>Repetition and overlap with what you’ve already read</li>
            <li>Signals of emotional persuasion techniques (explainable)</li>
            <li>Structure patterns that resemble AI-generated text (signals only)</li>
            <li>Cognitive load (how mentally demanding it may feel)</li>
          </ul>
        </div>

        <div className="pkf-card p-6">
          <div className="text-[15px] font-medium text-slate-100">What PKF never does</div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-[14px] text-slate-300">
            <li>Blocks content or tells you what to think</li>
            <li>Judges opinions, politics, or morality</li>
            <li>Claims truth (“fake news”) or certainty</li>
            <li>Logs keystrokes, DMs, or private messages</li>
          </ul>
        </div>

        <div className="pkf-card p-6">
          <div className="text-[15px] font-medium text-slate-100">Data storage</div>
          <div className="mt-3 text-[14px] text-slate-300">
            Local-only by default. Live monitor does not write to the database unless you explicitly save something.
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <ToggleRow
            label="AI-content detection"
            description="Signals only. Always includes a reason + confidence."
            checked={toggles.ai}
            onChange={(v) => setToggles((t) => ({ ...t, ai: v }))}
          />
          <ToggleRow
            label="Misinformation signals"
            description="We do not claim truth—only pattern resemblance."
            checked={toggles.misinfo}
            onChange={(v) => setToggles((t) => ({ ...t, misinfo: v }))}
          />
          <ToggleRow
            label="Emotional manipulation detection"
            description="Flags urgency/outage tactics with explanation."
            checked={toggles.emotion}
            onChange={(v) => setToggles((t) => ({ ...t, emotion: v }))}
          />
        </div>

        <div className="pkf-card p-6">
          <div className="text-[15px] font-medium text-slate-100">Model transparency</div>
          <div className="mt-3 text-[14px] text-slate-300">
            Current build uses lightweight heuristics and existing NLP scoring. When models are added, we’ll list them here with limitations.
          </div>
        </div>
      </div>
    </div>
  )
}
