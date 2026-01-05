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
    bg: 'bg-[var(--pkf-warning-subtle)]',
    text: 'text-[var(--pkf-warning)]',
    dot: 'bg-[var(--pkf-warning)]',
  },
  ai: {
    bg: 'bg-[var(--pkf-secondary-subtle)]',
    text: 'text-[var(--pkf-secondary)]',
    dot: 'bg-[var(--pkf-secondary)]',
  },
  repetition: {
    bg: 'bg-[var(--pkf-info-subtle)]',
    text: 'text-[var(--pkf-info)]',
    dot: 'bg-[var(--pkf-info)]',
  },
  density: {
    bg: 'bg-[var(--pkf-overlay)]',
    text: 'text-[var(--pkf-text-muted)]',
    dot: 'bg-[var(--pkf-text-subtle)]',
  },
  neutral: {
    bg: 'bg-[var(--pkf-overlay)]',
    text: 'text-[var(--pkf-text-muted)]',
    dot: 'bg-[var(--pkf-text-subtle)]',
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
