import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck } from 'lucide-react'
import api from '../lib/api'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.access_token)
      const { data: user } = await api.get('/auth/me')
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center px-6">
      {/* Logo area */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="w-20 h-20 bg-[#161b27] border-2 border-[#F5A623] flex items-center justify-center">
          <Truck size={40} className="text-[#F5A623]" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">TruckScan</h1>
          <p className="text-white/40 text-sm font-mono mt-1">TRAILER LOAD DOCUMENTATION</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full bg-[#161b27] border border-white/10 text-white px-4 py-3.5 text-base focus:outline-none focus:border-[#F5A623] transition-colors min-h-[56px]"
            placeholder="user@arnian.com"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full bg-[#161b27] border border-white/10 text-white px-4 py-3.5 text-base focus:outline-none focus:border-[#F5A623] transition-colors min-h-[56px]"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm font-mono border border-red-400/30 bg-red-400/10 px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#F5A623] text-[#0f1117] font-bold text-base py-4 min-h-[56px] hover:bg-[#e8961f] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Autenticando...' : 'Iniciar Sesión'}
        </button>
      </form>

      <p className="mt-8 text-white/20 text-xs font-mono">ARNIAN TRUCKSCAN</p>
    </div>
  )
}
