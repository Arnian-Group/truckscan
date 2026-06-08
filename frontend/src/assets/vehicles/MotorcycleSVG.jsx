const BODY = '#1e3a5f'
const GLASS = '#0d2340'
const TIRE = '#111'
const RIM = '#4a4a4a'
const HUB = '#888'
const HEAD = '#fbbf24'
const TAIL = '#ef4444'

function Wheel({ cx, cy, r = 28 }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill={TIRE} />
      <circle cx={cx} cy={cy} r={r * 0.55} fill={RIM} />
      <circle cx={cx} cy={cy} r={r * 0.2} fill={HUB} />
    </>
  )
}

function MotoSide({ mirror }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={mirror ? { transform: 'scaleX(-1)', display: 'block' } : { display: 'block' }}>
      <Wheel cx={76} cy={124} r={28} />
      <Wheel cx={244} cy={124} r={28} />

      {/* Front fork — angled forward ~20° from vertical */}
      <line x1="76" y1="96" x2="94" y2="56" stroke="#2d5080" strokeWidth="6" strokeLinecap="round" />
      <line x1="84" y1="96" x2="100" y2="58" stroke="#2d5080" strokeWidth="4" strokeLinecap="round" />

      {/* Handlebars */}
      <line x1="96" y1="56" x2="78" y2="52" stroke="#4a7ab5" strokeWidth="4" strokeLinecap="round" />
      <line x1="96" y1="56" x2="114" y2="54" stroke="#4a7ab5" strokeWidth="4" strokeLinecap="round" />

      {/* Main body — fuel tank hump + fairing */}
      <path
        d="
          M 94 58
          C 100 50 114 46 130 46
          L 162 46
          C 174 46 182 50 186 56
          L 192 68
          C 196 76 194 86 188 90
          L 168 96
          L 120 96
          C 108 96 100 90 96 82
          Z
        "
        fill={BODY}
      />

      {/* Seat — curves back from tank to tail */}
      <path
        d="
          M 162 46
          L 214 52
          L 230 64
          C 236 70 234 80 228 84
          L 210 90
          L 188 90
          L 192 68
          L 186 56
          Z
        "
        fill="#162d4a"
      />

      {/* Tail fairing */}
      <path
        d="
          M 214 52
          L 248 68
          L 244 84
          L 228 84
          L 230 64
          Z
        "
        fill={BODY}
      />

      {/* Engine block */}
      <rect x="118" y="84" width="50" height="28" rx="3" fill="#162d4a" stroke="#2d5080" strokeWidth="1.5" />

      {/* Exhaust */}
      <path d="M 168 104 Q 200 108 230 110 L 232 116 Q 200 114 168 110 Z" fill="#2d5080" />

      {/* Chain / lower frame */}
      <line x1="100" y1="104" x2="244" y2="116" stroke="#2d5080" strokeWidth="2" />

      {/* Windscreen */}
      <path d="M 96 58 L 102 48 L 120 46 L 118 56 Z" fill={GLASS} opacity="0.7" />

      {/* Headlight */}
      <ellipse cx="80" cy="86" rx="9" ry="7" fill={HEAD} />
      {/* Taillight */}
      <rect x="242" y="76" width="8" height="8" rx="1" fill={TAIL} />

      {/* Foot peg */}
      <line x1="150" y1="112" x2="165" y2="112" stroke="#4a7ab5" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function MotoFront({ className }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="55" y="30" width="50" height="80" rx="6" fill={BODY} />
      <ellipse cx="80" cy="66" rx="18" ry="22" fill={BODY} />
      <ellipse cx="80" cy="64" rx="12" ry="12" fill={HEAD} />
      <line x1="48" y1="54" x2="112" y2="54" stroke="#4a7ab5" strokeWidth="4" strokeLinecap="round" />
      <Wheel cx={80} cy={138} r={24} />
    </svg>
  )
}

function MotoRear({ className }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="55" y="30" width="50" height="80" rx="6" fill={BODY} />
      <rect x="62" y="98" width="36" height="8" rx="2" fill={TAIL} />
      <Wheel cx={80} cy={138} r={24} />
    </svg>
  )
}

function MotoTop({ className }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="160" cy="80" rx="130" ry="28" fill={BODY} />
      <rect x="120" y="56" width="80" height="48" rx="8" fill="#162d4a" />
    </svg>
  )
}

function MotoInterior({ className }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="60" y="20" width="200" height="120" rx="8" fill="#162d4a" />
      <rect x="80" y="30" width="160" height="60" rx="4" fill={BODY} />
      <circle cx="160" cy="120" r="22" stroke="#4a7ab5" strokeWidth="3" fill="none" />
    </svg>
  )
}

export default function MotorcycleSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <MotoFront className={className} />
  if (view === 'rear') return <MotoRear className={className} />
  if (view === 'top') return <MotoTop className={className} />
  if (view === 'interior') return <MotoInterior className={className} />
  return <MotoSide mirror={view === 'left'} />
}
