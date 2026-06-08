const BODY = '#1e3a5f'
const CAGE = '#374151'
const TIRE = '#111'
const RIM = '#4a4a4a'
const HUB = '#888'
const HEAD = '#fbbf24'
const TAIL = '#ef4444'

function Wheel({ cx, cy, r = 30 }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill={TIRE} />
      <circle cx={cx} cy={cy} r={r * 0.55} fill={RIM} />
      <circle cx={cx} cy={cy} r={r * 0.2} fill={HUB} />
    </>
  )
}

function CanAmSide({ mirror }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={mirror ? { transform: 'scaleX(-1)', display: 'block' } : { display: 'block' }}>
      <Wheel cx={72} cy={126} r={30} />
      <Wheel cx={248} cy={126} r={30} />

      {/* Lower body / floor tub */}
      <path
        d="
          M 44 110
          L 44 100
          L 276 100
          L 276 110
          Q 248 90 220 110
          L 100 110
          Q 72 90 44 110
          Z
        "
        fill={BODY}
      />

      {/* Front body panel */}
      <path d="M 44 100 L 44 80 L 100 80 L 100 100 Z" fill={BODY} />
      {/* Rear body panel */}
      <path d="M 220 100 L 220 80 L 276 80 L 276 100 Z" fill={BODY} />
      {/* Center seats */}
      <rect x="100" y="72" width="120" height="28" rx="2" fill="#162d4a" />
      <rect x="105" y="74" width="52" height="18" rx="2" fill="#192f50" />
      <rect x="163" y="74" width="52" height="18" rx="2" fill="#192f50" />

      {/* Roll cage — stroke only, rectangular frame */}
      {/* A-pillar left */}
      <line x1="104" y1="100" x2="96" y2="40" stroke={CAGE} strokeWidth="4" strokeLinecap="round" />
      {/* A-pillar right (rear of cab) */}
      <line x1="216" y1="100" x2="224" y2="40" stroke={CAGE} strokeWidth="4" strokeLinecap="round" />
      {/* Main hoop top */}
      <line x1="96" y1="40" x2="224" y2="40" stroke={CAGE} strokeWidth="4" strokeLinecap="round" />
      {/* Front cage bar */}
      <line x1="96" y1="40" x2="72" y2="72" stroke={CAGE} strokeWidth="3" strokeLinecap="round" />
      {/* Rear cage bar */}
      <line x1="224" y1="40" x2="248" y2="72" stroke={CAGE} strokeWidth="3" strokeLinecap="round" />
      {/* Diagonal brace */}
      <line x1="104" y1="100" x2="216" y2="40" stroke={CAGE} strokeWidth="2" strokeLinecap="round" opacity="0.5" />

      {/* Headlight */}
      <rect x="44" y="83" width="10" height="12" rx="1" fill={HEAD} />
      {/* Taillight */}
      <rect x="268" y="83" width="9" height="12" rx="1" fill={TAIL} />
      {/* Skid plate */}
      <rect x="64" y="106" width="192" height="5" rx="2" fill="#2a4060" />
    </svg>
  )
}

function CanAmFront({ className }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="16" y="60" width="128" height="70" rx="4" fill={BODY} />
      <line x1="26" y1="130" x2="26" y2="30" stroke={CAGE} strokeWidth="5" />
      <line x1="134" y1="130" x2="134" y2="30" stroke={CAGE} strokeWidth="5" />
      <line x1="26" y1="30" x2="134" y2="30" stroke={CAGE} strokeWidth="5" />
      <rect x="28" y="66" width="44" height="30" rx="3" fill={BODY} stroke={CAGE} strokeWidth="2" />
      <rect x="88" y="66" width="44" height="30" rx="3" fill={BODY} stroke={CAGE} strokeWidth="2" />
      <rect x="18" y="102" width="24" height="14" rx="2" fill={HEAD} />
      <rect x="118" y="102" width="24" height="14" rx="2" fill={HEAD} />
      <Wheel cx={36} cy={140} r={24} />
      <Wheel cx={124} cy={140} r={24} />
    </svg>
  )
}

function CanAmRear({ className }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="16" y="60" width="128" height="70" rx="4" fill={BODY} />
      <line x1="26" y1="130" x2="26" y2="30" stroke={CAGE} strokeWidth="5" />
      <line x1="134" y1="130" x2="134" y2="30" stroke={CAGE} strokeWidth="5" />
      <line x1="26" y1="30" x2="134" y2="30" stroke={CAGE} strokeWidth="5" />
      <rect x="20" y="104" width="22" height="12" rx="2" fill={TAIL} />
      <rect x="118" y="104" width="22" height="12" rx="2" fill={TAIL} />
      <Wheel cx={36} cy={140} r={24} />
      <Wheel cx={124} cy={140} r={24} />
    </svg>
  )
}

function CanAmTop({ className }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="42" y="10" width="236" height="140" rx="8" fill={BODY} />
      <rect x="60" y="20" width="86" height="120" rx="4" fill="#162d4a" stroke={CAGE} strokeWidth="2" />
      <rect x="174" y="20" width="86" height="120" rx="4" fill="#162d4a" stroke={CAGE} strokeWidth="2" />
    </svg>
  )
}

function CanAmInterior({ className }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="20" y="10" width="280" height="140" rx="8" fill="#162d4a" />
      <rect x="40" y="20" width="240" height="80" rx="4" fill={BODY} />
      <circle cx="90" cy="118" r="20" stroke="#4a7ab5" strokeWidth="3" fill="none" />
      <circle cx="230" cy="118" r="20" stroke="#4a7ab5" strokeWidth="3" fill="none" />
    </svg>
  )
}

export default function CanAmSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <CanAmFront className={className} />
  if (view === 'rear') return <CanAmRear className={className} />
  if (view === 'top') return <CanAmTop className={className} />
  if (view === 'interior') return <CanAmInterior className={className} />
  return <CanAmSide mirror={view === 'left'} />
}
