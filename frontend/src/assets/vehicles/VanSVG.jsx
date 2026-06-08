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
      <circle cx={cx} cy={cy} r={r * 0.56} fill={RIM} />
      <circle cx={cx} cy={cy} r={r * 0.2} fill={HUB} />
    </>
  )
}

function VanSide({ mirror }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={mirror ? { transform: 'scaleX(-1)', display: 'block' } : { display: 'block' }}>
      <Wheel cx={68} cy={128} r={22} />
      <Wheel cx={252} cy={128} r={22} />

      {/* Van body — tall boxy, nearly vertical front, long */}
      <path
        d="
          M 38 106
          L 38 56
          C 39 50 44 46 54 46
          L 268 46
          C 274 46 278 50 278 56
          L 278 106
          Q 252 86 230 106
          L 90 106
          Q 68 86 46 106
          Z
        "
        fill={BODY}
      />

      {/* Windshield — slight slope on a van */}
      <path d="M 40 80 L 42 56 L 80 56 L 80 80 Z" fill={GLASS} opacity="0.85" />
      {/* Side windows x3 */}
      <rect x="96" y="56" width="44" height="32" rx="2" fill={GLASS} opacity="0.75" />
      <rect x="148" y="56" width="44" height="32" rx="2" fill={GLASS} opacity="0.75" />
      <rect x="200" y="56" width="44" height="32" rx="2" fill={GLASS} opacity="0.75" />

      {/* Headlight */}
      <rect x="38" y="72" width="8" height="12" rx="1" fill={HEAD} />
      {/* Taillight */}
      <rect x="272" y="64" width="7" height="24" rx="1" fill={TAIL} />
      {/* Roof rack */}
      <rect x="80" y="44" width="184" height="4" rx="1" fill="#2d5080" />
      {/* Sliding door handle line */}
      <line x1="246" y1="78" x2="246" y2="90" stroke="#2d5080" strokeWidth="2" />
    </svg>
  )
}

function VanFront({ className }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="12" y="20" width="136" height="100" rx="6" fill={BODY} />
      <rect x="18" y="28" width="54" height="40" rx="3" fill={GLASS} opacity="0.8" />
      <rect x="88" y="28" width="54" height="40" rx="3" fill={GLASS} opacity="0.8" />
      <rect x="14" y="100" width="26" height="13" rx="2" fill={HEAD} />
      <rect x="120" y="100" width="26" height="13" rx="2" fill={HEAD} />
      <Wheel cx={36} cy={138} r={20} />
      <Wheel cx={124} cy={138} r={20} />
    </svg>
  )
}

function VanRear({ className }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="12" y="20" width="136" height="100" rx="6" fill={BODY} />
      <rect x="40" y="28" width="80" height="60" rx="3" fill={GLASS} opacity="0.6" />
      <rect x="14" y="102" width="24" height="12" rx="2" fill={TAIL} />
      <rect x="122" y="102" width="24" height="12" rx="2" fill={TAIL} />
      <Wheel cx={36} cy={138} r={20} />
      <Wheel cx={124} cy={138} r={20} />
    </svg>
  )
}

function VanTop({ className }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="38" y="10" width="244" height="140" rx="8" fill={BODY} />
      <rect x="48" y="20" width="50" height="120" rx="4" fill={GLASS} opacity="0.7" />
      <rect x="110" y="20" width="44" height="120" rx="4" fill={GLASS} opacity="0.6" />
      <rect x="166" y="20" width="44" height="120" rx="4" fill={GLASS} opacity="0.6" />
      <rect x="222" y="20" width="44" height="120" rx="4" fill={GLASS} opacity="0.6" />
    </svg>
  )
}

function VanInterior({ className }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="20" y="10" width="280" height="140" rx="8" fill="#162d4a" />
      <rect x="40" y="18" width="240" height="70" rx="4" fill={GLASS} opacity="0.5" />
      <rect x="40" y="96" width="240" height="44" rx="4" fill="#1e3a5f" stroke="#2d5080" strokeWidth="1" />
      <circle cx="80" cy="120" r="18" stroke="#4a7ab5" strokeWidth="3" fill="none" />
    </svg>
  )
}

export default function VanSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <VanFront className={className} />
  if (view === 'rear') return <VanRear className={className} />
  if (view === 'top') return <VanTop className={className} />
  if (view === 'interior') return <VanInterior className={className} />
  return <VanSide mirror={view === 'left'} />
}
