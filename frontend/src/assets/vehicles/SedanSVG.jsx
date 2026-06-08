const BODY = '#1e3a5f'
const GLASS = '#0d2340'
const TIRE = '#111'
const RIM = '#4a4a4a'
const HUB = '#888'
const HEAD = '#fbbf24'
const TAIL = '#ef4444'

function Wheel({ cx, cy, r = 22 }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill={TIRE} />
      <circle cx={cx} cy={cy} r={r * 0.58} fill={RIM} />
      <circle cx={cx} cy={cy} r={r * 0.2} fill={HUB} />
    </>
  )
}

function SedanSide({ mirror }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={mirror ? { transform: 'scaleX(-1)', display: 'block' } : { display: 'block' }}>
      {/* Wheels behind body */}
      <Wheel cx={82} cy={128} r={22} />
      <Wheel cx={238} cy={128} r={22} />

      {/* Body silhouette — 3-box sedan profile */}
      <path
        d="
          M 44 104
          L 44 96
          C 46 92 50 89 58 88
          L 78 86
          C 86 84 92 79 98 73
          L 114 52
          L 197 52
          L 220 68
          L 242 72
          C 252 78 260 92 265 103
          L 265 104
          Q 238 84 212 104
          L 106 104
          Q 82 84 56 104
          Z
        "
        fill={BODY}
      />

      {/* Windshield */}
      <path d="M 100 73 L 116 52 L 152 52 L 146 73 Z" fill={GLASS} opacity="0.85" />
      {/* Front door glass */}
      <path d="M 150 52 L 172 52 L 172 71 L 150 71 Z" fill={GLASS} opacity="0.75" />
      {/* Rear door glass */}
      <path d="M 176 52 L 196 52 L 196 70 L 176 70 Z" fill={GLASS} opacity="0.75" />
      {/* Rear window */}
      <path d="M 197 52 L 219 68 L 215 72 L 195 68 Z" fill={GLASS} opacity="0.7" />

      {/* Headlight */}
      <rect x="44" y="90" width="7" height="10" rx="1" fill={HEAD} />
      {/* Taillight */}
      <rect x="260" y="87" width="6" height="14" rx="1" fill={TAIL} />
      {/* Mirror */}
      <path d="M 100 68 L 106 65 L 108 70 L 102 72 Z" fill="#2d4e7a" />
    </svg>
  )
}

function SedanFront({ className }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="20" y="40" width="120" height="80" rx="6" fill={BODY} />
      <path d="M 30 40 Q 80 20 130 40" fill={BODY} />
      <rect x="30" y="50" width="40" height="25" rx="3" fill={GLASS} opacity="0.8" />
      <rect x="90" y="50" width="40" height="25" rx="3" fill={GLASS} opacity="0.8" />
      <rect x="22" y="95" width="22" height="12" rx="2" fill={HEAD} />
      <rect x="116" y="95" width="22" height="12" rx="2" fill={HEAD} />
      <Wheel cx={38} cy={138} r={20} />
      <Wheel cx={122} cy={138} r={20} />
    </svg>
  )
}

function SedanRear({ className }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="20" y="40" width="120" height="80" rx="6" fill={BODY} />
      <path d="M 30 40 Q 80 20 130 40" fill={BODY} />
      <rect x="35" y="50" width="38" height="24" rx="3" fill={GLASS} opacity="0.8" />
      <rect x="87" y="50" width="38" height="24" rx="3" fill={GLASS} opacity="0.8" />
      <rect x="22" y="97" width="20" height="10" rx="2" fill={TAIL} />
      <rect x="118" y="97" width="20" height="10" rx="2" fill={TAIL} />
      <Wheel cx={38} cy={138} r={20} />
      <Wheel cx={122} cy={138} r={20} />
    </svg>
  )
}

function SedanTop({ className }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="44" y="20" width="232" height="120" rx="30" fill={BODY} />
      <rect x="90" y="28" width="60" height="50" rx="4" fill={GLASS} opacity="0.7" />
      <rect x="170" y="28" width="60" height="50" rx="4" fill={GLASS} opacity="0.7" />
      <rect x="90" y="82" width="60" height="44" rx="4" fill={GLASS} opacity="0.7" />
      <rect x="170" y="82" width="60" height="44" rx="4" fill={GLASS} opacity="0.7" />
    </svg>
  )
}

function SedanInterior({ className }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="20" y="10" width="280" height="140" rx="8" fill="#162d4a" />
      <rect x="40" y="20" width="240" height="80" rx="4" fill={GLASS} opacity="0.5" />
      <rect x="130" y="110" width="60" height="30" rx="4" fill="#2a4a70" />
      <circle cx="100" cy="125" r="18" stroke="#4a7ab5" strokeWidth="3" fill="none" />
      <circle cx="220" cy="125" r="18" stroke="#4a7ab5" strokeWidth="3" fill="none" />
    </svg>
  )
}

export default function SedanSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <SedanFront className={className} />
  if (view === 'rear') return <SedanRear className={className} />
  if (view === 'top') return <SedanTop className={className} />
  if (view === 'interior') return <SedanInterior className={className} />
  return <SedanSide mirror={view === 'left'} />
}
