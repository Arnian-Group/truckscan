import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Login from './pages/Login'
import TrailerList from './pages/TrailerList'
import TrailerDetail from './pages/TrailerDetail'
import AuditLog from './pages/AuditLog'
import Users from './pages/Users'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

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
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<TrailerList />} />
          <Route path="/trailers/:id" element={<TrailerDetail />} />
          <Route element={<AdminRoute />}>
            <Route path="/audit" element={<AuditLog />} />
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
