import React from 'react'
import { SoftButton, CalmNotice } from '../design/components'
import { FileText, Upload, MoreHorizontal, ExternalLink } from 'lucide-react'

interface Document {
  id: string
  title: string
  source: string
  addedAt: string
  wordCount: number
  hasInsights: boolean
}

const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Understanding Attention Economics',
    source: 'Article',
    addedAt: '2 hours ago',
    wordCount: 2450,
    hasInsights: true,
  },
  {
    id: '2',
    title: 'The Calm Technology Movement',
    source: 'PDF',
    addedAt: 'Yesterday',
    wordCount: 8200,
    hasInsights: true,
  },
  {
    id: '3',
    title: 'Notes on Digital Minimalism',
    source: 'Note',
    addedAt: '3 days ago',
    wordCount: 450,
    hasInsights: false,
  },
  {
    id: '4',
    title: 'Research: Information Overload Effects',
    source: 'PDF',
    addedAt: 'Last week',
    wordCount: 12800,
    hasInsights: true,
  },
]

export function Documents() {
  const [dragOver, setDragOver] = React.useState(false)

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-(--pkf-text-strong)">Documents</h1>
          <p className="mt-2 text-[14px] text-(--pkf-text-muted)">
            Content you've added for analysis.
          </p>
        </div>

        <SoftButton variant="primary" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Add content
        </SoftButton>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={() => setDragOver(false)}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? 'border-(--pkf-primary) bg-(--pkf-primary-subtle)'
            : 'border-(--pkf-border) bg-(--pkf-surface)'
        }`}
      >
        <Upload className="mx-auto h-8 w-8 text-(--pkf-text-subtle)" />
        <p className="mt-3 text-[14px] text-(--pkf-text)">
          Drop files here or{' '}
          <button className="text-(--pkf-primary) hover:underline">browse</button>
        </p>
        <p className="mt-1 text-[12px] text-(--pkf-text-muted)">PDF, TXT, or paste text</p>
      </div>

      {/* Document List */}
      <section>
        <h2 className="mb-4 text-[16px] font-medium text-(--pkf-text-strong)">
          Your documents
        </h2>

        <div className="divide-y divide-[var(--pkf-border) rounded-2xl bg-(--pkf-card)) ring-1 ring-(--pkf-border)">
          {mockDocuments.map((doc) => (
            <DocumentRow key={doc.id} document={doc} />
          ))}
        </div>
      </section>

      {/* Info Notice */}
      <CalmNotice tone="info" title="About document analysis">
        We analyze text locally when possible. For cloud processing, your content is encrypted and
        not stored after analysis.
      </CalmNotice>
    </div>
  )
}

function DocumentRow({ document }: { document: Document }) {
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-(--pkf-card-hover)) transition-colors">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-(--pkf-surface) ring-1 ring-(--pkf-border-subtle)">
        <FileText className="h-5 w-5 text-(--pkf-text-subtle)" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[14px] font-medium text-(--pkf-text-strong)">
          {document.title}
        </h3>
        <div className="mt-1 flex items-center gap-3 text-[12px] text-(--pkf-text-muted)">
          <span>{document.source}</span>
          <span>·</span>
          <span>{document.wordCount.toLocaleString()} words</span>
          <span>·</span>
          <span>{document.addedAt}</span>
        </div>
      </div>

      {document.hasInsights && (
        <span className="flex-shrink-0 rounded-full bg-(--pkf-primary-subtle) px-2 py-0.5 text-[11px] font-medium text-(--pkf-primary)">
          Insights
        </span>
      )}

      <div className="flex flex-shrink-0 items-center gap-1">
        <button className="pkf-focus rounded-lg p-2 text-(--pkf-text-muted) hover:bg-(--pkf-overlay) hover:text-(--pkf-text)">
          <ExternalLink className="h-4 w-4" />
        </button>
        <button className="pkf-focus rounded-lg p-2 text-(--pkf-text-muted) hover:bg-(--pkf-overlay) hover:text-(--pkf-text)">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
