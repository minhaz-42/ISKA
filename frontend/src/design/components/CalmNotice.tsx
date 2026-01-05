import React from 'react'
import { Info, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react'

type NoticeTone = 'info' | 'success' | 'warning' | 'tip'

interface CalmNoticeProps {
  tone?: NoticeTone
  title?: string
  children: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

const toneConfig: Record<NoticeTone, { bg: string; icon: React.ReactNode; iconColor: string }> = {
  info: {
    bg: 'bg-[var(--pkf-info-subtle)]',
    icon: <Info className="h-4 w-4" />,
    iconColor: 'text-[var(--pkf-info)]',
  },
  success: {
    bg: 'bg-[var(--pkf-success-subtle)]',
    icon: <CheckCircle className="h-4 w-4" />,
    iconColor: 'text-[var(--pkf-success)]',
  },
  warning: {
    bg: 'bg-[var(--pkf-warning-subtle)]',
    icon: <AlertCircle className="h-4 w-4" />,
    iconColor: 'text-[var(--pkf-warning)]',
  },
  tip: {
    bg: 'bg-[var(--pkf-overlay)]',
    icon: <Lightbulb className="h-4 w-4" />,
    iconColor: 'text-[var(--pkf-secondary)]',
  },
}

export function CalmNotice({
  tone = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className = '',
}: CalmNoticeProps) {
  const config = toneConfig[tone]

  return (
    <div
      className={`rounded-2xl ${config.bg} p-4 ring-1 ring-[var(--pkf-border-subtle)] ${className}`}
      role="note"
    >
      <div className="flex gap-3">
        <span className={`shrink-0 mt-0.5 ${config.iconColor}`}>{config.icon}</span>
        <div className="min-w-0 flex-1">
          {title && (
            <h4 className="text-[14px] font-medium text-[var(--pkf-text-strong)] mb-1">{title}</h4>
          )}
          <div className="text-[13px] text-[var(--pkf-text)] leading-relaxed">{children}</div>
        </div>
        {dismissible && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="pkf-focus shrink-0 rounded-lg px-2 py-1 text-[12px] text-[var(--pkf-text-muted)] hover:bg-[var(--pkf-overlay-hover)] hover:text-[var(--pkf-text)]"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  )
}
