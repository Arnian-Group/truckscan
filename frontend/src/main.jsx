import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TrailerList from './pages/TrailerList'
import TrailerDetail from './pages/TrailerDetail'
import AuditLog from './pages/AuditLog'
import Users from './pages/Users'
import VehicleList from './pages/VehicleList'
import VehicleNew from './pages/VehicleNew'
import VehicleIntake from './pages/VehicleIntake'
import VehicleInspection from './pages/VehicleInspection'
import VehicleDetail from './pages/VehicleDetail'
import MercanciaIntake from './pages/MercanciaIntake'
import SharedView from './pages/SharedView'
import ShareLinks from './pages/ShareLinks'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import VehicleRoute from './components/VehicleRoute'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/s/:token" element={<SharedView />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trailers" element={<TrailerList />} />
          <Route path="/trailers/:id" element={<TrailerDetail />} />
          <Route element={<VehicleRoute />}>
            <Route path="/vehicles" element={<VehicleList />} />
            <Route path="/vehicles/new" element={<VehicleNew />} />
            <Route path="/vehicles/:id/intake" element={<VehicleIntake />} />
            <Route path="/vehicles/:id/inspection" element={<VehicleInspection />} />
            <Route path="/vehicles/:id/mercancias" element={<MercanciaIntake />} />
            <Route path="/vehicles/:id" element={<VehicleDetail />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/audit"  element={<AuditLog />} />
            <Route path="/users"  element={<Users />} />
            <Route path="/shares" element={<ShareLinks />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
