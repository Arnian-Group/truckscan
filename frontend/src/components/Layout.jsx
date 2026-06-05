import { useNavigate, useLocation, Link } from 'react-router-dom'
import { logout, getUser, isAdmin } from '../lib/auth'
import { Truck, List, ClipboardList, Users, LogOut } from 'lucide-react'

export default function Layout({ children, title, back }) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getUser()

  function handleLogout() {
    logout()
    navigate('/login')
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
        <span className="font-bold text-lg tracking-tight flex-1 truncate">{title || 'TruckScan'}</span>
        <div className="flex items-center gap-1">
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

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>

      {/* Bottom nav */}
      <nav className="bg-[#161b27] border-t border-white/10 flex sticky bottom-0 z-40 pb-safe">
        <NavItem to="/" icon={<List size={20} />} label="Trailers" active={location.pathname === '/'} />
        {isAdmin() && (
          <>
            <NavItem to="/audit" icon={<ClipboardList size={20} />} label="Audit" active={location.pathname === '/audit'} />
            <NavItem to="/users" icon={<Users size={20} />} label="Users" active={location.pathname === '/users'} />
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
