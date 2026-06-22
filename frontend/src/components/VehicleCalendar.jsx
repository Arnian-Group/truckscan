import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Car } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { cityBadgeClass } from '../lib/cities'

const STATUS_CONFIG = {
  completed:      { label: 'COMPLETADO', textColor: 'text-[#22C55E]',  dotColor: 'bg-[#22C55E]',  badge: 'text-[#22C55E] bg-[#22C55E22] border-[#22C55E40]' },
  in_inspection:  { label: 'INSPECCIÓN', textColor: 'text-purple-400', dotColor: 'bg-purple-400', badge: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
  intake_complete:{ label: 'FIRMADO',    textColor: 'text-blue-400',   dotColor: 'bg-blue-400',   badge: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  intake:         { label: 'INTAKE',     textColor: 'text-[#F5A623]',  dotColor: 'bg-[#F5A623]',  badge: 'text-[#F5A623] bg-[#F5A62322] border-[#F5A62340]' },
}
const STATUS_ORDER = ['completed', 'in_inspection', 'intake_complete', 'intake']
const DAYS_SHORT   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const MONTHS_ES    = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function toLocalDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function getMonthRange(date) {
  const y = date.getFullYear(), m = date.getMonth()
  const firstDow   = new Date(y, m, 1).getDay()
  const lastDay    = new Date(y, m+1, 0).getDate()
  const lastDow    = new Date(y, m, lastDay).getDay()
  const start = new Date(y, m, 1 - firstDow,      0,  0,  0)
  const end   = new Date(y, m, lastDay + (6-lastDow), 23, 59, 59)
  return { from: start.toISOString(), to: end.toISOString() }
}

function getWeekRange(date) {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0,0,0,0)
  const start = new Date(d)
  d.setDate(d.getDate() + 6)
  d.setHours(23,59,59,999)
  return { from: start.toISOString(), to: d.toISOString() }
}

function getDayRange(date) {
  const s = new Date(date); s.setHours(0,0,0,0)
  const e = new Date(date); e.setHours(23,59,59,999)
  return { from: s.toISOString(), to: e.toISOString() }
}

function groupByLocalDate(inspections) {
  return inspections.reduce((acc, i) => {
    const key = toLocalDateStr(new Date(i.created_at))
    if (!acc[key]) acc[key] = []
    acc[key].push(i)
    return acc
  }, {})
}

function getStatusCounts(insps) {
  const counts = {}
  STATUS_ORDER.forEach(s => { counts[s] = 0 })
  insps.forEach(i => { if (counts[i.status] !== undefined) counts[i.status]++ })
  return counts
}

function nextRoute(insp) {
  if (insp.vehicle_type === 'mercancias' && insp.status !== 'completed') return `/vehicles/${insp.id}/mercancias`
  if (insp.status === 'intake') return `/vehicles/${insp.id}/intake`
  if (insp.status === 'intake_complete' || insp.status === 'in_inspection') return `/vehicles/${insp.id}/inspection`
  return `/vehicles/${insp.id}`
}

// ── Summary Panel ────────────────────────────────────────────────────────────

function SummaryPanel({ inspections, label }) {
  const counts = getStatusCounts(inspections)
  return (
    <div className="bg-[#161b27] border border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-wider">Resumen</span>
        <span className="text-[10px] font-mono text-white/30 truncate ml-2">{label}</span>
      </div>
      <div className="space-y-2.5">
        {STATUS_ORDER.map(s => (
          <div key={s} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_CONFIG[s].dotColor}`} />
              <span className={`text-[11px] font-mono font-bold ${STATUS_CONFIG[s].textColor}`}>{STATUS_CONFIG[s].label}</span>
            </div>
            <span className={`font-mono text-base font-bold tabular-nums ${counts[s] > 0 ? STATUS_CONFIG[s].textColor : 'text-white/15'}`}>
              {counts[s]}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 mt-3 pt-3 flex justify-between items-center">
        <span className="text-[11px] font-mono text-white/40 uppercase font-bold">Total</span>
        <span className="font-mono text-xl font-bold text-white tabular-nums">{inspections.length}</span>
      </div>
    </div>
  )
}

// ── Mini Card ─────────────────────────────────────────────────────────────────

function MiniCard({ insp, onClick }) {
  const st = STATUS_CONFIG[insp.status] || STATUS_CONFIG.intake
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#1e2535] border border-white/5 px-3 py-2 hover:border-[#F5A623]/40 active:scale-[0.99] transition-all"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Car size={11} className="text-[#F5A623] shrink-0" />
            <span className="text-xs font-mono font-bold text-white/80">
              {insp.vehicle_type === 'mercancias' ? 'MERCANCÍA' : (insp.vehicle_type?.toUpperCase() || '—')}
            </span>
            {insp.folio && (
              <span className="text-[10px] font-mono text-[#F5A623]/50 shrink-0">{insp.folio}</span>
            )}
            {insp.city && (
              <span className={`text-[9px] font-mono font-bold px-1 py-0.5 border uppercase shrink-0 ${cityBadgeClass(insp.city)}`}>
                {insp.city}
              </span>
            )}
          </div>
          {insp.vehicle_type !== 'mercancias' && (insp.make || insp.model) && (
            <p className="text-[11px] text-white/65 font-mono truncate">
              {[insp.make, insp.model].filter(Boolean).join(' ')}
            </p>
          )}
          {insp.vehicle_type !== 'mercancias' && insp.vin && (
            <p className="text-[11px] text-[#F5A623] font-mono font-bold tracking-wide truncate">
              VIN: {insp.vin}
            </p>
          )}
          <p className="text-[11px] text-white/40 font-mono truncate">
            {insp.nombre || insp.nombre_entrega || 'Sin cliente'}
          </p>
        </div>
        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border shrink-0 ${st.badge}`}>
          {st.label}
        </span>
      </div>
    </button>
  )
}

// ── Month Grid ────────────────────────────────────────────────────────────────

function MonthGrid({ currentDate, byDate, selectedDay, onDaySelect }) {
  const y = currentDate.getFullYear()
  const m = currentDate.getMonth()
  const firstDow    = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m+1, 0).getDate()
  const todayStr    = toLocalDateStr(new Date())

  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i+7))

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-white/5 mb-1">
        {DAYS_SHORT.map(d => (
          <div key={d} className="text-center text-[10px] font-mono text-white/25 py-1.5 uppercase">{d}</div>
        ))}
      </div>
      <div className="space-y-0.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-0.5">
            {week.map((day, di) => {
              if (day === null) return <div key={di} />
              const dateStr   = `${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
              const dayInsps  = byDate[dateStr] || []
              const counts    = getStatusCounts(dayInsps)
              const isToday   = dateStr === todayStr
              const isSel     = dateStr === selectedDay
              const hasData   = dayInsps.length > 0

              return (
                <button
                  key={di}
                  onClick={() => onDaySelect(dateStr)}
                  className={`min-h-[52px] flex flex-col items-center py-1.5 px-0.5 gap-0.5 transition-all border ${
                    isSel    ? 'border-[#F5A623] bg-[#F5A623]/10'
                    : isToday ? 'border-white/20 bg-white/5'
                    : 'border-transparent hover:bg-white/5'
                  }`}
                >
                  <span className={`text-xs font-mono leading-none ${
                    isToday ? 'text-[#F5A623] font-bold'
                    : hasData ? 'text-white/80' : 'text-white/25'
                  }`}>{day}</span>
                  {hasData && (
                    <div className="flex flex-wrap gap-0.5 justify-center">
                      {STATUS_ORDER.filter(s => counts[s] > 0).map(s => (
                        <div key={s} className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[s].dotColor}`} />
                      ))}
                    </div>
                  )}
                  {hasData && (
                    <span className="text-[9px] font-mono text-white/30 leading-none">{dayInsps.length}</span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Week View ─────────────────────────────────────────────────────────────────

function WeekView({ currentDate, byDate, onNavigate }) {
  const start = new Date(currentDate)
  start.setDate(currentDate.getDate() - currentDate.getDay())
  start.setHours(0,0,0,0)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
  const todayStr = toLocalDateStr(new Date())

  return (
    <div className="space-y-2">
      {days.map(d => {
        const dateStr  = toLocalDateStr(d)
        const dayInsps = byDate[dateStr] || []
        const isToday  = dateStr === todayStr
        return (
          <div key={dateStr} className={`border ${isToday ? 'border-[#F5A623]/30 bg-[#F5A623]/5' : 'border-white/5'}`}>
            <div className={`px-3 py-2 flex items-center justify-between border-b ${isToday ? 'border-[#F5A623]/20' : 'border-white/5'}`}>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-mono font-bold uppercase ${isToday ? 'text-[#F5A623]' : 'text-white/50'}`}>
                  {DAYS_SHORT[d.getDay()]}
                </span>
                <span className={`text-sm font-mono font-bold ${isToday ? 'text-[#F5A623]' : 'text-white/80'}`}>
                  {d.getDate()}
                </span>
                <span className="text-[11px] font-mono text-white/30">{MONTHS_ES[d.getMonth()].slice(0,3)}</span>
              </div>
              {dayInsps.length > 0 && (
                <div className="flex items-center gap-1">
                  {STATUS_ORDER.filter(s => dayInsps.some(i => i.status === s)).map(s => (
                    <div key={s} className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[s].dotColor}`} />
                  ))}
                  <span className="text-[10px] font-mono text-white/40 ml-1">{dayInsps.length}</span>
                </div>
              )}
            </div>
            {dayInsps.length === 0 ? (
              <div className="px-3 py-2 text-[11px] font-mono text-white/20">Sin entradas</div>
            ) : (
              <div className="p-1 space-y-px">
                {dayInsps.map(insp => (
                  <MiniCard key={insp.id} insp={insp} onClick={() => onNavigate(nextRoute(insp))} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Day View ──────────────────────────────────────────────────────────────────

function DayView({ currentDate, byDate, onNavigate }) {
  const dateStr  = toLocalDateStr(currentDate)
  const dayInsps = byDate[dateStr] || []
  return dayInsps.length === 0 ? (
    <div className="text-center py-14 text-white/30">
      <Calendar size={36} className="mx-auto mb-3 opacity-20" />
      <p className="font-mono text-sm">Sin entradas este día</p>
    </div>
  ) : (
    <div className="space-y-2">
      {dayInsps.map(insp => (
        <MiniCard key={insp.id} insp={insp} onClick={() => onNavigate(nextRoute(insp))} />
      ))}
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────

export default function VehicleCalendar({ statusFilter, vehicleTypeFilter, search, cityFilter }) {
  const navigate   = useNavigate()
  const [viewMode,   setViewMode]   = useState('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const [inspections, setInspections] = useState([])
  const [loading,    setLoading]    = useState(false)

  const getPeriodRange = useCallback(() => {
    if (viewMode === 'month') return getMonthRange(currentDate)
    if (viewMode === 'week')  return getWeekRange(currentDate)
    return getDayRange(currentDate)
  }, [viewMode, currentDate])

  useEffect(() => {
    let cancelled = false
    async function fetch() {
      setLoading(true)
      try {
        const { from, to } = getPeriodRange()
        const params = { date_from: from, date_to: to, page_size: 500 }
        if (statusFilter)      params.status       = statusFilter
        if (vehicleTypeFilter) params.vehicle_type = vehicleTypeFilter
        if (search)            params.search       = search
        if (cityFilter)        params.city         = cityFilter
        const { data } = await api.get('/vehicles', { params })
        if (!cancelled) setInspections(data.items ?? [])
      } catch (e) {
        console.error(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [viewMode, currentDate, statusFilter, vehicleTypeFilter, search, cityFilter, getPeriodRange])

  const byDate = groupByLocalDate(inspections)

  function nav(dir) {
    setCurrentDate(d => {
      const nd = new Date(d)
      if (viewMode === 'month') nd.setMonth(d.getMonth() + dir)
      else if (viewMode === 'week') nd.setDate(d.getDate() + 7 * dir)
      else nd.setDate(d.getDate() + dir)
      return nd
    })
    setSelectedDay(null)
  }

  function getPeriodLabel() {
    if (viewMode === 'month')
      return `${MONTHS_ES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    if (viewMode === 'week') {
      const { from, to } = getWeekRange(currentDate)
      const s = new Date(from), e = new Date(to)
      return `${s.getDate()} – ${e.getDate()} ${MONTHS_ES[e.getMonth()].slice(0,3)} ${e.getFullYear()}`
    }
    return `${DAYS_SHORT[currentDate.getDay()]} ${currentDate.getDate()} ${MONTHS_ES[currentDate.getMonth()].slice(0,3)} ${currentDate.getFullYear()}`
  }

  const summaryInsps = (selectedDay && viewMode === 'month')
    ? (byDate[selectedDay] || [])
    : inspections

  const summaryLabel = (selectedDay && viewMode === 'month')
    ? (() => {
        const d = new Date(selectedDay + 'T12:00:00')
        return `${DAYS_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS_ES[d.getMonth()].slice(0,3)}`
      })()
    : getPeriodLabel()

  return (
    <div className="px-4 py-3 pb-28 space-y-3">
      {/* View mode toggle */}
      <div className="flex gap-1">
        {[['month','Mes'],['week','Semana'],['day','Día']].map(([m, label]) => (
          <button
            key={m}
            onClick={() => { setViewMode(m); setSelectedDay(null) }}
            className={`flex-1 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
              viewMode === m ? 'bg-[#F5A623] text-[#0f1117]' : 'border border-white/10 text-white/40 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Navigation header */}
      <div className="flex items-center justify-between">
        <button onClick={() => nav(-1)} className="p-2 text-white/40 hover:text-white transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center">
          <ChevronLeft size={18} />
        </button>
        <span className="font-mono text-sm font-bold text-white/80 capitalize">{getPeriodLabel()}</span>
        <button onClick={() => nav(1)} className="p-2 text-white/40 hover:text-white transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center">
          <ChevronRight size={18} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Calendar body + summary side by side on wider screens */}
          <div className="sm:grid sm:grid-cols-[1fr_210px] sm:gap-4 sm:items-start">
            <div>
              {viewMode === 'month' && (
                <MonthGrid
                  currentDate={currentDate}
                  byDate={byDate}
                  selectedDay={selectedDay}
                  onDaySelect={d => setSelectedDay(prev => prev === d ? null : d)}
                />
              )}
              {viewMode === 'week' && (
                <WeekView currentDate={currentDate} byDate={byDate} onNavigate={r => navigate(r)} />
              )}
              {viewMode === 'day' && (
                <DayView currentDate={currentDate} byDate={byDate} onNavigate={r => navigate(r)} />
              )}
            </div>

            {/* Summary panel */}
            <div className="mt-4 sm:mt-0">
              <SummaryPanel inspections={summaryInsps} label={summaryLabel} />
            </div>
          </div>

          {/* Selected-day detail list (month view only) */}
          {viewMode === 'month' && selectedDay && (
            <div className="border border-[#F5A623]/25 bg-[#F5A623]/5 p-3">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-mono font-bold text-[#F5A623]/70 uppercase">
                  {(() => {
                    const d = new Date(selectedDay + 'T12:00:00')
                    return `${DAYS_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS_ES[d.getMonth()].slice(0,3)} ${d.getFullYear()}`
                  })()}
                </span>
                <span className="text-[10px] font-mono text-white/30">
                  {(byDate[selectedDay] || []).length} entrada(s)
                </span>
              </div>
              {(byDate[selectedDay] || []).length === 0 ? (
                <p className="text-[11px] font-mono text-white/30 py-2 text-center">Sin entradas</p>
              ) : (
                <div className="space-y-1.5">
                  {(byDate[selectedDay] || []).map(insp => (
                    <MiniCard key={insp.id} insp={insp} onClick={() => navigate(nextRoute(insp))} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
