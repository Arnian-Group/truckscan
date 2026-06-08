import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader, CheckSquare, Square } from 'lucide-react'
import Layout from '../components/Layout'
import SignatureCanvas from '../components/SignatureCanvas'
import api from '../lib/api'

const CITIES = ['Tijuana', 'CSL', 'San Diego']
const FUEL_OPTIONS = ['E', '1/4', '1/2', '3/4', 'F']
const CHECKLIST_ITEMS = [
  { key: 'licencia',    label: 'Copia de Licencia / Driver\'s License' },
  { key: 'circulacion', label: 'Tarjeta de Circulación / Circulation Card' },
  { key: 'aseguranza',  label: 'Copia de Aseguranza / Insurance' },
  { key: 'cotizacion',  label: 'Cotización Firmada / Signed Quote' },
  { key: 'autorizacion',label: 'Carta de Autorización / Authorization' },
]

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-mono text-white/40 uppercase tracking-wider mb-1.5">{label}</label>
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

export default function VehicleIntake() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [insp, setInsp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [signing, setSigning] = useState(false)
  const [firmaOrigen, setFirmaOrigen] = useState(null)
  const [firmaDestino, setFirmaDestino] = useState(null)
  const [nombreOrigen, setNombreOrigen] = useState('')
  const [nombreDestino, setNombreDestino] = useState('')
  const [sigError, setSigError] = useState('')

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
      if (data.firma_origen) setFirmaOrigen(data.firma_origen)
      if (data.nombre_firma_origen) setNombreOrigen(data.nombre_firma_origen)
      if (data.nombre_firma_destino) setNombreDestino(data.nombre_firma_destino)
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  function set(field) {
    return val => setForm(prev => ({ ...prev, [field]: val }))
  }

  function toggleChecklist(key) {
    setForm(prev => ({
      ...prev,
      checklist: { ...prev.checklist, [key]: !prev.checklist[key] },
    }))
  }

  async function handleSaveIntake() {
    setSaving(true)
    try {
      await api.patch(`/vehicles/${id}/intake`, {
        ...form,
        year: form.year ? parseInt(form.year) : null,
        odometer: form.odometer ? parseInt(form.odometer) : null,
        vin: form.vin || null,
      })
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleSign() {
    if (!firmaOrigen) {
      setSigError('Se requiere la firma de origen')
      return
    }
    setSigError('')
    setSigning(true)
    try {
      await api.patch(`/vehicles/${id}/intake`, {
        ...form,
        year: form.year ? parseInt(form.year) : null,
        odometer: form.odometer ? parseInt(form.odometer) : null,
        vin: form.vin || null,
      })
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
    } finally {
      setSigning(false)
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

        {/* Section: General info */}
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
            <Field label="Cliente / Customer">
              <Input value={form.nombre} onChange={set('nombre')} placeholder="Nombre completo" />
            </Field>
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
                  <button
                    key={f}
                    type="button"
                    onClick={() => set('gasolina')(f)}
                    className={`flex-1 py-3 font-mono font-bold text-sm min-h-[48px] transition-all ${
                      form.gasolina === f
                        ? 'bg-[#F5A623] text-[#0f1117]'
                        : 'bg-[#1e2535] text-white/50 border border-white/10 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
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
              <button
                key={key}
                type="button"
                onClick={() => toggleChecklist(key)}
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

        {/* Save intake button */}
        <button
          type="button"
          onClick={handleSaveIntake}
          disabled={saving}
          className="w-full py-3.5 border border-[#F5A623]/50 text-[#F5A623] font-mono font-bold text-sm hover:bg-[#F5A62310] disabled:opacity-50 transition-all"
        >
          {saving ? 'Guardando...' : 'Guardar Datos'}
        </button>

        {/* Legal text */}
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
    </Layout>
  )
}
