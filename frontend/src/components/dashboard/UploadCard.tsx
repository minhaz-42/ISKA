import React from 'react'
import { Upload, FileText } from 'lucide-react'

export type UploadContentType = 'auto' | 'pdf' | 'docx' | 'html' | 'text' | 'markdown'

const CONTENT_TYPES: { value: UploadContentType; label: string }[] = [
  { value: 'auto', label: 'auto (detect)' },
  { value: 'pdf', label: 'pdf' },
  { value: 'docx', label: 'docx' },
  { value: 'html', label: 'html' },
  { value: 'text', label: 'text' },
  { value: 'markdown', label: 'markdown' },
]

type Status = 'idle' | 'processing' | 'success' | 'error'

export function UploadCard() {
  const [contentType, setContentType] = React.useState<UploadContentType>('auto')
  const [file, setFile] = React.useState<File | null>(null)
  const [status, setStatus] = React.useState<Status>('idle')
  const [message, setMessage] = React.useState<string | null>(null)

  const isBusy = status === 'processing'

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      setStatus('error')
      setMessage('Please choose a file first.')
      return
    }

    setStatus('processing')
    setMessage(null)

    window.setTimeout(() => {
      setStatus('success')
      setMessage('Uploaded.')
    }, 900)
  }

  return (
    <section className="pkf-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-50">Upload file</h3>
          <p className="mt-1 text-sm text-slate-300">Send a document for scoring and extraction.</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 text-orange-300">
          <Upload className="h-5 w-5" />
        </div>
      </div>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm text-slate-300">Content type</span>
          <select
            className="mt-2 w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-100 ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-cyan-300/40"
            value={contentType}
            onChange={(e) => setContentType(e.target.value as UploadContentType)}
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
          <span className="text-sm text-slate-300">File</span>
          <div className="mt-2 flex items-center gap-3">
            <input
              className="block w-full text-sm text-slate-200 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-100 hover:file:bg-white/15"
              type="file"
              onChange={(e) => {
                const f = e.currentTarget.files?.[0] ?? null
                setFile(f)
                setStatus('idle')
                setMessage(null)
              }}
              disabled={isBusy}
              aria-label="Choose file"
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">Supported: PDF, DOCX, HTML, TXT, MD</p>
        </label>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-orange-500 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-500/10 ring-1 ring-white/10 transition active:translate-y-px disabled:opacity-60"
          disabled={isBusy}
        >
          {isBusy ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
              Uploading…
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Upload
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

        <div className="rounded-xl bg-white/5 p-3 text-xs text-slate-300 ring-1 ring-white/10">
          <span className="font-medium text-slate-100">Tip:</span> use <span className="font-mono">auto</span> content
          type for uploads; it detects PDF, DOCX, HTML, Markdown, Text.
        </div>
      </form>
    </section>
  )
}
