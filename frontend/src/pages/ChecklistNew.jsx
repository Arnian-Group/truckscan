import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import Layout from '../components/Layout'
import api from '../lib/api'

const ASSET_TYPE_ICON = { forklift: '🏗️', utility_vehicle: '🚙' }

export default function ChecklistNew() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/checklists/templates').then(({ data }) => setTemplates(data))
      .catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <Layout title="Nuevo Checklist" back="/checklists">
      <div className="px-4 py-4 pb-24">
        <p className="text-white/40 text-sm font-mono mb-4">Selecciona el tipo de checklist</p>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : templates.length === 0 ? (
          <p className="text-white/30 text-sm font-mono text-center py-16">No tienes acceso a ningún tipo de checklist todavía.</p>
        ) : (
          <div className="space-y-3">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate(`/checklists/new/${t.id}`)}
                className="w-full bg-[#161b27] border border-white/10 hover:border-[#F5A623]/60 active:scale-98 transition-all p-4 flex items-center gap-4 text-left"
              >
                <span className="text-3xl leading-none shrink-0">{ASSET_TYPE_ICON[t.asset_type] || '📋'}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm">{t.name}</div>
                  <div className="text-white/40 text-xs font-mono mt-0.5">{t.code} · Rev. {t.revision}</div>
                </div>
                <ChevronRight size={18} className="text-white/30 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
