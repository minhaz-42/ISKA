import React from 'react'
import { InsightCard, CalmNotice, SoftButton, ExplanationBox } from '../design/components'
import { TrendingUp, Calendar, Filter } from 'lucide-react'

export function Insights() {
  const [filter, setFilter] = React.useState<'all' | 'patterns' | 'density' | 'ai'>('all')

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-(--pkf-text-strong)">Insights</h1>
          <p className="mt-2 text-[14px] text-(--pkf-text-muted)">
            Patterns and observations from your reading.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-(--pkf-text-muted)" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="pkf-focus rounded-lg bg-(--pkf-surface) px-3 py-2 text-[13px] text-(--pkf-text) ring-1 ring-(--pkf-border)"
          >
            <option value="all">All insights</option>
            <option value="patterns">Patterns</option>
            <option value="density">Density</option>
            <option value="ai">AI detection</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-(--pkf-card)) p-5 ring-1 ring-(--pkf-border)">
          <div className="flex items-center gap-2 text-(--pkf-text-subtle)">
            <TrendingUp className="h-4 w-4" />
            <span className="text-[13px]">This week</span>
          </div>
          <div className="mt-2 text-[24px] font-semibold text-(--pkf-text-strong)">8</div>
          <div className="mt-1 text-[12px] text-(--pkf-text-muted)">new insights</div>
        </div>

        <div className="rounded-2xl bg-(--pkf-card)) p-5 ring-1 ring-(--pkf-border)">
          <div className="flex items-center gap-2 text-(--pkf-text-subtle)">
            <Calendar className="h-4 w-4" />
            <span className="text-[13px]">This month</span>
          </div>
          <div className="mt-2 text-[24px] font-semibold text-(--pkf-text-strong)">23</div>
          <div className="mt-1 text-[12px] text-(--pkf-text-muted)">total insights</div>
        </div>

        <div className="rounded-2xl bg-(--pkf-card)) p-5 ring-1 ring-(--pkf-border)">
          <div className="flex items-center gap-2 text-(--pkf-text-subtle)">
            <Filter className="h-4 w-4" />
            <span className="text-[13px]">Most common</span>
          </div>
          <div className="mt-2 text-[16px] font-semibold text-(--pkf-text-strong)">
            Persuasion patterns
          </div>
          <div className="mt-1 text-[12px] text-(--pkf-text-muted)">40% of insights</div>
        </div>
      </div>

      {/* Explanation Box */}
      <ExplanationBox title="About these insights" source="PKF analysis engine">
        Insights are observations, not judgments. We notice patterns like repetition, density, and
        persuasive language — but we don't block or shame. You decide what matters.
      </ExplanationBox>

      {/* Insight List */}
      <section>
        <h2 className="mb-4 text-[16px] font-medium text-(--pkf-text-strong)">
          Recent insights
        </h2>

        <div className="space-y-3">
          <InsightCard
            title="Persuasive framing detected"
            summary="This article uses urgency language common in marketing content."
            explanation="Phrases like 'limited time' and 'act now' trigger urgency responses. This isn't inherently bad — sales content often reads this way. We're noting it so you can read with awareness."
            tone="warning"
            timestamp="1h ago"
            actions={
              <SoftButton variant="ghost" size="sm">
                View source
              </SoftButton>
            }
          />

          <InsightCard
            title="High AI probability"
            summary="This text has patterns consistent with AI-generated content."
            explanation="AI detection isn't perfect, but this content scores high on common markers: consistent tone, lack of personal voice, and predictable sentence structures. Human-edited AI content may still trigger this."
            tone="info"
            timestamp="3h ago"
            actions={
              <SoftButton variant="ghost" size="sm">
                Learn more
              </SoftButton>
            }
          />

          <InsightCard
            title="Topic repetition"
            summary="You've read similar content 3 times this week."
            explanation="Repetition isn't wrong — you might be researching a topic deeply. We flag it in case you're stuck in a reading loop or want to diversify your sources."
            tone="neutral"
            timestamp="Yesterday"
          />

          <InsightCard
            title="New perspective detected"
            summary="This article presents a viewpoint you haven't encountered before."
            explanation="Based on your reading history, this content introduces concepts or perspectives that are new to you. This could be valuable for expanding your understanding."
            tone="success"
            timestamp="2 days ago"
          />

          <InsightCard
            title="Dense academic content"
            summary="This paper has significantly higher complexity than your average reading."
            explanation="Academic papers often have longer sentences, more jargon, and denser arguments. Consider reading in shorter sessions or taking notes to improve retention."
            tone="neutral"
            timestamp="3 days ago"
          />
        </div>
      </section>

      {/* Load More */}
      <div className="text-center">
        <SoftButton variant="subtle" size="sm">
          Load more insights
        </SoftButton>
      </div>

      {/* Privacy Notice */}
      <CalmNotice tone="tip">
        Insights are generated locally when possible. We don't store your reading content — only
        anonymized patterns for your personal review.
      </CalmNotice>
    </div>
  )
}
