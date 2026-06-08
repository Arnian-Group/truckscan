const BODY = '#1e3a5f'
const TIRE = '#111'
const RIM = '#4a4a4a'
const HUB = '#888'
const HEAD = '#fbbf24'
const TAIL = '#ef4444'

function Wheel({ cx, cy, r = 32 }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill={TIRE} />
      <circle cx={cx} cy={cy} r={r * 0.52} fill={RIM} />
      <circle cx={cx} cy={cy} r={r * 0.18} fill={HUB} />
    </>
  )
}

function ATVSide({ mirror }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={mirror ? { transform: 'scaleX(-1)', display: 'block' } : { display: 'block' }}>
      {/* Fat tires dominate — drawn first */}
      <Wheel cx={82} cy={118} r={32} />
      <Wheel cx={234} cy={118} r={32} />

      {/* Front fender arch */}
      <path d="M 48 108 Q 82 76 116 108" fill={BODY} />
      {/* Rear fender arch */}
      <path d="M 200 108 Q 234 76 268 108" fill={BODY} />

      {/* Main body / frame between wheels */}
      <rect x="112" y="90" width="92" height="22" rx="3" fill={BODY} />

      {/* Front rack */}
      <rect x="48" y="88" width="66" height="10" rx="2" fill="#162d4a" stroke="#2d5080" strokeWidth="1.5" />
      <line x1="60" y1="88" x2="60" y2="98" stroke="#2d5080" strokeWidth="1.5" />
      <line x1="74" y1="88" x2="74" y2="98" stroke="#2d5080" strokeWidth="1.5" />
      <line x1="88" y1="88" x2="88" y2="98" stroke="#2d5080" strokeWidth="1.5" />

      {/* Rear rack */}
      <rect x="202" y="88" width="66" height="10" rx="2" fill="#162d4a" stroke="#2d5080" strokeWidth="1.5" />
      <line x1="214" y1="88" x2="214" y2="98" stroke="#2d5080" strokeWidth="1.5" />
      <line x1="228" y1="88" x2="228" y2="98" stroke="#2d5080" strokeWidth="1.5" />
      <line x1="242" y1="88" x2="242" y2="98" stroke="#2d5080" strokeWidth="1.5" />

      {/* Seat */}
      <rect x="120" y="72" width="76" height="20" rx="4" fill="#162d4a" />
      <rect x="122" y="74" width="72" height="14" rx="3" fill="#1a3560" />

      {/* Fuel tank / nose */}
      <path d="M 114 90 L 110 72 L 128 72 L 128 90 Z" fill={BODY} />

      {/* Handlebars T-shape */}
      <line x1="120" y1="62" x2="120" y2="74" stroke="#4a7ab5" strokeWidth="4" strokeLinecap="round" />
      <line x1="104" y1="62" x2="136" y2="62" stroke="#4a7ab5" strokeWidth="4" strokeLinecap="round" />

      {/* Headlight */}
      <rect x="50" y="80" width="10" height="10" rx="1" fill={HEAD} />
      {/* Taillight */}
      <rect x="260" y="82" width="8" height="10" rx="1" fill={TAIL} />

      {/* Exhaust */}
      <path d="M 204 108 Q 224 112 244 110 L 244 116 Q 224 118 204 114 Z" fill="#2d5080" />

      {/* Skid plate */}
      <rect x="114" y="110" width="88" height="5" rx="2" fill="#2a4060" />
    </svg>
  )
}

function ATVFront({ className }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="38" y="44" width="84" height="66" rx="4" fill={BODY} />
      <rect x="48" y="52" width="64" height="26" rx="3" fill={BODY} stroke="#2d5080" strokeWidth="1" />
      <line x1="36" y1="54" x2="124" y2="54" stroke="#4a7ab5" strokeWidth="4" strokeLinecap="round" />
      <rect x="46" y="98" width="22" height="12" rx="2" fill={HEAD} />
      <rect x="92" y="98" width="22" height="12" rx="2" fill={HEAD} />
      <Wheel cx={36} cy={138} r={26} />
      <Wheel cx={124} cy={138} r={26} />
    </svg>
  )
}

function ATVRear({ className }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="38" y="44" width="84" height="66" rx="4" fill={BODY} />
      <rect x="48" y="52" width="64" height="26" rx="3" fill={BODY} stroke="#2d5080" strokeWidth="1" />
      <rect x="46" y="100" width="22" height="10" rx="2" fill={TAIL} />
      <rect x="92" y="100" width="22" height="10" rx="2" fill={TAIL} />
      <Wheel cx={36} cy={138} r={26} />
      <Wheel cx={124} cy={138} r={26} />
    </svg>
  )
}

function ATVTop({ className }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="50" y="10" width="220" height="140" rx="10" fill={BODY} />
      <rect x="90" y="20" width="140" height="120" rx="6" fill="#162d4a" />
      <line x1="50" y1="80" x2="160" y2="80" stroke="#2d5080" strokeWidth="60" strokeLinecap="round" opacity="0.3" />
    </svg>
  )
}

function ATVInterior({ className }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="50" y="10" width="220" height="140" rx="8" fill="#162d4a" />
      <rect x="80" y="20" width="160" height="60" rx="4" fill={BODY} />
      <rect x="80" y="96" width="160" height="40" rx="4" fill="#1e3a5f" />
      <circle cx="140" cy="116" r="16" stroke="#4a7ab5" strokeWidth="3" fill="none" />
    </svg>
  )
}

export default function ATVSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <ATVFront className={className} />
  if (view === 'rear') return <ATVRear className={className} />
  if (view === 'top') return <ATVTop className={className} />
  if (view === 'interior') return <ATVInterior className={className} />
  return <ATVSide mirror={view === 'left'} />
}
