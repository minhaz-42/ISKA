import React from 'react'

export function QuickStartCard() {
  return (
    <section className="pkf-glass rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Quick start</h2>
          <p className="mt-1 text-sm text-slate-300/80">Upload or paste content to score it.</p>
        </div>
        <div className="hidden sm:block rounded-full bg-gradient-to-r from-orange-400/20 to-red-500/20 px-3 py-1 text-xs text-slate-200 ring-1 ring-white/10">
          Developer-friendly
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="pkf-ring rounded-xl bg-white/5 p-3">
          <div className="text-sm font-semibold">
            <span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-orange-500/15 text-orange-200 ring-1 ring-orange-400/30">
              1
            </span>
            Add content (Upload or Paste)
          </div>
        </div>
        <div className="pkf-ring rounded-xl bg-white/5 p-3">
          <div className="text-sm font-semibold">
            <span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-orange-500/15 text-orange-200 ring-1 ring-orange-400/30">
              2
            </span>
            PKF normalizes + analyzes it
          </div>
        </div>
        <div className="pkf-ring rounded-xl bg-white/5 p-3">
          <div className="text-sm font-semibold">
            <span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-orange-500/15 text-orange-200 ring-1 ring-orange-400/30">
              3
            </span>
            Review recent documents + scores
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-orange-400/20 bg-orange-500/10 p-3 text-sm text-slate-200">
        <span className="font-semibold text-orange-200">Tip:</span> use <span className="font-mono">auto</span> content type for uploads; it detects PDF, DOCX, HTML, Markdown, Text.
      </div>
    </section>
  )
}
