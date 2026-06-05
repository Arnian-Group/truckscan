import { useState, useEffect } from 'react'
import { Loader, RefreshCw } from 'lucide-react'
import Layout from '../components/Layout'
import api from '../lib/api'

const ACTION_LABELS = {
  login: 'Login',
  trailer_created: 'Trailer creado',
  trailer_completed: 'Trailer completado',
  trailer_viewed: 'Trailer visto',
  trailers_listed: 'Lista trailers',
  section_photos_added: 'Fotos agregadas',
  section_marked_done: 'Sección hecha',
  section_viewed: 'Sección vista',
  user_created: 'Usuario creado',
}

export default function AuditLog() {
  const [items, setItems] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [userFilter, setUserFilter] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 50

  useEffect(() => {
    api.get('/users').then(({ data }) => setUsers(data)).catch(() => {})
  }, [])

  async function load() {
    setLoading(true)
    try {
      const params = { page, page_size: PAGE_SIZE }
      if (userFilter) params.user_id = userFilter
      const { data } = await api.get('/audit', { params })
      setItems(data.items)
      setTotal(data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page, userFilter])

  return (
    <Layout title="Audit Log">
      {/* Filters */}
      <div className="px-4 py-3 flex gap-2 border-b border-white/5 flex-wrap">
        <select
          value={userFilter}
          onChange={(e) => { setUserFilter(e.target.value); setPage(1) }}
          className="bg-[#161b27] border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-[#F5A623] min-h-[40px]"
        >
          <option value="">Todos los usuarios</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
          ))}
        </select>
        <button
          onClick={() => { setPage(1); load() }}
          className="p-2 text-white/40 hover:text-white min-h-[40px] min-w-[40px] flex items-center justify-center border border-white/10"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader size={28} className="animate-spin text-[#F5A623]" />
          </div>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs font-mono uppercase">
                <th className="px-4 py-3 text-left">Timestamp</th>
                <th className="px-4 py-3 text-left">Usuario</th>
                <th className="px-4 py-3 text-left">Acción</th>
                <th className="px-4 py-3 text-left">Entidad</th>
                <th className="px-4 py-3 text-left">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="px-4 py-2.5 font-mono text-xs text-white/50 whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleString('es-MX')}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="text-xs">
                      <div className="font-medium">{item.user?.name || '—'}</div>
                      <div className="text-white/30 font-mono text-[10px]">{item.user?.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-xs px-2 py-0.5 bg-[#F5A62318] text-[#F5A623] border border-[#F5A62330]">
                      {ACTION_LABELS[item.action] || item.action}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-white/50">
                    {item.entity && <span>{item.entity}</span>}
                    {item.entity_id && (
                      <span className="text-white/25 ml-1 text-[10px] truncate block max-w-[100px]">
                        {item.entity_id.slice(0, 8)}...
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-white/30">
                    {item.metadata_ && Object.entries(item.metadata_).map(([k, v]) => (
                      <span key={k} className="mr-2">{k}: {String(v)}</span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex justify-center gap-2 py-4 border-t border-white/10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-mono border border-white/10 disabled:opacity-30 hover:border-[#F5A623] min-h-[40px]"
          >
            ← Anterior
          </button>
          <span className="px-4 py-2 text-sm font-mono text-white/40">
            {page} / {Math.ceil(total / PAGE_SIZE)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / PAGE_SIZE)}
            className="px-4 py-2 text-sm font-mono border border-white/10 disabled:opacity-30 hover:border-[#F5A623] min-h-[40px]"
          >
            Siguiente →
          </button>
        </div>
      )}
    </Layout>
  )
}
