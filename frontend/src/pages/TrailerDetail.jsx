import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Loader } from 'lucide-react'
import Layout from '../components/Layout'
import TrailerDiagram from '../components/TrailerDiagram'
import SectionSheet from '../components/SectionSheet'
import api from '../lib/api'

export default function TrailerDetail() {
  const { id } = useParams()
  const [trailer, setTrailer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [completing, setCompleting] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)

  async function load() {
    try {
      const { data } = await api.get(`/trailers/${id}`)
      setTrailer(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  function handleSectionUpdate(updated) {
    setTrailer((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        sections: prev.sections.map((s) => (s.number === updated.number ? updated : s)),
      }
    })
  }

  async function handleComplete() {
    if (completing) return
    setCompleting(true)
    try {
      const { data } = await api.patch(`/trailers/${id}/complete`)
      setTrailer(data)
      setJustCompleted(true)
    } catch (err) {
      alert(err.response?.data?.detail || 'Cannot complete trailer')
    } finally {
      setCompleting(false)
    }
  }

  const doneCount = trailer?.sections?.filter((s) => s.status === 'done').length || 0
  const totalCount = trailer?.sections?.length || 8
  const allDone = doneCount === totalCount
  const isCompleted = trailer?.status === 'completed'

  const selectedSection = selected !== null
    ? trailer?.sections?.find((s) => s.number === selected)
    : null

  if (loading) {
    return (
      <Layout title="Cargando..." back="/">
        <div className="flex justify-center items-center h-64">
          <Loader size={32} className="animate-spin text-[#F5A623]" />
        </div>
      </Layout>
    )
  }

  if (!trailer) {
    return (
      <Layout title="Error" back="/">
        <div className="p-8 text-center text-white/40">Trailer no encontrado</div>
      </Layout>
    )
  }

  const title = trailer.plate
    ? `${trailer.plate}${trailer.reference ? ' · ' + trailer.reference : ''}`
    : trailer.reference || `Trailer #${trailer.id.slice(0, 8).toUpperCase()}`

  return (
    <Layout title={title} back="/">
      <div className="px-4 py-4 space-y-4 pb-32">
        {/* Header info */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`font-mono text-xs px-2 py-0.5 font-bold uppercase ${
                  isCompleted
                    ? 'bg-[#22C55E22] text-[#22C55E] border border-[#22C55E40]'
                    : 'bg-[#F5A62322] text-[#F5A623] border border-[#F5A62340]'
                }`}
              >
                {isCompleted ? 'COMPLETADO' : 'EN PROGRESO'}
              </span>
            </div>
            <p className="text-xs text-white/30 font-mono mt-1">
              {new Date(trailer.created_at).toLocaleString('es-MX')}
              {trailer.creator && ` · ${trailer.creator.name}`}
            </p>
          </div>

          {/* Progress */}
          <div className="text-right">
            <span className="font-mono font-bold text-2xl" style={{ color: allDone ? '#22C55E' : '#F5A623' }}>
              {doneCount}
            </span>
            <span className="font-mono text-white/30 text-sm">/{totalCount}</span>
            <p className="text-xs text-white/30 font-mono">secciones</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/10">
          <motion.div
            className="h-full"
            style={{ backgroundColor: allDone ? '#22C55E' : '#F5A623' }}
            initial={{ width: 0 }}
            animate={{ width: `${(doneCount / totalCount) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Trailer diagram */}
        <div className="bg-[#161b27] border border-white/10 py-4">
          <TrailerDiagram
            sections={trailer.sections}
            selectedSection={selected}
            onSelect={(num) => {
              if (!isCompleted) setSelected(selected === num ? null : num)
            }}
          />
        </div>

        {/* Instruction */}
        {!isCompleted && (
          <p className="text-center text-white/30 text-xs font-mono">
            Toca una sección para documentarla
          </p>
        )}

        {/* Sections list summary */}
        <div className="space-y-2">
          {trailer.sections.map((section) => (
            <SectionRow
              key={section.number}
              section={section}
              onClick={() => !isCompleted && setSelected(section.number)}
              readonly={isCompleted}
            />
          ))}
        </div>

        {/* Just completed celebration */}
        <AnimatePresence>
          {justCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#16a34a] text-white px-6 py-3 font-bold flex items-center gap-2 shadow-xl z-50"
            >
              <CheckCircle size={20} />
              ¡Trailer completado!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Complete button */}
      {!isCompleted && (
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-[#0f1117]/90 backdrop-blur-sm border-t border-white/10 z-30">
          <button
            onClick={handleComplete}
            disabled={!allDone || completing}
            className="w-full min-h-[56px] font-bold text-base transition-all flex items-center justify-center gap-2
              bg-[#22C55E] text-white hover:bg-[#16a34a] active:scale-98
              disabled:bg-white/5 disabled:text-white/20 disabled:cursor-not-allowed"
          >
            {completing ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <>
                <CheckCircle size={20} />
                {allDone ? 'Marcar Trailer como Completado' : `Faltan ${totalCount - doneCount} secciones`}
              </>
            )}
          </button>
        </div>
      )}

      {/* Section sheet */}
      <AnimatePresence>
        {selected !== null && selectedSection && !isCompleted && (
          <SectionSheet
            key={selected}
            trailerId={id}
            sectionNumber={selected}
            section={selectedSection}
            onClose={() => setSelected(null)}
            onUpdate={(updated) => {
              handleSectionUpdate(updated)
            }}
          />
        )}
        {selected !== null && isCompleted && selectedSection && (
          <SectionSheet
            key={`view-${selected}`}
            trailerId={id}
            sectionNumber={selected}
            section={{ ...selectedSection, status: 'done' }}
            onClose={() => setSelected(null)}
            onUpdate={() => {}}
          />
        )}
      </AnimatePresence>
    </Layout>
  )
}

function SectionRow({ section, onClick, readonly }) {
  const isDoor = section.number === 4 || section.number === 8

  return (
    <button
      onClick={onClick}
      disabled={readonly}
      className={`w-full flex items-center gap-3 p-3 border transition-all text-left
        ${section.status === 'done'
          ? 'border-[#22C55E30] bg-[#22C55E08]'
          : 'border-white/10 bg-[#161b27] hover:border-[#F5A623]/30'
        }
        ${readonly ? 'cursor-default' : 'active:scale-98'}`}
    >
      <div
        className={`w-9 h-9 flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
          section.status === 'done' ? 'bg-[#22C55E22] text-[#22C55E]' : 'bg-[#F5A62322] text-[#F5A623]'
        }`}
      >
        {section.number}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Sección {section.number}
            {isDoor && <span className="text-white/40 text-xs ml-1">PUERTA</span>}
          </span>
        </div>
        {section.notes && (
          <p className="text-xs text-white/40 truncate">{section.notes}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {section.photos?.length > 0 && (
          <span className="text-xs font-mono text-white/40">{section.photos.length} foto{section.photos.length !== 1 ? 's' : ''}</span>
        )}
        {section.status === 'done' ? (
          <CheckCircle size={18} className="text-[#22C55E]" />
        ) : (
          <div className="w-4 h-4 border-2 border-[#F5A623] rounded-full" />
        )}
      </div>
    </button>
  )
}
