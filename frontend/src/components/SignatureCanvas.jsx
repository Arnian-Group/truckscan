import { useRef, useEffect, useCallback, useState } from 'react'
import { Check, RotateCcw } from 'lucide-react'

export default function SignatureCanvas({ label, value, locked, disabled, hint, onSave, onClear }) {
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  const lastPos = useRef(null)
  const [hasSignature, setHasSignature] = useState(false)

  function getCtx() {
    return canvasRef.current?.getContext('2d')
  }

  function fillWhite(ctx, canvas) {
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
  }

  useEffect(() => {
    if (locked) return
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    fillWhite(ctx, canvas)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    setHasSignature(false)
  }, [locked])

  function getPos(e) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    if (e.touches) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startDraw = useCallback((e) => {
    if (disabled) return
    e.preventDefault()
    isDrawing.current = true
    lastPos.current = getPos(e)
  }, [disabled])

  const draw = useCallback((e) => {
    if (disabled) return
    e.preventDefault()
    if (!isDrawing.current) return
    const ctx = getCtx()
    if (!ctx) return
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
    setHasSignature(true)
  }, [disabled])

  const endDraw = useCallback(() => {
    isDrawing.current = false
    lastPos.current = null
  }, [])

  function clear() {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!ctx || !canvas) return
    fillWhite(ctx, canvas)
    setHasSignature(false)
    onClear?.()
  }

  function save() {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) return
    onSave(canvas.toDataURL('image/png'))
  }

  if (locked && value) {
    return (
      <div>
        {label && (
          <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-2">
            {label}
          </label>
        )}
        <div className="border border-[#22C55E]/40">
          <img src={value} alt="Firma" className="w-full object-contain bg-white block" style={{ height: '150px' }} />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="flex items-center gap-1.5 text-xs font-mono text-[#22C55E]">
            <Check size={14} /> Firma registrada
          </span>
          <button
            type="button"
            onClick={() => onClear?.()}
            className="flex items-center gap-1.5 text-xs font-mono text-white/40 hover:text-white px-2 py-1.5 min-h-[36px]"
          >
            <RotateCcw size={13} /> Cambiar firma
          </button>
        </div>
      </div>
    )
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
        className={`w-full border block ${disabled ? 'border-white/10 opacity-30 touch-auto' : 'border-white/20 cursor-crosshair touch-none'}`}
        style={{ height: '150px', background: '#ffffff' }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      {disabled && hint && (
        <p className="text-xs font-mono text-white/30 mt-1.5">{hint}</p>
      )}
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={clear}
          disabled={disabled}
          className="flex-1 py-2.5 text-sm font-mono text-white/50 border border-white/10 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-h-[44px]"
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={save}
          disabled={disabled || !hasSignature}
          className="flex-1 py-2.5 text-sm font-mono font-bold text-[#0f1117] bg-[#F5A623] hover:bg-[#e8961f] disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[44px]"
        >
          Confirmar Firma
        </button>
      </div>
    </div>
  )
}
