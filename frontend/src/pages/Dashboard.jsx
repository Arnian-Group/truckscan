import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Car } from 'lucide-react'
import { canTrailers, canVehicles } from '../lib/auth'
import Layout from '../components/Layout'

export default function Dashboard() {
  const navigate = useNavigate()
  const hasTrailers = canTrailers()
  const hasVehicles = canVehicles()

  useEffect(() => {
    if (hasTrailers && !hasVehicles) {
      navigate('/trailers', { replace: true })
    } else if (hasVehicles && !hasTrailers) {
      navigate('/vehicles', { replace: true })
    }
  }, [hasTrailers, hasVehicles, navigate])

  if (hasTrailers && !hasVehicles) return null
  if (hasVehicles && !hasTrailers) return null

  return (
    <Layout title="TruckScan">
      <div className="min-h-[calc(100vh-112px)] flex flex-col items-center justify-center px-6 py-12">
        <div className="mb-10 text-center">
          <p className="text-white/40 text-sm font-mono uppercase tracking-widest">Selecciona un módulo</p>
        </div>

        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          {hasTrailers && (
            <ModuleCard
              icon={<Truck size={48} className="text-[#F5A623]" />}
              title="CARGA"
              subtitle="Trailer Load Documentation"
              badge="TRAILERS"
              onClick={() => navigate('/trailers')}
            />
          )}
          {hasVehicles && (
            <ModuleCard
              icon={<Car size={48} className="text-[#F5A623]" />}
              title="RECIBOS"
              subtitle="Vehicle Receiving & Inspection"
              badge="RECIBOS"
              onClick={() => navigate('/vehicles')}
            />
          )}
        </div>

        <p className="mt-12 text-white/15 text-xs font-mono">ARNIAN TRUCKSCAN</p>
      </div>
    </Layout>
  )
}

function ModuleCard({ icon, title, subtitle, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-[#161b27] border border-white/10 hover:border-[#F5A623]/60 active:scale-98 transition-all p-8 flex flex-col items-center gap-5 text-center group"
    >
      <div className="w-20 h-20 bg-[#F5A62315] border border-[#F5A62330] flex items-center justify-center group-hover:bg-[#F5A62322] transition-colors">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight mb-1">{title}</div>
        <div className="text-white/40 text-sm">{subtitle}</div>
      </div>
      <span className="font-mono text-[10px] font-bold tracking-widest px-3 py-1 bg-[#F5A62320] text-[#F5A623] border border-[#F5A62340]">
        {badge}
      </span>
    </button>
  )
}
