import React from 'react'

// Calm design note: This is a single button (not a switch UI library)
// to keep the interaction predictable and non-alarming.
export function MonitorToggle(props: {
  enabled: boolean
  onToggle: (next: boolean) => void
}) {
  const { enabled, onToggle } = props

  return (
    <button
      type="button"
      className={
        'pkf-focus w-full rounded-full px-5 py-4 text-left text-[15px] font-medium transition active:translate-y-px ' +
        (enabled
          ? 'bg-(--pkf-primary) text-(--pkf-text-strong) hover:brightness-105'
          : 'bg-(--pkf-overlay) text-(--pkf-text) ring-1 ring-(--pkf-border) hover:bg-(--pkf-overlay-hover)')
      }
      onClick={() => onToggle(!enabled)}
      aria-pressed={enabled}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div>Live monitor is {enabled ? 'on' : 'off'}</div>
          <div
            className={
              'mt-1 text-[13px] font-normal ' +
              (enabled ? 'text-(--pkf-text-strong) opacity-80' : 'text-(--pkf-text-muted)')
            }
          >
            {enabled
              ? 'You’ll see calm signals when patterns appear.'
              : 'Turn on to receive gentle, explanation-first signals.'}
          </div>
        </div>

        {/* Visual toggle affordance (no alarms, no red/green). */}
        <div
          className={
            'relative h-8 w-14 rounded-full ring-1 transition ' +
            (enabled ? 'bg-(--pkf-overlay-hover) ring-(--pkf-border)' : 'bg-(--pkf-overlay) ring-(--pkf-border)')
          }
          aria-hidden
        >
          <div
            className={
              'absolute top-1 h-6 w-6 rounded-full bg-(--pkf-card) ring-1 ring-(--pkf-border) transition ' +
              (enabled ? 'left-7' : 'left-1')
            }
          />
        </div>
      </div>
    </button>
  )
}
