import type { AnalysisResult, AnalysisSummary, CreditBalance, CreditPack, StatusResponse, UploadResponse } from './types'

const BASE = process.env.NEXT_PUBLIC_API_URL

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

let sessionExpiring = false

/** Single handling of an expired session: clear the cookie and go to /auth. */
function handleSessionExpired(): void {
  if (typeof window === 'undefined' || sessionExpiring) return
  sessionExpiring = true
  const locale = window.location.pathname.split('/')[1] === 'en' ? 'en' : 'es'
  fetch('/api/auth/logout', { method: 'POST' })
    .catch(() => undefined)
    .finally(() => window.location.assign(`/${locale}/auth`))
}

async function parseResponse<T>(res: Response, authenticated = false): Promise<T> {
  if (authenticated && res.status === 401) handleSessionExpired()
  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = await res.json()
      detail = body?.detail ?? detail
    } catch {
      // ignore parse error, use default message
    }
    throw new ApiError(res.status, detail)
  }
  return res.json() as Promise<T>
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}

export const api = {
  register: (email: string, password: string) =>
    fetch(`${BASE}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(r => parseResponse<{ id: number; email: string; is_premium: boolean }>(r)),

  login: (email: string, password: string) => {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    return fetch(`${BASE}/api/v1/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    }).then(r => parseResponse<{ access_token: string; token_type: string }>(r))
  },

  upload: (
    file: File,
    token: string | null,
    platform = 'whatsapp',
    language = 'auto',
    dateRange?: { from: string; to: string } | null,
  ): Promise<UploadResponse> => {
    const form = new FormData()
    form.append('file', file)
    form.append('platform', platform)
    form.append('language', language)
    if (dateRange) {
      form.append('date_from', dateRange.from)
      form.append('date_to', dateRange.to)
    }
    return fetch(`${BASE}/api/v1/upload/`, {
      method: 'POST',
      headers: token ? authHeaders(token) : {},
      body: form,
    }).then(r => parseResponse<UploadResponse>(r, !!token))
  },

  getStatus: (id: number, token: string): Promise<StatusResponse> =>
    fetch(`${BASE}/api/v1/analysis/${id}/status`, {
      headers: authHeaders(token),
    }).then(r => parseResponse<StatusResponse>(r, true)),

  getAnalysis: (id: number, token: string): Promise<AnalysisResult> =>
    fetch(`${BASE}/api/v1/analysis/${id}`, {
      headers: authHeaders(token),
    }).then(r => parseResponse<AnalysisResult>(r, true)),

  listAnalyses: (token: string) =>
    fetch(`${BASE}/api/v1/analysis/`, {
      headers: authHeaders(token),
    }).then(r => parseResponse<AnalysisSummary[]>(r, true)),

  deleteAnalysis: (id: number, token: string): Promise<void> =>
    fetch(`${BASE}/api/v1/analysis/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }).then(r => {
      if (r.status === 401) handleSessionExpired()
      if (!r.ok) throw new ApiError(r.status, `HTTP ${r.status}`)
    }),
  getCredits: (token: string): Promise<CreditBalance> =>
    fetch(`${BASE}/api/v1/payments/credits`, {
      headers: authHeaders(token),
    }).then(r => parseResponse<CreditBalance>(r, true)),

  getPacks: (): Promise<CreditPack[]> =>
    fetch(`${BASE}/api/v1/payments/packs`).then(r => parseResponse<CreditPack[]>(r)),

  createCheckout: (pack: string, token: string): Promise<{ url: string }> =>
    fetch(`${BASE}/api/v1/payments/checkout`, {
      method: 'POST',
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ pack }),
    }).then(r => parseResponse<{ url: string }>(r, true)),
}
