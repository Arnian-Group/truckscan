const BODY = '#1e3a5f'
const CAGE = '#374151'
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

function RacerSide({ mirror }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={mirror ? { transform: 'scaleX(-1)', display: 'block' } : { display: 'block' }}>
      <Wheel cx={74} cy={120} r={32} />
      <Wheel cx={246} cy={120} r={32} />

      {/* Low body tub */}
      <path
        d="
          M 46 108
          L 46 96
          L 274 96
          L 274 108
          Q 246 88 218 108
          L 102 108
          Q 74 88 46 108
          Z
        "
        fill={BODY}
      />

      {/* Nose cone */}
      <path d="M 46 96 L 46 80 C 50 72 60 68 78 68 L 108 80 L 108 96 Z" fill={BODY} />

      {/* Rear section */}
      <path d="M 210 96 L 210 76 L 274 80 L 274 96 Z" fill={BODY} />

      {/* Driver cockpit */}
      <rect x="108" y="68" width="102" height="28" rx="2" fill="#162d4a" />
      <rect x="112" y="72" width="94" height="20" rx="2" fill="#192f50" />

      {/* Roll cage */}
      {/* Main hoop */}
      <line x1="116" y1="96" x2="110" y2="38" stroke={CAGE} strokeWidth="4" strokeLinecap="round" />
      <line x1="204" y1="96" x2="210" y2="38" stroke={CAGE} strokeWidth="4" strokeLinecap="round" />
      <line x1="110" y1="38" x2="210" y2="38" stroke={CAGE} strokeWidth="4" strokeLinecap="round" />
      {/* Front cage bars to nose */}
      <line x1="110" y1="38" x2="78" y2="68" stroke={CAGE} strokeWidth="3" strokeLinecap="round" />
      {/* Rear cage bars */}
      <line x1="210" y1="38" x2="246" y2="74" stroke={CAGE} strokeWidth="3" strokeLinecap="round" />
      {/* Diagonal brace */}
      <line x1="116" y1="96" x2="210" y2="38" stroke={CAGE} strokeWidth="2" opacity="0.5" strokeLinecap="round" />

      {/* Rear wing/spoiler */}
      <rect x="218" y="28" width="52" height="6" rx="2" fill={BODY} />
      <line x1="226" y1="34" x2="222" y2="50" stroke={BODY} strokeWidth="3" />
      <line x1="260" y1="34" x2="256" y2="50" stroke={BODY} strokeWidth="3" />

      {/* Front suspension arm */}
      <line x1="74" y1="104" x2="106" y2="94" stroke="#2d5080" strokeWidth="2" strokeLinecap="round" />
      {/* Rear suspension arm */}
      <line x1="246" y1="104" x2="212" y2="94" stroke="#2d5080" strokeWidth="2" strokeLinecap="round" />

      {/* Headlight */}
      <rect x="46" y="82" width="10" height="10" rx="1" fill={HEAD} />
      {/* Taillight */}
      <rect x="266" y="82" width="8" height="10" rx="1" fill={TAIL} />
      {/* Skid plate */}
      <rect x="76" y="108" width="168" height="5" rx="2" fill="#2a4060" />
    </svg>
  )
}

function RacerFront({ className }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="20" y="58" width="120" height="72" rx="4" fill={BODY} />
      <line x1="28" y1="130" x2="22" y2="24" stroke={CAGE} strokeWidth="5" />
      <line x1="132" y1="130" x2="138" y2="24" stroke={CAGE} strokeWidth="5" />
      <line x1="22" y1="24" x2="138" y2="24" stroke={CAGE} strokeWidth="5" />
      <rect x="30" y="66" width="44" height="28" rx="3" fill={BODY} stroke={CAGE} strokeWidth="2" />
      <rect x="86" y="66" width="44" height="28" rx="3" fill={BODY} stroke={CAGE} strokeWidth="2" />
      <rect x="18" y="102" width="22" height="12" rx="2" fill={HEAD} />
      <rect x="120" y="102" width="22" height="12" rx="2" fill={HEAD} />
      <Wheel cx={34} cy={140} r={26} />
      <Wheel cx={126} cy={140} r={26} />
    </svg>
  )
}

function RacerRear({ className }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="20" y="58" width="120" height="72" rx="4" fill={BODY} />
      <line x1="28" y1="130" x2="22" y2="24" stroke={CAGE} strokeWidth="5" />
      <line x1="132" y1="130" x2="138" y2="24" stroke={CAGE} strokeWidth="5" />
      <line x1="22" y1="24" x2="138" y2="24" stroke={CAGE} strokeWidth="5" />
      <rect x="10" y="8" width="140" height="18" rx="3" fill={BODY} />
      <rect x="20" y="104" width="22" height="12" rx="2" fill={TAIL} />
      <rect x="118" y="104" width="22" height="12" rx="2" fill={TAIL} />
      <Wheel cx={34} cy={140} r={26} />
      <Wheel cx={126} cy={140} r={26} />
    </svg>
  )
}

function RacerTop({ className }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="44" y="14" width="232" height="132" rx="8" fill={BODY} />
      <rect x="108" y="22" width="104" height="116" rx="4" fill="#162d4a" stroke={CAGE} strokeWidth="2" />
      <rect x="230" y="6" width="60" height="8" rx="3" fill={BODY} />
    </svg>
  )
}

function RacerInterior({ className }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="20" y="10" width="280" height="140" rx="8" fill="#162d4a" />
      <rect x="40" y="18" width="240" height="80" rx="4" fill={BODY} />
      <line x1="40" y1="18" x2="280" y2="98" stroke={CAGE} strokeWidth="3" opacity="0.5" />
      <line x1="280" y1="18" x2="40" y2="98" stroke={CAGE} strokeWidth="3" opacity="0.5" />
      <circle cx="160" cy="130" r="20" stroke="#4a7ab5" strokeWidth="3" fill="none" />
    </svg>
  )
}

export default function RacerSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <RacerFront className={className} />
  if (view === 'rear') return <RacerRear className={className} />
  if (view === 'top') return <RacerTop className={className} />
  if (view === 'interior') return <RacerInterior className={className} />
  return <RacerSide mirror={view === 'left'} />
}
