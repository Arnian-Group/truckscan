const BODY = '#1e3a5f'
const GLASS = '#0d2340'
const TIRE = '#111'
const RIM = '#4a4a4a'
const HUB = '#888'
const HEAD = '#fbbf24'
const TAIL = '#ef4444'

function Wheel({ cx, cy, r = 18 }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill={TIRE} />
      <circle cx={cx} cy={cy} r={r * 0.55} fill={RIM} />
      <circle cx={cx} cy={cy} r={r * 0.22} fill={HUB} />
    </>
  )
}

function GolfSide({ mirror }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={mirror ? { transform: 'scaleX(-1)', display: 'block' } : { display: 'block' }}>
      <Wheel cx={82} cy={132} r={18} />
      <Wheel cx={232} cy={132} r={18} />

      {/* Chassis / frame — low, short vehicle */}
      <rect x="60" y="104" width="196" height="12" rx="3" fill={BODY} />

      {/* Front nose / dash area */}
      <path d="M 60 104 L 60 82 C 62 76 68 72 78 70 L 120 68 L 120 104 Z" fill={BODY} />

      {/* Seat area — bench seat visible */}
      <rect x="120" y="76" width="80" height="28" rx="2" fill="#162d4a" />
      <rect x="122" y="78" width="76" height="18" rx="2" fill="#1a3560" />
      {/* Seat back */}
      <rect x="120" y="68" width="78" height="12" rx="2" fill="#1e3a5f" />

      {/* Rear cargo area */}
      <rect x="200" y="76" width="56" height="28" rx="2" fill="#192f50" stroke="#2d5080" strokeWidth="1" />

      {/* Canopy posts */}
      <rect x="110" y="36" width="6" height="52" rx="2" fill={BODY} />
      <rect x="226" y="36" width="6" height="52" rx="2" fill={BODY} />

      {/* Canopy roof */}
      <rect x="106" y="30" width="130" height="10" rx="3" fill={BODY} />

      {/* Windshield (small) */}
      <path d="M 68 82 L 72 68 L 110 68 L 110 82 Z" fill={GLASS} opacity="0.7" />

      {/* Steering column */}
      <line x1="92" y1="68" x2="88" y2="86" stroke="#2d5080" strokeWidth="3" />
      <line x1="80" y1="68" x2="100" y2="68" stroke="#2d5080" strokeWidth="3" />

      {/* Headlight */}
      <rect x="60" y="78" width="7" height="9" rx="1" fill={HEAD} />
      {/* Taillight */}
      <rect x="254" y="82" width="6" height="10" rx="1" fill={TAIL} />
    </svg>
  )
}

function GolfFront({ className }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="30" y="55" width="100" height="65" rx="4" fill={BODY} />
      <rect x="34" y="62" width="40" height="30" rx="3" fill={GLASS} opacity="0.7" />
      <rect x="86" y="62" width="40" height="30" rx="3" fill={GLASS} opacity="0.7" />
      <line x1="36" y1="30" x2="36" y2="58" stroke={BODY} strokeWidth="6" />
      <line x1="124" y1="30" x2="124" y2="58" stroke={BODY} strokeWidth="6" />
      <rect x="30" y="24" width="100" height="10" rx="3" fill={BODY} />
      <rect x="32" y="104" width="22" height="10" rx="2" fill={HEAD} />
      <rect x="106" y="104" width="22" height="10" rx="2" fill={HEAD} />
      <Wheel cx={42} cy={140} r={16} />
      <Wheel cx={118} cy={140} r={16} />
    </svg>
  )
}

function GolfRear({ className }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="30" y="55" width="100" height="65" rx="4" fill={BODY} />
      <line x1="36" y1="30" x2="36" y2="58" stroke={BODY} strokeWidth="6" />
      <line x1="124" y1="30" x2="124" y2="58" stroke={BODY} strokeWidth="6" />
      <rect x="30" y="24" width="100" height="10" rx="3" fill={BODY} />
      <rect x="34" y="106" width="20" height="10" rx="2" fill={TAIL} />
      <rect x="106" y="106" width="20" height="10" rx="2" fill={TAIL} />
      <Wheel cx={42} cy={140} r={16} />
      <Wheel cx={118} cy={140} r={16} />
    </svg>
  )
}

function GolfTop({ className }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="60" y="10" width="200" height="140" rx="8" fill={BODY} />
      <rect x="106" y="14" width="108" height="132" rx="4" fill="#162d4a" />
    </svg>
  )
}

function GolfInterior({ className }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="40" y="10" width="240" height="140" rx="8" fill="#162d4a" />
      <rect x="60" y="18" width="120" height="60" rx="4" fill={GLASS} opacity="0.5" />
      <rect x="60" y="90" width="200" height="44" rx="4" fill="#1e3a5f" />
      <circle cx="90" cy="112" r="14" stroke="#4a7ab5" strokeWidth="3" fill="none" />
    </svg>
  )
}

export default function GolfCartSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <GolfFront className={className} />
  if (view === 'rear') return <GolfRear className={className} />
  if (view === 'top') return <GolfTop className={className} />
  if (view === 'interior') return <GolfInterior className={className} />
  return <GolfSide mirror={view === 'left'} />
}
