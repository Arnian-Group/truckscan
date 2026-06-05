export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

export function isAdmin() {
  return getUser()?.role === 'admin'
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
