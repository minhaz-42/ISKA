import React from 'react'
import { ClipboardPaste, Send } from 'lucide-react'

export type PasteContentType = 'web' | 'social' | 'text' | 'markdown' | 'html'

const CONTENT_TYPES: { value: PasteContentType; label: string }[] = [
  { value: 'web', label: 'web' },
  { value: 'social', label: 'social' },
  { value: 'text', label: 'text' },
  { value: 'markdown', label: 'markdown' },
  { value: 'html', label: 'html' },
]

type Status = 'idle' | 'processing' | 'success' | 'error'

export function PasteCard() {
  const [contentType, setContentType] = React.useState<PasteContentType>('web')
  const [title, setTitle] = React.useState('')
  const [sourceName, setSourceName] = React.useState('')
  const [sourceUrl, setSourceUrl] = React.useState('')
  const [content, setContent] = React.useState('')
  const [status, setStatus] = React.useState<Status>('idle')
  const [message, setMessage] = React.useState<string | null>(null)

  const isBusy = status === 'processing'

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) {
      setStatus('error')
      setMessage('Paste some content first.')
      return
    }

    setStatus('processing')
    setMessage(null)

    window.setTimeout(() => {
      setStatus('success')
      setMessage('Analyzed.')
    }, 1100)
  }

  return (
    <section className="pkf-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-50">Paste content</h3>
          <p className="mt-1 text-sm text-slate-300">Add text, notes, or a webpage excerpt.</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 text-cyan-200">
          <ClipboardPaste className="h-5 w-5" />
        </div>
      </div>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm text-slate-300">Content type</span>
            <select
              className="mt-2 w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-100 ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-cyan-300/40"
              value={contentType}
              onChange={(e) => setContentType(e.target.value as PasteContentType)}
              disabled={isBusy}
            >
              {CONTENT_TYPES.map((o) => (
                <option key={o.value} value={o.value} className="bg-slate-900">
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Title (optional)</span>
            <input
              className="mt-2 w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-100 ring-1 ring-white/10 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-300/40"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isBusy}
              placeholder="e.g. Paper notes, Thread summary…"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Source name (optional)</span>
            <input
              className="mt-2 w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-100 ring-1 ring-white/10 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-300/40"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              disabled={isBusy}
              placeholder="e.g. arXiv, Twitter, Blog"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Source URL (optional)</span>
            <input
              className="mt-2 w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-100 ring-1 ring-white/10 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-300/40"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              disabled={isBusy}
              placeholder="https://…"
              inputMode="url"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm text-slate-300">Content</span>
          <textarea
            className="mt-2 min-h-[160px] w-full resize-y rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-100 ring-1 ring-white/10 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-300/40"
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              if (status !== 'idle') {
                setStatus('idle')
                setMessage(null)
              }
            }}
            disabled={isBusy}
            placeholder="Paste a paragraph, notes, or an excerpt…"
          />
        </label>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-slate-100 ring-1 ring-white/10 transition hover:bg-white/15 active:translate-y-[1px] disabled:opacity-60"
          disabled={isBusy}
        >
          {isBusy ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
              Analyzing…
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Send className="h-4 w-4" />
              Submit
            </span>
          )}
        </button>

        {message ? (
          <div
            className={
              status === 'success'
                ? 'rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200 ring-1 ring-emerald-400/20'
                : status === 'error'
                  ? 'rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-200 ring-1 ring-rose-400/20'
                  : 'rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200 ring-1 ring-white/10'
            }
            role={status === 'error' ? 'alert' : undefined}
          >
            {message}
          </div>
        ) : null}

        <p className="text-xs text-slate-400">
          UI-only demo: this form simulates an analyze request (no backend calls).
        </p>

        {/* keep unused vars referenced so TS doesn’t complain in strict setups */}
        <span className="hidden" aria-hidden>
          {title}
          {sourceName}
          {sourceUrl}
        </span>
      </form>
    </section>
  )
}
