import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, ArrowRight, Check, CloudOff, Camera } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from '../components/Layout'
import ChecklistItemControl, { isFailValue } from '../components/ChecklistItemControl'
import api, { isQueuedResponse } from '../lib/api'
import { compressImage } from '../lib/compressImage'
import { thumbUrl } from '../lib/mediaUrl'

const AUTOSAVE_DEBOUNCE_MS = 900

function HeaderInput({ field, value, onChange }) {
  const type = field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : 'text'
  if (field.type === 'select') {
    return (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#1e2535] border border-white/10 text-white px-3 py-3 text-sm focus:outline-none focus:border-[#F5A623] min-h-[48px]"
      >
        <option value="">—</option>
        {(field.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  }
  return (
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#1e2535] border border-white/10 text-white px-3 py-3 text-sm focus:outline-none focus:border-[#F5A623] min-h-[48px]"
    />
  )
}

function SectionCard({ title, answered, total, open, onToggle, children }) {
  const complete = total > 0 && answered === total
  return (
    <div className="bg-[#161b27] border border-white/10 overflow-hidden">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3.5 text-left min-h-[52px]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">{title}</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${
            complete ? 'text-[#22C55E] border-[#22C55E]/40 bg-[#22C55E]/10' : 'text-white/30 border-white/10'
          }`}>
            {answered}/{total}
          </span>
        </div>
        {open ? <ChevronUp size={16} className="text-white/40 shrink-0" /> : <ChevronDown size={16} className="text-white/40 shrink-0" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ChecklistFill() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [headerValues, setHeaderValues] = useState({})
  const [responses, setResponses] = useState({}) // item_key -> { result, observation }
  const [openSections, setOpenSections] = useState({})
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const [queued, setQueued] = useState(false)
  const [uploadingPhotoFor, setUploadingPhotoFor] = useState(null)
  const saveTimer = useRef(null)
  const dirtyRef = useRef(false)
  const fileInputRefs = useRef({})

  useEffect(() => {
    api.get(`/checklists/submissions/${id}`).then(({ data }) => {
      setSubmission(data)
      setHeaderValues(data.header_values || {})
      const byKey = {}
      for (const r of data.responses || []) byKey[r.item_key] = r
      setResponses(byKey)
      const firstSection = data.template?.sections?.[0]?.key
      setOpenSections({ __header: true, ...(firstSection ? { [firstSection]: true } : {}) })
    }).catch((err) => {
      alert(err.response?.data?.detail || 'No se pudo cargar el checklist')
      navigate('/checklists')
    }).finally(() => setLoading(false))
  }, [id])

  const flush = useCallback(async (hv, resp) => {
    clearTimeout(saveTimer.current)
    if (!dirtyRef.current) return
    dirtyRef.current = false
    setSaving(true)
    try {
      const response = await api.patch(`/checklists/submissions/${id}`, {
        header_values: hv,
        responses: Object.values(resp),
      })
      if (isQueuedResponse(response)) {
        setQueued(true)
      } else {
        setQueued(false)
        setSavedAt(new Date())
      }
    } catch (err) {
      // Real (non-offline) failures surface silently here — the next successful
      // autosave will retry with the latest state. Loud errors on every keystroke
      // would be worse UX than a quiet retry for a form this granular.
      console.error(err)
    } finally {
      setSaving(false)
    }
  }, [id])

  function scheduleSave(hv, resp) {
    dirtyRef.current = true
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => flush(hv, resp), AUTOSAVE_DEBOUNCE_MS)
  }

  function updateHeader(key, value) {
    setHeaderValues((prev) => {
      const next = { ...prev, [key]: value }
      scheduleSave(next, responses)
      return next
    })
  }

  function updateResponse(itemKey, patch) {
    setResponses((prev) => {
      const next = { ...prev, [itemKey]: { ...prev[itemKey], item_key: itemKey, ...patch } }
      scheduleSave(headerValues, next)
      return next
    })
  }

  async function handleContinue() {
    await flush(headerValues, responses)
    navigate(`/checklists/${id}/sign`)
  }

  // Photos upload immediately (own endpoint, own log entry) rather than riding the
  // autosave PATCH — keeps the debounced text/tri-state autosave payload small and
  // means a photo is never silently lost if the user navigates away mid-debounce.
  async function handleAddPhoto(itemKey, fileList) {
    const files = Array.from(fileList || [])
    if (!files.length) return
    setUploadingPhotoFor(itemKey)
    try {
      const compressed = await Promise.all(files.map((f) => compressImage(f)))
      const formData = new FormData()
      formData.append('item_key', itemKey)
      for (const f of compressed) formData.append('photos', f)
      const res = await api.post(`/checklists/submissions/${id}/photos`, formData)
      if (isQueuedResponse(res)) {
        alert('Sin conexión: la foto se subirá automáticamente cuando vuelvas a tener señal.')
      } else {
        const updated = (res.data.responses || []).find((r) => r.item_key === itemKey)
        if (updated) {
          setResponses((prev) => ({ ...prev, [itemKey]: { ...prev[itemKey], ...updated } }))
        }
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'No se pudo subir la foto')
    } finally {
      setUploadingPhotoFor(null)
    }
  }

  if (loading || !submission) {
    return (
      <Layout title="Checklist" back="/checklists">
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  const template = submission.template
  const responseType = template.response_type
  const totalItems = template.sections.reduce((n, s) => n + s.items.length, 0)
  const answeredItems = Object.values(responses).filter((r) => r.result).length

  return (
    <Layout title={template.name} back="/checklists">
      <div className="px-4 py-4 pb-32 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-white/40">
          <span>{template.code} · Rev. {template.revision}</span>
          <span className="flex items-center gap-1.5">
            {saving ? (
              <><CloudOff size={12} className="text-[#F5A623]" /> Guardando...</>
            ) : queued ? (
              <><CloudOff size={12} className="text-[#F5A623]" /> Sin conexión — se subirá solo</>
            ) : savedAt ? (
              <><Check size={12} className="text-[#22C55E]" /> Guardado {savedAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</>
            ) : null}
          </span>
        </div>

        <SectionCard
          title="Datos de la unidad"
          answered={template.header_fields.filter((f) => headerValues[f.key]).length}
          total={template.header_fields.length}
          open={!!openSections.__header}
          onToggle={() => setOpenSections((p) => ({ ...p, __header: !p.__header }))}
        >
          <div className="grid grid-cols-2 gap-3">
            {template.header_fields.map((f) => (
              <div key={f.key} className={f.type === 'select' ? '' : 'col-span-2 sm:col-span-1'}>
                <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-1.5">{f.label}</label>
                <HeaderInput field={f} value={headerValues[f.key]} onChange={(v) => updateHeader(f.key, v)} />
              </div>
            ))}
          </div>
        </SectionCard>

        {template.sections.map((section) => {
          const sectionAnswered = section.items.filter((it) => responses[it.key]?.result).length
          return (
            <SectionCard
              key={section.key}
              title={section.label}
              answered={sectionAnswered}
              total={section.items.length}
              open={!!openSections[section.key]}
              onToggle={() => setOpenSections((p) => ({ ...p, [section.key]: !p[section.key] }))}
            >
              {section.items.map((item) => {
                const r = responses[item.key] || {}
                const failed = isFailValue(responseType, r.result)
                return (
                  <div key={item.key} className="space-y-2">
                    <div className="flex items-start gap-2">
                      <p className="flex-1 text-sm text-white leading-snug">
                        {item.label}
                        {item.criticality === 'critico' && <span className="text-[#F5A623] ml-1" title="Punto crítico">⚠</span>}
                      </p>
                    </div>
                    {item.criterion_text && (
                      <p className="text-xs text-white/35 leading-snug">{item.criterion_text}</p>
                    )}
                    <ChecklistItemControl
                      responseType={responseType}
                      value={r.result || null}
                      onChange={(v) => updateResponse(item.key, { result: v })}
                    />
                    {failed && (
                      <>
                        <textarea
                          value={r.observation || ''}
                          onChange={(e) => updateResponse(item.key, { observation: e.target.value })}
                          placeholder="Describe la condición insegura / acción requerida..."
                          rows={2}
                          className="w-full bg-[#1e2535] border border-red-400/30 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-400 placeholder-white/20"
                        />
                        <div className="flex flex-wrap gap-2">
                          {(r.photos || []).map((p, i) => (
                            <img key={i} src={thumbUrl(p)} alt="" className="w-14 h-14 object-cover border border-white/10" />
                          ))}
                          <input
                            ref={(el) => { fileInputRefs.current[item.key] = el }}
                            type="file" accept="image/*" capture="environment" multiple className="hidden"
                            onChange={(e) => { handleAddPhoto(item.key, e.target.files); e.target.value = '' }}
                          />
                          <button
                            type="button"
                            disabled={uploadingPhotoFor === item.key}
                            onClick={() => fileInputRefs.current[item.key]?.click()}
                            className="w-14 h-14 border border-dashed border-white/20 text-white/40 hover:text-white hover:border-white/40 flex items-center justify-center transition-colors disabled:opacity-50"
                          >
                            {uploadingPhotoFor === item.key
                              ? <div className="w-4 h-4 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
                              : <Camera size={16} />}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </SectionCard>
          )
        })}
      </div>

      <div className="fixed bottom-14 left-0 right-0 bg-[#0f1117] border-t border-white/10 px-4 py-3 z-30">
        <div className="flex items-center justify-between mb-2 text-xs font-mono text-white/40">
          <span>{answeredItems}/{totalItems} puntos respondidos</span>
        </div>
        <button
          onClick={handleContinue}
          className="w-full flex items-center justify-center gap-2 bg-[#F5A623] text-[#0f1117] font-bold text-base py-4 min-h-[56px] hover:bg-[#e8961f] transition-colors"
        >
          Continuar a firmas <ArrowRight size={18} />
        </button>
      </div>
    </Layout>
  )
}
