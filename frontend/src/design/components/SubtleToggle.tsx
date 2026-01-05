import React from 'react'

interface SubtleToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}

export function SubtleToggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: SubtleToggleProps) {
  const id = React.useId()

  return (
    <label
      htmlFor={id}
      className={`flex items-start justify-between gap-4 rounded-2xl p-4 ring-1 ring-(--pkf-border) transition-colors ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:bg-(--pkf-surface-hover))'
      }`}
    >
      <div className="min-w-0">
        <div className="text-[14px] font-medium text-(--pkf-text-strong)">{label}</div>
        {description && (
          <p className="mt-1 text-[13px] text-(--pkf-text-muted) leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <button
        id={id}
        role="switch"
        type="button"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`pkf-focus relative shrink-0 h-7 w-12 rounded-full transition-colors ${
          checked ? 'bg-(--pkf-primary)' : 'bg-(--pkf-overlay) ring-1 ring-(--pkf-border)'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </label>
  )
}
