import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader, X, ChevronDown, ChevronUp, Hash, Package, Camera, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from '../components/Layout'
import SignatureCanvas from '../components/SignatureCanvas'
import api from '../lib/api'
import { compressImage } from '../lib/compressImage'
import { mediaUrl } from '../lib/mediaUrl'

const CITIES = ['Tijuana', 'CSL', 'San Diego']

function Input({ value, onChange, type = 'text', placeholder, maxLength, className = '' }) {
  return (
    <input
      type={type}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`w-full bg-[#1e2535] border border-white/10 text-white px-3 py-3 text-sm focus:outline-none focus:border-[#F5A623] min-h-[48px] ${className}`}
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-[#1e2535] border border-white/10 text-white px-3 py-3 text-sm focus:outline-none focus:border-[#F5A623] resize-none"
    />
  )
}

function SectionCard({ title, badge, open, onToggle, children }) {
  return (
    <div className="bg-[#161b27] border border-white/10 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left min-h-[52px]"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">{title}</span>
          {badge != null && (
            <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${
              badge > 0
                ? 'text-[#22C55E] border-[#22C55E]/40 bg-[#22C55E]/10'
                : 'text-white/30 border-white/10'
            }`}>
              {badge}
            </span>
          )}
        </div>
        {open ? <ChevronUp size={16} className="text-white/40 shrink-0" /> : <ChevronDown size={16} className="text-white/40 shrink-0" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/5 pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ReviewModal({ form, fotos, insp, onClose, onSubmit, submitting }) {
  const [firmaEntrega, setFirmaEntrega] = useState(null)
  const [firmaRecibe, setFirmaRecibe] = useState(null)
  const [nombreEntrega, setNombreEntrega] = useState(form.nombre_entrega || '')
  const [nombreRecibe, setNombreRecibe] = useState(form.nombre_recibe || '')
  const [sigError, setSigError] = useState('')

  function handleSubmit() {
    if (!firmaEntrega) { setSigError('Se requiere la firma de quien entrega'); return }
    if (!firmaRecibe) { setSigError('Se requiere la firma de quien recibe'); return }
    setSigError('')
    onSubmit({ firmaEntrega, nombreEntrega, firmaRecibe, nombreRecibe })
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col bg-[#0f1117]"
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 280 }}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#161b27] shrink-0">
        <button onClick={onClose} className="min-w-[40px] min-h-[40px] flex items-center justify-center text-white/50 hover:text-white">
          <X size={20} />
        </button>
        <div className="flex-1">
          <p className="font-bold text-sm">Revisar y Firmar</p>
          <p className="text-xs text-white/40">Confirma los datos antes de firmar</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 space-y-5 max-w-2xl mx-auto pb-8">

          <section>
            <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3 pb-2 border-b border-white/5">
              Resumen
            </h2>
            <div className="bg-[#161b27] border border-white/10 p-4 space-y-3">
              {[
                { label: 'Folio', value: insp?.folio },
                { label: 'Entregado por', value: form.nombre_entrega },
                { label: 'Recibido por', value: form.nombre_recibe },
                { label: 'Ciudad', value: form.city },
                { label: 'Fecha', value: form.fecha },
                { label: 'Fotos', value: fotos.length ? `${fotos.length} foto(s)` : null },
              ].filter(r => r.value).map(({ label, value }) => (
                <div key={label} className="grid grid-cols-2 gap-2">
                  <span className="text-[10px] font-mono text-white/30 uppercase">{label}</span>
                  <p className="text-sm text-white/80 font-mono truncate">{value}</p>
                </div>
              ))}
              <div className="pt-2 border-t border-white/5">
                <span className="text-[10px] font-mono text-white/30 uppercase">Descripción</span>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">{form.descripcion || '—'}</p>
              </div>
              {form.notas && (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[10px] font-mono text-white/30 uppercase">Notas</span>
                  <p className="text-xs text-white/60 mt-0.5">{form.notas}</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3 pb-2 border-b border-white/5">
              Firma — Quien Entrega
            </h2>
            <div className="space-y-2">
              <Input value={nombreEntrega} onChange={setNombreEntrega} placeholder="Nombre de quien entrega" />
              <SignatureCanvas onSave={setFirmaEntrega} />
            </div>
          </section>

          <section>
            <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3 pb-2 border-b border-white/5">
              Firma — Quien Recibe
            </h2>
            <div className="space-y-2">
              <Input value={nombreRecibe} onChange={setNombreRecibe} placeholder="Nombre de quien recibe" />
              <SignatureCanvas onSave={setFirmaRecibe} />
            </div>
          </section>

          {sigError && (
            <p className="text-red-400 text-sm text-center font-mono">{sigError}</p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-[#F5A623] text-[#0f1117] py-4 font-bold text-sm uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 min-h-[56px]"
          >
            {submitting ? <Loader size={18} className="animate-spin" /> : 'Guardar Recibo'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function MercanciaIntake() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [insp, setInsp] = useState(null)
  const [loadingInsp, setLoadingInsp] = useState(true)
  const [openSection, setOpenSection] = useState('info')
  const [showReview, setShowReview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fotos, setFotos] = useState([])
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    nombre_recibe: '',
    nombre_entrega: '',
    descripcion: '',
    notas: '',
    fecha: new Date().toISOString().slice(0, 10),
    city: 'Tijuana',
  })

  const nombreRecibeRef = useRef(null)

  useEffect(() => {
    api.get(`/vehicles/${id}`)
      .then(({ data }) => {
        setInsp(data)
        setForm(f => ({
          ...f,
          nombre_recibe: data.nombre || '',
          fecha: data.fecha || f.fecha,
          city: data.city || f.city,
        }))
      })
      .catch(() => setError('No se pudo cargar la inspección'))
      .finally(() => setLoadingInsp(false))
  }, [id])

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function toggle(section) {
    setOpenSection(s => s === section ? null : section)
  }

  async function handleFotos(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const compressed = await Promise.all(files.map(f => compressImage(f)))
    setFotos(prev => [...prev, ...compressed])
    e.target.value = ''
  }

  function removePhoto(idx) {
    setFotos(prev => prev.filter((_, i) => i !== idx))
  }

  function handleContinue() {
    if (!form.nombre_recibe.trim()) {
      setOpenSection('info')
      setError('El nombre de quien recibe es obligatorio')
      setTimeout(() => nombreRecibeRef.current?.focus(), 200)
      return
    }
    if (!form.descripcion.trim()) {
      setOpenSection('mercancias')
      setError('La descripción de la mercancía es obligatoria')
      return
    }
    setError('')
    setShowReview(true)
  }

  async function handleSubmit({ firmaEntrega, nombreEntrega, firmaRecibe, nombreRecibe }) {
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('nombre_recibe', nombreRecibe || form.nombre_recibe)
      fd.append('nombre_entrega', nombreEntrega || form.nombre_entrega)
      fd.append('descripcion', form.descripcion)
      if (form.notas) fd.append('notas', form.notas)
      fd.append('fecha', form.fecha)
      fd.append('city', form.city)
      fd.append('firma_origen', firmaEntrega)
      if (nombreEntrega) fd.append('nombre_firma_origen', nombreEntrega)
      fd.append('firma_destino', firmaRecibe)
      if (nombreRecibe) fd.append('nombre_firma_destino', nombreRecibe)
      for (const f of fotos) fd.append('fotos', f)

      await api.post(`/vehicles/${id}/mercancias-save`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate(`/vehicles/${id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar')
      setSubmitting(false)
    }
  }

  if (loadingInsp) {
    return (
      <Layout title="Mercancía">
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Recibo de Mercancía">
      <div className="px-4 py-4 space-y-3 pb-32 max-w-2xl mx-auto">

        {/* Folio badge */}
        {insp?.folio && (
          <div className="flex items-center gap-1.5 px-3 py-2 bg-[#F5A623]/10 border border-[#F5A623]/30 w-fit">
            <Hash size={13} className="text-[#F5A623]" />
            <span className="text-[#F5A623] font-mono text-xs font-bold">{insp.folio}</span>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono">
            {error}
          </div>
        )}

        {/* Info section */}
        <SectionCard title="Información" open={openSection === 'info'} onToggle={() => toggle('info')}>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">
                Nombre quien recibe <span className="text-red-400">*</span>
              </label>
              <input
                ref={nombreRecibeRef}
                type="text"
                value={form.nombre_recibe}
                onChange={e => setField('nombre_recibe', e.target.value)}
                placeholder="Nombre del receptor"
                className="w-full bg-[#1e2535] border border-white/10 text-white px-3 py-3 text-sm focus:outline-none focus:border-[#F5A623] min-h-[48px]"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Nombre quien entrega</label>
              <Input value={form.nombre_entrega} onChange={v => setField('nombre_entrega', v)} placeholder="Nombre del remitente" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Ciudad</label>
                <select
                  value={form.city}
                  onChange={e => setField('city', e.target.value)}
                  className="w-full bg-[#1e2535] border border-white/10 text-white px-3 py-3 text-sm focus:outline-none focus:border-[#F5A623] min-h-[48px]"
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Fecha</label>
                <Input type="date" value={form.fecha} onChange={v => setField('fecha', v)} />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Mercancias section */}
        <SectionCard title="Mercancía" open={openSection === 'mercancias'} onToggle={() => toggle('mercancias')}>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">
                Descripción <span className="text-red-400">*</span>
              </label>
              <Textarea
                value={form.descripcion}
                onChange={v => setField('descripcion', v)}
                placeholder="Describe la mercancía recibida (tipo, cantidad, condición...)"
                rows={5}
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Notas adicionales</label>
              <Textarea
                value={form.notas}
                onChange={v => setField('notas', v)}
                placeholder="Observaciones, condición especial, etc."
                rows={3}
              />
            </div>
          </div>
        </SectionCard>

        {/* Photos section */}
        <SectionCard title="Fotos" badge={fotos.length} open={openSection === 'fotos'} onToggle={() => toggle('fotos')}>
          <div className="space-y-3">
            {fotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {fotos.map((f, idx) => (
                  <div key={idx} className="relative aspect-square bg-[#0f1117] border border-white/10 overflow-hidden">
                    <img
                      src={URL.createObjectURL(f)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 bg-black/70 text-white/80 hover:text-red-400 p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border border-dashed border-white/20 py-4 text-white/40 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Camera size={18} />
              Agregar fotos
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={handleFotos}
              className="hidden"
            />
          </div>
        </SectionCard>

        {/* Continue button */}
        <button
          type="button"
          onClick={handleContinue}
          className="w-full bg-[#F5A623] text-[#0f1117] py-4 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 min-h-[56px] active:scale-[0.98] transition-transform"
        >
          <Package size={18} />
          Continuar a Firmas
        </button>
      </div>

      <AnimatePresence>
        {showReview && (
          <ReviewModal
            form={form}
            fotos={fotos}
            insp={insp}
            onClose={() => setShowReview(false)}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </AnimatePresence>
    </Layout>
  )
}
