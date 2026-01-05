import React from 'react'

type SignalType = 'pattern' | 'ai' | 'repetition' | 'density' | 'neutral'

interface ReadingSignalBadgeProps {
  type: SignalType
  label: string
  subtle?: boolean
  className?: string
}

const signalStyles: Record<SignalType, { bg: string; text: string; dot: string }> = {
  pattern: {
    bg: 'bg-(--pkf-warning-subtle))',
    text: 'text-(--pkf-warning))',
    dot: 'bg-(--pkf-warning))',
  },
  ai: {
    bg: 'bg-(--pkf-secondary-subtle))',
    text: 'text-(--pkf-secondary))',
    dot: 'bg-(--pkf-secondary))',
  },
  repetition: {
    bg: 'bg-(--pkf-info-subtle))',
    text: 'text-(--pkf-info))',
    dot: 'bg-(--pkf-info))',
  },
  density: {
    bg: 'bg-(--pkf-overlay)',
    text: 'text-(--pkf-text-muted)',
    dot: 'bg-(--pkf-text-subtle)',
  },
  neutral: {
    bg: 'bg-(--pkf-overlay)',
    text: 'text-(--pkf-text-muted)',
    dot: 'bg-(--pkf-text-subtle)',
  },
}

export function ReadingSignalBadge({
  type,
  label,
  subtle = false,
  className = '',
}: ReadingSignalBadgeProps) {
  const styles = signalStyles[type]

  if (subtle) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-[12px] ${styles.text} ${className}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
        {label}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${styles.bg} ${styles.text} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
      {label}
    </span>
  )
}
