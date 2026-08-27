import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Wrench, QrCode, Layers, Pencil, Power } from 'lucide-react'
import Layout from '../components/Layout'
import api from '../lib/api'

const ASSET_TYPE_ICON = { forklift: '🏗️', utility_vehicle: '🚙' }

async function openPDFBlob(endpoint, filename) {
  const token = localStorage.getItem('token')
  const base = import.meta.env.VITE_API_URL || ''
  try {
    const resp = await fetch(`${base}${endpoint}`, { headers: { Authorization: `Bearer ${token}` } })
    if (!resp.ok) throw new Error('No se pudo generar el PDF')
    const blob = await resp.blob()
    const url = URL.createObjectURL(blob)
    if (filename) {
      const a = document.createElement('a')
      a.href = url; a.download = filename
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
    } else {
      window.open(url, '_blank', 'noopener')
    }
    setTimeout(() => URL.revokeObjectURL(url), 15000)
  } catch (err) {
    alert(err.message || 'Error al generar el PDF')
  }
}

export default function ChecklistAssets() {
  const [assetTypes, setAssetTypes] = useState([])
  const [typeFilter, setTypeFilter] = useState('')
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingAsset, setEditingAsset] = useState(null)

  async function loadTypes() {
    const { data } = await api.get('/checklists/asset-types')
    setAssetTypes(data)
    if (!typeFilter && data.length) setTypeFilter(data[0].asset_type)
    return data
  }

  async function loadAssets(assetType) {
    setLoading(true)
    try {
      const { data } = await api.get('/checklists/assets', { params: assetType ? { asset_type: assetType } : {} })
      setAssets(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTypes().catch(console.error) }, [])
  useEffect(() => { if (typeFilter) loadAssets(typeFilter) }, [typeFilter])

  async function handleToggleActive(asset) {
    try {
      const { data } = await api.patch(`/checklists/assets/${asset.id}`, { is_active: !asset.is_active })
      setAssets((prev) => prev.map((a) => (a.id === data.id ? data : a)))
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al actualizar')
    }
  }

  return (
    <Layout title="Unidades y QR" back="/checklists">
      <div className="px-4 py-3 flex gap-2 border-b border-white/5 overflow-x-auto">
        {assetTypes.map((t) => (
          <button
            key={t.asset_type}
            onClick={() => setTypeFilter(t.asset_type)}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors min-h-[36px] whitespace-nowrap flex-shrink-0 ${
              typeFilter === t.asset_type ? 'bg-[#F5A623] text-[#0f1117]' : 'text-white/40 border border-white/10 hover:text-white'
            }`}
          >
            {ASSET_TYPE_ICON[t.asset_type] || ''} {t.label}
          </button>
        ))}
        {typeFilter && (
          <button
            onClick={() => openPDFBlob(`/checklists/assets/qr-sheet?asset_type=${typeFilter}`, `qr_sheet_${typeFilter}.pdf`)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-white/50 border border-white/10 hover:text-white hover:border-white/30 transition-colors min-h-[36px] whitespace-nowrap flex-shrink-0"
          >
            <Layers size={13} /> Hoja de QR
          </button>
        )}
      </div>

      <div className="px-4 py-4 space-y-3 pb-24">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <Wrench size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-mono text-sm">No hay unidades registradas</p>
          </div>
        ) : (
          assets.map((a) => (
            <div key={a.id} className={`bg-[#161b27] border p-4 flex items-center gap-3 ${a.is_active ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
              <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-white/5 text-lg">
                {ASSET_TYPE_ICON[a.asset_type] || <Wrench size={16} className="text-white/50" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-white">{a.economic_number}</div>
                <div className="text-white/40 text-xs font-mono truncate">
                  {[a.brand, a.model, a.plate].filter(Boolean).join(' · ') || '—'}
                  {a.ctpat_scope && <span className="ml-2 text-[#F5A623]">CTPAT</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openPDFBlob(`/checklists/assets/${a.id}/qr-label`, `qr_${a.economic_number}.pdf`)}
                  title="Descargar etiqueta QR"
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center text-white/30 hover:text-[#F5A623] hover:bg-[#F5A62310] transition-all"
                >
                  <QrCode size={16} />
                </button>
                <button
                  onClick={() => setEditingAsset(a)}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleToggleActive(a)}
                  title={a.is_active ? 'Desactivar' : 'Reactivar'}
                  className={`min-w-[40px] min-h-[40px] flex items-center justify-center transition-all ${a.is_active ? 'text-white/30 hover:text-red-400 hover:bg-red-400/10' : 'text-white/30 hover:text-[#22C55E] hover:bg-[#22C55E10]'}`}
                >
                  <Power size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => setShowCreate(true)}
        disabled={!typeFilter}
        className="fixed bottom-20 right-4 w-14 h-14 bg-[#F5A623] text-[#0f1117] flex items-center justify-center shadow-lg hover:bg-[#e8961f] active:scale-95 transition-all z-30 disabled:opacity-40"
        aria-label="Nueva unidad"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      <AnimatePresence>
        {showCreate && (
          <AssetModal
            assetType={typeFilter}
            onClose={() => setShowCreate(false)}
            onSaved={(a) => { setAssets((prev) => [...prev, a]); setShowCreate(false) }}
          />
        )}
        {editingAsset && (
          <AssetModal
            asset={editingAsset}
            assetType={editingAsset.asset_type}
            onClose={() => setEditingAsset(null)}
            onSaved={(a) => { setAssets((prev) => prev.map((x) => (x.id === a.id ? a : x))); setEditingAsset(null) }}
          />
        )}
      </AnimatePresence>
    </Layout>
  )
}

function AssetModal({ asset, assetType, onClose, onSaved }) {
  const isEdit = !!asset
  const [economicNumber, setEconomicNumber] = useState(asset?.economic_number || '')
  const [brand, setBrand] = useState(asset?.brand || '')
  const [model, setModel] = useState(asset?.model || '')
  const [plate, setPlate] = useState(asset?.plate || '')
  const [energyType, setEnergyType] = useState(asset?.energy_type || '')
  const [ctpatScope, setCtpatScope] = useState(asset?.ctpat_scope || false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const body = {
        economic_number: economicNumber, brand: brand || null, model: model || null,
        plate: plate || null, energy_type: energyType || null, ctpat_scope: ctpatScope,
      }
      const { data } = isEdit
        ? await api.patch(`/checklists/assets/${asset.id}`, body)
        : await api.post('/checklists/assets', { ...body, asset_type: assetType })
      onSaved(data)
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(Array.isArray(detail) ? detail.map((e) => e.msg ?? JSON.stringify(e)).join(', ') : (detail || 'Error al guardar'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <motion.div
        className="relative bg-[#161b27] border-t border-white/10 rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-xl">{isEdit ? 'Editar unidad' : 'Nueva unidad'}</h2>
          <button onClick={onClose} className="p-2 text-white/50 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="No. económico" value={economicNumber} onChange={setEconomicNumber} required />
          <Field label="Marca" value={brand} onChange={setBrand} />
          <Field label="Modelo" value={model} onChange={setModel} />
          <Field label="Placas" value={plate} onChange={setPlate} />
          {assetType === 'forklift' && (
            <div>
              <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-1.5">Tipo de energía</label>
              <select
                value={energyType}
                onChange={(e) => setEnergyType(e.target.value)}
                className="w-full bg-[#1e2535] border border-white/10 text-white px-4 py-3.5 text-base focus:outline-none focus:border-[#F5A623] min-h-[56px]"
              >
                <option value="">—</option>
                <option value="lp">LP</option>
                <option value="electrico">Eléctrico</option>
                <option value="diesel">Diésel</option>
                <option value="gasolina">Gasolina</option>
              </select>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCtpatScope((v) => !v)}
            className={`w-full flex items-center gap-3 p-3 border transition-all ${
              ctpatScope ? 'bg-white/5 border-white/20 text-white' : 'border-white/5 text-white/40 hover:text-white/70'
            }`}
          >
            <div className={`w-4 h-4 border-2 flex items-center justify-center flex-shrink-0 ${ctpatScope ? 'border-[#F5A623] bg-[#F5A623]' : 'border-white/20'}`}>
              {ctpatScope && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="#0f1117" strokeWidth="2" strokeLinecap="round"/></svg>}
            </div>
            <span className="text-sm text-left">Unidad en alcance CTPAT (cruza frontera con carga)</span>
          </button>

          {error && <p className="text-red-400 text-sm font-mono border border-red-400/30 bg-red-400/10 px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading || !economicNumber}
            className="w-full bg-[#F5A623] text-[#0f1117] font-bold text-base py-4 min-h-[56px] hover:bg-[#e8961f] transition-colors disabled:opacity-60"
          >
            {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear unidad'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}

function Field({ label, value, onChange, required }) {
  return (
    <div>
      <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-[#1e2535] border border-white/10 text-white px-4 py-3.5 text-base focus:outline-none focus:border-[#F5A623] min-h-[56px]"
      />
    </div>
  )
}
