import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link2, Trash2, ExternalLink, Copy, Check, RefreshCw } from 'lucide-react'
import Layout from '../components/Layout'
import api from '../lib/api'

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
      title="Copiar URL"
      className="p-1.5 text-white/30 hover:text-white transition-colors"
    >
      {copied ? <Check size={14} className="text-[#22C55E]" /> : <Copy size={14} />}
    </button>
  )
}

export default function ShareLinks() {
  const navigate = useNavigate()
  const [links,    setLinks]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [revoking, setRevoking] = useState(null)
  const [filter,   setFilter]   = useState('all') // all | active | revoked | expired

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/shared/links')
      setLinks(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
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
    } catch (e) {
      alert('Error al revocar')
    } finally {
      setRevoking(null)
    }
  }

  const filtered = links.filter(l => {
    if (filter === 'active')  return !l.revoked_at && (!l.expires_at || new Date(l.expires_at) > new Date())
    if (filter === 'revoked') return !!l.revoked_at
    if (filter === 'expired') return !l.revoked_at && l.expires_at && new Date(l.expires_at) < new Date()
    return true
  })

  const counts = {
    all:     links.length,
    active:  links.filter(l => !l.revoked_at && (!l.expires_at || new Date(l.expires_at) > new Date())).length,
    revoked: links.filter(l => !!l.revoked_at).length,
    expired: links.filter(l => !l.revoked_at && l.expires_at && new Date(l.expires_at) < new Date()).length,
  }

  return (
    <Layout title="Links compartidos">
      {/* Filter tabs */}
      <div className="px-4 py-3 flex gap-2 border-b border-white/5 overflow-x-auto">
        {[['all','Todos'],['active','Activos'],['expired','Expirados'],['revoked','Revocados']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider min-h-[36px] whitespace-nowrap flex-shrink-0 transition-colors ${
              filter === val
                ? 'bg-[#F5A623] text-[#0f1117]'
                : 'text-white/40 border border-white/10 hover:text-white'
            }`}
          >
            {label} <span className="opacity-60">({counts[val]})</span>
          </button>
        ))}
        <button
          onClick={load}
          className="ml-auto min-h-[36px] min-w-[36px] flex items-center justify-center text-white/40 hover:text-white flex-shrink-0"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="px-4 py-4 space-y-2 pb-28">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <Link2 size={36} className="mx-auto mb-3 opacity-20" />
            <p className="font-mono text-sm">Sin enlaces en esta categoría</p>
          </div>
        ) : (
          filtered.map(link => {
            const st = linkStatus(link)
            const isActive = !link.revoked_at && (!link.expires_at || new Date(link.expires_at) > new Date())
            const url = shareUrl(link.token)
            return (
              <div key={link.id} className="bg-[#161b27] border border-white/10 p-4 space-y-3">
                {/* Row 1: folio + status + access count */}
                <div className="flex items-center gap-2 flex-wrap">
                  {link.folio ? (
                    <button
                      onClick={() => navigate(`/vehicles/${link.inspection_id}`)}
                      className="font-mono text-sm font-bold text-[#F5A623] hover:underline"
                    >
                      {link.folio}
                    </button>
                  ) : (
                    <span className="font-mono text-xs text-white/30">Sin folio</span>
                  )}
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border ${st.cls}`}>
                    {st.label}
                  </span>
                  {link.label && (
                    <span className="text-xs text-white/50 truncate">{link.label}</span>
                  )}
                  <span className="ml-auto text-xs font-mono text-white/30 shrink-0">
                    {link.access_count} acceso{link.access_count !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Row 2: dates */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-white/30">
                  <span>Creado: {new Date(link.created_at).toLocaleDateString('es-MX', { day:'numeric', month:'short', year:'numeric' })}</span>
                  {link.expires_at
                    ? <span>Vence: {new Date(link.expires_at).toLocaleDateString('es-MX', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
                    : <span>Sin vencimiento</span>}
                  {link.last_accessed_at && (
                    <span>Último acceso: {new Date(link.last_accessed_at).toLocaleDateString('es-MX', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                  )}
                  {link.revoked_at && (
                    <span className="text-red-400/60">Revocado: {new Date(link.revoked_at).toLocaleDateString('es-MX', { day:'numeric', month:'short', year:'numeric' })}</span>
                  )}
                </div>

                {/* Row 3: actions */}
                {isActive && (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 min-w-0 font-mono text-[10px] text-white/25 truncate">{url}</div>
                    <div className="flex items-center gap-1 shrink-0">
                      <CopyBtn text={url} />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-white/30 hover:text-white transition-colors"
                        title="Abrir enlace"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <button
                        onClick={() => revoke(link.id)}
                        title="Revocar"
                        className={`p-1.5 transition-colors ${
                          revoking === link.id
                            ? 'text-red-400'
                            : 'text-white/20 hover:text-red-400'
                        }`}
                      >
                        <Trash2 size={14} />
                      </button>
                      {revoking === link.id && (
                        <button
                          onClick={() => revoke(link.id)}
                          className="text-[10px] font-mono font-bold text-red-400 border border-red-400/40 px-2 py-1 hover:bg-red-400/10 transition-colors"
                        >
                          ¿Confirmar?
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </Layout>
  )
}
