import React from 'react'
import { Loader2, Upload, Send } from 'lucide-react'

export function UploadCard(props: {
  contentType: string
  onContentTypeChange: (value: string) => void
  file: File | null
  onFileChange: (file: File | null) => void
  onSubmit: (e: React.FormEvent) => void
  disabled?: boolean
  status?: 'idle' | 'loading' | 'error' | 'success'
  message?: string
}) {
  const { contentType, onContentTypeChange, file, onFileChange, onSubmit, disabled, status, message } = props

  return (
    <div className="pkf-glass rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Upload file</h3>
          <p className="mt-1 text-sm text-slate-300/80">Supported: PDF, DOCX, HTML, TXT, MD</p>
        </div>
        <div className="pkf-ring rounded-xl bg-white/5 p-2 text-orange-200">
          <Upload className="h-5 w-5" />
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label className="block">
          <div className="text-sm text-slate-300/80">Content type</div>
          <select
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 outline-none focus:border-orange-400/40 focus:ring-2 focus:ring-orange-500/20"
            value={contentType}
            onChange={(e) => onContentTypeChange(e.target.value)}
          >
            <option value="auto">auto</option>
            <option value="pdf">pdf</option>
            <option value="docx">docx</option>
            <option value="html">html</option>
            <option value="text">text</option>
            <option value="markdown">markdown</option>
          </select>
        </label>

        <label className="block">
          <div className="text-sm text-slate-300/80">File</div>
          <input
            className="mt-2 w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-100 hover:file:bg-white/15"
            type="file"
            accept=".pdf,.docx,.txt,.md,.markdown,.html,.htm"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div className="mt-2 text-xs text-slate-400" title={file.name}>
              Selected: <span className="font-semibold text-slate-200">{file.name}</span>
            </div>
          ) : null}
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-400 to-red-500 px-4 py-2 text-sm font-semibold text-black shadow-sm shadow-orange-500/20 transition active:translate-y-px disabled:opacity-60"
          >
            {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Upload
          </button>

          {status === 'error' ? <div className="text-sm text-rose-300">{message}</div> : null}
          {status === 'success' ? <div className="text-sm text-emerald-300">Uploaded.</div> : null}
        </div>
      </form>
    </div>
  )
}

export function PasteCard(props: {
  contentType: string
  onContentTypeChange: (value: string) => void
  title: string
  onTitleChange: (value: string) => void
  sourceName: string
  onSourceNameChange: (value: string) => void
  sourceUrl: string
  onSourceUrlChange: (value: string) => void
  content: string
  onContentChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  disabled?: boolean
  status?: 'idle' | 'loading' | 'error' | 'success'
  message?: string
}) {
  const {
    contentType,
    onContentTypeChange,
    title,
    onTitleChange,
    sourceName,
    onSourceNameChange,
    sourceUrl,
    onSourceUrlChange,
    content,
    onContentChange,
    onSubmit,
    disabled,
    status,
    message,
  } = props

  return (
    <div className="pkf-glass rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Paste content</h3>
          <p className="mt-1 text-sm text-slate-300/80">Great for web snippets or notes.</p>
        </div>
        <div className="pkf-ring rounded-xl bg-white/5 p-2 text-cyan-200">
          <Send className="h-5 w-5" />
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label className="block">
          <div className="text-sm text-slate-300/80">Content type</div>
          <select
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-500/20"
            value={contentType}
            onChange={(e) => onContentTypeChange(e.target.value)}
          >
            <option value="web">web</option>
            <option value="social">social</option>
            <option value="text">text</option>
            <option value="markdown">markdown</option>
          </select>
        </label>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="block">
            <div className="text-sm text-slate-300/80">Title (optional)</div>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-500/20"
              placeholder="e.g., Persuasive speech outline"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
            />
          </label>

          <label className="block">
            <div className="text-sm text-slate-300/80">Source name (optional)</div>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-500/20"
              placeholder="e.g., Reddit, Medium, X"
              value={sourceName}
              onChange={(e) => onSourceNameChange(e.target.value)}
            />
          </label>
        </div>

        <label className="block">
          <div className="text-sm text-slate-300/80">Source URL (optional)</div>
          <input
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-500/20"
            placeholder="https://..."
            value={sourceUrl}
            onChange={(e) => onSourceUrlChange(e.target.value)}
          />
        </label>

        <label className="block">
          <div className="text-sm text-slate-300/80">Content</div>
          <textarea
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-500/20"
            rows={10}
            placeholder="Paste the text you want to evaluate…"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 ring-1 ring-white/10 transition hover:bg-white/15 active:translate-y-px disabled:opacity-60"
          >
            {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Submit
          </button>

          {status === 'error' ? <div className="text-sm text-rose-300">{message}</div> : null}
          {status === 'success' ? <div className="text-sm text-emerald-300">Submitted.</div> : null}
        </div>
      </form>
    </div>
  )
}
