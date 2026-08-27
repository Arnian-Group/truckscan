import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, Camera, CameraOff, Keyboard } from 'lucide-react'
import QrScanner from 'qr-scanner'
import QrScannerWorkerPath from 'qr-scanner/qr-scanner-worker.min.js?url'

QrScanner.WORKER_PATH = QrScannerWorkerPath

// Camera-based QR scanner with a manual-entry fallback — desktop admins have no
// camera, and headless/kiosk devices or permission-denied cases need a way in too.
export default function QRScanner({ onScan, onClose }) {
  const videoRef = useRef(null)
  const scannerRef = useRef(null)
  const [cameraError, setCameraError] = useState('')
  const [manualMode, setManualMode] = useState(false)
  const [manualValue, setManualValue] = useState('')

  useEffect(() => {
    if (manualMode) return
    let cancelled = false
    const scanner = new QrScanner(
      videoRef.current,
      (result) => { if (!cancelled) onScan(result.data || result) },
      { highlightScanRegion: true, highlightCodeOutline: true, maxScansPerSecond: 5 }
    )
    scannerRef.current = scanner
    scanner.start().catch((err) => {
      if (!cancelled) setCameraError(err?.message || 'No se pudo acceder a la cámara')
    })
    return () => {
      cancelled = true
      scanner.stop()
      scanner.destroy()
      scannerRef.current = null
    }
  }, [manualMode])

  function handleManualSubmit(e) {
    e.preventDefault()
    if (manualValue.trim()) onScan(manualValue.trim())
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <motion.div
        className="relative bg-[#161b27] border-t border-white/10 rounded-t-2xl p-5"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Camera size={18} className="text-[#F5A623]" /> Escanear QR de la unidad
          </h3>
          <button onClick={onClose} aria-label="Cerrar" className="p-2 text-white/50 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X size={20} />
          </button>
        </div>

        {!manualMode ? (
          <>
            <div className="relative w-full aspect-square bg-black overflow-hidden border border-white/10">
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            </div>
            {cameraError && (
              <div className="mt-3 flex items-start gap-2 text-red-400 text-xs font-mono border border-red-400/30 bg-red-400/10 px-3 py-2">
                <CameraOff size={14} className="shrink-0 mt-0.5" />
                <span>{cameraError} — usa el código manual abajo.</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setManualMode(true)}
              className="w-full flex items-center justify-center gap-2 mt-3 py-3 text-sm font-mono text-white/50 border border-white/10 hover:text-white hover:border-white/30 transition-colors min-h-[48px]"
            >
              <Keyboard size={15} /> Ingresar código manualmente
            </button>
          </>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <label className="block text-xs font-mono text-white/50 uppercase tracking-wider">
              Código de la etiqueta
            </label>
            <input
              type="text"
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value)}
              autoFocus
              className="w-full bg-[#1e2535] border border-white/10 text-white px-4 py-3.5 text-base focus:outline-none focus:border-[#F5A623] min-h-[56px] font-mono"
              placeholder="Código impreso bajo el QR"
            />
            <button
              type="submit"
              disabled={!manualValue.trim()}
              className="w-full bg-[#F5A623] text-[#0f1117] font-bold text-base py-4 min-h-[56px] hover:bg-[#e8961f] disabled:opacity-40 transition-colors"
            >
              Buscar unidad
            </button>
            <button
              type="button"
              onClick={() => { setManualMode(false); setCameraError('') }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-mono text-white/40 hover:text-white transition-colors min-h-[44px]"
            >
              <Camera size={15} /> Volver a la cámara
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}
