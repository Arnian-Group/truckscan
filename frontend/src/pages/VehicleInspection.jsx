import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Loader, CheckCircle, Plus, Users, X, Pencil, Eye, WifiOff } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from '../components/Layout'
import DamageSheet from '../components/DamageSheet'
import EditorsModal from '../components/EditorsModal'
import api, { isQueuedResponse } from '../lib/api'
import { newIdempotencyKey } from '../lib/idempotency'
import { canEditDoc, canManageEditors } from '../lib/auth'
import { thumbUrl } from '../lib/mediaUrl'
import { subscribeStaleVehicle } from '../lib/staleData'

function photoSrc(p) {
  return p.startsWith('blob:') ? p : thumbUrl(p)
}

const DAMAGE_TYPE_LABELS = {
  condition: 'General', scratched: 'Rallado', dented: 'Abollado',
  stained: 'Manchado', cracked: 'Quebrado', missing: 'Faltante', other: 'Otro',
}

const VIEWS = [
  { id: 'front',    label: 'Front',    labelEs: 'Frontal' },
  { id: 'right',    label: 'Right',    labelEs: 'Der.' },
  { id: 'left',     label: 'Left',     labelEs: 'Izq.' },
  { id: 'rear',     label: 'Rear',     labelEs: 'Trasera' },
  { id: 'top',      label: 'Top',      labelEs: 'Techo' },
  { id: 'interior', label: 'Interior', labelEs: 'Interior' },
]

export default function VehicleInspection() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [insp, setInsp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('front')
  const [pendingCoords, setPendingCoords] = useState(null)
  const [savingDamage, setSavingDamage] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [confirmFinish, setConfirmFinish] = useState(false)
  const [notasFinales, setNotasFinales] = useState('')
  const [selectedDamage, setSelectedDamage] = useState(null)
  const [editorsModal, setEditorsModal] = useState(false)
  const [stale, setStale] = useState(false)
  // Reused across manual retries of the same attempt — see VehicleNew.jsx for why.
  const damageKeyRef = useRef(null)
  const completeKeyRef = useRef(null)

  async function load() {
    setStale(false)
    try {
      const { data } = await api.get(`/vehicles/${id}`)
      if (!canEditDoc(data)) {
        navigate(`/vehicles/${id}`, { replace: true })
        return
      }
      // If we just signed offline, the cached/queued status may still read "intake"
      // until the sign request syncs — trust the local action instead of bouncing back.
      const justSigned = location.state?.justSigned
      if (data.status === 'completed') {
        navigate(`/vehicles/${id}`, { replace: true })
        return
      }
      if (data.status === 'intake' && !justSigned) {
        navigate(`/vehicles/${id}/intake`, { replace: true })
        return
      }
      let current = data
      if (data.status === 'intake' || data.status === 'intake_complete') {
        try {
          const res = await api.patch(`/vehicles/${id}/start-inspection`)
          current = isQueuedResponse(res) ? { ...data, status: 'in_inspection' } : res.data
        } catch {
          current = { ...data, status: 'in_inspection' }
        }
      }
      setInsp(current)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  useEffect(() => subscribeStaleVehicle((url) => {
    if (url.endsWith(`/vehicles/${id}`)) setStale(true)
  }), [id])

  const handleAddDamage = useCallback(() => {
    setPendingCoords({ x_pct: 50, y_pct: 50 })
  }, [])

  async function handleSaveDamage({ damage_type, description, photos }) {
    setSavingDamage(true)
    if (!damageKeyRef.current) damageKeyRef.current = newIdempotencyKey()
    try {
      const formData = new FormData()
      formData.append('view', activeView)
      formData.append('x_pct', pendingCoords.x_pct.toString())
      formData.append('y_pct', pendingCoords.y_pct.toString())
      formData.append('damage_type', damage_type)
      if (description) formData.append('description', description)
      for (const photo of photos) formData.append('photos', photo)

      const res = await api.post(`/vehicles/${id}/damages`, formData, {
        headers: { 'Idempotency-Key': damageKeyRef.current },
      })
      damageKeyRef.current = null
      const dmg = isQueuedResponse(res)
        ? {
            id: `local-${crypto.randomUUID()}`,
            view: activeView,
            x_pct: pendingCoords.x_pct,
            y_pct: pendingCoords.y_pct,
            damage_type,
            description: description || null,
            photos: photos.map(p => URL.createObjectURL(p)),
            created_at: new Date().toISOString(),
            _pending: true,
          }
        : res.data
      setInsp(prev => ({ ...prev, damages: [...(prev.damages || []), dmg] }))
      setPendingCoords(null)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al guardar')
    } finally {
      setSavingDamage(false)
    }
  }

  async function handleDeleteDamage(dmgId) {
    // Pending damages added offline have no server-side counterpart yet — drop locally.
    if (dmgId.startsWith('local-')) {
      setInsp(prev => ({ ...prev, damages: prev.damages.filter(d => d.id !== dmgId) }))
      setSelectedDamage(null)
      return
    }
    try {
      await api.delete(`/vehicles/${id}/damages/${dmgId}`)
      setInsp(prev => ({ ...prev, damages: prev.damages.filter(d => d.id !== dmgId) }))
      setSelectedDamage(null)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al eliminar')
    }
  }

  async function handleRemovePhoto(dmgId, photoIdx) {
    const dmg = insp.damages.find(d => d.id === dmgId)
    if (!dmg) return
    const newPhotos = dmg.photos.filter((_, i) => i !== photoIdx)
    if (dmgId.startsWith('local-')) {
      const updated = { ...dmg, photos: newPhotos }
      setInsp(prev => ({ ...prev, damages: prev.damages.map(d => d.id === dmgId ? updated : d) }))
      setSelectedDamage(updated)
      return
    }
    try {
      const res = await api.patch(`/vehicles/${id}/damages/${dmgId}`, { photos: newPhotos })
      const updated = isQueuedResponse(res) ? { ...dmg, photos: newPhotos } : res.data
      setInsp(prev => ({ ...prev, damages: prev.damages.map(d => d.id === dmgId ? updated : d) }))
      setSelectedDamage(updated)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al eliminar foto')
    }
  }

  async function handleComplete() {
    setCompleting(true)
    if (!completeKeyRef.current) completeKeyRef.current = newIdempotencyKey()
    try {
      await api.post(`/vehicles/${id}/complete`, { notas_finales: notasFinales || null }, {
        headers: { 'Idempotency-Key': completeKeyRef.current },
      })
      completeKeyRef.current = null
      navigate(`/vehicles/${id}`)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al completar')
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <Layout title="Inspección" back="/vehicles">
        <div className="flex justify-center py-16"><Loader size={28} className="animate-spin text-[#F5A623]" /></div>
      </Layout>
    )
  }

  const viewDamages = (insp?.damages || []).filter(d => d.view === activeView)
  const totalDamages = insp?.damages?.length || 0
  const viewsWithDamages = new Set((insp?.damages || []).map(d => d.view))

  return (
    <Layout title={`${insp?.make || ''} ${insp?.model || ''} — Inspección`} back="/vehicles">
      <div className="flex flex-col h-[calc(100vh-112px)]">

        {stale && (
          <div className="px-4 py-2.5 bg-[#F5A623]/10 border-b border-[#F5A623]/20 flex items-center gap-2 text-[#F5A623] text-xs font-mono flex-shrink-0">
            <WifiOff size={14} className="shrink-0" />
            <span className="flex-1">Sin conexión — mostrando la última versión guardada en este dispositivo, puede no estar actualizada.</span>
            <button onClick={load} className="font-bold underline shrink-0">Reintentar</button>
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="flex items-center bg-[#0d1520] border-b border-white/5 flex-shrink-0">
          <button
            onClick={() => navigate(`/vehicles/${id}`)}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-mono text-white/50 hover:text-white transition-colors min-h-[40px]"
          >
            <Eye size={14} className="text-[#F5A623] shrink-0" />
            Ver detalle
          </button>
          {canEditDoc(insp) && (
            <button
              onClick={() => navigate(`/vehicles/${id}/intake`)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-mono text-white/50 hover:text-white border-l border-white/5 transition-colors min-h-[40px]"
            >
              <Pencil size={14} className="text-[#F5A623] shrink-0" />
              Editar datos
            </button>
          )}
          {canManageEditors(insp) && (
            <button
              onClick={() => setEditorsModal(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-mono text-white/50 hover:text-white border-l border-white/5 transition-colors min-h-[40px]"
            >
              <Users size={14} className="text-[#F5A623] shrink-0" />
              Editores{insp?.editor_ids?.length > 0 ? ` (${insp.editor_ids.length})` : ''}
            </button>
          )}
        </div>

        {/* View tabs */}
        <div className="flex bg-[#161b27] border-b border-white/10 overflow-x-auto flex-shrink-0">
          {VIEWS.map(v => {
            const hasDamage = viewsWithDamages.has(v.id)
            return (
              <button
                key={v.id}
                onClick={() => setActiveView(v.id)}
                className={`flex-1 flex flex-col items-center py-2 px-1 min-w-[52px] transition-colors relative ${
                  activeView === v.id ? 'text-[#F5A623]' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {hasDamage && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                )}
                <span className="text-[10px] font-mono font-bold">{v.label}</span>
                <span className="text-[8px] text-white/30">{v.labelEs}</span>
                {activeView === v.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F5A623]" />
                )}
              </button>
            )
          })}
        </div>

        {/* Damage area */}
        <div className="flex-1 overflow-auto flex flex-col">

          {/* Add damage button */}
          <div className="px-4 pt-4 flex-shrink-0">
            <button
              onClick={handleAddDamage}
              className="w-full flex items-center justify-center gap-2 border border-dashed border-white/20 hover:border-[#F5A623]/60 text-white/40 hover:text-[#F5A623] py-5 transition-colors"
            >
              <Plus size={18} />
              <span className="text-sm font-mono">Agregar fotos / observación — {VIEWS.find(v => v.id === activeView)?.labelEs || activeView}</span>
            </button>
          </div>

          {/* Damage list for this view */}
          <div className="px-4 py-3 space-y-1.5 flex-1">
            {viewDamages.length === 0 ? (
              <p className="text-center text-white/20 text-xs font-mono py-6">Sin daños registrados en esta vista</p>
            ) : (
              viewDamages.map((d, i) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDamage(d)}
                  className="w-full flex items-center gap-3 bg-[#161b27] border border-white/5 hover:border-white/20 px-3 py-2.5 text-left transition-colors"
                >
                  <span className="w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: { condition:'#22C55E',scratched:'#EF4444',dented:'#F97316',stained:'#3B82F6',cracked:'#8B5CF6',missing:'#6B7280',other:'#F5A623' }[d.damage_type] || '#F5A623' }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-mono text-white/70">{DAMAGE_TYPE_LABELS[d.damage_type] || d.damage_type}</span>
                    {d.description && <p className="text-xs text-white/40 truncate">{d.description}</p>}
                  </div>
                  {d.photos?.length > 0 && (
                    <span className="text-xs text-white/30 font-mono">{d.photos.length}📷</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#161b27] border-t border-white/10 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="flex-1 text-xs text-white/40 font-mono">
            {totalDamages} observación{totalDamages !== 1 ? 'es' : ''} en total
          </div>
          <button
            onClick={() => setConfirmFinish(true)}
            disabled={completing}
            className="flex items-center gap-2 bg-[#22C55E] text-white font-bold py-2.5 px-5 text-sm hover:bg-[#16a34a] disabled:opacity-60 transition-all min-h-[44px]"
          >
            <CheckCircle size={16} />
            Finalizar
          </button>
        </div>
      </div>

      {/* Damage sheet */}
      <AnimatePresence>
        {pendingCoords && (
          <DamageSheet
            key="new-damage"
            onSave={handleSaveDamage}
            onClose={() => { damageKeyRef.current = null; setPendingCoords(null) }}
            loading={savingDamage}
          />
        )}
      </AnimatePresence>

      {/* Selected damage detail */}
      <AnimatePresence>
        {selectedDamage && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col justify-end"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/70" onClick={() => setSelectedDamage(null)} />
            <motion.div
              className="relative bg-[#161b27] border-t border-white/10 rounded-t-2xl p-5"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">{DAMAGE_TYPE_LABELS[selectedDamage.damage_type] || selectedDamage.damage_type} — {selectedDamage.view}</h3>
                <button onClick={() => setSelectedDamage(null)} className="p-2 text-white/50 min-w-[44px] min-h-[44px] flex items-center justify-center">
                  ✕
                </button>
              </div>
              {selectedDamage.description && (
                <p className="text-white/60 text-sm mb-3">{selectedDamage.description}</p>
              )}
              {selectedDamage.photos?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedDamage.photos.map((p, i) => (
                    <div key={i} className="relative">
                      <img src={photoSrc(p)} loading="lazy" alt="" className="w-20 h-20 object-cover border border-white/10" />
                      <button
                        onClick={() => handleRemovePhoto(selectedDamage.id, i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => handleDeleteDamage(selectedDamage.id)}
                className="w-full py-3 border border-red-500/40 text-red-400 font-mono text-sm hover:bg-red-500/10 transition-colors"
              >
                Eliminar daño
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm finish modal */}
      <AnimatePresence>
        {confirmFinish && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/80" onClick={() => setConfirmFinish(false)} />
            <motion.div
              className="relative bg-[#161b27] border border-white/10 p-6 w-full max-w-sm"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
            >
              <h3 className="font-bold text-lg mb-2">¿Finalizar Inspección?</h3>
              <p className="text-white/50 text-sm mb-4">
                Una vez finalizado no se pueden agregar más observaciones. Se generará el reporte PDF.
              </p>
              <textarea
                value={notasFinales}
                onChange={e => setNotasFinales(e.target.value)}
                placeholder="Nota final (opcional)..."
                rows={2}
                className="w-full bg-[#1e2535] border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#F5A623] resize-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmFinish(false)}
                  className="flex-1 py-3 border border-white/10 text-white/50 font-mono text-sm hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => { setConfirmFinish(false); handleComplete() }}
                  disabled={completing}
                  className="flex-1 py-3 bg-[#22C55E] text-white font-bold text-sm hover:bg-[#16a34a] disabled:opacity-60"
                >
                  {completing ? 'Finalizando...' : 'Finalizar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {editorsModal && (
        <EditorsModal
          module="vehicles"
          docId={id}
          onClose={() => setEditorsModal(false)}
          onChange={() => api.get(`/vehicles/${id}`).then(({ data }) => setInsp(data)).catch(console.error)}
        />
      )}
    </Layout>
  )
}
