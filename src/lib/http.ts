import { useAuthStore } from '@/stores/auth.store'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: Method
  body?: unknown
  /** Auth screens handle a 401 themselves, as a wrong password rather than an expired session. */
  skipSessionCheck?: boolean
}

const request = async <T>(
  path: string,
  { method = 'GET', body, skipSessionCheck }: RequestOptions = {},
) => {
  const isForm = body instanceof FormData
  const response = await fetch(`${API_URL}/api${path}`, {
    method,
    credentials: 'include',
    headers: body && !isForm ? { 'content-type': 'application/json' } : undefined,
    body: isForm ? body : body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 401 && !skipSessionCheck) {
    useAuthStore.getState().signOut()
    window.location.assign('/login')
  }
  if (!response.ok) {
    const { message } = (await response.json().catch(() => ({}))) as { message?: string }
    throw new Error(message ?? 'Something went wrong. Please try again.')
  }
  return (response.status === 204 ? undefined : await response.json()) as T
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
