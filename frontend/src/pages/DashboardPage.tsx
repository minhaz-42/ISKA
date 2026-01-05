import React from 'react'
import {
  Flame,
  Shield,
  BookOpen,
  FileText,
  Brain,
  Sparkles,
  Layers,
  Repeat2,
  GitCompareArrows,
} from 'lucide-react'

import { DocumentTable, PasteCard, StatCard, UploadCard, type DocumentRow } from '../components/dashboard'

function formatInt(n: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n)
}

export function DashboardPage() {
  // UI-only demo data (no backend calls)
  const stats = {
    totalDocuments: 12,
    totalWords: 184_230,
    totalConcepts: 476,
    avgNovelty: 0.62,
    avgDepth: 0.54,
    redundancies7d: 3,
    contradictions7d: 1,
  }

  const rows: DocumentRow[] = React.useMemo(
    () => [
      {
        id: '1',
        title: 'On the Reliability of LLM Evaluation Metrics (notes)',
        type: 'markdown',
        words: 1620,
        processed: 'yes',
        value: 0.78,
      },
      {
        id: '2',
        title: 'A short thread about “AI agent safety” — excerpt',
        type: 'web',
        words: 842,
        processed: 'yes',
        value: 0.58,
      },
      {
        id: '3',
        title: 'Paper draft v3.docx',
        type: 'docx',
        words: 5321,
        processed: 'pending',
        value: null,
      },
      {
        id: '4',
        title: 'Screenshot OCR dump — messy text',
        type: 'text',
        words: 402,
        processed: 'error',
        value: null,
      },
    ],
    [],
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        {/* 1) Header / Hero */}
        <header className="relative overflow-hidden rounded-3xl bg-slate-950 ring-1 ring-white/10">
          <div className="absolute inset-0 bg-linear-to-r from-orange-500/10 via-rose-500/10 to-transparent" />
          <div className="relative p-6 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                    <Flame className="h-6 w-6 text-orange-300" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                      Personal Knowledge Firewall
                    </h1>
                    <p className="mt-1 text-sm text-slate-300">A fiery shield for your knowledge intake.</p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-slate-300">
                  <span className="font-medium text-slate-100">API:</span>{' '}
                  <span className="font-mono text-cyan-200">http://127.0.0.1:8000/api</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-200 ring-1 ring-white/10">
                  <Shield className="h-3.5 w-3.5 text-cyan-200" />
                  Portfolio-ready dashboard UI
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* 2) Quick Start */}
        <section className="mt-8 pkf-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-50">Quick start</h2>
              <p className="mt-1 text-sm text-slate-300">Upload or paste content to score it.</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 text-orange-300">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <ol className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="Quick start steps">
            <li className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 text-cyan-200">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-50">1) Add content</p>
                  <p className="mt-1 text-xs text-slate-300">Upload or paste what you consumed.</p>
                </div>
              </div>
            </li>

            <li className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 text-orange-200">
                  <Brain className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-50">2) PKF normalizes + analyzes</p>
                  <p className="mt-1 text-xs text-slate-300">It scores novelty, depth, and patterns.</p>
                </div>
              </div>
            </li>

            <li className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 text-emerald-200">
                  <BookOpen className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-50">3) Review documents + scores</p>
                  <p className="mt-1 text-xs text-slate-300">See recent items and high-level signals.</p>
                </div>
              </div>
            </li>
          </ol>

          <div className="mt-5 rounded-2xl bg-white/5 p-4 text-sm text-slate-200 ring-1 ring-white/10">
            <span className="font-medium text-slate-50">Tip:</span> use <span className="font-mono">auto</span> content
            type for uploads; it detects PDF, DOCX, HTML, Markdown, Text.
          </div>
        </section>

        {/* 3) Metrics */}
        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-50">Dashboard metrics</h2>
              <p className="mt-1 text-sm text-slate-300">Your intake at a glance (UI mock data).</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Total documents"
              value={formatInt(stats.totalDocuments)}
              icon={Layers}
              tone="neutral"
            />
            <StatCard label="Total words" value={formatInt(stats.totalWords)} icon={FileText} tone="neutral" />
            <StatCard label="Total concepts" value={formatInt(stats.totalConcepts)} icon={BookOpen} tone="neutral" />

            <StatCard
              label="Avg novelty"
              value={stats.avgNovelty.toFixed(2)}
              icon={Sparkles}
              tone="good"
              hint="Novelty: how new or non-redundant this intake appears relative to your recent history."
              meter={{ value: stats.avgNovelty, label: 'Average novelty' }}
            />
            <StatCard
              label="Avg depth"
              value={stats.avgDepth.toFixed(2)}
              icon={Brain}
              tone="good"
              hint="Depth: a heuristic for explanatory richness and concept density (not truth)."
              meter={{ value: stats.avgDepth, label: 'Average depth' }}
            />

            <StatCard
              label="Redundancies (7d)"
              value={formatInt(stats.redundancies7d)}
              icon={Repeat2}
              tone={stats.redundancies7d === 0 ? 'neutral' : stats.redundancies7d <= 2 ? 'warn' : 'bad'}
              hint="Redundancy: repeated content patterns in your recent intake."
            />
            <StatCard
              label="Contradictions (7d)"
              value={formatInt(stats.contradictions7d)}
              icon={GitCompareArrows}
              tone={stats.contradictions7d === 0 ? 'neutral' : stats.contradictions7d <= 1 ? 'warn' : 'bad'}
              hint="Contradictions: conflicting claims detected between items (signal only)."
            />
          </div>
        </section>

        {/* 4) Ingest */}
        <section className="mt-8">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">Ingest</h2>
            <p className="mt-1 text-sm text-slate-300">Upload a file or paste content to analyze.</p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <UploadCard />
            <PasteCard />
          </div>
        </section>

        {/* 5) Recent documents */}
        <section className="mt-8">
          <DocumentTable rows={rows} />
        </section>

        <footer className="mt-10 text-xs text-slate-500">
          PKF UI demo — dark-mode first, Tailwind CSS, Lucide icons.
        </footer>
      </div>
    </div>
  )
}
