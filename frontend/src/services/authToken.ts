const TOKEN_KEY = 'pkf_token'

export function getAuthToken(): string | null {
  try {
    const t = window.localStorage.getItem(TOKEN_KEY)
    return t && t.trim() ? t : null
  } catch {
    return null
  }
}

export function setAuthToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // ignore
  }
}

export function clearAuthToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore
  }
}
