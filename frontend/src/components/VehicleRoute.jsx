import { Navigate, Outlet } from 'react-router-dom'
import { canVehicles } from '../lib/auth'

export default function VehicleRoute() {
  if (!canVehicles()) return <Navigate to="/" replace />
  return <Outlet />
}
