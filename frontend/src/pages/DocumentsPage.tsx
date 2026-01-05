import React from 'react'
import type { Document } from '../services/types'

function chipTone(label: string): string {
  if (label.includes('ai')) return 'bg-white/5 text-[var(--pkf-secondary)] ring-[var(--pkf-border)]'
  if (label.includes('contrad')) return 'bg-white/5 text-[var(--pkf-attention)] ring-[var(--pkf-border)]'
  if (label.includes('redundan') || label.includes('repeat')) return 'bg-white/5 text-[var(--pkf-neutral)] ring-[var(--pkf-border)]'
  return 'bg-white/5 text-slate-300 ring-[var(--pkf-border)]'
}

function makeInsightSummary(d: Document): { title: string; why: string; tags: string[] } {
  const tags: string[] = []
  const whyParts: string[] = []

  if (d.score) {
    if (d.score.redundancy_explanation) {
      tags.push('repetition')
      whyParts.push(d.score.redundancy_explanation)
    }
    if (d.score.novelty_explanation) {
      tags.push('novelty')
      whyParts.push(d.score.novelty_explanation)
    }
    if (d.score.depth_explanation) {
      tags.push('depth')
      whyParts.push(d.score.depth_explanation)
    }
    if (d.score.cognitive_load_explanation) {
      tags.push('cognitive load')
      whyParts.push(d.score.cognitive_load_explanation)
    }
  }

  return {
    title: d.title || 'Untitled',
    why: whyParts[0] || 'Ingested and analyzed. Open to see explanations and patterns.',
    tags: Array.from(new Set(tags)).slice(0, 3),
  }
}

export function DocumentsPage(props: {
  docs: Document[]
  loading: boolean
  error: string | null
  onRefresh: () => void
}) {
  const { docs, loading, error, onRefresh } = props

  // Progressive disclosure: keep ingest UI hidden until asked for.
  const [addOpen, setAddOpen] = React.useState(false)
  const [tab, setTab] = React.useState<'upload' | 'paste'>('upload')

  const [uploadType, setUploadType] = React.useState<'auto' | 'pdf' | 'docx' | 'html' | 'text' | 'markdown'>('auto')
  const [uploadFile, setUploadFile] = React.useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = React.useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [uploadMessage, setUploadMessage] = React.useState<string | null>(null)

  const [pasteType, setPasteType] = React.useState<'web' | 'social' | 'text' | 'markdown' | 'html'>('web')
  const [pasteTitle, setPasteTitle] = React.useState('')
  const [pasteSourceName, setPasteSourceName] = React.useState('')
  const [pasteSourceUrl, setPasteSourceUrl] = React.useState('')
  const [pasteContent, setPasteContent] = React.useState('')
  const [pasteStatus, setPasteStatus] = React.useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [pasteMessage, setPasteMessage] = React.useState<string | null>(null)

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-medium text-slate-100">Documents & insights</h2>
          <p className="mt-2 text-[15px] font-normal text-slate-300">
            Insight cards explain what mattered and why patterns were detected.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAddOpen((v) => !v)}
            className="pkf-focus rounded-xl bg-(--pkf-primary) px-4 py-2 text-[14px] font-medium text-white transition hover:brightness-105 active:translate-y-px"
            aria-expanded={addOpen}
          >
            Add content
          </button>

          <button
            type="button"
            onClick={onRefresh}
            className="pkf-focus rounded-xl bg-transparent px-4 py-2 text-[14px] font-medium text-slate-200 ring-1 ring-(--pkf-border) transition hover:bg-white/5 active:translate-y-px"
          >
            Refresh
          </button>
        </div>
      </div>

      {addOpen ? (
        <div className="mt-6 pkf-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[15px] font-medium text-slate-100">Add content</div>
              <div className="mt-1 text-[13px] text-slate-400">
                Upload a file or paste text. Nothing is stored without your consent.
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-white/5 p-1 ring-1 ring-(--pkf-border)">
              <button
                type="button"
                onClick={() => setTab('upload')}
                className={
                  'pkf-focus rounded-lg px-3 py-1.5 text-[13px] font-medium transition ' +
                  (tab === 'upload' ? 'bg-(--pkf-card-hover) text-slate-100' : 'text-slate-300 hover:bg-(--pkf-card-hover)')
                }
              >
                Upload
              </button>
              <button
                type="button"
                onClick={() => setTab('paste')}
                className={
                  'pkf-focus rounded-lg px-3 py-1.5 text-[13px] font-medium transition ' +
                  (tab === 'paste' ? 'bg-(--pkf-card-hover) text-slate-100' : 'text-slate-300 hover:bg-(--pkf-card-hover)')
                }
              >
                Paste
              </button>
            </div>
          </div>

          {/* Upload */}
          {tab === 'upload' ? (
            <form
              className="mt-5 grid grid-cols-1 gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                if (!uploadFile) {
                  setUploadStatus('error')
                  setUploadMessage('Choose a file first.')
                  return
                }
                setUploadStatus('processing')
                setUploadMessage(null)
                window.setTimeout(() => {
                  setUploadStatus('success')
                  setUploadMessage('Uploaded.')
                }, 900)
              }}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <div className="text-[13px] text-slate-300">Content type</div>
                  <select
                    className="pkf-focus mt-2 w-full rounded-xl bg-white/5 px-3 py-2 text-[14px] text-slate-100 ring-1 ring-(--pkf-border)"
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as typeof uploadType)}
                    disabled={uploadStatus === 'processing'}
                  >
                    <option value="auto" className="bg-[var(--pkf-surface)]">auto (detect)</option>
                    <option value="pdf" className="bg-[var(--pkf-surface)]">pdf</option>
                    <option value="docx" className="bg-[var(--pkf-surface)]">docx</option>
                    <option value="html" className="bg-[var(--pkf-surface)]">html</option>
                    <option value="text" className="bg-[var(--pkf-surface)]">text</option>
                    <option value="markdown" className="bg-[var(--pkf-surface)]">markdown</option>
                  </select>
                  {/* Calm design note: no warnings; only a gentle tip */}
                  <div className="mt-2 text-[12px] text-slate-400">Tip: use auto to detect PDF, DOCX, HTML, Markdown, Text.</div>
                </label>

                <label className="block">
                  <div className="text-[13px] text-slate-300">File</div>
                  <input
                    className="pkf-focus mt-2 block w-full text-[13px] text-slate-200 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-[13px] file:font-medium file:text-slate-100 hover:file:bg-white/15"
                    type="file"
                    onChange={(ev) => {
                      const f = ev.currentTarget.files?.[0] ?? null
                      setUploadFile(f)
                      setUploadStatus('idle')
                      setUploadMessage(null)
                    }}
                    disabled={uploadStatus === 'processing'}
                    aria-label="Choose a file"
                  />
                  <div className="mt-2 text-[12px] text-slate-400">Supported: PDF, DOCX, HTML, TXT, MD</div>
                </label>
              </div>

              <button
                type="submit"
                className="pkf-focus inline-flex items-center justify-center rounded-xl bg-(--pkf-primary) px-4 py-2.5 text-[14px] font-medium text-white transition hover:brightness-105 active:translate-y-px disabled:opacity-60"
                disabled={uploadStatus === 'processing'}
              >
                {uploadStatus === 'processing' ? 'Uploading…' : 'Upload'}
              </button>

              {uploadMessage ? (
                <div
                  className={
                    'rounded-xl bg-white/5 p-4 text-[13px] ring-1 ring-(--pkf-border) ' +
                    (uploadStatus === 'error'
                      ? 'text-(--pkf-attention)'
                      : uploadStatus === 'success'
                        ? 'text-(--pkf-healthy)'
                        : 'text-slate-200')
                  }
                  role={uploadStatus === 'error' ? 'alert' : undefined}
                >
                  {uploadMessage}
                </div>
              ) : null}

              {/* Calm design note: keep form state visible and simple */}
              <div className="hidden" aria-hidden>
                {uploadType}
              </div>
            </form>
          ) : null}

          {/* Paste */}
          {tab === 'paste' ? (
            <form
              className="mt-5 grid grid-cols-1 gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                if (!pasteContent.trim()) {
                  setPasteStatus('error')
                  setPasteMessage('Paste some content first.')
                  return
                }
                setPasteStatus('processing')
                setPasteMessage(null)
                window.setTimeout(() => {
                  setPasteStatus('success')
                  setPasteMessage('Analyzed.')
                }, 1100)
              }}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <div className="text-[13px] text-slate-300">Content type</div>
                  <select
                    className="pkf-focus mt-2 w-full rounded-xl bg-white/5 px-3 py-2 text-[14px] text-slate-100 ring-1 ring-(--pkf-border)"
                    value={pasteType}
                    onChange={(e) => setPasteType(e.target.value as typeof pasteType)}
                    disabled={pasteStatus === 'processing'}
                  >
                    <option value="web" className="bg-[var(--pkf-surface)]">web</option>
                    <option value="social" className="bg-[var(--pkf-surface)]">social</option>
                    <option value="text" className="bg-[var(--pkf-surface)]">text</option>
                    <option value="markdown" className="bg-[var(--pkf-surface)]">markdown</option>
                    <option value="html" className="bg-[var(--pkf-surface)]">html</option>
                  </select>
                </label>

                <label className="block">
                  <div className="text-[13px] text-slate-300">Title (optional)</div>
                  <input
                    className="pkf-focus mt-2 w-full rounded-xl bg-white/5 px-3 py-2 text-[14px] text-slate-100 ring-1 ring-(--pkf-border) placeholder:text-slate-500"
                    value={pasteTitle}
                    onChange={(e) => setPasteTitle(e.target.value)}
                    disabled={pasteStatus === 'processing'}
                    placeholder="A short label"
                  />
                </label>

                <label className="block">
                  <div className="text-[13px] text-slate-300">Source name (optional)</div>
                  <input
                    className="pkf-focus mt-2 w-full rounded-xl bg-white/5 px-3 py-2 text-[14px] text-slate-100 ring-1 ring-(--pkf-border) placeholder:text-slate-500"
                    value={pasteSourceName}
                    onChange={(e) => setPasteSourceName(e.target.value)}
                    disabled={pasteStatus === 'processing'}
                    placeholder="Where this came from"
                  />
                </label>

                <label className="block">
                  <div className="text-[13px] text-slate-300">Source url (optional)</div>
                  <input
                    className="pkf-focus mt-2 w-full rounded-xl bg-white/5 px-3 py-2 text-[14px] text-slate-100 ring-1 ring-(--pkf-border) placeholder:text-slate-500"
                    value={pasteSourceUrl}
                    onChange={(e) => setPasteSourceUrl(e.target.value)}
                    disabled={pasteStatus === 'processing'}
                    placeholder="https://…"
                    inputMode="url"
                  />
                </label>
              </div>

              <label className="block">
                <div className="text-[13px] text-slate-300">Content</div>
                <textarea
                  className="pkf-focus mt-2 min-h-[140px] w-full resize-y rounded-xl bg-white/5 px-3 py-2 text-[14px] text-slate-100 ring-1 ring-(--pkf-border) placeholder:text-slate-500"
                  value={pasteContent}
                  onChange={(e) => {
                    setPasteContent(e.target.value)
                    if (pasteStatus !== 'idle') {
                      setPasteStatus('idle')
                      setPasteMessage(null)
                    }
                  }}
                  disabled={pasteStatus === 'processing'}
                  placeholder="Paste a paragraph, notes, or an excerpt…"
                />
              </label>

              <button
                type="submit"
                className="pkf-focus inline-flex items-center justify-center rounded-xl bg-(--pkf-primary) px-4 py-2.5 text-[14px] font-medium text-white transition hover:brightness-105 active:translate-y-px disabled:opacity-60"
                disabled={pasteStatus === 'processing'}
              >
                {pasteStatus === 'processing' ? 'Analyzing…' : 'Submit'}
              </button>

              {pasteMessage ? (
                <div
                  className={
                    'rounded-xl bg-white/5 p-4 text-[13px] ring-1 ring-(--pkf-border) ' +
                    (pasteStatus === 'error'
                      ? 'text-(--pkf-attention)'
                      : pasteStatus === 'success'
                        ? 'text-(--pkf-healthy)'
                        : 'text-slate-200')
                  }
                  role={pasteStatus === 'error' ? 'alert' : undefined}
                >
                  {pasteMessage}
                </div>
              ) : null}

              <div className="hidden" aria-hidden>
                {pasteType}
                {pasteTitle}
                {pasteSourceName}
                {pasteSourceUrl}
              </div>
            </form>
          ) : null}
        </div>
      ) : null}

      {loading ? <div className="mt-4 text-[13px] text-slate-400">Loading…</div> : null}
      {error ? (
        <div className="mt-4 rounded-xl bg-white/5 p-4 text-[13px] text-slate-200 ring-1 ring-(--pkf-border)">
          {error}
        </div>
      ) : null}

      <div className="mt-5 space-y-3">
        {docs.length === 0 && !loading ? (
          <div className="pkf-card p-6 text-[14px] text-slate-300">
            No documents yet. Add one via Upload/Paste (we’ll integrate that flow here next).
          </div>
        ) : null}

        {docs.map((d) => {
          const s = makeInsightSummary(d)
          const value = d.score ? d.score.overall_value_score : null
          const valueLabel =
            value === null
              ? 'Not yet available'
              : value >= 0.75
                ? 'Higher'
                : value >= 0.5
                  ? 'Moderate'
                  : 'Lower'
          return (
            <div key={d.id} className="pkf-card pkf-card-hover p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-medium text-slate-100" title={s.title}>
                    {s.title}
                  </div>
                  <div className="mt-2 text-[12px] text-slate-400">
                    {d.content_type} • {new Date(d.ingested_at).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {s.tags.map((t) => (
                    <span key={t} className={`rounded-full px-2.5 py-1 text-[12px] font-medium ring-1 ${chipTone(t)}`}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 text-[14px] text-slate-200">{s.why}</div>

              <div className="mt-4 flex flex-wrap gap-2 text-[12px] text-slate-300">
                <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-(--pkf-border)">
                  Processed: {d.is_processed ? 'yes' : 'not yet'}
                </span>
                <span
                  className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-(--pkf-border)"
                  title={value === null ? undefined : `Value score: ${value.toFixed(2)}`}
                >
                  Value: {valueLabel}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
