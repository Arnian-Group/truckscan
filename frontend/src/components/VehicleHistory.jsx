import { useState, useEffect } from 'react'
import { Loader, Clock } from 'lucide-react'
import api from '../lib/api'

function formatValue(v) {
  if (v === null || v === undefined || v === '') return '(vacío)'
  return v
}

export default function VehicleHistory({ inspectionId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/vehicles/${inspectionId}/history`)
      .then(({ data }) => setItems(data))
      .catch(() => setError('No se pudo cargar el historial'))
      .finally(() => setLoading(false))
  }, [inspectionId])

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader size={20} className="animate-spin text-[#F5A623]" />
      </div>
    )
  }

  if (error) {
    return <p className="text-red-400 text-xs font-mono">{error}</p>
  }

  if (items.length === 0) {
    return <p className="text-white/30 text-xs font-mono">Sin cambios registrados aún</p>
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 text-xs">
          <Clock size={14} className="text-white/20 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-white/70 leading-relaxed">
              <span className="font-medium">{item.user?.name || 'Sistema'}</span>{' '}
              {item.type === 'field_change' ? (
                <>
                  cambió <span className="text-[#F5A623]">{item.field_label}</span>:{' '}
                  <span className="font-mono text-white/40">{formatValue(item.old_value)}</span>
                  {' → '}
                  <span className="font-mono text-white/80">{formatValue(item.new_value)}</span>
                </>
              ) : (
                <span className="text-white/60">{item.action_label}</span>
              )}
            </p>
            <p className="text-white/25 font-mono text-[10px] mt-0.5">
              {new Date(item.timestamp).toLocaleString('es-MX')}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
