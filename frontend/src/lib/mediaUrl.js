export function mediaUrl(path) {
  if (!path) return ''
  const token = localStorage.getItem('token')
  const base = import.meta.env.VITE_API_URL || ''
  return `${base}${path}?token=${encodeURIComponent(token || '')}`
}

export function thumbUrl(path) {
  if (!path) return ''
  return `${mediaUrl(path)}&thumb=1`
}
