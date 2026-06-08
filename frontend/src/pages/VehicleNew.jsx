import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../lib/api'
import SedanSVG from '../assets/vehicles/SedanSVG'
import PickupSVG from '../assets/vehicles/PickupSVG'
import VanSVG from '../assets/vehicles/VanSVG'
import GolfCartSVG from '../assets/vehicles/GolfCartSVG'
import CanAmSVG from '../assets/vehicles/CanAmSVG'
import MotorcycleSVG from '../assets/vehicles/MotorcycleSVG'
import ATVSVG from '../assets/vehicles/ATVSVG'
import RacerSVG from '../assets/vehicles/RacerSVG'

const TYPES = [
  { id: 'sedan',      label: 'Sedan / Auto',     SVG: SedanSVG },
  { id: 'pickup',     label: 'Pickup Truck',      SVG: PickupSVG },
  { id: 'van',        label: 'Van',               SVG: VanSVG },
  { id: 'golf',       label: 'Golf Cart',         SVG: GolfCartSVG },
  { id: 'canam',      label: 'Can-Am / UTV',      SVG: CanAmSVG },
  { id: 'motorcycle', label: 'Motocicleta',       SVG: MotorcycleSVG },
  { id: 'atv',        label: 'Cuatrimoto / ATV',  SVG: ATVSVG },
  { id: 'racer',      label: 'Racer / Buggy',     SVG: RacerSVG },
]

export default function VehicleNew() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(null)

  async function handleSelect(type_id) {
    setLoading(type_id)
    try {
      const { data } = await api.post('/vehicles', { vehicle_type: type_id })
      navigate(`/vehicles/${data.id}/intake`)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al crear inspección')
      setLoading(null)
    }
  }

  return (
    <Layout title="Nueva Inspección" back="/vehicles">
      <div className="px-4 py-4 pb-24">
        <p className="text-white/40 text-sm font-mono mb-4">Selecciona el tipo de vehículo</p>
        <div className="grid grid-cols-2 gap-3">
          {TYPES.map(({ id, label, SVG }) => (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              disabled={!!loading}
              className="bg-[#161b27] border border-white/10 hover:border-[#F5A623]/60 active:scale-97 transition-all p-4 flex flex-col items-center gap-3 disabled:opacity-60"
            >
              <div className="w-full h-[80px] flex items-center justify-center">
                {loading === id ? (
                  <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <SVG view="side" className="w-full h-full" />
                )}
              </div>
              <span className="text-xs font-mono text-white/70 text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  )
}
