import { useState } from 'react'
import { motion } from 'framer-motion'
import { Truck } from 'lucide-react'

// ── Section definitions ────────────────────────────────────────
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

// ── Trailer layout ────────────────────────────────────────────
const PAD      = 14   // inner padding from trailer wall to sections
const COL_W    = 94   // standard column width
const DOOR_W   = 104  // door column width
const ROW_H    = 76   // section row height
const GAP      = 7    // gap between rows / columns

const COL_WIDTHS = [COL_W, COL_W, COL_W, DOOR_W]
const COL_STARTS = COL_WIDTHS.map((_, i) =>
  PAD + COL_WIDTHS.slice(0, i).reduce((s, w) => s + w + GAP, 0)
)
// COL_STARTS = [14, 115, 216, 317]

const TRAILER_INNER_W = COL_WIDTHS.reduce((a, b) => a + b, 0) + (COL_WIDTHS.length - 1) * GAP
const TRAILER_W = PAD + TRAILER_INNER_W + PAD  // 435

// Vertical (extra top pad so exhaust stacks don't clip)
const EXTRA_TOP  = 18            // head room above trailer box
const BOX_TOP    = EXTRA_TOP     // trailer outline starts here
const SEC_TOP    = EXTRA_TOP + PAD  // sections start inside box
const SEC_H      = 2 * ROW_H + GAP  // 159
const BOX_H      = PAD + SEC_H + PAD  // 187
const BOX_BOT    = BOX_TOP + BOX_H   // 205
const WHEEL_Y    = BOX_BOT + 4       // 209
const WHEEL_H    = 16
const TOTAL_H    = WHEEL_Y + WHEEL_H + 14  // 239  (+14 for bottom label)

// ── Truck cab constants ───────────────────────────────────────
// Cab drawn at absolute x=0..CAB_TOTAL_W; trailer shifted by SHIFT
const NOSE_W      = 20   // hood/nose from x=0
const BODY_L      = 18   // cab body starts (overlaps nose end)
const CAB_TOTAL_W = 72   // full cab art width
const COUPLING_W  = 8    // coupling plate overlaps trailer front
const SHIFT       = CAB_TOTAL_W - COUPLING_W  // 64: trailer group offset when cab shown

// ── Colours ──────────────────────────────────────────────────
function secColor(sec, selected) {
  if (selected)               return { fill: '#ffffff22', stroke: '#ffffff',  glow: true,  pulse: false }
  if (sec.status === 'done')  return { fill: '#16a34a33', stroke: '#22C55E',  glow: false, pulse: false }
  if (sec.photos?.length > 0) return { fill: '#F5A62330', stroke: '#F5A623',  glow: false, pulse: true  }
  return                             { fill: '#F5A62314', stroke: '#F5A623',  glow: false, pulse: true  }
}

// ── Truck cab SVG (drawn at x=0, fits in x=0..CAB_TOTAL_W) ───
function CabSVG() {
  const top  = BOX_TOP
  const bot  = BOX_BOT
  const h    = BOX_H
  const mid  = top + h / 2

  const bodyR = SHIFT          // cab body right edge = where coupling starts = 64
  const bodyW = bodyR - BODY_L // 46

  // window proportions
  const winTop = top + 8
  const winH   = h * 0.40

  return (
    <g>
      {/* ── Exhaust stacks (just above trailer box top) ── */}
      <rect x={BODY_L + 5}  y={top - 14} width={5}  height={16} rx="2.5" fill="#1e2535" stroke="#F5A62328" strokeWidth="1" />
      <rect x={BODY_L + 13} y={top - 9}  width={4}  height={11} rx="2"   fill="#1e2535" stroke="#F5A62220" strokeWidth="1" />
      <ellipse cx={BODY_L + 7.5} cy={top - 15} rx={3.5} ry={2} fill="#F5A62318" />

      {/* ── Hood / nose ── */}
      <path
        d={`M ${BODY_L} ${top + 10}
            L ${NOSE_W * 0.3} ${top + h * 0.26}
            L ${NOSE_W * 0.3} ${top + h * 0.74}
            L ${BODY_L} ${top + h - 10} Z`}
        fill="#151c2e" stroke="#F5A62332" strokeWidth="1"
      />
      {/* Front bumper face */}
      <rect x={1} y={top + h * 0.22} width={NOSE_W * 0.3} height={h * 0.56} rx="1"
        fill="#0e131e" stroke="#F5A62325" strokeWidth="0.8" />
      {/* Headlights */}
      <rect x={2} y={top + h * 0.25} width={8} height={h * 0.14} rx="2.5" fill="#F5A62342" />
      <rect x={2} y={top + h * 0.61} width={8} height={h * 0.14} rx="2.5" fill="#F5A62342" />
      {/* Grille bars */}
      {[0, 6, 12].map((dy) => (
        <line key={dy}
          x1={3} y1={top + h * 0.40 + dy}
          x2={NOSE_W * 0.3 - 1} y2={top + h * 0.40 + dy}
          stroke="#F5A62218" strokeWidth="0.9" />
      ))}

      {/* ── Cab body ── */}
      <rect x={BODY_L} y={top + 2} width={bodyW} height={h - 4} rx="4"
        fill="#1a2238" stroke="#F5A62352" strokeWidth="1.5" />

      {/* Windshield */}
      <rect x={BODY_L + 2} y={winTop} width={Math.min(36, bodyW - 4)} height={winH} rx="2"
        fill="#F5A62318" stroke="#F5A62338" strokeWidth="0.8" />

      {/* Side window */}
      {bodyW > 44 && (
        <rect x={BODY_L + 40} y={winTop + 2} width={bodyW - 46} height={winH - 4} rx="2"
          fill="#F5A62312" stroke="#F5A62328" strokeWidth="0.8" />
      )}

      {/* Door split line */}
      <line
        x1={BODY_L + bodyW * 0.56} y1={top + 4}
        x2={BODY_L + bodyW * 0.56} y2={top + h - 4}
        stroke="#F5A62218" strokeWidth="0.8" strokeDasharray="3,2"
      />

      {/* Door handle */}
      <rect
        x={BODY_L + bodyW * 0.60} y={mid + 6}
        width={bodyW * 0.12} height={3.5} rx="1.75"
        fill="#F5A62238"
      />

      {/* Fuel tank */}
      <rect x={bodyR - 13} y={top + h * 0.62} width={11} height={h * 0.30} rx="2"
        fill="#141b2a" stroke="#F5A62320" strokeWidth="1" />

      {/* ── Coupling / fifth-wheel plate ── */}
      <rect x={bodyR} y={mid - h * 0.13} width={COUPLING_W} height={h * 0.26} rx="3"
        fill="#F5A62322" stroke="#F5A62442" strokeWidth="1.2" />
      <circle cx={bodyR + COUPLING_W / 2} cy={mid} r={2.5}
        fill="#F5A62332" stroke="#F5A623" strokeWidth="0.8" />

      {/* ── Wheels ── */}
      {/* Steer axle – single tire under nose */}
      <rect x={6} y={WHEEL_Y} width={12} height={WHEEL_H} rx="3.5"
        fill="#0f1117" stroke="#F5A62338" strokeWidth="1.5" />
      <circle cx={12} cy={WHEEL_Y + WHEEL_H / 2} r={2} fill="#F5A62325" />
      <line x1={2}  y1={WHEEL_Y + WHEEL_H / 2} x2={20} y2={WHEEL_Y + WHEEL_H / 2}
        stroke="#F5A62218" strokeWidth="1.5" />

      {/* Drive axle 1 – dual tires */}
      <rect x={bodyR - 26} y={WHEEL_Y} width={11} height={WHEEL_H} rx="3.5"
        fill="#0f1117" stroke="#F5A62338" strokeWidth="1.5" />
      <rect x={bodyR - 14} y={WHEEL_Y} width={11} height={WHEEL_H} rx="3.5"
        fill="#0f1117" stroke="#F5A62330" strokeWidth="1.5" />
      <circle cx={bodyR - 9} cy={WHEEL_Y + WHEEL_H / 2} r={2} fill="#F5A62325" />

      {/* Drive axle 2 – dual tires */}
      <rect x={bodyR - 44} y={WHEEL_Y} width={11} height={WHEEL_H} rx="3.5"
        fill="#0f1117" stroke="#F5A62338" strokeWidth="1.5" />
      <rect x={bodyR - 32} y={WHEEL_Y} width={11} height={WHEEL_H} rx="3.5"
        fill="#0f1117" stroke="#F5A62330" strokeWidth="1.5" />
      <circle cx={bodyR - 27} cy={WHEEL_Y + WHEEL_H / 2} r={2} fill="#F5A62325" />

      {/* Drive axle bar */}
      <line x1={bodyR - 46} y1={WHEEL_Y + WHEEL_H / 2}
            x2={bodyR - 2}  y2={WHEEL_Y + WHEEL_H / 2}
        stroke="#F5A62218" strokeWidth="2" strokeLinecap="round" />
    </g>
  )
}

// ── Trailer structure details (renders inside the trailer group) ──
function TrailerExtras({ showTruck }) {
  // Landing gear legs under front of trailer (hidden when truck shown)
  const lgX   = PAD + COL_W * 0.38  // ~50px from left wall
  const lgTop = BOX_BOT
  const lgBot = WHEEL_Y + WHEEL_H - 2

  // Bogey wheel positions (under rear of trailer, near door columns)
  const bx1 = COL_STARTS[2] + COL_W * 0.65
  const bx2 = bx1 + 20
  const bx3 = bx2 + 20

  return (
    <>
      {/* ── Trailer box ── */}
      {/* Outer shell */}
      <rect x={0} y={BOX_TOP} width={TRAILER_W} height={BOX_H} rx="3"
        fill="#0c1020" stroke="#ffffff14" strokeWidth="1.5" />
      {/* Top rail */}
      <rect x={0} y={BOX_TOP} width={TRAILER_W} height={5} rx="2" fill="#ffffff09" />
      {/* Bottom rail */}
      <rect x={0} y={BOX_BOT - 5} width={TRAILER_W} height={5} rx="2" fill="#ffffff09" />
      {/* Front wall */}
      <rect x={0} y={BOX_TOP} width={5} height={BOX_H} rx="2" fill="#ffffff09" />
      {/* Rear door frame */}
      <rect x={TRAILER_W - 5} y={BOX_TOP} width={5} height={BOX_H} rx="2" fill="#F5A62320" />
      {/* Corner brackets */}
      {[
        [0, BOX_TOP], [TRAILER_W - 7, BOX_TOP],
        [0, BOX_BOT - 7], [TRAILER_W - 7, BOX_BOT - 7],
      ].map(([cx, cy], i) => (
        <rect key={i} x={cx} y={cy} width={7} height={7} rx="1.5" fill="#F5A62330" />
      ))}

      {/* ── Landing gear ── */}
      {!showTruck && (
        <g>
          <rect x={lgX - 2}  y={lgTop} width={4} height={lgBot - lgTop - 3} rx="1" fill="#1e2535" stroke="#F5A62222" strokeWidth="0.8" />
          <rect x={lgX + 16} y={lgTop} width={4} height={lgBot - lgTop - 3} rx="1" fill="#1e2535" stroke="#F5A62222" strokeWidth="0.8" />
          {/* Cross brace */}
          <line x1={lgX} y1={WHEEL_Y + 3} x2={lgX + 20} y2={WHEEL_Y + 3} stroke="#F5A62220" strokeWidth="1.5" />
          {/* Feet */}
          <rect x={lgX - 5}  y={lgBot - 4} width={14} height={4} rx="1.5" fill="#1e2535" stroke="#F5A62228" strokeWidth="0.8" />
          <rect x={lgX + 11} y={lgBot - 4} width={14} height={4} rx="1.5" fill="#1e2535" stroke="#F5A62228" strokeWidth="0.8" />
        </g>
      )}

      {/* ── Trailer bogey wheels ── */}
      {[bx1, bx2, bx3].map((bx, i) => (
        <g key={i}>
          <rect x={bx - 5} y={WHEEL_Y}     width={10} height={WHEEL_H}     rx="3.5" fill="#0f1117" stroke="#F5A62335" strokeWidth="1.5" />
          <rect x={bx - 3} y={WHEEL_Y + 2} width={6}  height={WHEEL_H - 4} rx="2"   fill="#1a2238" stroke="#F5A62220" strokeWidth="1" />
          <circle cx={bx} cy={WHEEL_Y + WHEEL_H / 2} r={2} fill="#F5A62328" />
        </g>
      ))}
      {/* Bogey axle bar */}
      <line x1={bx1 - 5} y1={WHEEL_Y + WHEEL_H / 2}
            x2={bx3 + 5} y2={WHEEL_Y + WHEEL_H / 2}
        stroke="#F5A62218" strokeWidth="2" strokeLinecap="round" />
      {/* Rear underride guard */}
      <rect x={TRAILER_W - 7} y={WHEEL_Y + 2} width={5} height={WHEEL_H - 4} rx="2"
        fill="#1e2535" stroke="#F5A62328" strokeWidth="1" />

      {/* ── Door separator dashed line ── */}
      <line
        x1={COL_STARTS[3] - 5} y1={BOX_TOP + 6}
        x2={COL_STARTS[3] - 5} y2={BOX_BOT - 6}
        stroke="#F5A62338" strokeWidth="1" strokeDasharray="4,3"
      />

      {/* ── Row labels ── */}
      <text x={PAD - 3} y={SEC_TOP + ROW_H / 2 + 4}
        fill="#ffffff28" fontSize="8" fontFamily="monospace" textAnchor="end">P1</text>
      <text x={PAD - 3} y={SEC_TOP + ROW_H + GAP + ROW_H / 2 + 4}
        fill="#ffffff28" fontSize="8" fontFamily="monospace" textAnchor="end">P2</text>

      {/* ── Bottom label ── */}
      <text
        x={PAD + TRAILER_INNER_W / 2} y={TOTAL_H - 4}
        textAnchor="middle" fill="#ffffff14" fontSize="7" fontFamily="monospace">
        CAJA 53 FT
      </text>
    </>
  )
}

// ── Section cell ──────────────────────────────────────────────
function SectionCell({ s, sec, isSelected, onSelect }) {
  const x    = COL_STARTS[s.col]
  const y    = SEC_TOP + s.floor * (ROW_H + GAP)
  const w    = COL_WIDTHS[s.col]
  const midX = x + w / 2
  const c    = secColor(sec, isSelected)

  return (
    <motion.g
      onClick={() => onSelect(s.number)}
      style={{ cursor: 'pointer' }}
      whileTap={{ scale: 0.94 }}
      animate={c.glow ? { filter: ['drop-shadow(0 0 4px #fff)', 'drop-shadow(0 0 8px #fff)', 'drop-shadow(0 0 4px #fff)'] } : {}}
      transition={{ duration: 1, repeat: c.glow ? Infinity : 0 }}
    >
      {/* Pulse ring */}
      {c.pulse && !isSelected && (
        <motion.rect
          x={x - 2} y={y - 2} width={w + 4} height={ROW_H + 4} rx="4"
          fill="none" stroke={c.stroke} strokeWidth="1"
          animate={{ opacity: [0.65, 0.1, 0.65] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Body */}
      <rect x={x} y={y} width={w} height={ROW_H} rx="3"
        fill={c.fill} stroke={c.stroke} strokeWidth={isSelected ? 2.5 : 1.5} />

      {/* Door treatment */}
      {s.door && (
        <g clipPath={`url(#clip-${s.number})`}>
          <defs>
            <clipPath id={`clip-${s.number}`}>
              <rect x={x} y={y} width={w} height={ROW_H} rx="3" />
            </clipPath>
          </defs>
          {/* Hatch lines */}
          {[-8, 6, 20, 34, 48, 62, 76].map((off, i) => (
            <line key={i}
              x1={x + off} y1={y} x2={x + off + ROW_H} y2={y + ROW_H}
              stroke={c.stroke} strokeWidth="0.5" strokeOpacity="0.12" />
          ))}
          {/* Center split (door gap) */}
          <line x1={midX} y1={y + 4} x2={midX} y2={y + ROW_H - 4}
            stroke={c.stroke} strokeWidth="1.2" strokeOpacity="0.55" strokeDasharray="3,2" />
          {/* Hinges (left door, left edge) */}
          <rect x={x + 4} y={y + ROW_H * 0.20} width={5} height={7} rx="1"
            fill="none" stroke={c.stroke} strokeWidth="0.9" strokeOpacity="0.5" />
          <rect x={x + 4} y={y + ROW_H * 0.72} width={5} height={7} rx="1"
            fill="none" stroke={c.stroke} strokeWidth="0.9" strokeOpacity="0.5" />
          {/* Door handles */}
          <rect x={midX - 13} y={y + ROW_H * 0.44} width={8} height={3} rx="1.5"
            fill={c.stroke} fillOpacity="0.45" />
          <rect x={midX + 5}  y={y + ROW_H * 0.44} width={8} height={3} rx="1.5"
            fill={c.stroke} fillOpacity="0.45" />
        </g>
      )}

      {/* Number */}
      <text x={midX} y={y + 19} textAnchor="middle"
        fill={sec.status === 'done' ? '#22C55E' : '#F5A623'}
        fontSize="17" fontWeight="700" fontFamily="monospace">
        {s.number}
      </text>

      {/* Status */}
      {sec.status === 'done' ? (
        <g transform={`translate(${midX - 8}, ${y + 26})`}>
          <polyline points="2,8 6,13 14,4" fill="none"
            stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : sec.photos?.length > 0 ? (
        <>
          <text x={midX} y={y + 44} textAnchor="middle"
            fill="#F5A623" fontSize="8" fontFamily="monospace">
            {sec.photos.length} foto{sec.photos.length !== 1 ? 's' : ''}
          </text>
          <text x={midX} y={y + 56} textAnchor="middle"
            fill="#F5A623" fontSize="7" fontFamily="monospace" fontWeight="700" opacity="0.85">
            MARCAR LISTA
          </text>
        </>
      ) : (
        <text x={midX} y={y + 52} textAnchor="middle"
          fill="#F5A623" fontSize="8" fontFamily="monospace" opacity="0.55">
          TAP
        </text>
      )}

      {/* Door label */}
      {s.door && (
        <text x={midX} y={y + ROW_H - 7} textAnchor="middle"
          fill={c.stroke} fontSize="7" fontFamily="monospace" fontWeight="700" opacity="0.7">
          PUERTA
        </text>
      )}
    </motion.g>
  )
}

// ── Main export ───────────────────────────────────────────────
export default function TrailerDiagram({ sections, selectedSection, onSelect }) {
  const [showTruck, setShowTruck] = useState(false)

  const sectionMap = {}
  for (const s of sections || []) sectionMap[s.number] = s

  // viewBox: add SHIFT to the left when truck is visible
  const vbX = showTruck ? -SHIFT : 0
  const vbW = showTruck ? TRAILER_W + SHIFT : TRAILER_W

  return (
    <div className="w-full select-none">
      {/* Direction labels */}
      <div className="flex justify-between text-[10px] text-white/25 font-mono mb-1 px-3">
        <span>← FRENTE</span>
        <span>FONDO / PUERTAS →</span>
      </div>

      <svg
        viewBox={`${vbX} 0 ${vbW} ${TOTAL_H}`}
        className="w-full"
        style={{ maxHeight: 250, display: 'block' }}
      >
        {/* Truck cab — shifted left of the trailer (x = -SHIFT .. +COUPLING_W).
            The viewBox starts at vbX=-SHIFT to reveal that area. */}
        {showTruck && (
          <g transform={`translate(${-SHIFT}, 0)`}>
            <CabSVG />
          </g>
        )}

        {/* Trailer group — always at x=0 in SVG space, viewBox shifts instead */}
        <g>
          <TrailerExtras showTruck={showTruck} />
          {SECTIONS.map((s) => (
            <SectionCell
              key={s.number}
              s={s}
              sec={sectionMap[s.number] || { status: 'pending', photos: [] }}
              isSelected={selectedSection === s.number}
              onSelect={onSelect}
            />
          ))}
        </g>
      </svg>

      {/* Toggle button */}
      <div className="flex justify-end pr-2 mt-1.5">
        <button
          onClick={() => setShowTruck((v) => !v)}
          className="flex items-center gap-1.5 text-[11px] font-mono text-white/35 hover:text-[#F5A623] transition-colors py-1 px-2.5 border border-white/10 hover:border-[#F5A62340] active:scale-95"
        >
          <Truck size={11} />
          {showTruck ? 'Ocultar tractor' : 'Mostrar tractor'}
        </button>
      </div>
    </div>
  )
}
