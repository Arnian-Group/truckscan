import { Navigate, Outlet } from 'react-router-dom'
import { getUser } from '../lib/auth'

export default function ProtectedRoute() {
  const token = localStorage.getItem('token')
  const user = getUser()
  if (!token || !user) return <Navigate to="/login" replace />
  return <Outlet />
}
