import React from 'react'
import { CheckCircle2, Clock3, AlertTriangle, XCircle } from 'lucide-react'

export type DocumentRow = {
  id: string
  title: string
  type: string
  words: number
  processed: 'yes' | 'pending' | 'error'
  value: number | null
}

function valueTone(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return 'text-slate-300'
  if (value >= 0.75) return 'text-emerald-300'
  if (value >= 0.5) return 'text-orange-300'
  return 'text-rose-300'
}

function processedBadge(state: DocumentRow['processed']) {
  if (state === 'yes') {
    return {
      icon: CheckCircle2,
      label: 'Yes',
      cls: 'bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-400/20',
    }
  }
  if (state === 'pending') {
    return {
      icon: Clock3,
      label: 'Pending',
      cls: 'bg-amber-500/10 text-amber-200 ring-1 ring-amber-400/20',
    }
  }
  return {
    icon: XCircle,
    label: 'Error',
    cls: 'bg-rose-500/10 text-rose-200 ring-1 ring-rose-400/20',
  }
}

function typeBadge(type: string): string {
  const t = type.toLowerCase()
  if (t === 'pdf') return 'bg-white/5 text-slate-100 ring-white/10'
  if (t === 'docx') return 'bg-white/5 text-slate-100 ring-white/10'
  if (t === 'web' || t === 'html') return 'bg-cyan-500/10 text-cyan-200 ring-cyan-300/20'
  if (t === 'markdown' || t === 'md') return 'bg-indigo-500/10 text-indigo-200 ring-indigo-300/20'
  return 'bg-white/5 text-slate-100 ring-white/10'
}

export function DocumentTable(props: { rows: DocumentRow[]; emptyState?: React.ReactNode }) {
  if (!props.rows.length) {
    return (
      <section className="pkf-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-50">Recent documents</h3>
            <p className="mt-1 text-sm text-slate-300">Latest 25 ingested items.</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 text-amber-200">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-5 rounded-xl bg-white/5 p-4 text-sm text-slate-200 ring-1 ring-white/10">
          {props.emptyState ?? (
            <div>
              <p className="font-medium text-slate-50">No documents yet.</p>
              <p className="mt-1 text-slate-300">Upload or paste content to see analysis and scores here.</p>
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="pkf-card p-0">
      <div className="p-6">
        <h3 className="text-base font-semibold text-slate-50">Recent documents</h3>
        <p className="mt-1 text-sm text-slate-300">Latest 25 ingested items.</p>
      </div>

      <div className="max-h-105 overflow-auto rounded-b-2xl">
        <table className="w-full border-separate border-spacing-0 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur ring-1 ring-white/10">
            <tr>
              <th className="px-6 py-3 font-medium text-slate-300">Title</th>
              <th className="px-6 py-3 font-medium text-slate-300">Type</th>
              <th className="px-6 py-3 font-medium text-slate-300">Words</th>
              <th className="px-6 py-3 font-medium text-slate-300">Processed</th>
              <th className="px-6 py-3 font-medium text-slate-300">Value</th>
            </tr>
          </thead>
          <tbody>
            {props.rows.map((r) => {
              const badge = processedBadge(r.processed)
              const ProcIcon = badge.icon
              const valueText = r.value === null ? '—' : r.value.toFixed(2)

              return (
                <tr key={r.id} className="group">
                  <td className="border-t border-white/5 px-6 py-3">
                    <div className="max-w-105 truncate text-slate-100" title={r.title}>
                      {r.title}
                    </div>
                  </td>
                  <td className="border-t border-white/5 px-6 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ring-1 ${typeBadge(r.type)}`}>
                      {r.type}
                    </span>
                  </td>
                  <td className="border-t border-white/5 px-6 py-3 font-mono text-slate-200">{r.words.toLocaleString()}</td>
                  <td className="border-t border-white/5 px-6 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${badge.cls}`}>
                      <ProcIcon className="h-3.5 w-3.5" />
                      {badge.label}
                    </span>
                  </td>
                  <td className={`border-t border-white/5 px-6 py-3 font-mono ${valueTone(r.value)}`}>{valueText}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <style>{`
        tr.group:hover td { background: rgba(255,255,255,0.03); }
      `}</style>
    </section>
  )
}
