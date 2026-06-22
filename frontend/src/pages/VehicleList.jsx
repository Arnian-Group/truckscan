import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Car, RefreshCw, ChevronLeft, ChevronRight, Trash2, Search, X, LayoutList, CalendarDays, Archive } from 'lucide-react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import VehicleCalendar from '../components/VehicleCalendar'
import api from '../lib/api'
import { isAdmin, canEditDoc } from '../lib/auth'
import { CITIES, cityBadgeClass } from '../lib/cities'

const STATUS_LABELS = {
  intake:          { label: 'INTAKE',     color: 'text-[#F5A623] bg-[#F5A62322] border-[#F5A62340]' },
  intake_complete: { label: 'FIRMADO',    color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  in_inspection:   { label: 'INSPECCIÓN', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
  completed:       { label: 'COMPLETADO', color: 'text-[#22C55E] bg-[#22C55E22] border-[#22C55E40]' },
}

const VEHICLE_TYPES = [
  { value: '',            label: 'TODOS' },
  { value: 'sedan',       label: 'SEDAN' },
  { value: 'pickup',      label: 'PICKUP' },
  { value: 'van',         label: 'VAN' },
  { value: 'golf',        label: 'GOLF' },
  { value: 'canam',       label: 'CANAM' },
  { value: 'motorcycle',  label: 'MOTO' },
  { value: 'atv',         label: 'ATV' },
  { value: 'racer',       label: 'RACER' },
  { value: 'mercancias',  label: 'MERCANCÍA' },
]

function nextRoute(insp) {
  if (insp.vehicle_type === 'mercancias' && insp.status !== 'completed') return `/vehicles/${insp.id}/mercancias`
  if (insp.status === 'intake') return `/vehicles/${insp.id}/intake`
  if (insp.status === 'intake_complete' || insp.status === 'in_inspection') return `/vehicles/${insp.id}/inspection`
  return `/vehicles/${insp.id}`
}

function safeRoute(insp) {
  return canEditDoc(insp) ? nextRoute(insp) : `/vehicles/${insp.id}`
}

function InspectionCard({ insp, onClick, onArchive, confirmingArchive, showArchiveBtn = true }) {
  const st = STATUS_LABELS[insp.status] || STATUS_LABELS.intake
  const canArchive = showArchiveBtn && isAdmin() && (insp.status === 'intake' || insp.status === 'intake_complete')
  return (
    <div className="relative">
      <motion.div
        onClick={onClick}
        whileTap={{ scale: 0.98 }}
        className={`w-full bg-[#161b27] border p-4 text-left hover:border-[#F5A623]/40 active:scale-98 transition-all cursor-pointer ${
          insp.is_deleted ? 'border-white/5 opacity-70' : 'border-white/10'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <Car size={15} className="text-[#F5A623] shrink-0" />
              <span className="font-mono font-bold text-sm">
                {insp.vehicle_type?.toUpperCase()}
              </span>
              {insp.year && <span className="text-white/50 text-xs">{insp.year}</span>}
              {insp.city && (
                <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 border uppercase shrink-0 ${cityBadgeClass(insp.city)}`}>
                  {insp.city}
                </span>
              )}
            </div>
            <p className="text-white/70 text-sm truncate">
              {insp.vehicle_type === 'mercancias'
                ? (insp.mercancias_descripcion ? insp.mercancias_descripcion.slice(0, 60) : 'Recibo de mercancía')
                : ([insp.make, insp.model, insp.color].filter(Boolean).join(' · ') || 'Sin datos')}
            </p>
            {insp.vehicle_type !== 'mercancias' && insp.vin && (
              <p className="text-[#F5A623] text-xs font-mono font-bold tracking-wider truncate">
                VIN: {insp.vin}
              </p>
            )}
            {insp.vehicle_type === 'mercancias'
              ? (insp.nombre_entrega && <p className="text-white/40 text-xs font-mono truncate">Entrega: {insp.nombre_entrega}</p>)
              : (insp.nombre && <p className="text-white/40 text-xs font-mono truncate">{insp.nombre}</p>)}
          </div>
          <span className={`font-mono text-[10px] font-bold px-2 py-0.5 border uppercase shrink-0 ${canArchive ? 'mr-9' : ''} ${st.color}`}>
            {st.label}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white/25 font-mono mt-2">
          <span className="flex items-center gap-2 truncate">
            {insp.folio && <span className="text-[#F5A623]/50">{insp.folio}</span>}
            {insp.entry_number && <span className="text-white/40">#{insp.entry_number}</span>}
            {!insp.folio && !insp.entry_number && (insp.city || '—')}
          </span>
          <span className="shrink-0">{new Date(insp.created_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}</span>
        </div>
      </motion.div>
      {canArchive && (
        <button
          onClick={e => { e.stopPropagation(); onArchive(insp.id) }}
          className={`absolute top-3 right-3 min-w-[36px] min-h-[36px] flex items-center justify-center transition-all ${
            confirmingArchive
              ? 'bg-red-500/20 border border-red-500/60 text-red-400 px-2 text-[9px] font-mono font-bold gap-1'
              : 'text-white/20 hover:text-red-400 hover:bg-red-400/10'
          }`}
        >
          {confirmingArchive ? <><Trash2 size={11} />¿OK?</> : <Trash2 size={14} />}
        </button>
      )}
    </div>
  )
}

const PAGE_SIZE = 20

export default function VehicleList() {
  const navigate = useNavigate()
  const [view,          setView]         = useState(() => localStorage.getItem('vehicles_view') || 'list')
  const [archived,      setArchived]     = useState(false)
  const [items,         setItems]        = useState([])
  const [loading,       setLoading]      = useState(true)
  const [statusFilter,  setStatusFilter] = useState('')
  const [typeFilter,    setTypeFilter]   = useState('')
  const [cityFilter,    setCityFilter]   = useState('')
  const [page,          setPage]         = useState(1)
  const [total,         setTotal]        = useState(0)
  const [confirmArchiveId, setConfirmArchiveId] = useState(null)
  const [searchInput,   setSearchInput]  = useState('')
  const [search,        setSearch]       = useState('')
  const debounceRef = useRef(null)

  function handleSearchChange(val) {
    setSearchInput(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(val.trim())
      setPage(1)
    }, 350)
  }

  function clearSearch() {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }

  async function load(p = page, filter = statusFilter, type = typeFilter, q = search, arch = archived, city = cityFilter) {
    setLoading(true)
    try {
      const params = { page: p, page_size: PAGE_SIZE }
      if (filter)  params.status       = filter
      if (type)    params.vehicle_type = type
      if (q)       params.search       = q
      if (arch)    params.archived     = true
      if (city)    params.city         = city
      const { data } = await api.get('/vehicles', { params })
      setItems(data?.items ?? [])
      setTotal(data?.total ?? 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { setPage(1); load(1, statusFilter, typeFilter, search, archived, cityFilter) }, [statusFilter, typeFilter, archived, cityFilter])
  useEffect(() => { load(page, statusFilter, typeFilter, search, archived, cityFilter) }, [page, search])

  async function handleArchive(inspId) {
    if (confirmArchiveId !== inspId) {
      setConfirmArchiveId(inspId)
      setTimeout(() => setConfirmArchiveId(c => c === inspId ? null : c), 4000)
      return
    }
    try {
      await api.delete(`/vehicles/${inspId}`)
      setItems(prev => prev.filter(i => i.id !== inspId))
      setTotal(prev => prev - 1)
      setConfirmArchiveId(null)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al archivar')
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <Layout title="Recibos">

      {/* ── Row 1: Status filters + view toggle + refresh ── */}
      <div className="px-4 py-3 flex gap-2 border-b border-white/5 overflow-x-auto">
        {['', 'intake', 'intake_complete', 'in_inspection', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors min-h-[36px] whitespace-nowrap flex-shrink-0 ${
              statusFilter === f
                ? 'bg-[#F5A623] text-[#0f1117]'
                : 'text-white/40 border border-white/10 hover:text-white'
            }`}
          >
            {f === '' ? 'TODOS' : STATUS_LABELS[f]?.label || f}
          </button>
        ))}

        {/* View toggle + archive toggle */}
        <div className="ml-auto flex gap-1 flex-shrink-0">
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
            onClick={() => { setView('list'); localStorage.setItem('vehicles_view', 'list') }}
            title="Vista lista"
            className={`min-h-[36px] min-w-[36px] flex items-center justify-center transition-all ${
              view === 'list' ? 'bg-[#F5A623] text-[#0f1117]' : 'border border-white/10 text-white/40 hover:text-white'
            }`}
          >
            <LayoutList size={15} />
          </button>
          <button
            onClick={() => { setView('calendar'); localStorage.setItem('vehicles_view', 'calendar') }}
            title="Vista calendario"
            className={`min-h-[36px] min-w-[36px] flex items-center justify-center transition-all ${
              view === 'calendar' ? 'bg-[#F5A623] text-[#0f1117]' : 'border border-white/10 text-white/40 hover:text-white'
            }`}
          >
            <CalendarDays size={15} />
          </button>
          <button
            onClick={() => load(page, statusFilter, typeFilter, search, archived)}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-white/40 hover:text-white"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Archived banner ── */}
      {archived && (
        <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2 text-red-400 text-xs font-mono">
          <Archive size={12} />
          Viendo inspecciones archivadas — solo lectura
        </div>
      )}

      {/* ── Row 2: Vehicle type filter ── */}
      <div className="px-4 py-2 flex gap-1.5 border-b border-white/5 overflow-x-auto">
        {VEHICLE_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => setTypeFilter(t.value)}
            className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors min-h-[30px] whitespace-nowrap flex-shrink-0 ${
              typeFilter === t.value
                ? 'bg-white/15 text-white border border-white/30'
                : 'text-white/30 border border-white/8 hover:text-white/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Row 2b: Sucursal filter ── */}
      <div className="px-4 py-2 flex gap-1.5 border-b border-white/5 overflow-x-auto">
        <button
          onClick={() => setCityFilter('')}
          className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors min-h-[30px] whitespace-nowrap flex-shrink-0 ${
            cityFilter === ''
              ? 'bg-white/15 text-white border border-white/30'
              : 'text-white/30 border border-white/8 hover:text-white/60'
          }`}
        >
          TODAS LAS SUCURSALES
        </button>
        {CITIES.map(c => (
          <button
            key={c}
            onClick={() => setCityFilter(c)}
            className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors min-h-[30px] whitespace-nowrap flex-shrink-0 border ${
              cityFilter === c ? cityBadgeClass(c) : 'text-white/30 border-white/8 hover:text-white/60'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ── Row 3: Search bar ── */}
      <div className="px-4 py-2.5 border-b border-white/5">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-white/30 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Buscar por folio, entrada, placas, VIN o cliente..."
            className="w-full bg-[#1e2535] border border-white/10 text-white text-sm pl-8 pr-8 py-2.5 focus:outline-none focus:border-[#F5A623] placeholder-white/20 font-mono"
          />
          {searchInput && (
            <button onClick={clearSearch} className="absolute right-2 p-1 text-white/30 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Content: Calendar or List ── */}
      {view === 'calendar' ? (
        <VehicleCalendar
          statusFilter={statusFilter}
          vehicleTypeFilter={typeFilter}
          search={search}
          cityFilter={cityFilter}
        />
      ) : (
        <div className="px-4 py-4 space-y-3 pb-28">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-white/30">
              <Car size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-mono text-sm">{search ? `Sin resultados para "${search}"` : 'No hay inspecciones'}</p>
              {search && (
                <button onClick={clearSearch} className="mt-2 text-xs text-[#F5A623]/60 hover:text-[#F5A623] font-mono">
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            items.map(i => (
              <InspectionCard
                key={i.id}
                insp={i}
                onClick={() => navigate(archived ? `/vehicles/${i.id}` : safeRoute(i))}
                onArchive={handleArchive}
                confirmingArchive={confirmArchiveId === i.id}
                showArchiveBtn={!archived}
              />
            ))
          )}

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-mono border border-white/10 disabled:opacity-30 hover:border-[#F5A623] min-h-[44px]"
              >
                <ChevronLeft size={16} />Anterior
              </button>
              <span className="text-xs font-mono text-white/40">{page}/{totalPages} <span className="text-white/20">({total})</span></span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-mono border border-white/10 disabled:opacity-30 hover:border-[#F5A623] min-h-[44px]"
              >
                Siguiente<ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {!archived && (
        <button
          onClick={() => navigate('/vehicles/new')}
          className="fixed bottom-20 right-4 w-14 h-14 bg-[#F5A623] text-[#0f1117] flex items-center justify-center shadow-lg hover:bg-[#e8961f] active:scale-95 transition-all z-30"
          aria-label="Nueva inspección"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}
    </Layout>
  )
}
