import React from 'react'
import { BookOpen } from 'lucide-react'

interface ExplanationBoxProps {
  title?: string
  children: React.ReactNode
  source?: string
  className?: string
}

export function ExplanationBox({ title, children, source, className = '' }: ExplanationBoxProps) {
  return (
    <div
      className={`rounded-2xl bg-[var(--pkf-surface)] p-4 ring-1 ring-[var(--pkf-border)] ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 mt-0.5 text-[var(--pkf-text-subtle)]">
          <BookOpen className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          {title && (
            <h4 className="text-[13px] font-medium text-[var(--pkf-text-muted)] uppercase tracking-wide mb-2">
              {title}
            </h4>
          )}
          <div className="text-[14px] text-[var(--pkf-text)] leading-relaxed">{children}</div>
          {source && (
            <p className="mt-3 text-[12px] text-[var(--pkf-text-subtle)]">Source: {source}</p>
          )}
        </div>
      </div>
    </div>
  )
}
