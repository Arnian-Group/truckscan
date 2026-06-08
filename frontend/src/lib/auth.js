export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

export function isAdmin() {
  return getUser()?.is_admin === true || getUser()?.role === 'admin'
}

export function canTrailers() {
  const u = getUser()
  return u?.is_admin === true || u?.can_trailers === true || u?.role === 'admin' || u?.role === 'operator'
}

export function canVehicles() {
  const u = getUser()
  return u?.is_admin === true || u?.can_vehicles === true || u?.role === 'admin' || u?.role === 'vehicle_agent'
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
