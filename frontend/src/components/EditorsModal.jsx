import { useState, useEffect } from 'react'
import { X, UserPlus, Trash2, Users } from 'lucide-react'
import api from '../lib/api'

export default function EditorsModal({ module, docId, onClose, onChange }) {
  const [candidates, setCandidates] = useState([])
  const [editors, setEditors] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(null)
  const [removing, setRemoving] = useState(null)

  useEffect(() => { load() }, [docId])

  async function load() {
    setLoading(true)
    try {
      const [{ data: cands }, { data: eds }] = await Promise.all([
        api.get(`/${module}/editor-candidates`),
        api.get(`/${module}/${docId}/editors`),
      ])
      setCandidates(Array.isArray(cands) ? cands : [])
      setEditors(Array.isArray(eds) ? eds : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function addEditor(userId) {
    setAdding(userId)
    try {
      const { data } = await api.post(`/${module}/${docId}/editors`, { user_id: userId })
      setEditors(prev => [...prev, data])
      onChange?.()
    } catch (e) {
      alert(e.response?.data?.detail || 'Error al agregar editor')
    } finally {
      setAdding(null)
    }
  }

  async function removeEditor(userId) {
    setRemoving(userId)
    try {
      await api.delete(`/${module}/${docId}/editors/${userId}`)
      setEditors(prev => prev.filter(e => e.user_id !== userId))
      onChange?.()
    } catch (e) {
      alert(e.response?.data?.detail || 'Error al quitar editor')
    } finally {
      setRemoving(null)
    }
  }

  const editorIds = new Set(editors.map(e => e.user_id))
  const available = candidates.filter(c => !editorIds.has(c.id))

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#161b27] border border-white/10 w-full sm:max-w-md max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 sticky top-0 bg-[#161b27] z-10">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#F5A623]" />
            <span className="font-bold text-sm">Editores invitados</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <p className="text-xs text-white/40 leading-relaxed">
            Solo el creador, los editores invitados o un administrador pueden editar o cerrar este documento.
            Agrega usuarios del módulo para que también puedan hacerlo.
          </p>

          {loading ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {editors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-mono text-white/40 uppercase tracking-wider">
                    Editores actuales ({editors.length})
                  </p>
                  {editors.map(e => (
                    <div key={e.id} className="flex items-center justify-between gap-2 bg-[#1e2535] border border-white/5 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="text-sm text-white/80 truncate">{e.user?.name || '—'}</p>
                        <p className="text-xs text-white/30 truncate">{e.user?.email}</p>
                      </div>
                      <button
                        onClick={() => removeEditor(e.user_id)}
                        disabled={removing === e.user_id}
                        className="flex items-center gap-1 px-2.5 py-1.5 border border-white/10 text-[11px] font-mono text-white/30 hover:text-red-400 hover:border-red-400/40 transition-colors shrink-0 disabled:opacity-50"
                      >
                        <Trash2 size={11} />
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-[11px] font-mono text-white/40 uppercase tracking-wider">
                  Agregar editor
                </p>
                {available.length === 0 ? (
                  <p className="text-xs text-white/25 font-mono py-2">No hay más usuarios disponibles</p>
                ) : (
                  <div className="space-y-1.5">
                    {available.map(c => (
                      <div key={c.id} className="flex items-center justify-between gap-2 bg-[#1e2535] border border-white/5 px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="text-sm text-white/70 truncate">{c.name}</p>
                          <p className="text-xs text-white/30 truncate">{c.email}</p>
                        </div>
                        <button
                          onClick={() => addEditor(c.id)}
                          disabled={adding === c.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 border border-[#F5A623]/40 text-[11px] font-mono text-[#F5A623] hover:bg-[#F5A623]/10 transition-colors shrink-0 disabled:opacity-50"
                        >
                          <UserPlus size={11} />
                          Agregar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
