import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ClipboardCheck, RefreshCw, ChevronLeft, ChevronRight, Wrench, ShieldCheck, ShieldAlert, AlertTriangle, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import api from '../lib/api'
import { isAdmin, getUser } from '../lib/auth'

const ASSET_TYPE_ICON = { forklift: '🏗️', utility_vehicle: '🚙' }

const STATUS_LABELS = {
  draft:     { label: 'BORRADOR',  color: 'text-[#F5A623] bg-[#F5A62322] border-[#F5A62340]' },
  submitted: { label: 'ENVIADO',   color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  reviewed:  { label: 'REVISADO',  color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
  released:  { label: 'LIBERADO',  color: 'text-[#22C55E] bg-[#22C55E22] border-[#22C55E40]' },
}

// The two templates use different classification strings for the same semantic
// outcome (NO_OPERAR vs NO_APTO, etc.) — grouped here into one filter/stat/border
// per bucket so montacargas and utilitarios read the same way at a glance.
const CLASSIFICATION_GROUPS = [
  { key: 'apto', label: 'APTO', values: ['APTO'], icon: ShieldCheck, text: 'text-[#22C55E]', chip: 'text-[#22C55E] bg-[#22C55E15] border-[#22C55E40]', border: 'border-l-[#22C55E]' },
  { key: 'obs', label: 'CON OBSERVACIONES', values: ['OPERAR_CON_OBSERVACIONES', 'APTO_CON_OBSERVACIONES'], icon: AlertTriangle, text: 'text-[#F5A623]', chip: 'text-[#F5A623] bg-[#F5A62315] border-[#F5A62340]', border: 'border-l-[#F5A623]' },
  { key: 'no_apto', label: 'NO APTO', values: ['NO_OPERAR', 'NO_APTO'], icon: ShieldAlert, text: 'text-red-400', chip: 'text-red-400 bg-red-400/10 border-red-400/40', border: 'border-l-red-400' },
]
function classificationGroup(classification) {
  return CLASSIFICATION_GROUPS.find((g) => g.values.includes(classification))
}

const SORT_OPTIONS = [
  { value: 'recent', label: 'MÁS RECIENTES' },
  { value: 'oldest', label: 'MÁS ANTIGUOS' },
  { value: 'folio', label: 'FOLIO' },
  { value: 'unit', label: 'UNIDAD' },
]

function unitLabel(sub) {
  if (sub.asset) return `${sub.asset.economic_number}${sub.asset.brand ? ' · ' + sub.asset.brand : ''}`
  const hv = sub.header_values || {}
  return hv.no_economico || hv.unidad_no_economico || 'Sin unidad'
}

function canDeleteSubmission(sub, me) {
  if (isAdmin()) return true
  return sub.status === 'draft' && me && String(sub.created_by) === String(me.id)
}

function SubmissionCard({ sub, onClick, onDelete, confirmingDelete }) {
  const st = STATUS_LABELS[sub.status] || STATUS_LABELS.draft
  const cls = sub.classification ? classificationGroup(sub.classification) : null
  const me = getUser()
  const deletable = canDeleteSubmission(sub, me)
  return (
    <div className="relative">
      <motion.div
        onClick={onClick}
        whileTap={{ scale: 0.98 }}
        className={`w-full bg-[#161b27] border border-white/10 border-l-4 ${cls ? cls.border : 'border-l-white/10'} p-4 text-left hover:border-[#F5A623]/40 active:scale-98 transition-all cursor-pointer`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm leading-none shrink-0">{ASSET_TYPE_ICON[sub.template?.asset_type] || <ClipboardCheck size={15} className="text-[#F5A623]" />}</span>
              <span className="font-mono font-bold text-sm truncate">{sub.template?.name || 'Checklist'}</span>
            </div>
            <p className="text-white/70 text-sm truncate">{unitLabel(sub)}</p>
          </div>
          <div className={`flex flex-col items-end gap-1 shrink-0 ${deletable ? 'mr-9' : ''}`}>
            <span className={`font-mono text-[10px] font-bold px-2 py-0.5 border uppercase ${st.color}`}>
              {st.label}
            </span>
            {cls && (
              <span className={`font-mono text-[10px] font-bold px-2 py-0.5 border uppercase flex items-center gap-1 ${cls.chip}`}>
                <cls.icon size={10} /> {cls.label}
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-between text-xs text-white/25 font-mono mt-2">
          <span className="truncate">{sub.folio || '—'}</span>
          <span className="shrink-0">{new Date(sub.created_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}</span>
        </div>
      </motion.div>
      {deletable && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(sub.id) }}
          className={`absolute top-3 right-3 min-w-[36px] min-h-[36px] flex items-center justify-center transition-all ${
            confirmingDelete
              ? 'bg-red-500/20 border border-red-500/60 text-red-400 px-2 text-[9px] font-mono font-bold gap-1'
              : 'text-white/20 hover:text-red-400 hover:bg-red-400/10'
          }`}
        >
          {confirmingDelete ? <><Trash2 size={11} />¿OK?</> : <Trash2 size={14} />}
        </button>
      )}
    </div>
  )
}

function StatChip({ active, onClick, icon, label, count, color }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-mono font-bold uppercase tracking-wider transition-colors min-h-[36px] whitespace-nowrap flex-shrink-0 ${
        active ? `${color} border-current` : 'text-white/40 border-white/10 hover:text-white'
      }`}
    >
      {icon}{label}
      <span className={`px-1.5 ${active ? 'bg-black/20' : 'bg-white/10'}`}>{count}</span>
    </button>
  )
}

const PAGE_SIZE = 20

export default function ChecklistList() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [assetTypes, setAssetTypes] = useState([])
  const [assetTypeFilter, setAssetTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [classificationFilter, setClassificationFilter] = useState('') // group key
  const [sort, setSort] = useState('recent')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [counts, setCounts] = useState({ draft: 0, by_classification: {} })
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  useEffect(() => {
    api.get('/checklists/templates').then(({ data }) => {
      const seen = new Map()
      for (const t of data) if (!seen.has(t.asset_type)) seen.set(t.asset_type, t.name.split(' ').slice(-1)[0])
      setAssetTypes([...seen.entries()].map(([asset_type, label]) => ({ asset_type, label })))
    }).catch(console.error)
  }, [])

  async function loadCounts(assetType) {
    try {
      const { data } = await api.get('/checklists/submissions/counts', { params: assetType ? { asset_type: assetType } : {} })
      setCounts(data)
    } catch (err) {
      console.error(err)
    }
  }

  async function load(p, filters) {
    setLoading(true)
    try {
      const params = { page: p, page_size: PAGE_SIZE, sort: filters.sort }
      if (filters.assetType) params.asset_type = filters.assetType
      if (filters.status) params.status = filters.status
      if (filters.classification) {
        const group = CLASSIFICATION_GROUPS.find((g) => g.key === filters.classification)
        if (group) params.classification = group.values.join(',')
      }
      const { data } = await api.get('/checklists/submissions', { params })
      setItems(data?.items ?? [])
      setTotal(data?.total ?? 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      setTimeout(() => setConfirmDeleteId((c) => (c === id ? null : c)), 4000)
      return
    }
    try {
      await api.delete(`/checklists/submissions/${id}`)
      setItems((prev) => prev.filter((i) => i.id !== id))
      setTotal((prev) => prev - 1)
      setConfirmDeleteId(null)
      loadCounts(assetTypeFilter)
    } catch (err) {
      alert(err.response?.data?.detail || 'No se pudo eliminar')
    }
  }

  const filters = { assetType: assetTypeFilter, status: statusFilter, classification: classificationFilter, sort }
  useEffect(() => { setPage(1); load(1, filters); loadCounts(assetTypeFilter) }, [assetTypeFilter, statusFilter, classificationFilter, sort])
  useEffect(() => { load(page, filters) }, [page])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const obsCount = (counts.by_classification?.OPERAR_CON_OBSERVACIONES || 0) + (counts.by_classification?.APTO_CON_OBSERVACIONES || 0)
  const noAptoCount = (counts.by_classification?.NO_OPERAR || 0) + (counts.by_classification?.NO_APTO || 0)
  const aptoCount = counts.by_classification?.APTO || 0

  return (
    <Layout title="Checklists">
      {/* Quick-glance stats — tap to filter by result */}
      <div className="px-4 py-3 flex gap-2 border-b border-white/5 overflow-x-auto">
        <StatChip
          active={statusFilter === 'draft'} onClick={() => setStatusFilter(statusFilter === 'draft' ? '' : 'draft')}
          icon={<ClipboardCheck size={13} />} label="Borrador" count={counts.draft || 0} color="text-[#F5A623]"
        />
        <StatChip
          active={classificationFilter === 'apto'} onClick={() => setClassificationFilter(classificationFilter === 'apto' ? '' : 'apto')}
          icon={<ShieldCheck size={13} />} label="Apto" count={aptoCount} color="text-[#22C55E]"
        />
        <StatChip
          active={classificationFilter === 'obs'} onClick={() => setClassificationFilter(classificationFilter === 'obs' ? '' : 'obs')}
          icon={<AlertTriangle size={13} />} label="Con obs." count={obsCount} color="text-[#F5A623]"
        />
        <StatChip
          active={classificationFilter === 'no_apto'} onClick={() => setClassificationFilter(classificationFilter === 'no_apto' ? '' : 'no_apto')}
          icon={<ShieldAlert size={13} />} label="No apto" count={noAptoCount} color="text-red-400"
        />
      </div>

      {/* Asset type */}
      {assetTypes.length > 1 && (
        <div className="px-4 py-2 flex gap-1.5 border-b border-white/5 overflow-x-auto">
          <button
            onClick={() => setAssetTypeFilter('')}
            className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors min-h-[30px] whitespace-nowrap flex-shrink-0 ${
              assetTypeFilter === '' ? 'bg-white/15 text-white border border-white/30' : 'text-white/30 border border-white/8 hover:text-white/60'
            }`}
          >
            TODOS LOS TIPOS
          </button>
          {assetTypes.map((t) => (
            <button
              key={t.asset_type}
              onClick={() => setAssetTypeFilter(t.asset_type)}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors min-h-[30px] whitespace-nowrap flex-shrink-0 border ${
                assetTypeFilter === t.asset_type ? 'bg-white/15 text-white border-white/30' : 'text-white/30 border-white/8 hover:text-white/60'
              }`}
            >
              {ASSET_TYPE_ICON[t.asset_type] || ''} {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Status + sort */}
      <div className="px-4 py-3 flex gap-2 border-b border-white/5 overflow-x-auto">
        {['', 'draft', 'submitted', 'reviewed', 'released'].map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors min-h-[36px] whitespace-nowrap flex-shrink-0 ${
              statusFilter === f ? 'bg-[#F5A623] text-[#0f1117]' : 'text-white/40 border border-white/10 hover:text-white'
            }`}
          >
            {f === '' ? 'TODOS' : STATUS_LABELS[f]?.label || f}
          </button>
        ))}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="ml-auto bg-[#1e2535] border border-white/10 text-white text-xs font-mono font-bold px-2 min-h-[36px] flex-shrink-0 focus:outline-none focus:border-[#F5A623]"
        >
          {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        {isAdmin() && (
          <button
            onClick={() => navigate('/checklists/assets')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-white/50 border border-white/10 hover:text-white hover:border-white/30 transition-colors min-h-[36px] whitespace-nowrap flex-shrink-0"
          >
            <Wrench size={13} /> Unidades
          </button>
        )}
        <button
          onClick={() => { load(page, filters); loadCounts(assetTypeFilter) }}
          className="min-h-[36px] min-w-[36px] flex items-center justify-center text-white/40 hover:text-white flex-shrink-0"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="px-4 py-4 space-y-3 pb-28">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <ClipboardCheck size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-mono text-sm">No hay checklists</p>
          </div>
        ) : (
          items.map((sub) => (
            <SubmissionCard
              key={sub.id}
              sub={sub}
              onClick={() => navigate(sub.status === 'draft' ? `/checklists/${sub.id}/fill` : `/checklists/${sub.id}`)}
              onDelete={handleDelete}
              confirmingDelete={confirmDeleteId === sub.id}
            />
          ))
        )}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-mono border border-white/10 disabled:opacity-30 hover:border-[#F5A623] min-h-[44px]"
            >
              <ChevronLeft size={16} />Anterior
            </button>
            <span className="text-xs font-mono text-white/40">{page}/{totalPages} <span className="text-white/20">({total})</span></span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-mono border border-white/10 disabled:opacity-30 hover:border-[#F5A623] min-h-[44px]"
            >
              Siguiente<ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => navigate('/checklists/new')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-[#F5A623] text-[#0f1117] flex items-center justify-center shadow-lg hover:bg-[#e8961f] active:scale-95 transition-all z-30"
        aria-label="Nuevo checklist"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>
    </Layout>
  )
}
