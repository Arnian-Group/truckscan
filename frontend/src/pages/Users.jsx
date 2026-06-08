import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, UserCheck, Shield, Loader, Trash2, Car, Truck, Pencil } from 'lucide-react'
import Layout from '../components/Layout'
import api from '../lib/api'
import { getUser } from '../lib/auth'

function apiError(err) {
  const detail = err.response?.data?.detail
  if (Array.isArray(detail)) return detail.map((e) => e.msg ?? JSON.stringify(e)).join(', ')
  return detail || err.message || 'Error desconocido'
}

function roleLabel(user) {
  if (user.is_admin) return 'admin'
  const tags = []
  if (user.can_trailers) tags.push('trailers')
  if (user.can_vehicles) tags.push('vehicles')
  return tags.join('+') || 'sin acceso'
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const me = getUser()

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/users')
      setUsers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(userId) {
    if (confirmId !== userId) {
      setConfirmId(userId)
      setTimeout(() => setConfirmId((c) => c === userId ? null : c), 4000)
      return
    }
    setDeleting(true)
    try {
      await api.delete(`/users/${userId}`)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      setConfirmId(null)
    } catch (err) {
      alert(apiError(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Layout title="Usuarios">
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader size={28} className="animate-spin text-[#F5A623]" />
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3 pb-24">
          {users.map((user) => {
            const isSelf = user.id === me?.id
            const confirming = confirmId === user.id
            const label = roleLabel(user)

            return (
              <div key={user.id} className="bg-[#161b27] border border-white/10 p-4 flex items-center gap-3">
                <div className={`w-10 h-10 flex items-center justify-center shrink-0 ${
                  user.is_admin ? 'bg-[#F5A62322] text-[#F5A623]' : 'bg-white/5 text-white/50'
                }`}>
                  {user.is_admin ? <Shield size={18} /> : <UserCheck size={18} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {user.name}
                    {isSelf && <span className="ml-2 text-[10px] font-mono text-[#F5A623] bg-[#F5A62320] px-1.5 py-0.5">TÚ</span>}
                  </div>
                  <div className="text-xs text-white/40 font-mono truncate">{user.email}</div>
                  <div className="flex gap-1.5 mt-1">
                    {user.is_admin && <ModBadge color="amber" icon={<Shield size={9} />} label="Admin" />}
                    {user.can_trailers && <ModBadge color="blue" icon={<Truck size={9} />} label="Carga" />}
                    {user.can_vehicles && <ModBadge color="purple" icon={<Car size={9} />} label="Vehículos" />}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!isSelf && (
                    <button
                      onClick={() => setEditingUser(user)}
                      className="min-w-[40px] min-h-[40px] flex items-center justify-center text-white/30 hover:text-[#F5A623] hover:bg-[#F5A62310] transition-all"
                    >
                      <Pencil size={15} />
                    </button>
                  )}
                  {!isSelf && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={deleting}
                      className={`min-w-[40px] min-h-[40px] flex items-center justify-center transition-all active:scale-95 ${
                        confirming
                          ? 'bg-red-500/20 border border-red-500/60 text-red-400 px-2 text-[10px] font-mono font-bold gap-1'
                          : 'text-white/20 hover:text-red-400 hover:bg-red-400/10'
                      }`}
                    >
                      {confirming ? (<><Trash2 size={12} />¿CONFIRMAR?</>) : <Trash2 size={15} />}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-[#F5A623] text-[#0f1117] flex items-center justify-center shadow-lg hover:bg-[#e8961f] active:scale-95 transition-all z-30"
        aria-label="New user"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      <AnimatePresence>
        {showCreate && (
          <CreateUserModal
            onClose={() => setShowCreate(false)}
            onCreated={(u) => { setUsers((prev) => [...prev, u]); setShowCreate(false) }}
          />
        )}
        {editingUser && (
          <EditUserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSaved={(updated) => {
              setUsers((prev) => prev.map(u => u.id === updated.id ? updated : u))
              setEditingUser(null)
            }}
          />
        )}
      </AnimatePresence>
    </Layout>
  )
}

function ModBadge({ color, icon, label }) {
  const colors = {
    amber: 'bg-[#F5A62215] text-[#F5A623] border-[#F5A62330]',
    blue: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    purple: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  }
  return (
    <span className={`flex items-center gap-1 px-1.5 py-0.5 border font-mono text-[9px] font-bold ${colors[color]}`}>
      {icon}{label}
    </span>
  )
}

function CreateUserModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [canTrailers, setCanTrailers] = useState(false)
  const [canVehicles, setCanVehicles] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleAdminToggle(val) {
    setIsAdmin(val)
    if (val) { setCanTrailers(true); setCanVehicles(true) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/users', {
        name, email, password,
        is_admin: isAdmin,
        can_trailers: isAdmin || canTrailers,
        can_vehicles: isAdmin || canVehicles,
      })
      onCreated(data)
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(Array.isArray(detail) ? detail.map((e) => e.msg ?? JSON.stringify(e)).join(', ') : (detail || err.message || 'Error al crear usuario'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <motion.div
        className="relative bg-[#161b27] border-t border-white/10 rounded-t-2xl p-6"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-xl">Nuevo Usuario</h2>
          <button onClick={onClose} className="p-2 text-white/50 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nombre" value={name} onChange={setName} required />
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <Field label="Contraseña" type="password" value={password} onChange={setPassword} required />

          <div>
            <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-2">Permisos</label>
            <div className="space-y-2">
              <CheckRow
                checked={isAdmin}
                onChange={handleAdminToggle}
                icon={<Shield size={16} className="text-[#F5A623]" />}
                label="Admin — Acceso total al sistema"
              />
              <CheckRow
                checked={isAdmin || canTrailers}
                onChange={v => { if (!isAdmin) setCanTrailers(v) }}
                disabled={isAdmin}
                icon={<Truck size={16} className="text-blue-400" />}
                label="Módulo de Carga (trailers)"
              />
              <CheckRow
                checked={isAdmin || canVehicles}
                onChange={v => { if (!isAdmin) setCanVehicles(v) }}
                disabled={isAdmin}
                icon={<Car size={16} className="text-purple-400" />}
                label="Módulo de Vehículos (receiving)"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm font-mono border border-red-400/30 bg-red-400/10 px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || (!isAdmin && !canTrailers && !canVehicles)}
            className="w-full bg-[#F5A623] text-[#0f1117] font-bold text-base py-4 min-h-[56px] hover:bg-[#e8961f] transition-colors disabled:opacity-60"
          >
            {loading ? 'Creando...' : 'Crear Usuario'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}

function EditUserModal({ user, onClose, onSaved }) {
  const [isAdmin, setIsAdmin] = useState(user.is_admin)
  const [canTrailers, setCanTrailers] = useState(user.can_trailers)
  const [canVehicles, setCanVehicles] = useState(user.can_vehicles)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleAdminToggle(val) {
    setIsAdmin(val)
    if (val) { setCanTrailers(true); setCanVehicles(true) }
  }

  async function handleSave() {
    setError('')
    setLoading(true)
    try {
      const { data } = await api.patch(`/users/${user.id}`, {
        is_admin: isAdmin,
        can_trailers: isAdmin || canTrailers,
        can_vehicles: isAdmin || canVehicles,
      })
      onSaved(data)
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(Array.isArray(detail) ? detail.map(e => e.msg ?? JSON.stringify(e)).join(', ') : (detail || err.message || 'Error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <motion.div
        className="relative bg-[#161b27] border-t border-white/10 rounded-t-2xl p-6"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-xl">Editar permisos</h2>
          <button onClick={onClose} className="p-2 text-white/50 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X size={20} />
          </button>
        </div>
        <p className="text-white/40 text-sm font-mono mb-5">{user.name} · {user.email}</p>

        <div className="space-y-2 mb-5">
          <CheckRow
            checked={isAdmin}
            onChange={handleAdminToggle}
            icon={<Shield size={16} className="text-[#F5A623]" />}
            label="Admin — Acceso total al sistema"
          />
          <CheckRow
            checked={isAdmin || canTrailers}
            onChange={v => { if (!isAdmin) setCanTrailers(v) }}
            disabled={isAdmin}
            icon={<Truck size={16} className="text-blue-400" />}
            label="Módulo de Carga (trailers)"
          />
          <CheckRow
            checked={isAdmin || canVehicles}
            onChange={v => { if (!isAdmin) setCanVehicles(v) }}
            disabled={isAdmin}
            icon={<Car size={16} className="text-purple-400" />}
            label="Módulo de Vehículos (receiving)"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm font-mono border border-red-400/30 bg-red-400/10 px-3 py-2 mb-4">{error}</p>
        )}

        <button
          onClick={handleSave}
          disabled={loading || (!isAdmin && !canTrailers && !canVehicles)}
          className="w-full bg-[#F5A623] text-[#0f1117] font-bold text-base py-4 min-h-[56px] hover:bg-[#e8961f] transition-colors disabled:opacity-60"
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </motion.div>
    </motion.div>
  )
}

function CheckRow({ checked, onChange, icon, label, disabled = false }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`w-full flex items-center gap-3 p-3 border transition-all ${
        checked
          ? 'bg-white/5 border-white/20 text-white'
          : 'border-white/5 text-white/40 hover:text-white/70 hover:border-white/10'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <div className={`w-4 h-4 border-2 flex items-center justify-center flex-shrink-0 ${checked ? 'border-[#F5A623] bg-[#F5A623]' : 'border-white/20'}`}>
        {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="#0f1117" strokeWidth="2" strokeLinecap="round"/></svg>}
      </div>
      {icon}
      <span className="text-sm text-left">{label}</span>
    </button>
  )
}

function Field({ label, value, onChange, type = 'text', required }) {
  return (
    <div>
      <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-[#1e2535] border border-white/10 text-white px-4 py-3.5 text-base focus:outline-none focus:border-[#F5A623] min-h-[56px]"
      />
    </div>
  )
}
