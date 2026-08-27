import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Printer, Download, ShieldCheck, ShieldAlert, Loader } from 'lucide-react'
import Layout from '../components/Layout'
import api from '../lib/api'

const STATUS_LABELS = {
  draft: 'BORRADOR', submitted: 'ENVIADO', reviewed: 'REVISADO', released: 'LIBERADO',
}

const CLASSIFICATION_META = {
  APTO: { label: 'APTO PARA OPERAR', color: 'text-[#22C55E] bg-[#22C55E15] border-[#22C55E40]' },
  OPERAR_CON_OBSERVACIONES: { label: 'APTO CON OBSERVACIONES', color: 'text-[#F5A623] bg-[#F5A62315] border-[#F5A62340]' },
  APTO_CON_OBSERVACIONES: { label: 'APTO CON OBSERVACIONES', color: 'text-[#F5A623] bg-[#F5A62315] border-[#F5A62340]' },
  NO_OPERAR: { label: 'NO OPERAR / REPORTAR', color: 'text-red-400 bg-red-400/10 border-red-400/40' },
  NO_APTO: { label: 'NO APTO PARA OPERAR', color: 'text-red-400 bg-red-400/10 border-red-400/40' },
}

async function openPDF(endpoint, filename = null) {
  const token = localStorage.getItem('token')
  const base = import.meta.env.VITE_API_URL || ''
  try {
    const resp = await fetch(`${base}${endpoint}`, { headers: { Authorization: `Bearer ${token}` } })
    if (!resp.ok) throw new Error('PDF no disponible')
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
    alert(err.message || 'Error al cargar el PDF')
  }
}

export default function ChecklistDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sub, setSub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState(null)

  useEffect(() => {
    api.get(`/checklists/submissions/${id}`).then(({ data }) => setSub(data))
      .catch(console.error).finally(() => setLoading(false))
  }, [id])

  async function handleVerify() {
    setVerifying(true)
    setVerifyResult(null)
    try {
      const { data } = await api.get(`/checklists/submissions/${id}/verify`)
      setVerifyResult(data)
    } catch (err) {
      setVerifyResult({ valid: false, error: err.response?.data?.detail || 'Error al verificar' })
    } finally {
      setVerifying(false)
    }
  }

  if (loading || !sub) {
    return (
      <Layout title="Checklist" back="/checklists">
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  const template = sub.template
  const cls = sub.classification ? CLASSIFICATION_META[sub.classification] : null
  const hv = sub.header_values || {}

  return (
    <Layout title={template.name} back="/checklists">
      <div className="px-4 py-4 pb-24 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-white/40">{sub.folio || '—'}</span>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 border uppercase text-white/60 border-white/20">
            {STATUS_LABELS[sub.status] || sub.status}
          </span>
        </div>

        {cls && (
          <div className={`border px-4 py-3 font-mono font-bold text-sm ${cls.color}`}>{cls.label}</div>
        )}

        {template.header_fields.some((f) => hv[f.key]) && (
          <div className="bg-[#161b27] border border-white/10 p-4 space-y-1.5">
            {template.header_fields.map((f) => (
              hv[f.key] ? (
                <div key={f.key} className="flex justify-between text-sm">
                  <span className="text-white/40">{f.label}</span>
                  <span className="text-white">{hv[f.key]}</span>
                </div>
              ) : null
            ))}
          </div>
        )}

        {sub.status === 'draft' ? (
          <button
            onClick={() => navigate(`/checklists/${id}/fill`)}
            className="w-full bg-[#F5A623] text-[#0f1117] font-bold text-base py-4 min-h-[56px] hover:bg-[#e8961f] transition-colors"
          >
            Continuar llenando
          </button>
        ) : (
          <>
            <div className="bg-[#161b27] border border-white/10 flex">
              <button
                onClick={() => openPDF(`/checklists/submissions/${id}/pdf`)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors border-r border-white/5"
              >
                <Printer size={15} /> Ver / Imprimir
              </button>
              <button
                onClick={() => openPDF(`/checklists/submissions/${id}/pdf`, `checklist_${sub.folio || id}.pdf`)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm text-white/60 hover:text-[#F5A623] hover:bg-[#F5A62308] transition-colors"
              >
                <Download size={15} /> Descargar
              </button>
            </div>

            <div className="bg-[#161b27] border border-white/10 p-4">
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-mono text-white/60 hover:text-white border border-white/10 hover:border-white/30 transition-colors min-h-[44px] disabled:opacity-50"
              >
                {verifying ? <Loader size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                Verificar integridad del registro
              </button>
              {verifyResult && (
                <p className={`mt-2 text-xs font-mono flex items-center gap-1.5 ${verifyResult.valid ? 'text-[#22C55E]' : 'text-red-400'}`}>
                  {verifyResult.valid ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
                  {verifyResult.valid
                    ? `Cadena íntegra — ${verifyResult.entries_checked} eventos verificados`
                    : (verifyResult.error || `Se detectó una alteración en el evento #${verifyResult.first_break_seq}`)}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
