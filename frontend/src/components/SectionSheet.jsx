import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, CheckCircle, ChevronLeft, ChevronRight, Loader } from 'lucide-react'
import api from '../lib/api'
import { mediaUrl } from '../lib/mediaUrl'

const DOOR_SECTIONS = [4, 8]

export default function SectionSheet({ trailerId, sectionNumber, section, onClose, onUpdate }) {
  const [photos, setPhotos] = useState(section?.photos || [])
  const [notes, setNotes] = useState(section?.notes || '')
  const [uploading, setUploading] = useState(false)
  const [marking, setMarking] = useState(false)
  const [done, setDone] = useState(section?.status === 'done')
  const [lightbox, setLightbox] = useState(null)
  const [removingPhoto, setRemovingPhoto] = useState(null)
  const fileRef = useRef()

  const isDoorSection = DOOR_SECTIONS.includes(sectionNumber)
  const sectionLabel = isDoorSection
    ? `Sección ${sectionNumber} — PUERTA / DOOR`
    : `Sección ${sectionNumber}`

  function apiError(err) {
    const detail = err.response?.data?.detail
    if (Array.isArray(detail)) return detail.map((e) => e.msg ?? JSON.stringify(e)).join(', ')
    return detail || err.message || 'Error desconocido'
  }

  async function handleFiles(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      const form = new FormData()
      files.forEach((f) => form.append('files', f))
      // No poner Content-Type a mano — axios lo setea con el boundary correcto
      const { data } = await api.post(
        `/trailers/${trailerId}/sections/${sectionNumber}/photos`,
        form
      )
      setPhotos(data.photos)
      onUpdate(data)
    } catch (err) {
      alert(apiError(err))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleRemovePhoto(photoPath) {
    setRemovingPhoto(photoPath)
    try {
      const { data } = await api.delete(
        `/trailers/${trailerId}/sections/${sectionNumber}/photos`,
        { params: { photo: photoPath } }
      )
      setPhotos(data.photos)
      onUpdate(data)
    } catch (err) {
      alert(apiError(err))
    } finally {
      setRemovingPhoto(null)
    }
  }

  async function handleMarkDone() {
    if (!photos.length) return alert('Add at least one photo first')
    setMarking(true)
    try {
      const { data } = await api.patch(
        `/trailers/${trailerId}/sections/${sectionNumber}/done`,
        { notes: notes || null }
      )
      setDone(true)
      onUpdate(data)
      setTimeout(onClose, 800)
    } catch (err) {
      alert(apiError(err))
    } finally {
      setMarking(false)
    }
  }


  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

        {/* Sheet */}
        <motion.div
          className="relative bg-[#161b27] border-t border-white/10 rounded-t-2xl max-h-[92vh] flex flex-col"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div>
              <h2 className="font-bold text-lg text-white">{sectionLabel}</h2>
              {isDoorSection && (
                <p className="text-xs text-[#F5A623] font-mono mt-0.5">Fotografiar juntas con sección {sectionNumber === 4 ? 8 : 4}</p>
              )}
            </div>
            <button onClick={onClose} className="p-2 text-white/50 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center">
              <X size={20} />
            </button>
          </div>

          {/* Upload overlay */}
          <AnimatePresence>
            {uploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-[#161b27]/85 flex flex-col items-center justify-center gap-4 rounded-t-2xl"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-2 border-[#F5A623] border-t-transparent rounded-full"
                />
                <p className="text-[#F5A623] font-mono font-bold text-sm tracking-wider">SUBIENDO FOTOS...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* Photo grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((src, i) => (
                  <div key={i} className="relative aspect-square">
                    <button
                      onClick={() => setLightbox(i)}
                      className="absolute inset-0 bg-[#1e2535] overflow-hidden"
                    >
                      <img
                        src={mediaUrl(src)}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    {!done && (
                      <button
                        onClick={() => handleRemovePhoto(src)}
                        disabled={removingPhoto === src}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white disabled:opacity-50"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={handleFiles}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading || done}
              className={`w-full min-h-[56px] border-2 border-dashed flex items-center justify-center gap-3 font-semibold text-base transition-all
                ${done ? 'border-white/10 text-white/30 cursor-not-allowed' : 'border-[#F5A623] text-[#F5A623] hover:bg-[#F5A62312] active:scale-98'}`}
            >
              <Camera size={22} />
              {uploading ? 'Subiendo...' : photos.length > 0 ? 'Agregar más fotos' : 'Agregar fotos'}
            </button>

            {/* Notes */}
            <div>
              <label className="text-xs text-white/50 font-mono uppercase tracking-wider block mb-1">
                Notas (opcional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={done}
                placeholder="Ej: dañado, húmedo, faltante..."
                className="w-full bg-[#1e2535] border border-white/10 text-white px-3 py-3 text-sm focus:outline-none focus:border-[#F5A623] disabled:opacity-40 min-h-[48px]"
              />
            </div>

            {section?.updater && (
              <p className="text-xs text-white/30 font-mono">
                Documentado por {section.updater.name} · {new Date(section.updated_at).toLocaleString()}
              </p>
            )}
          </div>

          {/* Footer CTA */}
          <div className="p-4 border-t border-white/10">
            {done ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center gap-2 min-h-[56px] bg-[#16a34a22] border border-[#22C55E] text-[#22C55E] font-bold text-base"
              >
                <CheckCircle size={22} />
                Sección documentada ✓
              </motion.div>
            ) : (
              <button
                onClick={handleMarkDone}
                disabled={marking || !photos.length}
                className="w-full min-h-[56px] bg-[#F5A623] text-[#0f1117] font-bold text-base hover:bg-[#e8961f] active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {marking ? (
                  <span className="animate-pulse">Guardando...</span>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Marcar como Hecha ✓
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Lightbox */}
      {lightbox !== null && (
        <Lightbox
          photos={photos}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onChange={setLightbox}
        />
      )}
    </AnimatePresence>
  )
}

function Lightbox({ photos, index, onClose, onChange }) {
  return (
    <motion.div
      className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onChange(Math.max(0, index - 1)) }}
        disabled={index === 0}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-3 text-white/70 disabled:opacity-20"
      >
        <ChevronLeft size={32} />
      </button>

      <img
        src={mediaUrl(photos[index])}
        alt={`Photo ${index + 1}`}
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      <button
        onClick={(e) => { e.stopPropagation(); onChange(Math.min(photos.length - 1, index + 1)) }}
        disabled={index === photos.length - 1}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-3 text-white/70 disabled:opacity-20"
      >
        <ChevronRight size={32} />
      </button>

      <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/70">
        <X size={24} />
      </button>

      <span className="absolute bottom-6 text-white/50 font-mono text-sm">
        {index + 1} / {photos.length}
      </span>
    </motion.div>
  )
}
