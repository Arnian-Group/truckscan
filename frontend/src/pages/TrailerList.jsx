import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Truck, X, RefreshCw, ChevronLeft, ChevronRight, Archive } from 'lucide-react'
import Layout from '../components/Layout'
import api from '../lib/api'
import { isAdmin } from '../lib/auth'

const PAGE_SIZE = 20

function StatusBadge({ status }) {
  return (
    <span
      className={`font-mono text-xs px-2 py-0.5 font-bold uppercase tracking-wider ${
        status === 'completed'
          ? 'bg-[#22C55E22] text-[#22C55E] border border-[#22C55E40]'
          : 'bg-[#F5A62322] text-[#F5A623] border border-[#F5A62340]'
      }`}
    >
      {status === 'completed' ? 'COMPLETADO' : 'ABIERTO'}
    </span>
  )
}

function TrailerCard({ trailer, onClick }) {
  const doneCount = trailer.sections?.filter((s) => s.status === 'done').length || 0
  const totalCount = trailer.sections?.length || 8
  const isCompleted = trailer.status === 'completed'
  const displayDate = isCompleted ? trailer.updated_at : trailer.created_at

  return (
    <motion.button
      onClick={onClick}
      className={`w-full bg-[#161b27] border p-4 text-left hover:border-[#F5A623]/40 active:scale-98 transition-all ${trailer.is_deleted ? 'border-white/5 opacity-70' : 'border-white/10'}`}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Truck size={16} className="text-[#F5A623] shrink-0" />
            {trailer.plate ? (
              <span className="font-mono font-bold text-base text-white tracking-wider">{trailer.plate}</span>
            ) : (
              <span className="font-mono text-sm text-white/40">Sin placa</span>
            )}
          </div>
          {trailer.reference && (
            <p className="text-sm text-white/60 truncate">{trailer.reference}</p>
          )}
        </div>
        <StatusBadge status={trailer.status} />
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-white/40 font-mono">
          <span>{doneCount}/{totalCount} secciones</span>
          <span>{new Date(displayDate).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="h-1 bg-white/10 w-full">
          <div
            className="h-full transition-all"
            style={{ width: `${(doneCount / totalCount) * 100}%`, backgroundColor: doneCount === totalCount ? '#22C55E' : '#F5A623' }}
          />
        </div>
      </div>

      {trailer.creator && (
        <p className="text-xs text-white/25 font-mono mt-2">{trailer.creator.name}</p>
      )}
    </motion.button>
  )
}

function NewTrailerModal({ onClose, onCreate }) {
  const [plate, setPlate] = useState('')
  const [reference, setReference] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/trailers', {
        plate: plate || null,
        reference: reference || null,
      })
      onCreate(data)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error creating trailer')
    } finally {
      setLoading(false)
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
        <div className="absolute inset-0 bg-black/70" onClick={onClose} />
        <motion.div
          className="relative bg-[#161b27] border-t border-white/10 rounded-t-2xl p-6"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-xl">Nuevo Trailer</h2>
            <button onClick={onClose} className="p-2 text-white/50 min-w-[44px] min-h-[44px] flex items-center justify-center">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-1.5">
                Placa (opcional)
              </label>
              <input
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="ABC-1234"
                className="w-full bg-[#1e2535] border border-white/10 text-white px-4 py-3.5 font-mono text-base focus:outline-none focus:border-[#F5A623] min-h-[56px] uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-1.5">
                Referencia (opcional)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ej: PO-2024-001"
                className="w-full bg-[#1e2535] border border-white/10 text-white px-4 py-3.5 text-base focus:outline-none focus:border-[#F5A623] min-h-[56px]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F5A623] text-[#0f1117] font-bold text-base py-4 min-h-[56px] hover:bg-[#e8961f] transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'Creando...' : 'Iniciar Documentación →'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function TrailerList() {
  const navigate = useNavigate()
  const [trailers, setTrailers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [archived, setArchived] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  async function load(p = page, filter = statusFilter, arch = archived) {
    setLoading(true)
    try {
      const params = { page: p, page_size: PAGE_SIZE }
      if (filter) params.status = filter
      if (arch)   params.archived = true
      const { data } = await api.get('/trailers', { params })
      setTrailers(data.items)
      setTotal(data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    load(1, statusFilter, archived)
  }, [statusFilter, archived])

  useEffect(() => {
    load(page, statusFilter, archived)
  }, [page])

  function handleCreated(trailer) {
    setShowNew(false)
    navigate(`/trailers/${trailer.id}`)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <Layout title="TruckScan">
      {/* Filter bar */}
      <div className="px-4 py-3 flex gap-2 border-b border-white/5">
        {['', 'open', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors min-h-[36px] ${
              statusFilter === f
                ? 'bg-[#F5A623] text-[#0f1117]'
                : 'text-white/40 border border-white/10 hover:text-white'
            }`}
          >
            {f === '' ? 'TODOS' : f === 'open' ? 'ABIERTOS' : 'COMPLETADOS'}
          </button>
        ))}
        <div className="ml-auto flex gap-1">
          {isAdmin() && (
            <button
              onClick={() => { setArchived(a => !a); setPage(1) }}
              title={archived ? 'Ver activos' : 'Ver archivados'}
              className={`min-h-[36px] min-w-[36px] flex items-center justify-center transition-all ${
                archived ? 'bg-red-500/20 border border-red-500/40 text-red-400' : 'border border-white/10 text-white/40 hover:text-white'
              }`}
            >
              <Archive size={15} />
            </button>
          )}
          <button
            onClick={() => load(page, statusFilter, archived)}
            className="p-1.5 text-white/40 hover:text-white min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Archived banner */}
      {archived && (
        <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2 text-red-400 text-xs font-mono">
          <Archive size={12} />
          Viendo trailers archivados — solo lectura
        </div>
      )}

      {/* List */}
      <div className="px-4 py-4 space-y-3 pb-28">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : trailers.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <Truck size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-mono text-sm">No hay trailers</p>
          </div>
        ) : (
          trailers.map((t) => (
            <TrailerCard key={t.id} trailer={t} onClick={() => navigate(`/trailers/${t.id}`)} />
          ))
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-mono border border-white/10 disabled:opacity-30 hover:border-[#F5A623] transition-colors min-h-[44px]"
            >
              <ChevronLeft size={16} />
              Anterior
            </button>
            <span className="text-xs font-mono text-white/40">
              {page} / {totalPages}
              <span className="text-white/20 ml-1">({total})</span>
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-mono border border-white/10 disabled:opacity-30 hover:border-[#F5A623] transition-colors min-h-[44px]"
            >
              Siguiente
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* FAB */}
      {!archived && (
        <button
          onClick={() => setShowNew(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-[#F5A623] text-[#0f1117] flex items-center justify-center shadow-lg hover:bg-[#e8961f] active:scale-95 transition-all z-30"
          aria-label="New trailer"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}

      {showNew && <NewTrailerModal onClose={() => setShowNew(false)} onCreate={handleCreated} />}
    </Layout>
  )
}
