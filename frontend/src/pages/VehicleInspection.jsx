import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader, CheckCircle, Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from '../components/Layout'
import DamageSheet from '../components/DamageSheet'
import api from '../lib/api'

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
  const [insp, setInsp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('front')
  const [pendingCoords, setPendingCoords] = useState(null)
  const [savingDamage, setSavingDamage] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [confirmFinish, setConfirmFinish] = useState(false)
  const [notasFinales, setNotasFinales] = useState('')
  const [selectedDamage, setSelectedDamage] = useState(null)

  async function load() {
    try {
      const { data } = await api.get(`/vehicles/${id}`)
      setInsp(data)
      if (data.status === 'completed') navigate(`/vehicles/${id}`, { replace: true })
      if (data.status === 'intake') navigate(`/vehicles/${id}/intake`, { replace: true })
      if (data.status === 'intake_complete') {
        const { data: d2 } = await api.patch(`/vehicles/${id}/start-inspection`)
        setInsp(d2)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleAddDamage = useCallback(() => {
    setPendingCoords({ x_pct: 50, y_pct: 50 })
  }, [])

  async function handleSaveDamage({ damage_type, description, photos }) {
    setSavingDamage(true)
    try {
      const formData = new FormData()
      formData.append('view', activeView)
      formData.append('x_pct', pendingCoords.x_pct.toString())
      formData.append('y_pct', pendingCoords.y_pct.toString())
      formData.append('damage_type', damage_type)
      if (description) formData.append('description', description)
      for (const photo of photos) formData.append('photos', photo)

      const { data: dmg } = await api.post(`/vehicles/${id}/damages`, formData)
      setInsp(prev => ({ ...prev, damages: [...(prev.damages || []), dmg] }))
      setPendingCoords(null)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al guardar')
    } finally {
      setSavingDamage(false)
    }
  }

  async function handleDeleteDamage(dmgId) {
    try {
      await api.delete(`/vehicles/${id}/damages/${dmgId}`)
      setInsp(prev => ({ ...prev, damages: prev.damages.filter(d => d.id !== dmgId) }))
      setSelectedDamage(null)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al eliminar')
    }
  }

  async function handleComplete() {
    setCompleting(true)
    try {
      await api.post(`/vehicles/${id}/complete`, { notas_finales: notasFinales || null })
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
                    <span className="text-xs font-mono text-white/70 capitalize">{d.damage_type}</span>
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
            onClose={() => setPendingCoords(null)}
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
                <h3 className="font-bold capitalize">{selectedDamage.damage_type} — {selectedDamage.view}</h3>
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
                    <img key={i} src={p} alt="" className="w-20 h-20 object-cover border border-white/10" />
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
    </Layout>
  )
}
