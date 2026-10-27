import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, AlertTriangle } from 'lucide-react'
import api, { isQueuedResponse } from '../lib/api'
import { compressImage } from '../lib/compressImage'
import { newIdempotencyKey } from '../lib/idempotency'

const VIEWS = [
  { id: 'front',    labelEs: 'Frontal' },
  { id: 'right',    labelEs: 'Derecha' },
  { id: 'left',     labelEs: 'Izquierda' },
  { id: 'rear',     labelEs: 'Trasera' },
  { id: 'top',      labelEs: 'Techo' },
  { id: 'interior', labelEs: 'Interior' },
]

// Post-completion photos: append-only, audited. Two steps (fill → confirm) so
// nobody adds to a closed record by accident.
export default function AddendumSheet({ inspectionId, onSaved, onClose }) {
  const [view, setView] = useState('')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState([])
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)
  const keyRef = useRef(null)

  async function handlePhotos(e) {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    const compressed = await Promise.all(files.map(f => compressImage(f)))
    setPhotos(prev => [...prev, ...compressed])
  }

  async function handleConfirm() {
    if (saving) return
    setSaving(true)
    if (!keyRef.current) keyRef.current = newIdempotencyKey()
    try {
      const formData = new FormData()
      formData.append('view', view)
      formData.append('description', description.trim())
      for (const p of photos) formData.append('photos', p)
      const res = await api.post(`/vehicles/${inspectionId}/addenda`, formData, {
        headers: { 'Idempotency-Key': keyRef.current },
      })
      keyRef.current = null
      if (isQueuedResponse(res)) alert('Sin conexión — las fotos se subirán automáticamente al recuperar la señal.')
      onSaved?.()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al subir las fotos')
      setSaving(false)
    }
  }

  const ready = view && photos.length > 0 && description.trim()
  const viewLabel = VIEWS.find(v => v.id === view)?.labelEs

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col justify-end"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/70" onClick={saving ? undefined : onClose} />
        <motion.div
          className="relative bg-[#161b27] border-t border-white/10 rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto"
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">{confirming ? 'Confirmar hallazgo' : 'Agregar hallazgo posterior'}</h3>
            <button onClick={onClose} disabled={saving} className="p-2 text-white/50 min-w-[44px] min-h-[44px] flex items-center justify-center">
              <X size={20} />
            </button>
          </div>

          {!confirming ? (
            <>
              <p className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2">Zona</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {VIEWS.map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setView(v.id)}
                    className={`py-3 min-h-[48px] text-sm font-mono transition-colors ${
                      view === v.id
                        ? 'border-2 border-[#F5A623] bg-[#F5A62322] text-white'
                        : 'border border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    {v.labelEs}
                  </button>
                ))}
              </div>

              <p className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2">¿Qué se encontró?</p>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ej: Raspón en defensa trasera no visto en la revisión"
                rows={2}
                className="w-full bg-[#1e2535] border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#F5A623] resize-none mb-4"
              />

              <p className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2">Fotos</p>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border border-dashed border-white/20 py-3 text-white/50 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2 mb-3 min-h-[48px]"
              >
                <Camera size={18} />
                <span className="text-sm font-mono">Tomar o elegir fotos</span>
              </button>
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {photos.map((f, i) => (
                    <div key={i} className="relative">
                      <img src={URL.createObjectURL(f)} alt="" className="w-16 h-16 object-cover border border-white/10" />
                      <button
                        onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
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
                onClick={() => setConfirming(true)}
                disabled={!ready}
                className="w-full bg-[#F5A623] text-[#0f1117] font-bold py-4 min-h-[56px] hover:bg-[#e8961f] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Continuar
              </button>
            </>
          ) : (
            <>
              <div className="flex gap-3 bg-[#F5A623]/10 border border-[#F5A623]/30 p-4 mb-4">
                <AlertTriangle size={18} className="text-[#F5A623] shrink-0 mt-0.5" />
                <p className="text-sm text-white/80 leading-relaxed">
                  Vas a agregar <b>{photos.length} foto{photos.length !== 1 ? 's' : ''}</b> en <b>{viewLabel}</b> a una
                  inspección ya completada. Quedará en el historial y en el reporte PDF como
                  <b> agregado después del cierre</b>, con tu nombre y la fecha. <b>No se podrá borrar.</b>
                </p>
              </div>
              <p className="text-xs font-mono text-white/40 uppercase tracking-wider mb-1">Nota</p>
              <p className="text-sm text-white/70 bg-[#1e2535] border border-white/10 px-3 py-2.5 mb-4 whitespace-pre-wrap">{description.trim()}</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={saving}
                  className="flex-1 py-4 min-h-[56px] border border-white/10 text-white/50 font-mono text-sm hover:text-white disabled:opacity-40"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={saving}
                  className="flex-[2] bg-[#F5A623] text-[#0f1117] font-bold py-4 min-h-[56px] hover:bg-[#e8961f] disabled:opacity-60 transition-all"
                >
                  {saving ? 'Subiendo...' : 'Confirmar y subir'}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
