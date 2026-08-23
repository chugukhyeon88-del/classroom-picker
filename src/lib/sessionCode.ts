const STORAGE_KEY = 'classroom-picker-session-code'

export function getStoredSessionCode(): string | null {
  return sessionStorage.getItem(STORAGE_KEY)
}

export function setStoredSessionCode(code: string): void {
  sessionStorage.setItem(STORAGE_KEY, code.toUpperCase())
}

export function clearStoredSessionCode(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}

export function readCodeFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')?.trim().toUpperCase()
  return code && code.length >= 4 ? code : null
}
