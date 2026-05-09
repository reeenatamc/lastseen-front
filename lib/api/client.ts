import type { AnalysisResult, StatusResponse, UploadResponse } from './types'

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

async function parseResponse<T>(res: Response): Promise<T> {
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

  upload: (file: File, token: string, platform = 'whatsapp'): Promise<UploadResponse> => {
    const form = new FormData()
    form.append('file', file)
    form.append('platform', platform)
    return fetch(`${BASE}/api/v1/upload/`, {
      method: 'POST',
      headers: authHeaders(token),
      body: form,
    }).then(r => parseResponse<UploadResponse>(r))
  },

  getStatus: (id: number, token: string): Promise<StatusResponse> =>
    fetch(`${BASE}/api/v1/analysis/${id}/status`, {
      headers: authHeaders(token),
    }).then(r => parseResponse<StatusResponse>(r)),

  getAnalysis: (id: number, token: string): Promise<AnalysisResult> =>
    fetch(`${BASE}/api/v1/analysis/${id}`, {
      headers: authHeaders(token),
    }).then(r => parseResponse<AnalysisResult>(r)),

  listAnalyses: (token: string) =>
    fetch(`${BASE}/api/v1/analysis/`, {
      headers: authHeaders(token),
    }).then(r => parseResponse<AnalysisResult[]>(r)),

  deleteAnalysis: (id: number, token: string): Promise<void> =>
    fetch(`${BASE}/api/v1/analysis/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }).then(r => {
      if (!r.ok) throw new ApiError(r.status, `HTTP ${r.status}`)
    }),
}
