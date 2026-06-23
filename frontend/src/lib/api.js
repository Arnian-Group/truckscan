import axios from 'axios'
import { addPending } from './offlineQueue'

const BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({ baseURL: BASE })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// True when the response came from the service worker's offline write queue
// (the request couldn't reach the server and was queued for background retry)
// instead of a real response from the backend.
export function isQueuedResponse(response) {
  return response?.status === 202 && response?.data?.queued === true
}

function absoluteUrl(url) {
  return new URL(url, window.location.origin).href
}

api.interceptors.response.use(
  (r) => {
    if (isQueuedResponse(r)) {
      addPending(absoluteUrl(r.config.url), `${(r.config.method || '').toUpperCase()} ${r.config.url}`)
    }
    return r
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
