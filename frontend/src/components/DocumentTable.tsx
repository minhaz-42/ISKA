import React from 'react'
import type { Document } from '../services/types'
import { CheckCircle2, Clock3, XCircle } from 'lucide-react'

function valueTone(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'text-slate-400'
  if (value >= 0.6) return 'text-emerald-300'
  if (value >= 0.3) return 'text-amber-300'
  return 'text-slate-300'
}

export function DocumentTable(props: { docs: Document[] }) {
  const { docs } = props

  return (
    <div className="pkf-glass rounded-2xl">
      <div className="flex items-baseline justify-between gap-4 px-5 pt-5">
        <div>
          <h2 className="text-lg font-semibold">Recent documents</h2>
          <p className="mt-1 text-sm text-slate-300/80">Latest 25 ingested items.</p>
        </div>
      </div>

      <div className="mt-4 overflow-auto rounded-2xl">
        <table className="min-w-[860px] w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="bg-[#0b0f14]/80 backdrop-blur px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 ring-1 ring-white/5">
                Title
              </th>
              <th className="bg-[#0b0f14]/80 backdrop-blur px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 ring-1 ring-white/5">
                Type
              </th>
              <th className="bg-[#0b0f14]/80 backdrop-blur px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 ring-1 ring-white/5">
                Words
              </th>
              <th className="bg-[#0b0f14]/80 backdrop-blur px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 ring-1 ring-white/5">
                Processed
              </th>
              <th className="bg-[#0b0f14]/80 backdrop-blur px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 ring-1 ring-white/5">
                Value
              </th>
            </tr>
          </thead>

          <tbody>
            {docs.map((d) => {
              const value = d.score?.overall_value_score ?? null
              const processed = d.is_processed

              return (
                <tr key={d.id} className="transition hover:bg-white/5">
                  <td className="px-5 py-3 align-top text-sm">
                    <div className="max-w-[520px] truncate" title={d.title || 'Untitled'}>
                      {d.title || 'Untitled'}
                    </div>
                  </td>

                  <td className="px-3 py-3 align-top text-sm">
                    <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-1 text-xs font-semibold text-slate-200 ring-1 ring-white/10">
                      {d.content_type}
                    </span>
                  </td>

                  <td className="px-3 py-3 align-top text-right text-sm font-mono tabular-nums text-slate-200">
                    {d.word_count}
                  </td>

                  <td className="px-3 py-3 align-top text-sm">
                    {processed ? (
                      <span className="inline-flex items-center gap-2 text-emerald-300">
                        <CheckCircle2 className="h-4 w-4" /> yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-amber-300">
                        <Clock3 className="h-4 w-4" /> no
                      </span>
                    )}
                  </td>

                  <td className={`px-5 py-3 align-top text-right text-sm font-mono tabular-nums ${valueTone(value)}`}>
                    {typeof value === 'number' ? value.toFixed(2) : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {docs.length === 0 ? (
          <div className="px-5 py-10 text-sm text-slate-400">No documents yet. Upload a file or paste content to get started.</div>
        ) : null}
      </div>
    </div>
  )
}
