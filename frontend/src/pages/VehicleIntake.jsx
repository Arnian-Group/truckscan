import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader, CheckSquare, Square, Trash2, X, ArrowRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from '../components/Layout'
import SignatureCanvas from '../components/SignatureCanvas'
import api from '../lib/api'
import { isAdmin } from '../lib/auth'

const CITIES = ['Tijuana', 'CSL', 'San Diego']
const FUEL_OPTIONS = ['E', '1/4', '1/2', '3/4', 'F']
const CHECKLIST_ITEMS = [
  { key: 'licencia',     label: 'Copia de Licencia / Driver\'s License' },
  { key: 'circulacion',  label: 'Tarjeta de Circulación / Circulation Card' },
  { key: 'aseguranza',   label: 'Copia de Aseguranza / Insurance' },
  { key: 'cotizacion',   label: 'Cotización Firmada / Signed Quote' },
  { key: 'autorizacion', label: 'Carta de Autorización / Authorization' },
]

function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-xs font-mono text-white/40 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

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

function ReviewModal({ form, insp, onClose, onSign, signing }) {
  const [firmaOrigen, setFirmaOrigen] = useState(null)
  const [firmaDestino, setFirmaDestino] = useState(null)
  const [nombreOrigen, setNombreOrigen] = useState(form.nombre || '')
  const [nombreDestino, setNombreDestino] = useState('')
  const [sigError, setSigError] = useState('')

  const vehicleType = insp?.vehicle_type?.toUpperCase() || '—'
  const rows = [
    { label: 'Tipo',      value: vehicleType },
    { label: 'Cliente',   value: form.nombre },
    { label: 'ID',        value: form.id_cliente },
    { label: 'Año',       value: form.year },
    { label: 'Marca',     value: form.make },
    { label: 'Modelo',    value: form.model },
    { label: 'Color',     value: form.color },
    { label: 'Placas',    value: form.placas },
    { label: 'Odómetro',  value: form.odometer ? `${form.odometer} km/mi` : null },
    { label: 'VIN',       value: form.vin },
    { label: 'Gasolina',  value: form.gasolina },
    { label: 'Ciudad',    value: form.city },
    { label: 'Fecha',     value: form.fecha },
  ].filter(r => r.value)

  function handleSign() {
    if (!firmaOrigen) { setSigError('Se requiere la firma del cliente'); return }
    setSigError('')
    onSign({
      firmaOrigen,
      nombreOrigen,
      firmaDestino,
      nombreDestino,
    })
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col bg-[#0f1117]"
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 280 }}
    >
      {/* Header */}
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

          {/* Vehicle summary */}
          <section>
            <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3 pb-2 border-b border-white/5">
              Resumen del vehículo
            </h2>
            <div className="bg-[#161b27] border border-white/10 p-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {rows.map(({ label, value }) => (
                  <div key={label}>
                    <span className="text-[10px] font-mono text-white/30 uppercase">{label}</span>
                    <p className="text-sm text-white/80 font-mono truncate">{value}</p>
                  </div>
                ))}
              </div>
              {form.notas && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <span className="text-[10px] font-mono text-white/30 uppercase">Notas</span>
                  <p className="text-xs text-white/60 mt-0.5">{form.notas}</p>
                </div>
              )}
            </div>
          </section>

          {/* Documents */}
          <section>
            <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3 pb-2 border-b border-white/5">
              Documentos recibidos
            </h2>
            <div className="space-y-1.5">
              {CHECKLIST_ITEMS.map(({ key, label }) => {
                const checked = form.checklist[key]
                return (
                  <div key={key} className={`flex items-center gap-3 px-3 py-2.5 border ${checked ? 'bg-[#161b27] border-white/10' : 'border-white/5 opacity-50'}`}>
                    {checked
                      ? <CheckSquare size={16} className="text-[#22C55E] shrink-0" />
                      : <Square size={16} className="text-white/20 shrink-0" />}
                    <span className={`text-sm ${checked ? 'text-white/80' : 'text-white/30'}`}>{label}</span>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Legal */}
          <section>
            <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3 pb-2 border-b border-white/5">
              Descargo de Responsabilidad
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-white/50 leading-relaxed">
              <div className="bg-[#161b27] border border-white/5 p-4">
                <p className="text-white/70 font-mono uppercase text-[10px] mb-2">ORIGIN / ORIGEN</p>
                <p>Received by owner in apparent good condition EXCEPT AS NOTED. I agree with Arnian's assessment of the vehicle's condition at the time of delivery. I have read and understand the terms and conditions. I agree to be bound by these terms. This Vehicle is free of contents.</p>
              </div>
              <div className="bg-[#161b27] border border-white/5 p-4">
                <p className="text-white/70 font-mono uppercase text-[10px] mb-2">DESTINATION / DESTINO</p>
                <p>We have received the above vehicle in good condition except as noted, thereby releasing Arnian from any further claims regarding pre-existing damage. All items as specified above were received.</p>
              </div>
            </div>
          </section>

          {/* Signatures */}
          <section>
            <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3 pb-2 border-b border-white/5">
              Firmas / Signatures
            </h2>
            <div className="space-y-5">
              <div>
                <SignatureCanvas
                  label="Firma del Cliente (Origin) *"
                  onSave={data => { setFirmaOrigen(data); setSigError('') }}
                  onClear={() => setFirmaOrigen(null)}
                />
                {firmaOrigen && (
                  <div className="mt-2">
                    <input
                      value={nombreOrigen}
                      onChange={e => setNombreOrigen(e.target.value)}
                      placeholder="Nombre del firmante"
                      className="w-full bg-[#1e2535] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#F5A623]"
                    />
                  </div>
                )}
              </div>
              <div>
                <SignatureCanvas
                  label="Firma del Agente (Destination) — opcional"
                  onSave={data => setFirmaDestino(data)}
                  onClear={() => setFirmaDestino(null)}
                />
                {firmaDestino && (
                  <div className="mt-2">
                    <input
                      value={nombreDestino}
                      onChange={e => setNombreDestino(e.target.value)}
                      placeholder="Nombre del agente"
                      className="w-full bg-[#1e2535] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#F5A623]"
                    />
                  </div>
                )}
              </div>
            </div>

            {sigError && (
              <p className="mt-3 text-red-400 text-sm font-mono border border-red-400/30 bg-red-400/10 px-3 py-2">
                {sigError}
              </p>
            )}

            <button
              type="button"
              onClick={handleSign}
              disabled={signing || !firmaOrigen}
              className="mt-4 w-full bg-[#F5A623] text-[#0f1117] font-bold py-4 min-h-[56px] hover:bg-[#e8961f] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {signing ? 'Generando PDF...' : 'Confirmar y Generar PDF →'}
            </button>
          </section>

        </div>
      </div>
    </motion.div>
  )
}

export default function VehicleIntake() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [insp, setInsp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [signing, setSigning] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [confirmArchive, setConfirmArchive] = useState(false)
  const [nombreError, setNombreError] = useState(false)

  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    city: '',
    nombre: '',
    id_cliente: '',
    year: '',
    make: '',
    model: '',
    color: '',
    placas: '',
    odometer: '',
    vin: '',
    gasolina: '',
    notas: '',
    checklist: {},
  })

  useEffect(() => {
    api.get(`/vehicles/${id}`).then(({ data }) => {
      setInsp(data)
      setForm(prev => ({
        ...prev,
        fecha: data.fecha || prev.fecha,
        city: data.city || '',
        nombre: data.nombre || '',
        id_cliente: data.id_cliente || '',
        year: data.year || '',
        make: data.make || '',
        model: data.model || '',
        color: data.color || '',
        placas: data.placas || '',
        odometer: data.odometer || '',
        vin: data.vin || '',
        gasolina: data.gasolina || '',
        notas: data.notas || '',
        checklist: data.checklist || {},
      }))
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  function set(field) {
    return val => {
      setForm(prev => ({ ...prev, [field]: val }))
      if (field === 'nombre') setNombreError(false)
    }
  }

  function toggleChecklist(key) {
    setForm(prev => ({ ...prev, checklist: { ...prev.checklist, [key]: !prev.checklist[key] } }))
  }

  async function handleSaveAndReview() {
    if (!form.nombre?.trim()) {
      setNombreError(true)
      document.getElementById('field-nombre')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setSaving(true)
    try {
      await api.patch(`/vehicles/${id}/intake`, {
        ...form,
        year: form.year ? parseInt(form.year) : null,
        odometer: form.odometer ? parseInt(form.odometer) : null,
        vin: form.vin || null,
      })
      setShowReview(true)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleSign({ firmaOrigen, nombreOrigen, firmaDestino, nombreDestino }) {
    setSigning(true)
    try {
      await api.post(`/vehicles/${id}/sign`, {
        firma_origen: firmaOrigen,
        nombre_firma_origen: nombreOrigen || null,
        fecha_firma_origen: form.fecha || null,
        firma_destino: firmaDestino || undefined,
        nombre_firma_destino: firmaDestino ? (nombreDestino || null) : undefined,
        fecha_firma_destino: firmaDestino ? (form.fecha || null) : undefined,
      })
      navigate(`/vehicles/${id}/inspection`)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al firmar')
      setSigning(false)
    }
  }

  async function handleArchive() {
    if (!confirmArchive) {
      setConfirmArchive(true)
      setTimeout(() => setConfirmArchive(false), 5000)
      return
    }
    setArchiving(true)
    try {
      await api.delete(`/vehicles/${id}`)
      navigate('/vehicles')
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al archivar')
      setArchiving(false)
    }
  }

  if (loading) {
    return (
      <Layout title="Intake" back="/vehicles">
        <div className="flex justify-center py-16"><Loader size={28} className="animate-spin text-[#F5A623]" /></div>
      </Layout>
    )
  }

  return (
    <Layout title={`Intake — ${insp?.vehicle_type?.toUpperCase() || ''}`} back="/vehicles">
      <div className="px-4 py-4 pb-32 space-y-6 max-w-2xl mx-auto">

        {/* General info */}
        <section>
          <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3 pb-2 border-b border-white/5">
            Información General
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha">
              <Input type="date" value={form.fecha} onChange={set('fecha')} />
            </Field>
            <Field label="Ciudad">
              <select
                value={form.city}
                onChange={e => set('city')(e.target.value)}
                className="w-full bg-[#1e2535] border border-white/10 text-white px-3 py-3 text-sm focus:outline-none focus:border-[#F5A623] min-h-[48px]"
              >
                <option value="">— Seleccionar —</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <div id="field-nombre" className="col-span-2 sm:col-span-1">
              <Field label="Cliente / Customer" required>
                <input
                  type="text"
                  value={form.nombre || ''}
                  onChange={e => set('nombre')(e.target.value)}
                  placeholder="Nombre completo"
                  className={`w-full bg-[#1e2535] border text-white px-3 py-3 text-sm focus:outline-none min-h-[48px] transition-colors ${
                    nombreError ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[#F5A623]'
                  }`}
                />
                {nombreError && <p className="text-red-400 text-xs font-mono mt-1">El nombre del cliente es obligatorio</p>}
              </Field>
            </div>
            <Field label="ID / Documento">
              <Input value={form.id_cliente} onChange={set('id_cliente')} placeholder="ID, pasaporte..." />
            </Field>
            <Field label="Año / Year">
              <Input type="number" value={form.year} onChange={set('year')} placeholder="2020" />
            </Field>
            <Field label="Marca / Make">
              <Input value={form.make} onChange={set('make')} placeholder="Toyota, Ford..." />
            </Field>
            <Field label="Modelo / Model">
              <Input value={form.model} onChange={set('model')} placeholder="Tacoma, F-150..." />
            </Field>
            <Field label="Color">
              <Input value={form.color} onChange={set('color')} placeholder="Blanco, Negro..." />
            </Field>
            <Field label="Placas / Plates">
              <Input value={form.placas} onChange={set('placas')} placeholder="ABC-1234" className="uppercase" />
            </Field>
            <Field label="Odómetro / Odometer">
              <Input type="number" value={form.odometer} onChange={set('odometer')} placeholder="50000" />
            </Field>
          </div>
          <div className="mt-3">
            <Field label="VIN (máx 17 caracteres)">
              <Input value={form.vin} onChange={set('vin')} placeholder="1HGBH41JXMN109186" maxLength={17} />
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Nivel de gasolina / Fuel">
              <div className="flex gap-1">
                {FUEL_OPTIONS.map(f => (
                  <button key={f} type="button" onClick={() => set('gasolina')(f)}
                    className={`flex-1 py-3 font-mono font-bold text-sm min-h-[48px] transition-all ${
                      form.gasolina === f ? 'bg-[#F5A623] text-[#0f1117]' : 'bg-[#1e2535] text-white/50 border border-white/10 hover:text-white'
                    }`}>{f}</button>
                ))}
              </div>
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Notas / Notes">
              <textarea
                value={form.notas}
                onChange={e => set('notas')(e.target.value)}
                rows={3}
                placeholder="Observaciones generales..."
                className="w-full bg-[#1e2535] border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#F5A623] resize-none"
              />
            </Field>
          </div>
        </section>

        {/* Checklist */}
        <section>
          <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3 pb-2 border-b border-white/5">
            Documentos Recibidos
          </h2>
          <div className="space-y-2">
            {CHECKLIST_ITEMS.map(({ key, label }) => (
              <button key={key} type="button" onClick={() => toggleChecklist(key)}
                className="w-full flex items-center gap-3 p-3 bg-[#161b27] border border-white/10 hover:border-[#F5A623]/40 transition-all text-left min-h-[52px]"
              >
                {form.checklist[key]
                  ? <CheckSquare size={20} className="text-[#22C55E] shrink-0" />
                  : <Square size={20} className="text-white/20 shrink-0" />}
                <span className="text-sm text-white/80">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* CTA */}
        <button
          type="button"
          onClick={handleSaveAndReview}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-[#F5A623] text-[#0f1117] font-bold py-4 min-h-[56px] hover:bg-[#e8961f] disabled:opacity-50 transition-all text-base"
        >
          {saving ? 'Guardando...' : <><span>Guardar y Revisar</span><ArrowRight size={18} /></>}
        </button>

        {isAdmin() && (
          <section className="pt-2 border-t border-white/5">
            <button type="button" onClick={handleArchive} disabled={archiving}
              className={`w-full flex items-center justify-center gap-2 py-3 font-mono text-sm transition-all min-h-[48px] ${
                confirmArchive
                  ? 'border border-red-500/60 bg-red-500/10 text-red-400 font-bold'
                  : 'border border-white/10 text-white/30 hover:text-red-400 hover:border-red-400/40'
              }`}
            >
              <Trash2 size={15} />
              {archiving ? 'Archivando...' : confirmArchive ? '¿Confirmar archivar intake? Tap de nuevo' : 'Archivar este intake'}
            </button>
          </section>
        )}
      </div>

      <AnimatePresence>
        {showReview && (
          <ReviewModal
            form={form}
            insp={insp}
            onClose={() => setShowReview(false)}
            onSign={handleSign}
            signing={signing}
          />
        )}
      </AnimatePresence>
    </Layout>
  )
}
