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
import ChecklistList from './pages/ChecklistList'
import ChecklistNew from './pages/ChecklistNew'
import ChecklistNewAsset from './pages/ChecklistNewAsset'
import ChecklistFill from './pages/ChecklistFill'
import ChecklistSign from './pages/ChecklistSign'
import ChecklistDetail from './pages/ChecklistDetail'
import ChecklistAssets from './pages/ChecklistAssets'
import ChecklistVerifyPublic from './pages/ChecklistVerifyPublic'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import VehicleRoute from './components/VehicleRoute'
import ChecklistRoute from './components/ChecklistRoute'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/s/:token" element={<SharedView />} />
        <Route path="/checklists/verify/:id" element={<ChecklistVerifyPublic />} />
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
          <Route element={<ChecklistRoute />}>
            <Route path="/checklists" element={<ChecklistList />} />
            <Route path="/checklists/new" element={<ChecklistNew />} />
            <Route path="/checklists/new/:templateId" element={<ChecklistNewAsset />} />
            <Route path="/checklists/:id/fill" element={<ChecklistFill />} />
            <Route path="/checklists/:id/sign" element={<ChecklistSign />} />
            <Route path="/checklists/:id" element={<ChecklistDetail />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/audit"  element={<AuditLog />} />
            <Route path="/users"  element={<Users />} />
            <Route path="/shares" element={<ShareLinks />} />
            <Route path="/checklists/assets" element={<ChecklistAssets />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
