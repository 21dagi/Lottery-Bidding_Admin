import { env } from '@/config/env'
import { useAuthStore } from '@/stores/authStore'
import { mockRequest } from '@/mock'

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(message: string, status: number, code = 'UNKNOWN') {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export type ApiResponse<T> = {
  data: T
  message?: string
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  auth?: boolean
}

function buildUrl(path: string): string {
  const base = env.VITE_API_BASE_URL.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

let refreshPromise: Promise<boolean> | null = null

async function silentRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    try {
      const response = await fetch(buildUrl('/auth/admin/refresh'), {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) {
        useAuthStore.getState().clearSession()
        return false
      }
      const payload = (await response.json()) as ApiResponse<{
        accessToken: string
      }>
      const admin = useAuthStore.getState().admin
      if (admin && payload.data.accessToken) {
        useAuthStore.getState().setSession(payload.data.accessToken, admin)
        return true
      }
      return false
    } catch {
      useAuthStore.getState().clearSession()
      return false
    } finally {
      refreshPromise = null
    }
  })()
  return refreshPromise
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  if (env.VITE_USE_MOCKS) {
    return mockRequest<T>(path, options)
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (options.auth !== false) {
    const token = useAuthStore.getState().accessToken
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const doFetch = () =>
    fetch(buildUrl(path), {
      method: options.method ?? 'GET',
      headers,
      credentials: 'include',
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })

  let response = await doFetch()

  if (response.status === 401 && options.auth !== false) {
    const refreshed = await silentRefresh()
    if (refreshed) {
      const token = useAuthStore.getState().accessToken
      if (token) headers.Authorization = `Bearer ${token}`
      response = await doFetch()
    }
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    let code = 'UNKNOWN'
    try {
      const payload = (await response.json()) as { message?: string; code?: string }
      message = payload.message ?? message
      code = payload.code ?? code
    } catch {
      // empty body
    }
    throw new ApiError(message, response.status, code)
  }

  if (response.status === 204) {
    return { data: undefined as T }
  }

  return (await response.json()) as ApiResponse<T>
}
