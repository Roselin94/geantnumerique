const API = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '')
const API_ORIGIN = /^https?:\/\//i.test(API) ? new URL(API).origin : ''

export function assetUrl(path) {
  if (typeof path !== 'string' || !path) return ''
  if (/^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(path)) return path
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}

export async function request(path, options = {}) {
  const headers = { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...options.headers }
  const token = localStorage.getItem('gn-token')
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${API}${path}`, { ...options, headers })
  if (response.status === 204) return null
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Une erreur est survenue. Veuillez réessayer.')
  return data
}

export const getPublic = (resource) => request(`/public/${resource}`)
