import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader, FileText, Printer, Download, CheckSquare, Square, ExternalLink, Trash2, Shield, ChevronLeft, ChevronRight, X, ZoomIn, Share2, Users, Lock } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from '../components/Layout'
import ShareModal from '../components/ShareModal'
import EditorsModal from '../components/EditorsModal'
import api from '../lib/api'
import { isAdmin, canEditDoc, canManageEditors } from '../lib/auth'
import { mediaUrl, thumbUrl } from '../lib/mediaUrl'

const CHECKLIST_ITEMS = [
  { key: 'licencia',     label: 'Copia de Licencia' },
  { key: 'circulacion',  label: 'Tarjeta de Circulación' },
  { key: 'aseguranza',   label: 'Copia de Aseguranza' },
  { key: 'cotizacion',   label: 'Cotización Firmada' },
  { key: 'autorizacion', label: 'Carta de Autorización' },
]

const STATUS_LABELS = {
  intake: { label: 'INTAKE', color: 'text-[#F5A623] bg-[#F5A62322] border-[#F5A62340]' },
  intake_complete: { label: 'FIRMADO', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  in_inspection: { label: 'EN INSPECCIÓN', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
  completed: { label: 'COMPLETADO', color: 'text-[#22C55E] bg-[#22C55E22] border-[#22C55E40]' },
}

const DAMAGE_COLORS = {
  condition: '#22C55E',
  scratched: '#EF4444', dented: '#F97316', stained: '#3B82F6',
  cracked: '#8B5CF6', missing: '#6B7280', other: '#F5A623',
}


function PhotoLightbox({ photos, startIndex, onClose }) {
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
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={e => e.stopPropagation()}>
        <span className="text-white/50 text-sm font-mono">{idx + 1} / {photos.length}</span>
        <button onClick={onClose} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white/60 hover:text-white">
          <X size={22} />
        </button>
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden" onClick={e => e.stopPropagation()}>
        <motion.img
          key={idx}
          src={photos[idx]}
          alt=""
          className="max-w-full max-h-full object-contain select-none px-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.12 }}
        />
        {photos.length > 1 && (
          <>
            <button onClick={prev}
              className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors">
              <ChevronLeft size={26} />
            </button>
            <button onClick={next}
              className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors">
              <ChevronRight size={26} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="flex gap-1.5 px-4 py-3 overflow-x-auto shrink-0" onClick={e => e.stopPropagation()}>
          {photos.map((p, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`shrink-0 w-14 h-14 border-2 transition-all ${i === idx ? 'border-[#F5A623]' : 'border-transparent opacity-40 hover:opacity-70'}`}>
              <img src={p} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

async function openPDF(endpoint, filename = null) {
  const token = localStorage.getItem('token')
  const base = import.meta.env.VITE_API_URL || ''
  try {
    const resp = await fetch(`${base}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!resp.ok) throw new Error('PDF no disponible')
    const blob = await resp.blob()
    const url = URL.createObjectURL(blob)
    if (filename) {
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } else {
      window.open(url, '_blank', 'noopener')
    }
    setTimeout(() => URL.revokeObjectURL(url), 15000)
  } catch (err) {
    alert(err.message || 'Error al cargar el PDF')
  }
}

export default function VehicleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [insp, setInsp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [checklist, setChecklist] = useState({})
  const [savingChecklist, setSavingChecklist] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const [shareModal, setShareModal] = useState(false)
  const [editorsModal, setEditorsModal] = useState(false)
  const admin = isAdmin()

  const openPhoto = useCallback((photos, i) => {
    setLightbox({ photos, startIndex: i })
  }, [])

  useEffect(() => {
    api.get(`/vehicles/${id}`).then(({ data }) => {
      setInsp(data)
      setChecklist(data.checklist || {})
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <Layout title="Detalle" back="/vehicles">
        <div className="flex justify-center py-16"><Loader size={28} className="animate-spin text-[#F5A623]" /></div>
      </Layout>
    )
  }
  if (!insp) return <Layout title="No encontrado" back="/vehicles"><div className="p-8 text-center text-white/40">Inspección no encontrada</div></Layout>

  const st = STATUS_LABELS[insp.status] || STATUS_LABELS.intake
  const damages = insp.damages || []
  const canEdit = canEditDoc(insp)
  const canManage = canManageEditors(insp)

  // Damage summary by type
  async function handleSaveChecklist() {
    setSavingChecklist(true)
    try {
      const { data } = await api.patch(`/vehicles/${id}/checklist`, { checklist })
      setInsp(data)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al guardar')
    } finally {
      setSavingChecklist(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await api.delete(`/vehicles/${id}`)
      navigate('/vehicles')
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al archivar')
      setDeleting(false)
    }
  }

  const isMercancias = insp.vehicle_type === 'mercancias'
  const realDamages = damages.filter(d => d.damage_type !== 'condition')
  const conditionPhotos = damages.filter(d => d.damage_type === 'condition')
  const dmgSummary = realDamages.reduce((acc, d) => {
    acc[d.damage_type] = (acc[d.damage_type] || 0) + 1
    return acc
  }, {})


  return (
    <Layout title="Detalle" back="/vehicles">
      {insp.is_deleted && (
        <div className="px-4 py-2.5 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2 text-red-400 text-xs font-mono font-bold uppercase tracking-wider">
          <span>■</span> INSPECCIÓN ARCHIVADA — solo lectura
        </div>
      )}
      {!insp.is_deleted && !canEdit && (
        <div className="px-4 py-2.5 bg-[#F5A623]/10 border-b border-[#F5A623]/20 flex items-center gap-2 text-[#F5A623] text-xs font-mono font-bold uppercase tracking-wider">
          <Lock size={12} />
          Solo lectura — no eres el creador ni un editor invitado
        </div>
      )}
      <div className="px-4 py-4 pb-24 max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="bg-[#161b27] border border-white/10 p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h1 className="font-bold text-xl">
                {[insp.year, insp.make, insp.model].filter(Boolean).join(' ') || 'Vehículo'}
              </h1>
              <p className="text-white/50 text-sm">{insp.color} · {insp.vehicle_type?.toUpperCase()}</p>
              {insp.creator?.name && (
                <p className="text-white/25 text-xs font-mono mt-0.5">Creado por {insp.creator.name}</p>
              )}
            </div>
            <span className={`font-mono text-xs font-bold px-2 py-1 border whitespace-nowrap ${st.color}`}>
              {st.label}
            </span>
          </div>
          {isMercancias ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {insp.nombre_entrega && <InfoRow label="Entregado por" value={insp.nombre_entrega} />}
              {insp.nombre && <InfoRow label="Recibido por" value={insp.nombre} />}
              {insp.city && <InfoRow label="Ciudad" value={insp.city} />}
              {insp.fecha && <InfoRow label="Fecha" value={new Date(insp.fecha).toLocaleDateString('es-MX')} />}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {insp.nombre && <InfoRow label="Cliente" value={insp.nombre} />}
              {insp.placas && <InfoRow label="Placas" value={insp.placas} />}
              {insp.vin && <InfoRow label="VIN" value={insp.vin} />}
              {insp.odometer && <InfoRow label="Odómetro" value={`${insp.odometer.toLocaleString()} km/mi`} />}
              {insp.gasolina && <InfoRow label="Combustible" value={insp.gasolina} />}
              {insp.city && <InfoRow label="Ciudad" value={insp.city} />}
              {insp.fecha && <InfoRow label="Fecha" value={new Date(insp.fecha).toLocaleDateString('es-MX')} />}
            </div>
          )}
        </div>

        {/* Mercancias content */}
        {isMercancias && (
          <>
            {insp.mercancias_descripcion && (
              <section>
                <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-2">Descripción de Mercancía</h2>
                <p className="text-white/70 text-sm bg-[#161b27] border border-white/5 p-4 leading-relaxed whitespace-pre-wrap">{insp.mercancias_descripcion}</p>
              </section>
            )}
            {(insp.mercancias_fotos?.length > 0) && (
              <section>
                <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">
                  Fotos — {insp.mercancias_fotos.length} foto{insp.mercancias_fotos.length !== 1 ? 's' : ''}
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {insp.mercancias_fotos.map((p, i) => {
                    const all = insp.mercancias_fotos.map(x => mediaUrl(x))
                    return (
                      <button key={i} onClick={() => openPhoto(all, i)} className="relative aspect-square group">
                        <img src={thumbUrl(p)} loading="lazy" alt="" className="w-full h-full object-cover border border-white/10 group-hover:border-[#F5A623]/60 transition-colors" />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                          <ZoomIn size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}
          </>
        )}

        {/* Condition photos */}
        {!isMercancias && conditionPhotos.length > 0 && (
          <section>
            <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">
              Fotos de condición — {conditionPhotos.length} vista{conditionPhotos.length !== 1 ? 's' : ''}
            </h2>
            <div className="space-y-1.5">
              {conditionPhotos.map(d => (
                <div key={d.id} className="bg-[#161b27] border border-white/5 px-3 py-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full flex-shrink-0 bg-[#22C55E]" />
                    <span className="text-sm font-mono text-white/60 uppercase">{d.view}</span>
                    {d.photos?.length > 0 && <span className="text-xs text-white/30 ml-auto">{d.photos.length} foto{d.photos.length !== 1 ? 's' : ''}</span>}
                  </div>
                  {d.description && <p className="text-xs text-white/50 pl-5">{d.description}</p>}
                  {d.photos?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 pl-5">
                      {d.photos.map((p, i) => {
                        const all = d.photos.map(x => mediaUrl(x))
                        return (
                          <button key={i} onClick={() => openPhoto(all, i)} className="relative group">
                            <img src={thumbUrl(p)} loading="lazy" alt="" className="w-16 h-16 object-cover border border-white/10 group-hover:border-[#F5A623]/60 transition-colors" />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                              <ZoomIn size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Damage summary */}
        {!isMercancias && <section>
          <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">
            Daños — {realDamages.length} total{realDamages.length !== 1 ? 'es' : ''}
          </h2>
          {realDamages.length === 0 ? (
            <p className="text-white/25 text-sm font-mono">Sin daños registrados</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(dmgSummary).map(([type, count]) => (
                  <span key={type} className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono border border-white/10">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DAMAGE_COLORS[type] || '#F5A623' }} />
                    {count} {type}
                  </span>
                ))}
              </div>
              {Object.entries(
                realDamages.reduce((acc, d) => { (acc[d.view] = acc[d.view] || []).push(d); return acc }, {})
              ).map(([view, dmgs]) => (
                <div key={view} className="mb-3">
                  <p className="text-xs font-mono text-white/30 uppercase mb-1">{view}</p>
                  <div className="space-y-1.5">
                    {dmgs.map(d => (
                      <div key={d.id} className="bg-[#161b27] border border-white/5 px-3 py-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: DAMAGE_COLORS[d.damage_type] || '#F5A623' }} />
                          <span className="text-sm font-mono capitalize text-white/80">{d.damage_type}</span>
                          {d.photos?.length > 0 && <span className="text-xs text-white/30 ml-auto">{d.photos.length} foto{d.photos.length !== 1 ? 's' : ''}</span>}
                        </div>
                        {d.description && <p className="text-xs text-white/50 pl-5">{d.description}</p>}
                        {d.photos?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2 pl-5">
                            {d.photos.map((p, i) => {
                              const all = d.photos.map(x => mediaUrl(x))
                              return (
                                <button key={i} onClick={() => openPhoto(all, i)} className="relative group">
                                  <img src={thumbUrl(p)} loading="lazy" alt="" className="w-16 h-16 object-cover border border-white/10 group-hover:border-[#F5A623]/60 transition-colors" />
                                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                                    <ZoomIn size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </section>}

        {/* Checklist */}
        {!isMercancias && <section>
          <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">Documentos Recibidos</h2>
          <div className="space-y-1.5 mb-3">
            {CHECKLIST_ITEMS.map(({ key, label }) => {
              const checked = checklist[key]
              const itemEditable = canEdit && insp.status !== 'completed'
              return itemEditable ? (
                <button
                  key={key}
                  type="button"
                  onClick={() => setChecklist(prev => ({ ...prev, [key]: !prev[key] }))}
                  className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#161b27] border border-white/5 hover:border-white/20 transition-colors text-left"
                >
                  {checked
                    ? <CheckSquare size={16} className="text-[#22C55E] shrink-0" />
                    : <Square size={16} className="text-white/20 shrink-0" />}
                  <span className="text-sm text-white/70">{label}</span>
                </button>
              ) : (
                <div
                  key={key}
                  className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#161b27] border border-white/5 text-left"
                >
                  {checked
                    ? <CheckSquare size={16} className="text-[#22C55E] shrink-0" />
                    : <Square size={16} className="text-white/10 shrink-0" />}
                  <span className={`text-sm ${checked ? 'text-white/70' : 'text-white/30'}`}>{label}</span>
                </div>
              )
            })}
          </div>
          {canEdit && insp.status !== 'completed' && (
            <button
              onClick={handleSaveChecklist}
              disabled={savingChecklist}
              className="w-full py-2.5 border border-white/10 text-white/50 font-mono text-xs hover:text-white hover:border-white/30 transition-colors disabled:opacity-40"
            >
              {savingChecklist ? 'Guardando...' : 'Guardar documentos'}
            </button>
          )}
        </section>}

        {/* Signatures */}
        {(insp.firma_origen || insp.firma_destino) && (
          <section>
            <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">Firmas</h2>
            <div className="grid grid-cols-2 gap-3">
              {insp.firma_origen && (
                <div className="bg-[#161b27] border border-white/10 p-3">
                  <p className="text-[10px] font-mono text-white/30 mb-2">{isMercancias ? 'ENTREGA' : 'ORIGEN'}</p>
                  <img src={insp.firma_origen} alt="Firma origen" className="w-full h-16 object-contain bg-white" />
                  {insp.nombre_firma_origen && <p className="text-xs text-white/50 mt-1.5 truncate">{insp.nombre_firma_origen}</p>}
                  {insp.firma_hash_origen && (
                    <div className="flex items-center gap-1.5 mt-2 bg-[#0d1520] border border-[#22C55E]/20 px-2 py-1">
                      <Shield size={10} className="text-[#22C55E] shrink-0" />
                      <span className="text-[9px] font-mono text-[#22C55E]/70 truncate" title={insp.firma_hash_origen}>
                        {insp.firma_hash_origen.slice(0, 16).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {insp.firma_destino && (
                <div className="bg-[#161b27] border border-white/10 p-3">
                  <p className="text-[10px] font-mono text-white/30 mb-2">{isMercancias ? 'RECIBE' : 'DESTINO'}</p>
                  <img src={insp.firma_destino} alt="Firma destino" className="w-full h-16 object-contain bg-white" />
                  {insp.nombre_firma_destino && <p className="text-xs text-white/50 mt-1.5 truncate">{insp.nombre_firma_destino}</p>}
                  {insp.firma_hash_destino && (
                    <div className="flex items-center gap-1.5 mt-2 bg-[#0d1520] border border-[#22C55E]/20 px-2 py-1">
                      <Shield size={10} className="text-[#22C55E] shrink-0" />
                      <span className="text-[9px] font-mono text-[#22C55E]/70 truncate" title={insp.firma_hash_destino}>
                        {insp.firma_hash_destino.slice(0, 16).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Actions */}
        <section className="space-y-2">
          {insp.liability_pdf_path && (() => {
            const slug = [insp.nombre, insp.placas, insp.fecha].filter(Boolean).join('_').replace(/\s+/g, '-') || id
            const filename = `descargo_${slug}.pdf`
            return (
              <div className="border border-white/10">
                <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5">
                  <FileText size={16} className="text-[#F5A623] shrink-0" />
                  <span className="text-sm text-white/70 flex-1">PDF del Descargo</span>
                </div>
                <div className="flex">
                  <button
                    onClick={() => openPDF(`/vehicles/${id}/liability-pdf`)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors border-r border-white/5"
                  >
                    <Printer size={15} />
                    Ver / Imprimir
                  </button>
                  <button
                    onClick={() => openPDF(`/vehicles/${id}/liability-pdf`, filename)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-white/60 hover:text-[#F5A623] hover:bg-[#F5A62308] transition-colors"
                  >
                    <Download size={15} />
                    Descargar
                  </button>
                </div>
              </div>
            )
          })()}
          {insp.status === 'completed' && (
            <button
              onClick={() => openPDF(`/vehicles/${id}/${isMercancias ? 'mercancias-pdf' : 'report-pdf'}`)}
              className="w-full flex items-center gap-3 py-3.5 px-4 border border-white/10 hover:border-[#F5A623]/40 transition-colors"
            >
              <Printer size={18} className="text-[#F5A623]" />
              <span className="flex-1 text-sm text-left">{isMercancias ? 'Imprimir Recibo de Mercancía' : 'Imprimir / Guardar Reporte Completo'}</span>
              <ExternalLink size={14} className="text-white/30" />
            </button>
          )}
          {!insp.is_deleted && insp.status !== 'completed' && canEdit && (
            <button
              onClick={() => navigate(isMercancias ? `/vehicles/${id}/mercancias` : `/vehicles/${id}/inspection`)}
              className="w-full py-3.5 border border-purple-400/40 text-purple-400 font-mono text-sm hover:bg-purple-400/10 transition-colors"
            >
              {isMercancias ? 'Continuar Recibo →' : 'Continuar Inspección →'}
            </button>
          )}
          {!insp.is_deleted && canManage && (
            <button
              onClick={() => setEditorsModal(true)}
              className="w-full flex items-center gap-3 py-3.5 px-4 border border-white/10 hover:border-[#F5A623]/40 transition-colors"
            >
              <Users size={18} className="text-[#F5A623]" />
              <span className="flex-1 text-sm text-left">
                Editores invitados{insp.editor_ids?.length > 0 ? ` (${insp.editor_ids.length})` : ''}
              </span>
              <ExternalLink size={14} className="text-white/30" />
            </button>
          )}
          {!insp.is_deleted && insp.status === 'completed' && canEdit && (
            <button
              onClick={() => setShareModal(true)}
              className="w-full flex items-center gap-3 py-3.5 px-4 border border-white/10 hover:border-[#F5A623]/40 transition-colors"
            >
              <Share2 size={18} className="text-[#F5A623]" />
              <span className="flex-1 text-sm text-left">Compartir inspección</span>
              <ExternalLink size={14} className="text-white/30" />
            </button>
          )}
          {!insp.is_deleted && admin && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 border border-red-500/30 text-red-400/70 font-mono text-sm hover:border-red-500/60 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
              Archivar inspección
            </button>
          )}
        </section>

        {/* Notes */}
        {insp.notas && (
          <section>
            <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-2">Notas de intake</h2>
            <p className="text-white/60 text-sm bg-[#161b27] border border-white/5 p-3">{insp.notas}</p>
          </section>
        )}

        {/* Final notes */}
        {insp.notas_finales && (
          <section>
            <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-2">Nota final</h2>
            <p className="text-white/60 text-sm bg-[#161b27] border border-white/5 p-3">{insp.notas_finales}</p>
          </section>
        )}
      </div>

      {shareModal && (
        <ShareModal
          inspectionId={id}
          entryNumber={insp.entry_number}
          onEntryNumberSaved={v => setInsp(prev => ({ ...prev, entry_number: v }))}
          onClose={() => setShareModal(false)}
        />
      )}

      {editorsModal && (
        <EditorsModal
          module="vehicles"
          docId={id}
          onClose={() => setEditorsModal(false)}
          onChange={() => api.get(`/vehicles/${id}`).then(({ data }) => setInsp(data)).catch(console.error)}
        />
      )}

      <AnimatePresence>
        {lightbox && (
          <PhotoLightbox
            photos={lightbox.photos}
            startIndex={lightbox.startIndex}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>

      {/* Confirm archive modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/80" onClick={() => setConfirmDelete(false)} />
          <div className="relative bg-[#161b27] border border-white/10 p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-2">¿Archivar inspección?</h3>
            <p className="text-white/50 text-sm mb-6">
              La inspección dejará de aparecer en la lista. Esta acción es reversible desde la base de datos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-3 border border-white/10 text-white/50 font-mono text-sm hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => { setConfirmDelete(false); handleDelete() }}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 text-white font-bold text-sm hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? 'Archivando...' : 'Archivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-white/30 text-xs font-mono">{label}</span>
      <span className="text-white/80">{value}</span>
    </div>
  )
}
