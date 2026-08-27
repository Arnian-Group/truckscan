import { Navigate, Outlet } from 'react-router-dom'
import { canChecklists } from '../lib/auth'

export default function ChecklistRoute() {
  if (!canChecklists()) return <Navigate to="/" replace />
  return <Outlet />
}
