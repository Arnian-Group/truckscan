import { useState, useEffect } from 'react'
import { X, Link2, Copy, Check, Trash2, Plus, ExternalLink } from 'lucide-react'
import api from '../lib/api'

const EXPIRY_OPTIONS = [
  { label: '1 hora',          hours: 1 },
  { label: '24 horas',        hours: 24 },
  { label: '7 días',          hours: 24 * 7 },
  { label: '30 días',         hours: 24 * 30 },
  { label: 'Sin vencimiento', hours: null },
]

function linkStatus(link) {
  if (link.revoked_at) return { label: 'REVOCADO', cls: 'text-red-400 bg-red-400/10 border-red-400/30' }
  if (link.expires_at && new Date(link.expires_at) < new Date())
    return { label: 'EXPIRADO', cls: 'text-white/30 bg-white/5 border-white/10' }
  return { label: 'ACTIVO', cls: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30' }
}

function shareUrl(token) {
  return `${window.location.origin}/s/${token}`
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 text-xs font-mono text-white/50 hover:text-white hover:border-[#F5A623]/40 transition-colors shrink-0"
    >
      {copied ? <Check size={12} className="text-[#22C55E]" /> : <Copy size={12} />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}

export default function ShareModal({ inspectionId, entryNumber: initialEntryNumber, onEntryNumberSaved, onClose }) {
  const [links,        setLinks]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [creating,     setCreating]     = useState(false)
  const [label,        setLabel]        = useState('')
  const [entryNumber,  setEntryNumber]  = useState(initialEntryNumber || '')
  const [expiryHours,  setExpiryHours]  = useState(24 * 7)
  const [revoking,     setRevoking]     = useState(null)
  const [newLink,      setNewLink]      = useState(null)

  useEffect(() => {
    load()
  }, [inspectionId])

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get(`/shared/links/inspection/${inspectionId}`)
      setLinks(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function create() {
    setCreating(true)
    try {
      const { data } = await api.post('/shared/links', {
        inspection_id: inspectionId,
        label: label.trim() || null,
        expires_hours: expiryHours,
        entry_number: entryNumber.trim() || null,
      })
      setNewLink(data)
      setLinks(prev => [data, ...prev])
      setLabel('')
      if (data.entry_number) onEntryNumberSaved?.(data.entry_number)
    } catch (e) {
      alert(e.response?.data?.detail || 'Error al crear enlace')
    } finally {
      setCreating(false)
    }
  }

  async function revoke(linkId) {
    if (revoking !== linkId) {
      setRevoking(linkId)
      setTimeout(() => setRevoking(r => r === linkId ? null : r), 3500)
      return
    }
    try {
      await api.delete(`/shared/links/${linkId}`)
      setLinks(prev => prev.map(l => l.id === linkId ? { ...l, revoked_at: new Date().toISOString() } : l))
      if (newLink?.id === linkId) setNewLink(null)
    } catch (e) {
      alert('Error al revocar')
    } finally {
      setRevoking(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#161b27] border border-white/10 w-full sm:max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 sticky top-0 bg-[#161b27] z-10">
          <div className="flex items-center gap-2">
            <Link2 size={16} className="text-[#F5A623]" />
            <span className="font-bold text-sm">Compartir inspección</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* New link just created */}
          {newLink && !newLink.revoked_at && (
            <div className="bg-[#22C55E]/10 border border-[#22C55E]/30 p-4 space-y-3">
              <p className="text-xs font-mono text-[#22C55E] font-bold uppercase">Enlace creado</p>
              <div className="bg-[#0f1117] border border-white/10 px-3 py-2 font-mono text-xs text-white/70 break-all">
                {shareUrl(newLink.token)}
              </div>
              <div className="flex gap-2">
                <CopyBtn text={shareUrl(newLink.token)} />
                <a
                  href={shareUrl(newLink.token)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 text-xs font-mono text-white/50 hover:text-white transition-colors"
                >
                  <ExternalLink size={12} /> Abrir
                </a>
              </div>
            </div>
          )}

          {/* Create form */}
          <div className="space-y-3">
            <p className="text-[11px] font-mono text-white/40 uppercase tracking-wider">Nuevo enlace</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="Etiqueta (ej: Cliente Nombre / Motivo)"
                className="flex-1 min-w-0 bg-[#1e2535] border border-white/10 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-[#F5A623] placeholder-white/20 font-mono"
              />
              <input
                type="text"
                value={entryNumber}
                onChange={e => setEntryNumber(e.target.value)}
                placeholder="Núm. entrada"
                maxLength={10}
                className="w-28 shrink-0 bg-[#1e2535] border border-white/10 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-[#F5A623] placeholder-white/20 font-mono"
              />
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
              {EXPIRY_OPTIONS.map(opt => (
                <button
                  key={opt.label}
                  onClick={() => setExpiryHours(opt.hours)}
                  className={`py-1.5 text-[10px] font-mono font-bold uppercase transition-colors border ${
                    expiryHours === opt.hours
                      ? 'bg-[#F5A623] text-[#0f1117] border-[#F5A623]'
                      : 'text-white/40 border-white/10 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={create}
              disabled={creating || !label.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#F5A623] text-[#0f1117] font-bold text-sm hover:bg-[#e8961f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={16} />
              {creating ? 'Creando...' : 'Crear enlace'}
            </button>
          </div>

          {/* Existing links */}
          {!loading && links.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-mono text-white/40 uppercase tracking-wider">
                Enlaces existentes ({links.length})
              </p>
              {links.map(link => {
                const st = linkStatus(link)
                const url = shareUrl(link.token)
                const isActive = !link.revoked_at && (!link.expires_at || new Date(link.expires_at) > new Date())
                return (
                  <div key={link.id} className="bg-[#1e2535] border border-white/5 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border shrink-0 ${st.cls}`}>
                          {st.label}
                        </span>
                        {link.entry_number && (
                          <span className="text-xs text-[#F5A623]/70 font-bold shrink-0">#{link.entry_number}</span>
                        )}
                        {link.label && (
                          <span className="text-xs text-white/60 truncate">{link.label}</span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-white/25 shrink-0">
                        {link.access_count}×
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-white/30 truncate">{url}</div>
                    <div className="text-[10px] font-mono text-white/25">
                      {link.expires_at
                        ? `Vence: ${new Date(link.expires_at).toLocaleDateString('es-MX', { day:'numeric', month:'short', year:'numeric' })}`
                        : 'Sin vencimiento'}
                      {link.last_accessed_at && ` · Último acceso: ${new Date(link.last_accessed_at).toLocaleDateString('es-MX', { day:'numeric', month:'short' })}`}
                    </div>
                    {isActive && (
                      <div className="flex gap-2 pt-1">
                        <CopyBtn text={url} />
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1.5 border border-white/10 text-[11px] font-mono text-white/40 hover:text-white transition-colors"
                        >
                          <ExternalLink size={11} /> Abrir
                        </a>
                        <button
                          onClick={() => revoke(link.id)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 border text-[11px] font-mono transition-colors ml-auto ${
                            revoking === link.id
                              ? 'border-red-500/60 bg-red-500/10 text-red-400'
                              : 'border-white/10 text-white/30 hover:text-red-400 hover:border-red-400/40'
                          }`}
                        >
                          <Trash2 size={11} />
                          {revoking === link.id ? '¿Revocar?' : 'Revocar'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Admin link */}
          <div className="pt-2 border-t border-white/5 text-center">
            <a href="/shares" className="text-[11px] font-mono text-white/30 hover:text-[#F5A623] transition-colors">
              Ver todos los enlaces compartidos →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
