import { clearAuthToken, getAuthToken, setAuthToken } from './authToken'

export type AuthUser = {
  id: number
  username: string
  email?: string
}

type AuthResponse = {
  token: string
  user: AuthUser
}

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

export const auth = {
  getToken: getAuthToken,
  clearToken: clearAuthToken,

  async register(payload: { username: string; email?: string; password: string }): Promise<AuthUser> {
    const res = await http<AuthResponse>('/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setAuthToken(res.token)
    return res.user
  },

  async login(payload: { username: string; password: string }): Promise<AuthUser> {
    const res = await http<AuthResponse>('/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setAuthToken(res.token)
    return res.user
  },

  async me(): Promise<AuthUser> {
    const res = await http<{ user: AuthUser }>('/auth/me/')
    return res.user
  },

  async logout(): Promise<void> {
    try {
      await http<{ ok: boolean }>('/auth/logout/', { method: 'POST' })
    } finally {
      clearAuthToken()
    }
  },
}
