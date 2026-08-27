import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ClipboardCheck, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import api from '../lib/api'

const STATUS_LABELS = {
  draft:     { label: 'BORRADOR',  color: 'text-[#F5A623] bg-[#F5A62322] border-[#F5A62340]' },
  submitted: { label: 'ENVIADO',   color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  reviewed:  { label: 'REVISADO',  color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
  released:  { label: 'LIBERADO',  color: 'text-[#22C55E] bg-[#22C55E22] border-[#22C55E40]' },
}

const CLASSIFICATION_LABELS = {
  APTO: { label: 'APTO', color: 'text-[#22C55E]' },
  OPERAR_CON_OBSERVACIONES: { label: 'CON OBSERVACIONES', color: 'text-[#F5A623]' },
  APTO_CON_OBSERVACIONES: { label: 'CON OBSERVACIONES', color: 'text-[#F5A623]' },
  NO_OPERAR: { label: 'NO OPERAR', color: 'text-red-400' },
  NO_APTO: { label: 'NO APTO', color: 'text-red-400' },
}

function unitLabel(sub) {
  if (sub.asset) return `${sub.asset.economic_number}${sub.asset.brand ? ' · ' + sub.asset.brand : ''}`
  const hv = sub.header_values || {}
  return hv.no_economico || hv.unidad_no_economico || 'Sin unidad'
}

function SubmissionCard({ sub, onClick }) {
  const st = STATUS_LABELS[sub.status] || STATUS_LABELS.draft
  const cls = sub.classification ? CLASSIFICATION_LABELS[sub.classification] : null
  return (
    <motion.div
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="w-full bg-[#161b27] border border-white/10 p-4 text-left hover:border-[#F5A623]/40 active:scale-98 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <ClipboardCheck size={15} className="text-[#F5A623] shrink-0" />
            <span className="font-mono font-bold text-sm truncate">{sub.template?.name || 'Checklist'}</span>
          </div>
          <p className="text-white/70 text-sm truncate">{unitLabel(sub)}</p>
          {cls && <p className={`text-xs font-mono font-bold ${cls.color}`}>{cls.label}</p>}
        </div>
        <span className={`font-mono text-[10px] font-bold px-2 py-0.5 border uppercase shrink-0 ${st.color}`}>
          {st.label}
        </span>
      </div>
      <div className="flex justify-between text-xs text-white/25 font-mono mt-2">
        <span className="truncate">{sub.folio || '—'}</span>
        <span className="shrink-0">{new Date(sub.created_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}</span>
      </div>
    </motion.div>
  )
}

const PAGE_SIZE = 20

export default function ChecklistList() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  async function load(p = page, filter = statusFilter) {
    setLoading(true)
    try {
      const params = { page: p, page_size: PAGE_SIZE }
      if (filter) params.status = filter
      const { data } = await api.get('/checklists/submissions', { params })
      setItems(data?.items ?? [])
      setTotal(data?.total ?? 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { setPage(1); load(1, statusFilter) }, [statusFilter])
  useEffect(() => { load(page, statusFilter) }, [page])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <Layout title="Checklists">
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
        <button
          onClick={() => load(page, statusFilter)}
          className="ml-auto min-h-[36px] min-w-[36px] flex items-center justify-center text-white/40 hover:text-white flex-shrink-0"
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
