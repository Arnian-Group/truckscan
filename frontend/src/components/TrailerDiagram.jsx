import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck } from 'lucide-react'

const SECTIONS = [
  { number: 1, floor: 0, col: 0 },
  { number: 2, floor: 0, col: 1 },
  { number: 3, floor: 0, col: 2 },
  { number: 4, floor: 0, col: 3, door: true },
  { number: 5, floor: 1, col: 0 },
  { number: 6, floor: 1, col: 1 },
  { number: 7, floor: 1, col: 2 },
  { number: 8, floor: 1, col: 3, door: true },
]

// ── Trailer layout ──────────────────────────────────────────
const PAD = 14
const COL_W = 96
const ROW_H = 78
const GAP = 7
const DOOR_W = 106
const COL_WIDTHS = [COL_W, COL_W, COL_W, DOOR_W]
const COL_STARTS = COL_WIDTHS.map((_, i) =>
  PAD + COL_WIDTHS.slice(0, i).reduce((sum, w) => sum + w + GAP, 0)
)
const TRAILER_INNER_W = COL_WIDTHS.reduce((a, b) => a + b, 0) + (COL_WIDTHS.length - 1) * GAP
const TRAILER_W = PAD + TRAILER_INNER_W + PAD

// Vertical layout
const OUTLINE_TOP = 6
const SEC_TOP = PAD
const SEC_AREA_H = 2 * ROW_H + GAP
const OUTLINE_H = SEC_TOP + SEC_AREA_H + PAD - OUTLINE_TOP
const WHEEL_Y = OUTLINE_TOP + OUTLINE_H + 3
const WHEEL_H = 18
const TOTAL_H = WHEEL_Y + WHEEL_H + 18  // 18 for row labels at bottom

// ── Truck cab ───────────────────────────────────────────────
const CAB_W = 78          // full cab illustration width
const COUPLING_W = 8      // fifth-wheel coupling that overlaps trailer front
const TRAILER_SHIFT = CAB_W - COUPLING_W  // how much trailer shifts right when cab shown

// ── Colors ──────────────────────────────────────────────────
function sectionColor(section, selected) {
  if (selected) return { fill: '#ffffff22', stroke: '#ffffff', glow: true, pulse: false }
  if (section.status === 'done') return { fill: '#16a34a33', stroke: '#22C55E', glow: false, pulse: false }
  if (section.photos?.length > 0) return { fill: '#F5A62330', stroke: '#F5A623', glow: false, pulse: true, inProgress: true }
  return { fill: '#F5A62315', stroke: '#F5A623', glow: false, pulse: true }
}

// ── Truck cab drawing ────────────────────────────────────────
function CabSVG() {
  const cabTop = OUTLINE_TOP
  const cabH = OUTLINE_H
  const cabMid = cabTop + cabH / 2

  // Hood: x=2..24, vertically centred (narrower than full cab)
  const hoodLeft = 2
  const hoodRight = 24
  const hoodTop = cabTop + cabH * 0.15
  const hoodBot = cabTop + cabH * 0.85

  // Body: x=22..CAB_W-COUPLING_W
  const bodyLeft = 22
  const bodyRight = CAB_W - COUPLING_W

  return (
    <g>
      {/* Exhaust stacks */}
      <rect x={bodyLeft + 4}  y={cabTop - 16} width={6}  height={18} rx="3" fill="#1e2535" stroke="#F5A62330" strokeWidth="1" />
      <rect x={bodyLeft + 13} y={cabTop - 11} width={5}  height={13} rx="2.5" fill="#1e2535" stroke="#F5A62225" strokeWidth="1" />
      {/* Smoke puffs */}
      <circle cx={bodyLeft + 7}  cy={cabTop - 18} r={3.5} fill="#F5A62318" />
      <circle cx={bodyLeft + 15} cy={cabTop - 13} r={2.5} fill="#F5A62312" />

      {/* Hood (slanted nose) */}
      <path
        d={`M ${bodyLeft} ${cabTop + 6} L ${hoodRight} ${hoodTop} L ${hoodRight} ${hoodBot} L ${bodyLeft} ${cabTop + cabH - 6} Z`}
        fill="#151c2e"
        stroke="#F5A62335"
        strokeWidth="1"
      />
      {/* Bumper face */}
      <rect x={hoodLeft} y={hoodTop + 4} width={hoodRight - hoodLeft} height={hoodBot - hoodTop - 8} rx="2" fill="#0f1117" stroke="#F5A62330" strokeWidth="1" />
      {/* Headlights */}
      <rect x={hoodLeft + 2} y={hoodTop + 8}  width={8} height={10} rx="2.5" fill="#F5A62345" stroke="#F5A62355" strokeWidth="0.5" />
      <rect x={hoodLeft + 2} y={hoodBot - 20} width={8} height={10} rx="2.5" fill="#F5A62345" stroke="#F5A62355" strokeWidth="0.5" />
      {/* Grille lines */}
      {[0, 5, 10, 15].map((dy) => (
        <line key={dy} x1={hoodLeft + 3} y1={hoodTop + 24 + dy} x2={hoodRight - 2} y2={hoodTop + 24 + dy}
          stroke="#F5A62220" strokeWidth="0.8" />
      ))}

      {/* Cab main body */}
      <rect
        x={bodyLeft} y={cabTop + 2}
        width={bodyRight - bodyLeft} height={cabH - 4}
        rx="4"
        fill="#1a2238"
        stroke="#F5A62355"
        strokeWidth="1.5"
      />

      {/* Windshield (spans upper 40% of cab, slightly inset) */}
      <path
        d={`M ${bodyLeft + 2} ${cabTop + 12}
            L ${bodyLeft + 16} ${cabTop + 4}
            L ${bodyLeft + 46} ${cabTop + 4}
            L ${bodyLeft + 48} ${cabTop + 12}
            L ${bodyLeft + 48} ${cabTop + cabH * 0.44}
            L ${bodyLeft + 2} ${cabTop + cabH * 0.44} Z`}
        fill="#F5A62320"
        stroke="#F5A62440"
        strokeWidth="0.8"
      />
      {/* Windshield wiper */}
      <line
        x1={bodyLeft + 8} y1={cabTop + cabH * 0.42}
        x2={bodyLeft + 28} y2={cabTop + 14}
        stroke="#F5A62225" strokeWidth="1" strokeLinecap="round"
      />

      {/* Side window */}
      <rect
        x={bodyLeft + 50} y={cabTop + 6}
        width={bodyRight - bodyLeft - 58} height={cabH * 0.38}
        rx="2"
        fill="#F5A62314"
        stroke="#F5A62332"
        strokeWidth="0.8"
      />

      {/* Cab door split */}
      <line
        x1={bodyLeft + (bodyRight - bodyLeft) * 0.56} y1={cabTop + 4}
        x2={bodyLeft + (bodyRight - bodyLeft) * 0.56} y2={cabTop + cabH - 4}
        stroke="#F5A62220" strokeWidth="0.8" strokeDasharray="3,3"
      />
      {/* Door handle */}
      <rect
        x={bodyLeft + (bodyRight - bodyLeft) * 0.60}
        y={cabMid + cabH * 0.04}
        width={(bodyRight - bodyLeft) * 0.11} height={3.5}
        rx="1.75" fill="#F5A62240"
      />

      {/* Fuel tanks (lower rear of cab) */}
      <rect x={bodyRight - 15} y={cabTop + cabH * 0.60} width={12} height={cabH * 0.32} rx="2" fill="#141b2a" stroke="#F5A62325" strokeWidth="1" />
      <rect x={bodyRight - 15} y={cabTop + cabH * 0.65} width={12} height={3} rx="1" fill="#F5A62218" />

      {/* Fifth-wheel coupling plate */}
      <rect
        x={bodyRight} y={cabMid - cabH * 0.13}
        width={COUPLING_W} height={cabH * 0.26}
        rx="3"
        fill="#F5A62328"
        stroke="#F5A62445"
        strokeWidth="1.2"
      />
      {/* Kingpin indicator */}
      <circle cx={bodyRight + COUPLING_W / 2} cy={cabMid} r={3} fill="#F5A62340" stroke="#F5A623" strokeWidth="1" />

      {/* Cab wheels */}
      {/* Steer axle (under hood) */}
      <rect x={8} y={WHEEL_Y} width={14} height={WHEEL_H} rx="4" fill="#0f1117" stroke="#F5A62340" strokeWidth="1.5" />
      <line x1={15} y1={WHEEL_Y} x2={15} y2={WHEEL_Y + WHEEL_H} stroke="#F5A62220" strokeWidth="1" />
      <circle cx={15} cy={WHEEL_Y + WHEEL_H / 2} r={2.5} fill="#F5A62330" />
      {/* Drive axle 1 */}
      <rect x={bodyRight - 22} y={WHEEL_Y} width={14} height={WHEEL_H} rx="4" fill="#0f1117" stroke="#F5A62340" strokeWidth="1.5" />
      <rect x={bodyRight - 7}  y={WHEEL_Y} width={14} height={WHEEL_H} rx="4" fill="#0f1117" stroke="#F5A62335" strokeWidth="1.5" />
      <line x1={bodyRight - 15} y1={WHEEL_Y} x2={bodyRight - 15} y2={WHEEL_Y + WHEEL_H} stroke="#F5A62220" strokeWidth="1" />
      {/* Drive axle 2 */}
      <rect x={bodyRight - 38} y={WHEEL_Y} width={14} height={WHEEL_H} rx="4" fill="#0f1117" stroke="#F5A62340" strokeWidth="1.5" />
      <rect x={bodyRight - 23} y={WHEEL_Y} width={14} height={WHEEL_H} rx="4" fill="#0f1117" stroke="#F5A62335" strokeWidth="1.5" />
      {/* Axle bars */}
      <line x1={bodyRight - 44} y1={WHEEL_Y + WHEEL_H / 2} x2={bodyRight - 8} y2={WHEEL_Y + WHEEL_H / 2} stroke="#F5A62222" strokeWidth="2" />
      <line x1={2} y1={WHEEL_Y + WHEEL_H / 2} x2={24} y2={WHEEL_Y + WHEEL_H / 2} stroke="#F5A62222" strokeWidth="2" />
    </g>
  )
}

// ── Trailer structural details ───────────────────────────────
function TrailerStructure({ showTruck }) {
  // Trailer outline
  const ox = 0
  const oy = OUTLINE_TOP
  const ow = TRAILER_W
  const oh = OUTLINE_H

  // Landing gear (under front of trailer, visible when no truck)
  const lgX = PAD + COL_W * 0.35
  const lgBot = WHEEL_Y + WHEEL_H - 1

  // Trailer bogey wheels (under rear 2 axles, near doors)
  const bogeyX1 = COL_STARTS[2] + COL_W * 0.7
  const bogeyX2 = bogeyX1 + 20
  const bogeyX3 = bogeyX2 + 20

  return (
    <g>
      {/* ── Main outline (thicker, with corner detail) ── */}
      <rect x={ox} y={oy} width={ow} height={oh} rx="3" fill="#0f1117" stroke="#ffffff14" strokeWidth="1" />
      {/* Top and bottom rails (thicker stripe) */}
      <rect x={ox} y={oy}       width={ow} height={5} rx="2" fill="#ffffff0a" />
      <rect x={ox} y={oy + oh - 5} width={ow} height={5} rx="2" fill="#ffffff0a" />
      {/* Left wall (front) */}
      <rect x={ox} y={oy} width={5} height={oh} rx="2" fill="#ffffff0a" />
      {/* Right wall (rear / door frame) */}
      <rect x={ox + ow - 5} y={oy} width={5} height={oh} rx="2" fill="#F5A62318" />
      {/* Corner posts */}
      {[[ox, oy], [ox + ow - 6, oy], [ox, oy + oh - 6], [ox + ow - 6, oy + oh - 6]].map(([cx, cy], i) => (
        <rect key={i} x={cx} y={cy} width={6} height={6} rx="1" fill="#F5A62330" />
      ))}

      {/* Landing gear legs (hidden when truck shown) */}
      {!showTruck && (
        <g>
          {/* Leg 1 */}
          <rect x={lgX - 2}  y={oy + oh - 2} width={4} height={WHEEL_Y - (oy + oh) + 3} rx="1" fill="#1e2535" stroke="#F5A62225" strokeWidth="0.8" />
          {/* Leg 2 */}
          <rect x={lgX + 16} y={oy + oh - 2} width={4} height={WHEEL_Y - (oy + oh) + 3} rx="1" fill="#1e2535" stroke="#F5A62225" strokeWidth="0.8" />
          {/* Cross-brace */}
          <line x1={lgX} y1={WHEEL_Y + 2} x2={lgX + 20} y2={WHEEL_Y + 2} stroke="#F5A62225" strokeWidth="1.5" />
          {/* Feet */}
          <rect x={lgX - 5}  y={lgBot - 4} width={14} height={5} rx="1.5" fill="#1e2535" stroke="#F5A62230" strokeWidth="0.8" />
          <rect x={lgX + 11} y={lgBot - 4} width={14} height={5} rx="1.5" fill="#1e2535" stroke="#F5A62230" strokeWidth="0.8" />
        </g>
      )}

      {/* Trailer bogey wheels (3 axles visible) */}
      {[bogeyX1, bogeyX2, bogeyX3].map((bx, i) => (
        <g key={i}>
          {/* Outer + inner tire (dual) */}
          <rect x={bx - 5} y={WHEEL_Y}     width={10} height={WHEEL_H}       rx="3.5" fill="#0f1117" stroke="#F5A62338" strokeWidth="1.5" />
          <rect x={bx - 3} y={WHEEL_Y + 2} width={6}  height={WHEEL_H - 4}   rx="2"   fill="#1a2238" stroke="#F5A62222" strokeWidth="1" />
          <circle cx={bx} cy={WHEEL_Y + WHEEL_H / 2} r={2} fill="#F5A62330" />
        </g>
      ))}
      {/* Axle bars */}
      <line x1={bogeyX1 - 5} y1={WHEEL_Y + WHEEL_H / 2} x2={bogeyX3 + 5} y2={WHEEL_Y + WHEEL_H / 2} stroke="#F5A62220" strokeWidth="2" strokeLinecap="round" />
      {/* Rear underride guard */}
      <rect x={TRAILER_W - 8} y={WHEEL_Y + 2} width={6} height={WHEEL_H - 4} rx="2" fill="#1e2535" stroke="#F5A62330" strokeWidth="1" />
    </g>
  )
}

// ── Section cell ─────────────────────────────────────────────
function SectionCell({ s, sec, isSelected, onSelect }) {
  const x = COL_STARTS[s.col]
  const y = SEC_TOP + s.floor * (ROW_H + GAP)
  const w = COL_WIDTHS[s.col]
  const isDoor = s.door
  const colors = sectionColor(sec, isSelected)
  const midX = x + w / 2

  return (
    <motion.g
      onClick={() => onSelect(s.number)}
      style={{ cursor: 'pointer' }}
      whileTap={{ scale: 0.95 }}
      animate={colors.glow ? { filter: ['drop-shadow(0 0 4px #fff)', 'drop-shadow(0 0 8px #fff)', 'drop-shadow(0 0 4px #fff)'] } : {}}
      transition={{ duration: 1, repeat: colors.glow ? Infinity : 0 }}
    >
      {/* Pulse ring */}
      {colors.pulse && !isSelected && (
        <motion.rect
          x={x - 2} y={y - 2} width={w + 4} height={ROW_H + 4} rx="4"
          fill="none" stroke={colors.inProgress ? '#F5A623' : '#F5A62370'} strokeWidth="1"
          animate={{ opacity: [0.7, 0.1, 0.7] }}
          transition={{ duration: colors.inProgress ? 1.4 : 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Section body */}
      <rect x={x} y={y} width={w} height={ROW_H} rx="3"
        fill={colors.fill} stroke={colors.stroke} strokeWidth={isSelected ? 2.5 : 1.5} />

      {/* Door hatching */}
      {isDoor && (
        <g clipPath={`url(#clip-sec-${s.number})`}>
          <defs>
            <clipPath id={`clip-sec-${s.number}`}>
              <rect x={x} y={y} width={w} height={ROW_H} rx="3" />
            </clipPath>
          </defs>
          {[-8, 4, 16, 28, 40, 52, 64, 76].map((off, i) => (
            <line key={i}
              x1={x + off} y1={y}
              x2={x + off + ROW_H} y2={y + ROW_H}
              stroke={colors.stroke} strokeWidth="0.5" strokeOpacity="0.12"
            />
          ))}
          {/* Door center split */}
          <line x1={midX} y1={y + 4} x2={midX} y2={y + ROW_H - 4}
            stroke={colors.stroke} strokeWidth="1" strokeOpacity="0.5" strokeDasharray="3,2" />
          {/* Door hinges (left side) */}
          {[y + ROW_H * 0.22, y + ROW_H * 0.78].map((hy, i) => (
            <rect key={i} x={x + 4} y={hy - 3} width={5} height={6} rx="1"
              fill="none" stroke={colors.stroke} strokeWidth="0.8" strokeOpacity="0.5" />
          ))}
          {/* Door handles (just left of center) */}
          {[y + ROW_H * 0.44, y + ROW_H * 0.44].map((hy, i) => (
            <rect key={i}
              x={midX - 14 + i * 16} y={hy}
              width={8} height={3} rx="1.5"
              fill={colors.stroke} fillOpacity="0.5"
            />
          ))}
        </g>
      )}

      {/* Section number */}
      <text x={midX} y={y + 19} textAnchor="middle"
        fill={sec.status === 'done' ? '#22C55E' : '#F5A623'}
        fontSize="17" fontWeight="700" fontFamily="IBM Plex Mono">
        {s.number}
      </text>

      {/* Status content */}
      {sec.status === 'done' ? (
        <g transform={`translate(${midX - 8}, ${y + 26})`}>
          <polyline points="2,8 6,13 14,4" fill="none"
            stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : sec.photos?.length > 0 ? (
        <g>
          <text x={midX} y={y + 44} textAnchor="middle"
            fill="#F5A623" fontSize="8" fontFamily="IBM Plex Mono">
            {sec.photos.length} foto{sec.photos.length !== 1 ? 's' : ''}
          </text>
          <text x={midX} y={y + 56} textAnchor="middle"
            fill="#F5A623" fontSize="7" fontFamily="IBM Plex Mono" fontWeight="700" opacity="0.85">
            MARCAR LISTA
          </text>
        </g>
      ) : (
        <text x={midX} y={y + 52} textAnchor="middle"
          fill="#F5A623" fontSize="8" fontFamily="IBM Plex Mono" opacity="0.6">
          TAP
        </text>
      )}

      {/* Door label */}
      {isDoor && (
        <text x={midX} y={y + ROW_H - 7} textAnchor="middle"
          fill={colors.stroke} fontSize="7" fontFamily="IBM Plex Mono" opacity="0.7" fontWeight="700">
          PUERTA
        </text>
      )}
    </motion.g>
  )
}

// ── Main component ───────────────────────────────────────────
export default function TrailerDiagram({ sections, selectedSection, onSelect }) {
  const [showTruck, setShowTruck] = useState(false)

  const sectionMap = {}
  for (const s of sections || []) sectionMap[s.number] = s

  const viewW = showTruck ? TRAILER_W + TRAILER_SHIFT : TRAILER_W
  const trailerX = showTruck ? TRAILER_SHIFT : 0

  return (
    <div className="w-full select-none">
      {/* Direction labels */}
      <div className="flex justify-between text-[10px] text-white/25 font-mono mb-1 px-3">
        <span>← FRENTE</span>
        <span>FONDO / PUERTAS →</span>
      </div>

      <svg
        viewBox={`0 0 ${viewW} ${TOTAL_H}`}
        className="w-full"
        style={{ maxHeight: 240 }}
        overflow="visible"
      >
        {/* Truck cab (animated in/out) */}
        <AnimatePresence>
          {showTruck && (
            <motion.g
              key="cab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CabSVG />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Trailer group (shifts right when truck is shown) */}
        <motion.g
          animate={{ x: trailerX }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <TrailerStructure showTruck={showTruck} />

          {/* Row labels */}
          <text x={PAD - 3} y={SEC_TOP + ROW_H / 2 + 4}
            fill="#ffffff28" fontSize="8" fontFamily="IBM Plex Mono" textAnchor="end">
            P1
          </text>
          <text x={PAD - 3} y={SEC_TOP + ROW_H + GAP + ROW_H / 2 + 4}
            fill="#ffffff28" fontSize="8" fontFamily="IBM Plex Mono" textAnchor="end">
            P2
          </text>

          {/* Door separator dashed line */}
          <line
            x1={COL_STARTS[3] - 5} y1={OUTLINE_TOP + 6}
            x2={COL_STARTS[3] - 5} y2={OUTLINE_TOP + OUTLINE_H - 6}
            stroke="#F5A62338" strokeWidth="1" strokeDasharray="4,3"
          />

          {/* Section cells */}
          {SECTIONS.map((s) => {
            const sec = sectionMap[s.number] || { status: 'pending', photos: [] }
            return (
              <SectionCell
                key={s.number}
                s={s}
                sec={sec}
                isSelected={selectedSection === s.number}
                onSelect={onSelect}
              />
            )
          })}

          {/* Floor label bottom */}
          <text
            x={PAD + TRAILER_INNER_W / 2} y={TOTAL_H - 4}
            textAnchor="middle" fill="#ffffff15" fontSize="8" fontFamily="IBM Plex Mono"
          >
            CAJA 53 FT
          </text>
        </motion.g>
      </svg>

      {/* Toggle */}
      <div className="flex justify-end pr-3 mt-1">
        <button
          onClick={() => setShowTruck((v) => !v)}
          className="flex items-center gap-1.5 text-[11px] font-mono text-white/35 hover:text-[#F5A623] transition-colors py-1 px-2 border border-white/10 hover:border-[#F5A62340]"
        >
          <Truck size={11} />
          {showTruck ? 'Ocultar tractor' : 'Mostrar tractor'}
        </button>
      </div>
    </div>
  )
}
