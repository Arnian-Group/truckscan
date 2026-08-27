import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send } from 'lucide-react'
import Layout from '../components/Layout'
import SignatureCanvas from '../components/SignatureCanvas'
import api from '../lib/api'
import { getUser } from '../lib/auth'

export default function ChecklistSign() {
  const { id } = useParams()
  const navigate = useNavigate()
  const me = getUser()
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [names, setNames] = useState({})
  const [signing, setSigning] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function load() {
    return api.get(`/checklists/submissions/${id}`).then(({ data }) => {
      setSubmission(data)
      setNames((prev) => {
        const next = { ...prev }
        for (const role of data.template.signature_roles) {
          if (next[role.key] === undefined) {
            const existing = (data.signatures || []).find((s) => s.role === role.key)
            next[role.key] = existing?.name || (role.key === 'operador' || role.key === 'conductor' ? me?.name || '' : '')
          }
        }
        return next
      })
    })
  }

  useEffect(() => { load().catch(console.error).finally(() => setLoading(false)) }, [id])

  async function handleSign(role, dataUrl) {
    setSigning(role.key)
    setError('')
    try {
      await api.post(`/checklists/submissions/${id}/sign`, {
        role: role.key, name: names[role.key] || '', signature_data: dataUrl,
      })
      await load()
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo guardar la firma')
    } finally {
      setSigning(null)
    }
  }

  async function handleClear(roleKey) {
    setSubmission((prev) => ({ ...prev, signatures: (prev.signatures || []).filter((s) => s.role !== roleKey) }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    try {
      const { data } = await api.post(`/checklists/submissions/${id}/submit`)
      navigate(`/checklists/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo enviar el checklist')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !submission) {
    return (
      <Layout title="Firmas" back={`/checklists/${id}/fill`}>
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  const template = submission.template
  const signedByRole = Object.fromEntries((submission.signatures || []).map((s) => [s.role, s]))
  const requiredMissing = template.signature_roles.filter((r) => r.required && !signedByRole[r.key])

  return (
    <Layout title="Firmas" back={`/checklists/${id}/fill`}>
      <div className="px-4 py-4 pb-28 space-y-5">
        {template.signature_roles.map((role) => {
          const existing = signedByRole[role.key]
          return (
            <div key={role.key}>
              <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-1.5">
                {role.label}{role.required && <span className="text-[#F5A623]"> *</span>}
              </label>
              <input
                type="text"
                value={names[role.key] || ''}
                onChange={(e) => setNames((p) => ({ ...p, [role.key]: e.target.value }))}
                disabled={!!existing}
                placeholder="Nombre de quien firma"
                className="w-full bg-[#1e2535] border border-white/10 text-white px-3 py-3 text-sm focus:outline-none focus:border-[#F5A623] disabled:opacity-50 min-h-[48px] mb-2"
              />
              <SignatureCanvas
                value={existing?.signature_data}
                locked={!!existing}
                disabled={signing === role.key || !names[role.key]}
                hint={!names[role.key] ? 'Escribe el nombre antes de firmar' : ''}
                onSave={(dataUrl) => handleSign(role, dataUrl)}
                onClear={() => handleClear(role.key)}
              />
            </div>
          )
        })}

        {error && (
          <p className="text-red-400 text-sm font-mono border border-red-400/30 bg-red-400/10 px-3 py-2">{error}</p>
        )}
      </div>

      <div className="fixed bottom-14 left-0 right-0 bg-[#0f1117] border-t border-white/10 px-4 py-3 z-30">
        {requiredMissing.length > 0 && (
          <p className="text-xs font-mono text-white/40 mb-2">
            Faltan firmas: {requiredMissing.map((r) => r.label).join(', ')}
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={submitting || requiredMissing.length > 0}
          className="w-full flex items-center justify-center gap-2 bg-[#F5A623] text-[#0f1117] font-bold text-base py-4 min-h-[56px] hover:bg-[#e8961f] transition-colors disabled:opacity-40"
        >
          <Send size={18} /> {submitting ? 'Enviando...' : 'Enviar checklist'}
        </button>
      </div>
    </Layout>
  )
}
