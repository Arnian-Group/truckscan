import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader, FileText, Printer, CheckSquare, Square, ExternalLink } from 'lucide-react'
import Layout from '../components/Layout'
import api from '../lib/api'

const STATUS_LABELS = {
  intake: { label: 'INTAKE', color: 'text-[#F5A623] bg-[#F5A62322] border-[#F5A62340]' },
  intake_complete: { label: 'FIRMADO', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  in_inspection: { label: 'EN INSPECCIÓN', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
  completed: { label: 'COMPLETADO', color: 'text-[#22C55E] bg-[#22C55E22] border-[#22C55E40]' },
}

const DAMAGE_COLORS = {
  scratched: '#EF4444', dented: '#F97316', stained: '#3B82F6',
  cracked: '#8B5CF6', missing: '#6B7280', other: '#F5A623',
}

const CHECKLIST_LABELS = {
  licencia: 'Copia de Licencia',
  circulacion: 'Tarjeta de Circulación',
  aseguranza: 'Copia de Aseguranza',
  cotizacion: 'Cotización Firmada',
  autorizacion: 'Carta de Autorización',
}

async function openPDF(endpoint) {
  try {
    const resp = await api.get(endpoint, { responseType: 'blob' })
    const url = URL.createObjectURL(new Blob([resp.data], { type: 'application/pdf' }))
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  } catch {
    alert('Error al cargar el PDF')
  }
}

export default function VehicleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [insp, setInsp] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/vehicles/${id}`).then(({ data }) => setInsp(data)).catch(console.error).finally(() => setLoading(false))
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
  const checklist = insp.checklist || {}
  const STATIC_BASE = import.meta.env.VITE_API_URL || ''

  // Damage summary by type
  const dmgSummary = damages.reduce((acc, d) => {
    acc[d.damage_type] = (acc[d.damage_type] || 0) + 1
    return acc
  }, {})

  // Group by view
  const dmgByView = damages.reduce((acc, d) => {
    acc[d.view] = acc[d.view] || []
    acc[d.view].push(d)
    return acc
  }, {})

  return (
    <Layout title="Detalle" back="/vehicles">
      <div className="px-4 py-4 pb-24 max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="bg-[#161b27] border border-white/10 p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h1 className="font-bold text-xl">
                {[insp.year, insp.make, insp.model].filter(Boolean).join(' ') || 'Vehículo'}
              </h1>
              <p className="text-white/50 text-sm">{insp.color} · {insp.vehicle_type?.toUpperCase()}</p>
            </div>
            <span className={`font-mono text-xs font-bold px-2 py-1 border whitespace-nowrap ${st.color}`}>
              {st.label}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {insp.nombre && <InfoRow label="Cliente" value={insp.nombre} />}
            {insp.placas && <InfoRow label="Placas" value={insp.placas} />}
            {insp.vin && <InfoRow label="VIN" value={insp.vin} />}
            {insp.odometer && <InfoRow label="Odómetro" value={`${insp.odometer.toLocaleString()} km/mi`} />}
            {insp.gasolina && <InfoRow label="Combustible" value={insp.gasolina} />}
            {insp.city && <InfoRow label="Ciudad" value={insp.city} />}
            {insp.fecha && <InfoRow label="Fecha" value={new Date(insp.fecha).toLocaleDateString('es-MX')} />}
          </div>
        </div>

        {/* Damage summary */}
        <section>
          <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">
            Daños — {damages.length} total{damages.length !== 1 ? 'es' : ''}
          </h2>
          {damages.length === 0 ? (
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
              {Object.entries(dmgByView).map(([view, dmgs]) => (
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
                            {d.photos.map((p, i) => (
                              <img key={i} src={STATIC_BASE + p} alt="" className="w-16 h-16 object-cover border border-white/10" />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </section>

        {/* Checklist */}
        <section>
          <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">Documentos</h2>
          <div className="space-y-1.5">
            {Object.entries(CHECKLIST_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-3 px-3 py-2.5 bg-[#161b27] border border-white/5">
                {checklist[key]
                  ? <CheckSquare size={16} className="text-[#22C55E] shrink-0" />
                  : <Square size={16} className="text-white/20 shrink-0" />}
                <span className="text-sm text-white/60">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Signatures */}
        {(insp.firma_origen || insp.firma_destino) && (
          <section>
            <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">Firmas</h2>
            <div className="grid grid-cols-2 gap-3">
              {insp.firma_origen && (
                <div className="bg-[#161b27] border border-white/10 p-3">
                  <p className="text-[10px] font-mono text-white/30 mb-2">ORIGEN</p>
                  <img src={insp.firma_origen} alt="Firma origen" className="w-full h-16 object-contain bg-[#1e2535]" />
                  {insp.nombre_firma_origen && <p className="text-xs text-white/50 mt-1.5 truncate">{insp.nombre_firma_origen}</p>}
                </div>
              )}
              {insp.firma_destino && (
                <div className="bg-[#161b27] border border-white/10 p-3">
                  <p className="text-[10px] font-mono text-white/30 mb-2">DESTINO</p>
                  <img src={insp.firma_destino} alt="Firma destino" className="w-full h-16 object-contain bg-[#1e2535]" />
                  {insp.nombre_firma_destino && <p className="text-xs text-white/50 mt-1.5 truncate">{insp.nombre_firma_destino}</p>}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Actions */}
        <section className="space-y-2">
          {insp.liability_pdf_path && (
            <button
              onClick={() => openPDF(`/vehicles/${id}/liability-pdf`)}
              className="w-full flex items-center gap-3 py-3.5 px-4 border border-white/10 hover:border-[#F5A623]/40 transition-colors"
            >
              <FileText size={18} className="text-[#F5A623]" />
              <span className="flex-1 text-sm text-left">Ver PDF del Descargo</span>
              <ExternalLink size={14} className="text-white/30" />
            </button>
          )}
          {insp.full_report_pdf_path && (
            <button
              onClick={() => openPDF(`/vehicles/${id}/report-pdf`)}
              className="w-full flex items-center gap-3 py-3.5 px-4 border border-white/10 hover:border-[#F5A623]/40 transition-colors"
            >
              <Printer size={18} className="text-[#F5A623]" />
              <span className="flex-1 text-sm text-left">Imprimir / Guardar Reporte Completo</span>
              <ExternalLink size={14} className="text-white/30" />
            </button>
          )}
          {insp.status !== 'completed' && (
            <button
              onClick={() => navigate(`/vehicles/${id}/inspection`)}
              className="w-full py-3.5 border border-purple-400/40 text-purple-400 font-mono text-sm hover:bg-purple-400/10 transition-colors"
            >
              Continuar Inspección →
            </button>
          )}
        </section>

        {/* Notes */}
        {insp.notas && (
          <section>
            <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-2">Notas</h2>
            <p className="text-white/60 text-sm bg-[#161b27] border border-white/5 p-3">{insp.notas}</p>
          </section>
        )}
      </div>
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
