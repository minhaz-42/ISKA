import React from 'react'
import { InsightCard, CalmNotice, SoftButton } from '../design/components'
import { BookOpen, Clock, FileText, TrendingUp } from 'lucide-react'

export function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-(--pkf-text-strong)">
          Reading activity
        </h1>
        <p className="mt-2 text-[14px] text-(--pkf-text-muted)">
          A calm overview of your information patterns.
        </p>
      </div>

      {/* Quick Stats - Text-first, no charts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<FileText className="h-4 w-4" />}
          label="Documents"
          value="12"
          detail="this month"
        />
        <StatCard
          icon={<BookOpen className="h-4 w-4" />}
          label="Words read"
          value="~24k"
          detail="estimated"
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Reading time"
          value="~2h"
          detail="this week"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Patterns noticed"
          value="5"
          detail="insights"
        />
      </div>

      {/* Calm Notice */}
      <CalmNotice tone="tip" title="How this works">
        We analyze visible content to surface patterns — not to judge or block. You decide what
        matters.
      </CalmNotice>

      {/* Recent Insights */}
      <section>
        <h2 className="mb-4 text-[16px] font-medium text-(--pkf-text-strong)">
          Recent insights
        </h2>

        <div className="space-y-3">
          <InsightCard
            title="Similar phrasing detected"
            summary="Two recent articles share overlapping language patterns."
            explanation="This doesn't mean either is wrong — it could be a common narrative, syndicated content, or coincidence. We're just noting the pattern for your awareness."
            tone="info"
            timestamp="2h ago"
          />

          <InsightCard
            title="Higher reading density"
            summary="This document has longer sentences than your usual reading."
            explanation="Denser text isn't inherently bad — academic papers and technical docs often read this way. We flag it so you can pace yourself if needed."
            tone="neutral"
            timestamp="Yesterday"
          />

          <InsightCard
            title="New topic area"
            summary="This content introduces concepts you haven't encountered before."
            explanation="Seeing new topics is often valuable — it could mean you're expanding your knowledge. We highlight novelty so you're aware of it."
            tone="success"
            timestamp="2 days ago"
          />
        </div>
      </section>

      {/* Empty State Placeholder */}
      <section className="rounded-2xl bg-(--pkf-surface) p-8 text-center ring-1 ring-(--pkf-border)">
        <p className="text-[14px] text-(--pkf-text-muted)">
          Add more documents to see richer patterns over time.
        </p>
        <SoftButton variant="subtle" size="sm" className="mt-4">
          Add content
        </SoftButton>
      </section>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-2xl bg-(--pkf-card)) p-5 ring-1 ring-(--pkf-border)">
      <div className="flex items-center gap-2 text-(--pkf-text-subtle)">
        {icon}
        <span className="text-[13px]">{label}</span>
      </div>
      <div className="mt-2 text-[24px] font-semibold text-(--pkf-text-strong)">{value}</div>
      <div className="mt-1 text-[12px] text-(--pkf-text-muted)">{detail}</div>
    </div>
  )
}
