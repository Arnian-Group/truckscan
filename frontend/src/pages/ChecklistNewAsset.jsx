import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Wrench, QrCode } from 'lucide-react'
import Layout from '../components/Layout'
import QRScanner from '../components/QRScanner'
import api from '../lib/api'
import { newIdempotencyKey } from '../lib/idempotency'

// Best-effort mapping from a registered ChecklistAsset's fields onto a template's
// header_fields (which vary per template) — saves retyping unit data the operator
// already entered once when the asset was registered, without hardcoding per template.
function prefillFromAsset(headerFields, asset) {
  if (!asset) return {}
  const values = {}
  for (const f of headerFields) {
    const key = f.key.toLowerCase()
    if (key.includes('economico')) values[f.key] = asset.economic_number
    else if (key.includes('placa')) values[f.key] = asset.plate
    else if (key.includes('energia')) values[f.key] = asset.energy_type
    else if (key.includes('marca') && key.includes('modelo')) {
      values[f.key] = [asset.brand, asset.model].filter(Boolean).join(' ')
    } else if (key.includes('marca')) values[f.key] = asset.brand
  }
  return values
}

export default function ChecklistNewAsset() {
  const { templateId } = useParams()
  const navigate = useNavigate()
  const [template, setTemplate] = useState(null)
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [scanning, setScanning] = useState(false)
  const idemKey = useRef(newIdempotencyKey())

  useEffect(() => {
    api.get(`/checklists/templates/${templateId}`).then(({ data }) => {
      setTemplate(data)
      return api.get('/checklists/assets', { params: { asset_type: data.asset_type } })
    }).then(({ data }) => setAssets(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [templateId])

  // Throws on any failure — QRScanner awaits this and shows the message inline,
  // in the sheet the user is actually looking at, rather than a state update on
  // this page that would render behind the still-open scanner modal.
  async function handleScan(token) {
    const { data: asset } = await api.get(`/checklists/assets/by-qr/${encodeURIComponent(token)}`)
    if (asset.asset_type !== template.asset_type) {
      throw new Error(`Esa unidad es de tipo "${asset.asset_type}", no corresponde a este checklist.`)
    }
    await createSubmission(asset) // navigates on success, throws on failure
  }

  // Always throws on failure — callers decide how to surface it (inline in the
  // scanner sheet for handleScan, a plain alert for the direct-tap list below).
  async function createSubmission(asset) {
    if (creating || !template) return
    setCreating(true)
    try {
      const header_values = prefillFromAsset(template.header_fields, asset)
      const { data } = await api.post('/checklists/submissions', {
        template_id: template.id,
        asset_id: asset?.id || null,
        header_values,
      }, { headers: { 'Idempotency-Key': idemKey.current } })
      navigate(`/checklists/${data.id}/fill`)
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Sin conexión: no se pudo crear el checklist. Intenta de nuevo cuando tengas señal.')
    } finally {
      setCreating(false)
    }
  }

  async function handleTapCreate(asset) {
    try {
      await createSubmission(asset)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <Layout title={template?.name || 'Nuevo Checklist'} back="/checklists/new">
      <div className="px-4 py-4 pb-24">
        <p className="text-white/40 text-sm font-mono mb-4">Selecciona la unidad (o continúa sin registrarla)</p>

        <button
          onClick={() => setScanning(true)}
          className="w-full flex items-center justify-center gap-2 bg-[#F5A62315] border border-[#F5A62340] text-[#F5A623] font-bold py-3.5 mb-4 min-h-[52px] hover:bg-[#F5A62322] transition-colors"
        >
          <QrCode size={18} /> Escanear QR de la unidad
        </button>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {assets.map((a) => (
              <button
                key={a.id}
                disabled={creating}
                onClick={() => handleTapCreate(a)}
                className="w-full bg-[#161b27] border border-white/10 hover:border-[#F5A623]/60 active:scale-98 transition-all p-4 flex items-center gap-3 text-left disabled:opacity-50"
              >
                <Wrench size={18} className="text-[#F5A623] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm">{a.economic_number}</div>
                  <div className="text-white/40 text-xs font-mono mt-0.5 truncate">
                    {[a.brand, a.model, a.plate].filter(Boolean).join(' · ') || '—'}
                  </div>
                </div>
              </button>
            ))}
            <button
              disabled={creating}
              onClick={() => handleTapCreate(null)}
              className="w-full border border-dashed border-white/15 hover:border-[#F5A623]/60 active:scale-98 transition-all p-4 text-center text-white/40 hover:text-white text-sm font-mono disabled:opacity-50 min-h-[56px]"
            >
              {creating ? 'Creando...' : 'Continuar sin unidad registrada'}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {scanning && (
          <QRScanner onScan={handleScan} onClose={() => setScanning(false)} />
        )}
      </AnimatePresence>
    </Layout>
  )
}
