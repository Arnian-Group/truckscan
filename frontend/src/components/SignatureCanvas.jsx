import { useRef, useCallback, useState } from 'react'

export default function SignatureCanvas({ label, onSave, onClear }) {
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const isDrawing = useRef(false)
  const [hasSignature, setHasSignature] = useState(false)

  function initCtx() {
    if (ctxRef.current) return ctxRef.current
    const canvas = canvasRef.current
    if (!canvas) return null
    const dpr = window.devicePixelRatio || 1
    const w = canvas.offsetWidth || 400
    canvas.width = w * dpr
    canvas.height = 150 * dpr
    canvas.style.height = '150px'
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.8
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctxRef.current = ctx
    return ctx
  }

  function getPos(e) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    if (e.touches) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startDraw = useCallback((e) => {
    e.preventDefault()
    const ctx = initCtx()
    if (!ctx) return
    isDrawing.current = true
    const p = getPos(e)
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
  }, [])

  const draw = useCallback((e) => {
    e.preventDefault()
    if (!isDrawing.current) return
    const ctx = ctxRef.current
    if (!ctx) return
    const p = getPos(e)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    setHasSignature(true)
  }, [])

  const endDraw = useCallback(() => {
    isDrawing.current = false
  }, [])

  function clear() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = initCtx()
    ctx.clearRect(0, 0, canvas.offsetWidth, 150)
    setHasSignature(false)
    onClear?.()
  }

  function save() {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) return
    onSave(canvas.toDataURL('image/png'))
  }

  return (
    <div>
      {label && (
        <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <canvas
        ref={canvasRef}
        className="w-full bg-[#1e2535] border border-white/10 touch-none block"
        style={{ height: '150px', cursor: 'crosshair' }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={clear}
          className="flex-1 py-2.5 text-sm font-mono text-white/50 border border-white/10 hover:text-white hover:border-white/30 transition-colors min-h-[44px]"
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!hasSignature}
          className="flex-1 py-2.5 text-sm font-mono font-bold text-[#0f1117] bg-[#F5A623] hover:bg-[#e8961f] disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[44px]"
        >
          Confirmar Firma
        </button>
      </div>
    </div>
  )
}
