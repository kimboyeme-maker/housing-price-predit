// Central fetch client. Reads the gateway headers the backend sets
// (X-Request-ID / X-Error-Code / X-Error-Message) and normalises every failure
// into a typed ApiError of shape { requestId, errorCode, errorMessage }.

import type { ApiError } from '@/lib/types'

// Relative base by default → dev proxy (/api → :8000) and prod (nginx/Vercel rewrite).
export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api'

export class ApiClientError extends Error implements ApiError {
  requestId: string
  errorCode: string
  errorMessage: string
  status: number
  details?: unknown[]

  constructor(e: ApiError) {
    super(e.errorMessage)
    this.name = 'ApiClientError'
    this.requestId = e.requestId
    this.errorCode = e.errorCode
    this.errorMessage = e.errorMessage
    this.status = e.status
    this.details = e.details
  }
}

async function parseError(res: Response): Promise<ApiClientError> {
  let requestId = res.headers.get('X-Request-ID') ?? ''
  let errorCode = res.headers.get('X-Error-Code') ?? `HTTP-${res.status}`
  let errorMessage = res.headers.get('X-Error-Message') ?? res.statusText
  let details: unknown[] | undefined

  // Body envelope wins over headers when present (richer message + details).
  try {
    const body = await res.json()
    if (body?.error) {
      requestId = body.requestId ?? requestId
      errorCode = body.error.code ?? errorCode
      errorMessage = body.error.message ?? errorMessage
      details = body.error.details
    }
  } catch {
    /* non-JSON body — keep header-derived values */
  }

  return new ApiClientError({
    requestId,
    errorCode,
    errorMessage,
    status: res.status,
    details,
  })
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    })
  } catch (e) {
    // Network / CORS failure — no response object at all.
    throw new ApiClientError({
      requestId: '',
      errorCode: 'NETWORK',
      errorMessage: e instanceof Error ? e.message : 'Network request failed',
      status: 0,
    })
  }
  if (!res.ok) throw await parseError(res)
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
}
