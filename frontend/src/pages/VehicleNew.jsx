import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../lib/api'
import { newIdempotencyKey } from '../lib/idempotency'

const TYPES = [
  { id: 'sedan',      label: 'Sedan / Auto',    desc: '4 puertas',       icon: '🚗' },
  { id: 'pickup',     label: 'Pickup Truck',     desc: 'Camioneta',       icon: '🛻' },
  { id: 'van',        label: 'Van',              desc: 'Pasajeros / Carga', icon: '🚐' },
  { id: 'golf',       label: 'Golf Cart',        desc: 'Carrito de golf', icon: '⛳' },
  { id: 'canam',      label: 'Can-Am / UTV',     desc: 'Side by side',    icon: '🏎️' },
  { id: 'motorcycle', label: 'Motocicleta',      desc: 'Moto / Scooter',  icon: '🏍️' },
  { id: 'atv',        label: 'Cuatrimoto',       desc: 'ATV / Quad',      icon: '🚵' },
  { id: 'racer',      label: 'Racer / Buggy',    desc: 'Off-road',        icon: '🏁' },
  { id: 'mercancias', label: 'Mercancía',        desc: 'Recibo de carga', icon: '📦' },
]

export default function VehicleNew() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(null)
  // Reused across manual retries of the SAME type so a slow request that actually
  // reached the server (but timed out before the response arrived) can't create a
  // second inspection when the user taps again. Cleared once that type succeeds.
  const retryKeys = useRef({})

  async function handleSelect(type_id) {
    setLoading(type_id)
    if (!retryKeys.current[type_id]) retryKeys.current[type_id] = newIdempotencyKey()
    try {
      const { data } = await api.post('/vehicles', { vehicle_type: type_id }, {
        headers: { 'Idempotency-Key': retryKeys.current[type_id] },
      })
      delete retryKeys.current[type_id]
      if (type_id === 'mercancias') {
        navigate(`/vehicles/${data.id}/mercancias`)
      } else {
        navigate(`/vehicles/${data.id}/intake`)
      }
    } catch (err) {
      const detail = err.response?.data?.detail
      alert(detail || 'Sin conexión: no se pudo crear el recibo. Intenta de nuevo cuando tengas señal.')
      setLoading(null)
    }
  }

  return (
    <Layout title="Nuevo Recibo" back="/vehicles">
      <div className="px-4 py-4 pb-24">
        <p className="text-white/40 text-sm font-mono mb-4">Selecciona el tipo de recibo</p>
        <div className="grid grid-cols-2 gap-3">
          {TYPES.map(({ id, label, desc, icon }) => (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              disabled={!!loading}
              className="bg-[#161b27] border border-white/10 hover:border-[#F5A623]/60 active:scale-97 transition-all p-5 flex flex-col items-center gap-2 disabled:opacity-60 min-h-[100px] justify-center"
            >
              {loading === id ? (
                <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-3xl leading-none">{icon}</span>
              )}
              <span className="text-sm font-bold text-white text-center leading-tight">{label}</span>
              <span className="text-[10px] font-mono text-white/40 text-center">{desc}</span>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  )
}
