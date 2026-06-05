import { motion } from 'framer-motion'

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

const PAD = 16
const COL_W = 100
const ROW_H = 80
const GAP = 8
const DOOR_W = 110
const COL_WIDTHS = [COL_W, COL_W, COL_W, DOOR_W]
const COL_STARTS = COL_WIDTHS.map((_, i) =>
  PAD + COL_WIDTHS.slice(0, i).reduce((sum, w) => sum + w + GAP, 0)
)
const TOTAL_W = PAD + COL_WIDTHS.reduce((a, b) => a + b, 0) + (COL_WIDTHS.length - 1) * GAP + PAD
const TOTAL_H = PAD + 2 * ROW_H + GAP + PAD + 24

function sectionColor(section, selected) {
  if (selected) return { fill: '#ffffff22', stroke: '#ffffff', glow: true }
  if (section.status === 'done') return { fill: '#16a34a33', stroke: '#22C55E', glow: false }
  if (section.photos?.length > 0) return { fill: '#F5A62322', stroke: '#F5A623', glow: false }
  return { fill: '#F5A62318', stroke: '#F5A623', glow: false, pulse: true }
}

export default function TrailerDiagram({ sections, selectedSection, onSelect }) {
  const sectionMap = {}
  for (const s of sections || []) sectionMap[s.number] = s

  return (
    <div className="w-full px-2">
      {/* Labels */}
      <div className="flex justify-between text-[10px] text-white/30 font-mono mb-1 px-4">
        <span>FRONT</span>
        <span>BACK / PUERTA</span>
      </div>

      <svg
        viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
        className="w-full"
        style={{ maxHeight: 220 }}
      >
        {/* Trailer outline */}
        <rect
          x={PAD / 2}
          y={PAD / 2}
          width={TOTAL_W - PAD}
          height={TOTAL_H - PAD - 16}
          rx="4"
          fill="none"
          stroke="#ffffff18"
          strokeWidth="1.5"
        />

        {/* Floor labels */}
        <text x={PAD - 2} y={PAD + ROW_H / 2 + 4} fill="#ffffff30" fontSize="9" fontFamily="IBM Plex Mono" textAnchor="end">P1</text>
        <text x={PAD - 2} y={PAD + ROW_H + GAP + ROW_H / 2 + 4} fill="#ffffff30" fontSize="9" fontFamily="IBM Plex Mono" textAnchor="end">P2</text>

        {SECTIONS.map((s) => {
          const sec = sectionMap[s.number] || { status: 'pending', photos: [] }
          const x = COL_STARTS[s.col]
          const y = PAD + s.floor * (ROW_H + GAP)
          const w = COL_WIDTHS[s.col]
          const isSelected = selectedSection === s.number
          const colors = sectionColor(sec, isSelected)
          const isDoor = s.door

          return (
            <motion.g
              key={s.number}
              onClick={() => onSelect(s.number)}
              style={{ cursor: 'pointer' }}
              whileTap={{ scale: 0.96 }}
              animate={
                colors.glow
                  ? { filter: ['drop-shadow(0 0 4px #fff)', 'drop-shadow(0 0 8px #fff)', 'drop-shadow(0 0 4px #fff)'] }
                  : {}
              }
              transition={{ duration: 1, repeat: colors.glow ? Infinity : 0 }}
            >
              {/* Pulse ring for pending+no photos */}
              {colors.pulse && !isSelected && (
                <motion.rect
                  x={x - 2}
                  y={y - 2}
                  width={w + 4}
                  height={ROW_H + 4}
                  rx="4"
                  fill="none"
                  stroke="#F5A623"
                  strokeWidth="1"
                  animate={{ opacity: [0.6, 0.15, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              {/* Section body */}
              <rect
                x={x}
                y={y}
                width={w}
                height={ROW_H}
                rx="3"
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={isSelected ? 2 : 1.5}
              />

              {/* Door hatching */}
              {isDoor && (
                <g clipPath={`url(#clip-${s.number})`}>
                  <defs>
                    <clipPath id={`clip-${s.number}`}>
                      <rect x={x} y={y} width={w} height={ROW_H} rx="3" />
                    </clipPath>
                  </defs>
                  {[-10, 0, 10, 20, 30, 40, 50, 60].map((offset, i) => (
                    <line
                      key={i}
                      x1={x + offset}
                      y1={y}
                      x2={x + offset + ROW_H}
                      y2={y + ROW_H}
                      stroke={colors.stroke}
                      strokeWidth="0.5"
                      strokeOpacity="0.15"
                    />
                  ))}
                </g>
              )}

              {/* Section number */}
              <text
                x={x + w / 2}
                y={y + 20}
                textAnchor="middle"
                fill={sec.status === 'done' ? '#22C55E' : '#F5A623'}
                fontSize="18"
                fontWeight="700"
                fontFamily="IBM Plex Mono"
              >
                {s.number}
              </text>

              {/* Status icon */}
              {sec.status === 'done' ? (
                <g transform={`translate(${x + w / 2 - 8}, ${y + 28})`}>
                  <polyline
                    points="2,8 6,12 14,4"
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="draw-check"
                  />
                </g>
              ) : sec.photos?.length > 0 ? (
                <text
                  x={x + w / 2}
                  y={y + 50}
                  textAnchor="middle"
                  fill="#F5A623"
                  fontSize="9"
                  fontFamily="IBM Plex Mono"
                >
                  {sec.photos.length} foto{sec.photos.length !== 1 ? 's' : ''}
                </text>
              ) : (
                <text
                  x={x + w / 2}
                  y={y + 50}
                  textAnchor="middle"
                  fill="#F5A623"
                  fontSize="8"
                  fontFamily="IBM Plex Sans"
                  opacity="0.7"
                >
                  TAP
                </text>
              )}

              {/* Door label */}
              {isDoor && (
                <text
                  x={x + w / 2}
                  y={y + ROW_H - 8}
                  textAnchor="middle"
                  fill={colors.stroke}
                  fontSize="7.5"
                  fontFamily="IBM Plex Mono"
                  opacity="0.8"
                >
                  PUERTA
                </text>
              )}
            </motion.g>
          )
        })}

        {/* Door bracket */}
        <line
          x1={COL_STARTS[3] - 4}
          y1={PAD + 4}
          x2={COL_STARTS[3] - 4}
          y2={PAD + 2 * ROW_H + GAP - 4}
          stroke="#F5A62340"
          strokeWidth="1"
          strokeDasharray="3,3"
        />

        {/* Bottom labels */}
        <text x={PAD + COL_WIDTHS[0] / 2} y={TOTAL_H - 4} textAnchor="middle" fill="#ffffff20" fontSize="8" fontFamily="IBM Plex Mono">PISO 1</text>
        <text x={PAD + COL_WIDTHS[0] / 2} y={PAD + ROW_H + GAP + ROW_H / 2 + 4 + 20} textAnchor="middle" fill="#ffffff20" fontSize="8" fontFamily="IBM Plex Mono">PISO 2</text>
      </svg>
    </div>
  )
}
