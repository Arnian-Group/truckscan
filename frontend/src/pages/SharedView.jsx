import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Truck, CheckSquare, Square, ChevronLeft, ChevronRight, X, AlertTriangle, Clock } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const API = import.meta.env.VITE_API_URL || ''

function sharedMedia(path, token, thumb = false) {
  if (!path) return ''
  return `${API}${path}?share_token=${encodeURIComponent(token)}${thumb ? '&thumb=1' : ''}`
}

const CHECKLIST_ITEMS = [
  { key: 'licencia',     label: 'Copia de Licencia' },
  { key: 'circulacion',  label: 'Tarjeta de Circulación' },
  { key: 'aseguranza',   label: 'Copia de Aseguranza' },
  { key: 'cotizacion',   label: 'Cotización Firmada' },
  { key: 'autorizacion', label: 'Carta de Autorización' },
]

const DAMAGE_COLORS = {
  condition: '#22C55E', scratched: '#EF4444', dented: '#F97316',
  stained: '#3B82F6', cracked: '#8B5CF6', missing: '#6B7280', other: '#F5A623',
}

const DAMAGE_LABELS = {
  condition: 'Condición', scratched: 'Rayón', dented: 'Abolladura',
  stained: 'Mancha', cracked: 'Crack', missing: 'Faltante', other: 'Otro',
}

const VIEW_LABELS = {
  front: 'Frente', rear: 'Trasera', left: 'Izquierdo',
  right: 'Derecho', top: 'Techo', interior: 'Interior',
}

const STATUS_CONFIG = {
  intake:          { label: 'INTAKE',      cls: 'text-[#F5A623] bg-[#F5A62322] border-[#F5A62340]' },
  intake_complete: { label: 'FIRMADO',     cls: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  in_inspection:   { label: 'INSPECCIÓN',  cls: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
  completed:       { label: 'COMPLETADO',  cls: 'text-[#22C55E] bg-[#22C55E22] border-[#22C55E40]' },
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ photos, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex)
  const prev = useCallback(() => setIdx(i => (i - 1 + photos.length) % photos.length), [photos.length])
  const next = useCallback(() => setIdx(i => (i + 1) % photos.length), [photos.length])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, onClose])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col bg-black"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={e => e.stopPropagation()}>
        <span className="text-white/50 text-sm font-mono">{idx + 1} / {photos.length}</span>
        <button onClick={onClose} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white/60 hover:text-white">
          <X size={22} />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center relative overflow-hidden" onClick={e => e.stopPropagation()}>
        <motion.img
          key={idx} src={photos[idx]} alt=""
          className="max-w-full max-h-full object-contain select-none px-12"
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.12 }}
        />
        {photos.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors"><ChevronLeft size={26} /></button>
            <button onClick={next} className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors"><ChevronRight size={26} /></button>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="flex gap-1.5 px-4 py-3 overflow-x-auto shrink-0" onClick={e => e.stopPropagation()}>
          {photos.map((p, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`shrink-0 w-14 h-14 border-2 transition-all ${i === idx ? 'border-[#F5A623]' : 'border-transparent opacity-40 hover:opacity-70'}`}>
              <img src={p} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ── Info Row ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex flex-col">
      <span className="text-white/30 text-xs font-mono">{label}</span>
      <span className="text-white/80">{value}</span>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SharedView() {
  const { token } = useParams()
  const [data,    setData]    = useState(null)
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    fetch(`${API}/shared/${token}`)
      .then(async r => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}))
          throw new Error(body.detail || `Error ${r.status}`)
        }
        return r.json()
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    const isGone = error.toLowerCase().includes('revoc') || error.toLowerCase().includes('vencid')
    return (
      <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 text-[#F5A623]">
          {isGone ? <Clock size={48} /> : <AlertTriangle size={48} />}
        </div>
        <h1 className="text-xl font-bold mb-2">{isGone ? 'Enlace no disponible' : 'Enlace inválido'}</h1>
        <p className="text-white/40 font-mono text-sm max-w-xs">{error}</p>
        <p className="mt-6 text-xs text-white/20 font-mono">ARNIAN TRUCKSCAN</p>
      </div>
    )
  }

  const { inspection: insp, share_token: shareToken, expires_at, label } = data
  const st = STATUS_CONFIG[insp.status] || STATUS_CONFIG.intake
  const isMercancias = insp.vehicle_type === 'mercancias'

  // Group damages by view
  const damagesByView = (insp.damages || []).reduce((acc, d) => {
    if (!acc[d.view]) acc[d.view] = []
    acc[d.view].push(d)
    return acc
  }, {})

  const checklist = insp.checklist || {}

  function openPhoto(photos, i) {
    setLightbox({ photos, startIndex: i })
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">

      {/* Header */}
      <header className="bg-[#161b27] border-b border-white/10 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <Truck size={20} className="text-[#F5A623] shrink-0" />
        <span className="font-bold text-base tracking-tight flex-1 truncate">TruckScan</span>
        {insp.folio && (
          <span className="font-mono text-xs text-[#F5A623]/60 shrink-0">{insp.folio}</span>
        )}
      </header>

      {/* Expiry banner */}
      {expires_at && (
        <div className="bg-[#F5A623]/10 border-b border-[#F5A623]/20 px-4 py-2 flex items-center gap-2">
          <Clock size={12} className="text-[#F5A623] shrink-0" />
          <span className="text-xs font-mono text-[#F5A623]/70">
            Enlace válido hasta: {new Date(expires_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            {label && ` · ${label}`}
          </span>
        </div>
      )}

      <main className="flex-1 px-4 py-5 space-y-6 max-w-2xl mx-auto w-full pb-12">

        {/* Status + type */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`font-mono text-xs font-bold px-2.5 py-1 border ${st.cls}`}>{st.label}</span>
          <span className="font-mono text-sm font-bold text-white/60">{insp.vehicle_type?.toUpperCase()}</span>
          {insp.folio && <span className="font-mono text-xs text-[#F5A623]/50">{insp.folio}</span>}
        </div>

        {/* Vehicle / client info */}
        <section>
          <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">
            {isMercancias ? 'Información' : 'Vehículo y cliente'}
          </h2>
          <div className="bg-[#161b27] border border-white/10 p-4 grid grid-cols-2 gap-x-4 gap-y-3">
            {isMercancias ? (
              <>
                <InfoRow label="Recibe" value={insp.nombre} />
                <InfoRow label="Entrega" value={insp.nombre_entrega} />
                <InfoRow label="Ciudad" value={insp.city} />
                <InfoRow label="Fecha" value={insp.fecha} />
                {insp.mercancias_descripcion && (
                  <div className="col-span-2">
                    <span className="text-white/30 text-xs font-mono">Descripción</span>
                    <p className="text-white/80 text-sm mt-0.5">{insp.mercancias_descripcion}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <InfoRow label="Cliente" value={insp.nombre} />
                <InfoRow label="ID Cliente" value={insp.id_cliente} />
                <InfoRow label="Año" value={insp.year} />
                <InfoRow label="Marca" value={insp.make} />
                <InfoRow label="Modelo" value={insp.model} />
                <InfoRow label="Color" value={insp.color} />
                <InfoRow label="Placas" value={insp.placas} />
                <InfoRow label="Odómetro" value={insp.odometer ? `${insp.odometer.toLocaleString()} km` : null} />
                <InfoRow label="VIN" value={insp.vin} />
                <InfoRow label="Gasolina" value={insp.gasolina} />
                <InfoRow label="Ciudad" value={insp.city} />
                <InfoRow label="Fecha" value={insp.fecha} />
              </>
            )}
          </div>
        </section>

        {/* Mercancía photos */}
        {isMercancias && (insp.mercancias_fotos || []).length > 0 && (
          <section>
            <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">Fotos</h2>
            <div className="grid grid-cols-3 gap-1.5">
              {insp.mercancias_fotos.map((p, i) => (
                <button key={i} onClick={() => openPhoto(insp.mercancias_fotos.map(x => sharedMedia(x, shareToken)), i)} className="aspect-square bg-[#161b27] border border-white/10 overflow-hidden">
                  <img src={sharedMedia(p, shareToken, true)} loading="lazy" alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Damages */}
        {!isMercancias && Object.keys(damagesByView).length > 0 && (
          <section>
            <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">Daños registrados</h2>
            <div className="space-y-4">
              {Object.entries(damagesByView).map(([view, damages]) => (
                <div key={view}>
                  <p className="text-xs font-mono text-white/50 uppercase mb-2">{VIEW_LABELS[view] || view}</p>
                  <div className="space-y-2">
                    {damages.map(d => (
                      <div key={d.id} className="bg-[#161b27] border border-white/10 p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: DAMAGE_COLORS[d.damage_type] || '#F5A623' }}
                          />
                          <span className="text-xs font-mono font-bold text-white/70 uppercase">
                            {DAMAGE_LABELS[d.damage_type] || d.damage_type}
                          </span>
                        </div>
                        {d.description && <p className="text-sm text-white/60 mb-2">{d.description}</p>}
                        {d.photos?.length > 0 && (
                          <div className="grid grid-cols-4 gap-1">
                            {d.photos.map((p, i) => (
                              <button
                                key={i}
                                onClick={() => openPhoto(d.photos.map(x => sharedMedia(x, shareToken)), i)}
                                className="aspect-square bg-[#1e2535] border border-white/5 overflow-hidden"
                              >
                                <img src={sharedMedia(p, shareToken, true)} loading="lazy" alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Checklist */}
        {!isMercancias && (
          <section>
            <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">Documentos</h2>
            <div className="bg-[#161b27] border border-white/10 divide-y divide-white/5">
              {CHECKLIST_ITEMS.map(item => {
                const checked = checklist[item.key]
                return (
                  <div key={item.key} className="flex items-center gap-3 px-4 py-3">
                    {checked
                      ? <CheckSquare size={16} className="text-[#22C55E] shrink-0" />
                      : <Square size={16} className="text-white/20 shrink-0" />}
                    <span className={`text-sm ${checked ? 'text-white/80' : 'text-white/30'}`}>{item.label}</span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Signatures */}
        {(insp.firma_origen || insp.firma_destino) && (
          <section>
            <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">Firmas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {insp.firma_origen && (
                <div className="bg-[#161b27] border border-white/10 p-3">
                  <p className="text-[10px] font-mono text-white/30 mb-2 uppercase">
                    Origen · {insp.nombre_firma_origen || '—'}
                  </p>
                  <img src={insp.firma_origen} alt="Firma origen" className="w-full h-24 object-contain bg-white/5" />
                </div>
              )}
              {insp.firma_destino && (
                <div className="bg-[#161b27] border border-white/10 p-3">
                  <p className="text-[10px] font-mono text-white/30 mb-2 uppercase">
                    Destino · {insp.nombre_firma_destino || '—'}
                  </p>
                  <img src={insp.firma_destino} alt="Firma destino" className="w-full h-24 object-contain bg-white/5" />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Notes */}
        {insp.notas && (
          <section>
            <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-2">Notas de intake</h2>
            <p className="text-white/60 text-sm bg-[#161b27] border border-white/5 p-3">{insp.notas}</p>
          </section>
        )}
        {insp.notas_finales && (
          <section>
            <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-2">Nota final</h2>
            <p className="text-white/60 text-sm bg-[#161b27] border border-white/5 p-3">{insp.notas_finales}</p>
          </section>
        )}

        <p className="text-center text-xs text-white/15 font-mono pt-4">
          ARNIAN TRUCKSCAN — San Diego ↔ Tijuana
        </p>
      </main>

      <AnimatePresence>
        {lightbox && (
          <Lightbox
            photos={lightbox.photos}
            startIndex={lightbox.startIndex}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
