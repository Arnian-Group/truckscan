import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, Trash2 } from 'lucide-react'

const DAMAGE_TYPES = [
  { id: 'condition', label: 'Condition', labelEs: 'Sin daño',  color: '#22C55E' },
  { id: 'scratched', label: 'Scratched', labelEs: 'Rallado',   color: '#EF4444' },
  { id: 'dented',    label: 'Dented',    labelEs: 'Abollado',  color: '#F97316' },
  { id: 'stained',   label: 'Stained',   labelEs: 'Manchado',  color: '#3B82F6' },
  { id: 'cracked',   label: 'Cracked',   labelEs: 'Quebrado',  color: '#8B5CF6' },
  { id: 'missing',   label: 'Missing',   labelEs: 'Faltante',  color: '#6B7280' },
  { id: 'other',     label: 'Other',     labelEs: 'Otro',      color: '#F5A623' },
]

export default function DamageSheet({ onSave, onClose, loading = false, initialData = null }) {
  const [damageType, setDamageType] = useState(initialData?.damage_type || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [photos, setPhotos] = useState([])
  const fileRef = useRef(null)

  function handlePhotos(e) {
    const files = Array.from(e.target.files || [])
    setPhotos(prev => [...prev, ...files])
  }

  function removePhoto(i) {
    setPhotos(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    if (!damageType || loading) return
    await onSave({ damage_type: damageType, description, photos })
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col justify-end"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/70" onClick={onClose} />
        <motion.div
          className="relative bg-[#161b27] border-t border-white/10 rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto"
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Agregar Observación</h3>
            <button onClick={onClose} className="p-2 text-white/50 min-w-[44px] min-h-[44px] flex items-center justify-center">
              <X size={20} />
            </button>
          </div>

          {/* Damage type grid */}
          <p className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2">Tipo de observación</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {DAMAGE_TYPES.map(dt => (
              <button
                key={dt.id}
                type="button"
                onClick={() => setDamageType(dt.id)}
                className={`py-3 px-2 text-center transition-all min-h-[56px] flex flex-col items-center gap-1 ${
                  damageType === dt.id
                    ? 'border-2 text-white'
                    : 'border border-white/10 text-white/50 hover:text-white'
                }`}
                style={damageType === dt.id
                  ? { borderColor: dt.color, backgroundColor: dt.color + '22' }
                  : {}}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: dt.color }}
                />
                <span className="text-[10px] font-mono font-bold uppercase leading-tight">
                  {dt.label}
                </span>
                <span className="text-[9px] text-white/40 leading-tight">{dt.labelEs}</span>
              </button>
            ))}
          </div>

          {/* Description */}
          <p className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2">Descripción (opcional)</p>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ej: Buen estado general, raya en puerta trasera..."
            rows={2}
            className="w-full bg-[#1e2535] border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#F5A623] resize-none mb-4"
          />

          {/* Photos */}
          <p className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2">Fotos</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={handlePhotos}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border border-dashed border-white/20 py-3 text-white/50 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2 mb-3 min-h-[48px]"
          >
            <Camera size={18} />
            <span className="text-sm font-mono">Agregar Fotos</span>
          </button>
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {photos.map((f, i) => (
                <div key={i} className="relative">
                  <img
                    src={URL.createObjectURL(f)}
                    alt=""
                    className="w-16 h-16 object-cover border border-white/10"
                  />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!damageType || loading}
            className="w-full bg-[#F5A623] text-[#0f1117] font-bold py-4 min-h-[56px] hover:bg-[#e8961f] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
