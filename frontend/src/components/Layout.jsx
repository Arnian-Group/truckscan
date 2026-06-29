import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { logout, getUser, isAdmin, canTrailers, canVehicles } from '../lib/auth'
import { Truck, List, ClipboardList, Users, LogOut, Car, LayoutDashboard, Link2, CloudOff, AlertTriangle, X, RefreshCw } from 'lucide-react'
import { subscribe as subscribeSyncStatus, getPending, dismiss, triggerSync } from '../lib/offlineQueue'

export default function Layout({ children, title, back }) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getUser()
  const showVehicles = canVehicles()
  const showTrailers = canTrailers()
  const [syncStatus, setSyncStatus] = useState({ pending: 0, failed: 0 })
  const [syncPanel, setSyncPanel] = useState(false)
  const [panelItems, setPanelItems] = useState([])
  const [retrying, setRetrying] = useState(false)

  useEffect(() => subscribeSyncStatus(setSyncStatus), [])

  // Reload panel items whenever it's open and syncStatus changes
  useEffect(() => {
    if (syncPanel) getPending().then(setPanelItems)
  }, [syncPanel, syncStatus])

  // Auto-close panel when everything clears
  useEffect(() => {
    if (syncStatus.pending === 0 && syncStatus.failed === 0) setSyncPanel(false)
  }, [syncStatus])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  async function handleRetry() {
    setRetrying(true)
    try { await triggerSync() } catch {}
    setTimeout(() => setRetrying(false), 2000)
  }

  async function handleDismiss(id) {
    await dismiss(id)
    setPanelItems(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0f1117]">
      {/* Header */}
      <header className="bg-[#161b27] border-b border-white/10 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        {back ? (
          <button
            onClick={() => navigate(back)}
            className="text-[#F5A623] p-1 -ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" />
            </svg>
          </button>
        ) : (
          <Truck size={22} className="text-[#F5A623] shrink-0" />
        )}
        <Link to="/" className="font-bold text-lg tracking-tight flex-1 truncate hover:text-[#F5A623] transition-colors">
          {title || 'TruckScan'}
        </Link>
        <div className="flex items-center gap-1">
          {syncStatus.failed > 0 && (
            <button
              onClick={() => setSyncPanel(v => !v)}
              className="flex items-center gap-1 px-2 py-1 mr-1 text-red-400 bg-red-400/10 border border-red-400/30 text-xs font-mono min-h-[32px]"
              aria-label="Ver errores de sincronización"
            >
              <AlertTriangle size={14} />
              {syncStatus.failed}
            </button>
          )}
          {syncStatus.pending > 0 && (
            <button
              onClick={() => setSyncPanel(v => !v)}
              className="flex items-center gap-1 px-2 py-1 mr-1 text-[#F5A623] bg-[#F5A62318] border border-[#F5A62330] text-xs font-mono min-h-[32px]"
              aria-label="Ver cambios pendientes"
            >
              <CloudOff size={14} />
              {syncStatus.pending}
            </button>
          )}
          <span className="text-xs text-white/40 font-mono hidden sm:block truncate max-w-[120px]">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="p-2 text-white/50 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Sync panel — appears below header in DOM flow, backdrop covers main content */}
      {syncPanel && (
        <>
          <div className="fixed inset-0 z-30 bg-black/40" onClick={() => setSyncPanel(false)} />
          <div className="relative z-40 bg-[#1a2035] border-b border-white/10 shadow-2xl">
            <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-white/5">
              <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Sincronización</span>
              <div className="flex items-center gap-3">
                {syncStatus.pending > 0 && (
                  <button
                    onClick={handleRetry}
                    disabled={retrying}
                    className="flex items-center gap-1 text-xs font-mono text-[#F5A623] hover:text-white disabled:opacity-50 transition-colors"
                  >
                    <RefreshCw size={12} className={retrying ? 'animate-spin' : ''} />
                    Reintentar
                  </button>
                )}
                <button onClick={() => setSyncPanel(false)} className="text-white/30 hover:text-white p-1 -mr-1">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="max-h-[50vh] overflow-y-auto divide-y divide-white/5">
              {panelItems.length === 0 ? (
                <p className="px-4 py-4 text-xs text-white/30 font-mono">Cargando...</p>
              ) : (
                panelItems.map(item => (
                  <div key={item.id} className="px-4 py-3 flex items-start gap-3">
                    <div className={`mt-0.5 shrink-0 ${item.failed ? 'text-red-400' : 'text-[#F5A623]'}`}>
                      {item.failed ? <AlertTriangle size={14} /> : <CloudOff size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-white/60 truncate">{item.summary}</p>
                      <p className={`text-xs mt-0.5 ${item.failed ? 'text-red-400/80' : 'text-white/30'}`}>
                        {item.failed
                          ? (item.detail || `El servidor rechazó el cambio (${item.status})`)
                          : 'Pendiente de conexión — se subirá automáticamente'}
                      </p>
                    </div>
                    {item.failed && (
                      <button
                        onClick={() => handleDismiss(item.id)}
                        className="shrink-0 text-white/20 hover:text-red-400 p-1 -mr-1 transition-colors"
                        aria-label="Descartar"
                        title="Descartar este error"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>

      {/* Bottom nav */}
      <nav className="bg-[#161b27] border-t border-white/10 flex sticky bottom-0 z-40 pb-safe">
        {(showTrailers && showVehicles) || isAdmin() ? (
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Inicio" active={location.pathname === '/'} />
        ) : null}
        {showTrailers && (
          <NavItem to="/trailers" icon={<List size={20} />} label="Carga" active={location.pathname.startsWith('/trailers')} />
        )}
        {showVehicles && (
          <NavItem to="/vehicles" icon={<Car size={20} />} label="Recibos" active={location.pathname.startsWith('/vehicles')} />
        )}
        {isAdmin() && (
          <>
            <NavItem to="/audit"   icon={<ClipboardList size={20} />} label="Audit"  active={location.pathname === '/audit'} />
            <NavItem to="/users"   icon={<Users size={20} />}         label="Users"  active={location.pathname === '/users'} />
            <NavItem to="/shares"  icon={<Link2 size={20} />}         label="Links"  active={location.pathname === '/shares'} />
          </>
        )}
      </nav>
    </div>
  )
}

function NavItem({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-h-[56px] transition-colors ${
        active ? 'text-[#F5A623]' : 'text-white/40 hover:text-white/70'
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  )
}
