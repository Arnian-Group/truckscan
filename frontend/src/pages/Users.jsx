import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, UserCheck, Shield, Loader } from 'lucide-react'
import Layout from '../components/Layout'
import api from '../lib/api'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

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

  return (
    <Layout title="Usuarios">
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader size={28} className="animate-spin text-[#F5A623]" />
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3 pb-24">
          {users.map((user) => (
            <div key={user.id} className="bg-[#161b27] border border-white/10 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 flex items-center justify-center shrink-0 ${
                user.role === 'admin' ? 'bg-[#F5A62322] text-[#F5A623]' : 'bg-white/5 text-white/50'
              }`}>
                {user.role === 'admin' ? <Shield size={18} /> : <UserCheck size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{user.name}</div>
                <div className="text-xs text-white/40 font-mono truncate">{user.email}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`font-mono text-xs px-2 py-0.5 font-bold uppercase ${
                  user.role === 'admin'
                    ? 'bg-[#F5A62322] text-[#F5A623] border border-[#F5A62340]'
                    : 'bg-white/5 text-white/40 border border-white/10'
                }`}>
                  {user.role}
                </span>
                <span className={`text-xs font-mono ${user.is_active ? 'text-[#22C55E]' : 'text-red-400'}`}>
                  {user.is_active ? 'activo' : 'inactivo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
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
      </AnimatePresence>
    </Layout>
  )
}

function CreateUserModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('operator')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/users', { name, email, password, role })
      onCreated(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error creating user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <motion.div
        className="relative bg-[#161b27] border-t border-white/10 rounded-t-2xl p-6"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
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
            <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-1.5">Rol</label>
            <div className="flex gap-2">
              {['operator', 'admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-3 font-mono font-bold text-sm uppercase min-h-[48px] transition-colors ${
                    role === r
                      ? 'bg-[#F5A623] text-[#0f1117]'
                      : 'bg-[#1e2535] text-white/50 border border-white/10 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm font-mono border border-red-400/30 bg-red-400/10 px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F5A623] text-[#0f1117] font-bold text-base py-4 min-h-[56px] hover:bg-[#e8961f] transition-colors disabled:opacity-60"
          >
            {loading ? 'Creando...' : 'Crear Usuario'}
          </button>
        </form>
      </motion.div>
    </motion.div>
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
