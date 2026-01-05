import type { DashboardStats, Document } from './types'
import { getAuthToken } from './authToken'

const defaultBaseUrl = 'http://127.0.0.1:8000/api'

function getBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? defaultBaseUrl
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken()
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`)
  }

  return (await res.json()) as T
}

export const api = {
  listDocuments: () => http<Document[]>('/documents/'),
  getDashboardStats: () => http<DashboardStats>('/dashboard/stats/'),
  getRecentDocuments: (limit = 10) => http<Document[]>(`/dashboard/recent/?limit=${limit}`),

  uploadDocument: async (file: File, contentType: string) => {
    const body = new FormData()
    body.append('file', file)
    body.append('content_type', contentType)

    const token = getAuthToken()

    const res = await fetch(`${getBaseUrl()}/documents/upload/`, {
      method: 'POST',
      body,
      headers: {
        ...(token ? { Authorization: `Token ${token}` } : {}),
      },
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`HTTP ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`)
    }

    return (await res.json()) as Document
  },

  pasteContent: (payload: {
    content: string
    content_type: string
    title?: string
    source_url?: string
    source_name?: string
  }) =>
    http<Document>('/documents/paste/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
}
