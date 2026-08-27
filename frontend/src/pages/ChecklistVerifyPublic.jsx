import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ShieldCheck, ShieldAlert, Truck } from 'lucide-react'
import api from '../lib/api'

const CLASSIFICATION_META = {
  APTO: { label: 'APTO PARA OPERAR', color: 'text-[#22C55E] bg-[#22C55E15] border-[#22C55E40]' },
  OPERAR_CON_OBSERVACIONES: { label: 'APTO CON OBSERVACIONES', color: 'text-[#F5A623] bg-[#F5A62315] border-[#F5A62340]' },
  APTO_CON_OBSERVACIONES: { label: 'APTO CON OBSERVACIONES', color: 'text-[#F5A623] bg-[#F5A62315] border-[#F5A62340]' },
  NO_OPERAR: { label: 'NO OPERAR / REPORTAR', color: 'text-red-400 bg-red-400/10 border-red-400/40' },
  NO_APTO: { label: 'NO APTO PARA OPERAR', color: 'text-red-400 bg-red-400/10 border-red-400/40' },
}

// Public, unauthenticated page — reached by scanning the QR printed on a submitted
// checklist's PDF. Anyone with the link can see this (folio, classification, unit
// number, whether the record's hash chain is intact) — no auth, no PII beyond
// what's already printed on the physical/PDF document itself.
export default function ChecklistVerifyPublic() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const h = searchParams.get('h')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!h) { setResult({ valid: false, error: 'Falta el código de verificación en el enlace' }); setLoading(false); return }
    api.get(`/checklists/verify/${id}`, { params: { h } })
      .then(({ data }) => setResult(data))
      .catch((err) => setResult({ valid: false, error: err.response?.data?.detail || 'Error al verificar' }))
      .finally(() => setLoading(false))
  }, [id, h])

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center px-6 py-12">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-16 h-16 bg-[#161b27] border-2 border-[#F5A623] flex items-center justify-center">
          <Truck size={32} className="text-[#F5A623]" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Verificación de Checklist</h1>
        <p className="text-white/30 text-xs font-mono">ARNIAN TRUCKSCAN</p>
      </div>

      <div className="w-full max-w-sm">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : result?.valid ? (
          <div className="bg-[#161b27] border border-[#22C55E]/40 p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#22C55E] font-bold">
              <ShieldCheck size={20} /> Documento auténtico e íntegro
            </div>
            <p className="text-xs text-white/40 font-mono">{result.entries_checked} eventos verificados en la cadena de hash — sin alteraciones detectadas.</p>
            <div className="border-t border-white/10 pt-3 space-y-1.5 text-sm">
              <Row label="Folio" value={result.folio} />
              <Row label="Checklist" value={result.template_name} />
              <Row label="Código" value={result.template_code} />
              <Row label="Unidad" value={result.asset_economic_number} />
              {result.classification && (
                <div className={`mt-2 border px-3 py-2 font-mono font-bold text-xs ${CLASSIFICATION_META[result.classification]?.color || 'text-white/60 border-white/20'}`}>
                  {CLASSIFICATION_META[result.classification]?.label || result.classification}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#161b27] border border-red-400/40 p-5 space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-bold">
              <ShieldAlert size={20} /> No se pudo verificar
            </div>
            <p className="text-xs text-white/50 font-mono">{result?.error || 'Este documento no pudo ser validado.'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-3">
      <span className="text-white/40">{label}</span>
      <span className="text-white text-right">{value}</span>
    </div>
  )
}
