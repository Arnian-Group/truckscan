const BODY = '#1e3a5f'
const GLASS = '#0d2340'
const TIRE = '#111'
const RIM = '#4a4a4a'
const HUB = '#888'
const HEAD = '#fbbf24'
const TAIL = '#ef4444'

function Wheel({ cx, cy, r = 26 }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill={TIRE} />
      <circle cx={cx} cy={cy} r={r * 0.55} fill={RIM} />
      <circle cx={cx} cy={cy} r={r * 0.2} fill={HUB} />
    </>
  )
}

function PickupSide({ mirror }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={mirror ? { transform: 'scaleX(-1)', display: 'block' } : { display: 'block' }}>
      <Wheel cx={78} cy={124} r={26} />
      <Wheel cx={248} cy={124} r={26} />

      {/* Cab — tall boxy with steep windshield */}
      <path
        d="
          M 40 106
          L 40 95
          C 43 89 50 85 60 83
          L 82 81
          C 90 79 96 73 100 65
          L 109 46
          L 162 46
          L 162 98
          Q 148 80 110 98
          Q 78 80 42 98
          Z
        "
        fill={BODY}
      />

      {/* Bed — horizontal flat with open top */}
      <path
        d="
          M 162 46
          L 278 46
          L 278 98
          Q 248 80 222 98
          L 162 98
          Z
        "
        fill="#192f50"
      />

      {/* Cab windshield */}
      <path d="M 102 65 L 111 46 L 148 46 L 148 65 Z" fill={GLASS} opacity="0.85" />
      {/* Cab side window */}
      <path d="M 152 46 L 161 46 L 161 64 L 152 64 Z" fill={GLASS} opacity="0.75" />

      {/* Bed top rail */}
      <line x1="162" y1="46" x2="278" y2="46" stroke="#2d5080" strokeWidth="2.5" />
      {/* Bed floor line */}
      <line x1="164" y1="88" x2="276" y2="88" stroke="#2d5080" strokeWidth="1.5" />

      {/* Headlight */}
      <rect x="40" y="87" width="8" height="13" rx="1" fill={HEAD} />
      {/* Taillight */}
      <rect x="272" y="58" width="7" height="22" rx="1" fill={TAIL} />
      {/* Mirror */}
      <path d="M 102 60 L 110 57 L 111 63 L 103 65 Z" fill="#2d4e7a" />
      {/* Step bar */}
      <rect x="100" y="100" width="62" height="4" rx="1" fill="#2d5080" />
    </svg>
  )
}

function PickupFront({ className }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="14" y="28" width="132" height="92" rx="4" fill={BODY} />
      <rect x="22" y="36" width="48" height="32" rx="3" fill={GLASS} opacity="0.8" />
      <rect x="90" y="36" width="48" height="32" rx="3" fill={GLASS} opacity="0.8" />
      <rect x="16" y="97" width="28" height="14" rx="2" fill={HEAD} />
      <rect x="116" y="97" width="28" height="14" rx="2" fill={HEAD} />
      <Wheel cx={36} cy={138} r={22} />
      <Wheel cx={124} cy={138} r={22} />
    </svg>
  )
}

function PickupRear({ className }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="14" y="28" width="132" height="92" rx="4" fill={BODY} />
      <rect x="38" y="36" width="84" height="52" rx="3" fill={GLASS} opacity="0.6" />
      <rect x="16" y="99" width="26" height="12" rx="2" fill={TAIL} />
      <rect x="118" y="99" width="26" height="12" rx="2" fill={TAIL} />
      <Wheel cx={36} cy={138} r={22} />
      <Wheel cx={124} cy={138} r={22} />
    </svg>
  )
}

function PickupTop({ className }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="40" y="10" width="118" height="140" rx="10" fill={BODY} />
      <rect x="158" y="10" width="122" height="140" rx="4" fill="#162d4a" stroke="#2d5080" strokeWidth="2" />
      <rect x="58" y="18" width="82" height="58" rx="4" fill={GLASS} opacity="0.7" />
      <rect x="58" y="84" width="82" height="56" rx="4" fill={GLASS} opacity="0.7" />
    </svg>
  )
}

function PickupInterior({ className }) {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="20" y="10" width="280" height="140" rx="8" fill="#162d4a" />
      <rect x="40" y="18" width="240" height="80" rx="4" fill={GLASS} opacity="0.5" />
      <rect x="120" y="108" width="80" height="30" rx="4" fill="#2a4a70" />
      <circle cx="90" cy="128" r="20" stroke="#4a7ab5" strokeWidth="3" fill="none" />
      <circle cx="230" cy="128" r="20" stroke="#4a7ab5" strokeWidth="3" fill="none" />
    </svg>
  )
}

export default function PickupSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <PickupFront className={className} />
  if (view === 'rear') return <PickupRear className={className} />
  if (view === 'top') return <PickupTop className={className} />
  if (view === 'interior') return <PickupInterior className={className} />
  return <PickupSide mirror={view === 'left'} />
}
