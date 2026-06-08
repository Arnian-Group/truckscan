export default function GolfCartSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <GolfFront className={className} />
  if (view === 'rear') return <GolfRear className={className} />
  if (view === 'top') return <GolfTop className={className} />
  if (view === 'interior') return <GolfInterior className={className} />
  const mirror = view === 'left'
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      style={mirror ? { transform: 'scaleX(-1)' } : {}}>
      <ellipse cx="170" cy="152" rx="130" ry="7" fill="rgba(0,0,0,0.4)"/>
      {/* Rear wheel - wider golf cart tire */}
      <circle cx="248" cy="126" r="26" fill="#111827"/>
      <circle cx="248" cy="126" r="20" fill="#1f2937"/>
      <circle cx="248" cy="126" r="14" fill="#374151"/>
      <circle cx="248" cy="126" r="9" fill="#4b5563"/>
      <line x1="248" y1="112" x2="248" y2="140" stroke="#9ca3af" strokeWidth="2" opacity="0.7"/>
      <line x1="234" y1="126" x2="262" y2="126" stroke="#9ca3af" strokeWidth="2" opacity="0.7"/>
      <line x1="238" y1="116" x2="258" y2="136" stroke="#9ca3af" strokeWidth="1.5" opacity="0.5"/>
      <line x1="258" y1="116" x2="238" y2="136" stroke="#9ca3af" strokeWidth="1.5" opacity="0.5"/>
      <circle cx="248" cy="126" r="4" fill="#d1d5db"/>
      {/* Front wheel */}
      <circle cx="92" cy="126" r="26" fill="#111827"/>
      <circle cx="92" cy="126" r="20" fill="#1f2937"/>
      <circle cx="92" cy="126" r="14" fill="#374151"/>
      <circle cx="92" cy="126" r="9" fill="#4b5563"/>
      <line x1="92" y1="112" x2="92" y2="140" stroke="#9ca3af" strokeWidth="2" opacity="0.7"/>
      <line x1="78" y1="126" x2="106" y2="126" stroke="#9ca3af" strokeWidth="2" opacity="0.7"/>
      <line x1="82" y1="116" x2="102" y2="136" stroke="#9ca3af" strokeWidth="1.5" opacity="0.5"/>
      <line x1="102" y1="116" x2="82" y2="136" stroke="#9ca3af" strokeWidth="1.5" opacity="0.5"/>
      <circle cx="92" cy="126" r="4" fill="#d1d5db"/>
      {/* Fender arches */}
      <path d="M 66 112 Q 92 95 118 112" fill="none" stroke="#162b46" strokeWidth="3"/>
      <path d="M 222 112 Q 248 95 274 112" fill="none" stroke="#162b46" strokeWidth="3"/>
      {/* Frame / chassis */}
      <rect x="80" y="104" width="184" height="10" rx="3" fill="#1a2d4a" stroke="#2d4a78" strokeWidth="1"/>
      {/* Rear cargo / bench area */}
      <path d="M 180 66 L 272 66 L 272 112 L 180 112 Z" fill="#1e3558" stroke="#2d4a78" strokeWidth="1"/>
      {/* Rear seat back */}
      <rect x="180" y="54" width="10" height="56" rx="2" fill="#243b5e" stroke="#2d4a78" strokeWidth="1"/>
      {/* Seat cushion */}
      <path d="M 188 90 L 270 90 L 270 112 L 188 112 Z" fill="#162b46"/>
      <path d="M 188 78 L 270 78 L 270 90 L 188 90 Z" fill="#1e3558"/>
      {/* Canopy support posts */}
      <rect x="108" y="38" width="5" height="68" rx="2" fill="#2d4a78"/>
      <rect x="256" y="38" width="5" height="68" rx="2" fill="#2d4a78"/>
      {/* Canopy roof */}
      <path d="M 100 38 L 268 38 L 272 44 L 104 44 Z" fill="#243b5e" stroke="#2d4a78" strokeWidth="1.5"/>
      <path d="M 100 38 L 268 38 L 268 42 L 100 42 Z" fill="#1e3558"/>
      {/* Front windshield / dash area */}
      <path d="M 70 106 L 70 80 C 70 72 76 64 86 62 L 110 54 L 112 106 Z" fill="#1e3558"/>
      {/* Windshield frame */}
      <path d="M 86 62 L 110 54 L 112 96 L 110 96 L 110 60 L 88 66 Z" fill="#0d2340" opacity="0.7"/>
      {/* Dashboard */}
      <path d="M 72 96 L 112 96 L 112 106 L 72 106 Z" fill="#162b46"/>
      <rect x="80" y="98" width="24" height="6" rx="2" fill="#111827" stroke="#243b5e" strokeWidth="0.5"/>
      <circle cx="90" cy="101" r="2" fill="#F5A623"/>
      {/* Steering column */}
      <rect x="86" y="96" width="4" height="16" rx="1" fill="#374151"/>
      <circle cx="88" cy="112" r="8" fill="none" stroke="#4b5563" strokeWidth="3"/>
      <line x1="80" y1="112" x2="88" y2="104" stroke="#4b5563" strokeWidth="2"/>
      <line x1="96" y1="112" x2="88" y2="104" stroke="#4b5563" strokeWidth="2"/>
      {/* Headlight */}
      <path d="M 62 88 L 62 100 L 72 100 L 72 88 Z" fill="#fbbf24" opacity="0.85"/>
      <path d="M 63 89 L 63 98 L 70 98 L 70 89 Z" fill="#fef3c7" opacity="0.6"/>
      {/* Tail/brake light */}
      <rect x="270" y="70" width="8" height="18" rx="2" fill="#ef4444" opacity="0.85"/>
      {/* Windshield support bar */}
      <line x1="108" y1="44" x2="108" y2="96" stroke="#374151" strokeWidth="2"/>
      {/* Bag holder / luggage rack hint */}
      <rect x="188" y="66" width="76" height="12" rx="2" fill="#111c2e" stroke="#2d4a78" strokeWidth="0.5"/>
      {/* Golf bag outline */}
      <path d="M 200 66 L 210 50 L 225 48 L 230 66 Z" fill="#1a2d4a" stroke="#2d4a78" strokeWidth="0.5" opacity="0.6"/>
    </svg>
  )
}

function GolfFront({ className }) {
  return (
    <svg viewBox="0 0 240 170" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="120" cy="165" rx="100" ry="6" fill="rgba(0,0,0,0.4)"/>
      <circle cx="28" cy="128" r="24" fill="#111827"/><circle cx="28" cy="128" r="18" fill="#1f2937"/><circle cx="28" cy="128" r="12" fill="#374151"/><circle cx="28" cy="128" r="7" fill="#4b5563"/><circle cx="28" cy="128" r="3" fill="#9ca3af"/>
      <circle cx="212" cy="128" r="24" fill="#111827"/><circle cx="212" cy="128" r="18" fill="#1f2937"/><circle cx="212" cy="128" r="12" fill="#374151"/><circle cx="212" cy="128" r="7" fill="#4b5563"/><circle cx="212" cy="128" r="3" fill="#9ca3af"/>
      {/* Canopy */}
      <rect x="30" y="24" width="180" height="14" rx="4" fill="#243b5e" stroke="#2d4a78" strokeWidth="1.5"/>
      {/* Canopy posts */}
      <rect x="36" y="24" width="6" height="80" rx="2" fill="#374151"/>
      <rect x="198" y="24" width="6" height="80" rx="2" fill="#374151"/>
      {/* Open body */}
      <path d="M 42 104 L 42 68 L 198 68 L 198 104 Z" fill="#1e3558" stroke="#2d4a78" strokeWidth="1"/>
      {/* Dash */}
      <path d="M 42 104 L 42 90 C 52 84 80 82 120 82 C 160 82 188 84 198 90 L 198 104 Z" fill="#162b46"/>
      {/* Steering */}
      <circle cx="120" cy="100" r="18" fill="none" stroke="#374151" strokeWidth="4"/>
      <circle cx="120" cy="100" r="6" fill="#1e2535" stroke="#4b5563" strokeWidth="2"/>
      <line x1="120" y1="82" x2="120" y2="94" stroke="#374151" strokeWidth="3"/>
      <line x1="102" y1="100" x2="114" y2="100" stroke="#374151" strokeWidth="3"/>
      <line x1="126" y1="100" x2="138" y2="100" stroke="#374151" strokeWidth="3"/>
      {/* Headlights */}
      <rect x="48" y="106" width="36" height="16" rx="3" fill="#fbbf24" opacity="0.85"/>
      <rect x="156" y="106" width="36" height="16" rx="3" fill="#fbbf24" opacity="0.85"/>
      {/* Bumper */}
      <rect x="34" y="122" width="172" height="12" rx="3" fill="#1a2d4a" stroke="#2d4a78" strokeWidth="1"/>
    </svg>
  )
}

function GolfRear({ className }) {
  return (
    <svg viewBox="0 0 240 170" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="120" cy="165" rx="100" ry="6" fill="rgba(0,0,0,0.4)"/>
      <circle cx="28" cy="128" r="24" fill="#111827"/><circle cx="28" cy="128" r="18" fill="#1f2937"/><circle cx="28" cy="128" r="12" fill="#374151"/><circle cx="28" cy="128" r="7" fill="#4b5563"/><circle cx="28" cy="128" r="3" fill="#9ca3af"/>
      <circle cx="212" cy="128" r="24" fill="#111827"/><circle cx="212" cy="128" r="18" fill="#1f2937"/><circle cx="212" cy="128" r="12" fill="#374151"/><circle cx="212" cy="128" r="7" fill="#4b5563"/><circle cx="212" cy="128" r="3" fill="#9ca3af"/>
      <rect x="30" y="24" width="180" height="14" rx="4" fill="#243b5e" stroke="#2d4a78" strokeWidth="1.5"/>
      <rect x="36" y="24" width="6" height="80" rx="2" fill="#374151"/>
      <rect x="198" y="24" width="6" height="80" rx="2" fill="#374151"/>
      {/* Rear bench seat */}
      <rect x="42" y="68" width="156" height="36" rx="3" fill="#1e3558" stroke="#2d4a78" strokeWidth="1"/>
      <rect x="46" y="72" width="148" height="16" rx="2" fill="#162b46"/>
      <rect x="46" y="88" width="148" height="14" rx="2" fill="#243b5e"/>
      {/* Rear body / bumper */}
      <rect x="42" y="104" width="156" height="20" rx="3" fill="#162b46" stroke="#2d4a78" strokeWidth="1"/>
      {/* Taillights */}
      <rect x="42" y="104" width="24" height="14" rx="2" fill="#ef4444" opacity="0.85"/>
      <rect x="174" y="104" width="24" height="14" rx="2" fill="#ef4444" opacity="0.85"/>
      {/* Bumper */}
      <rect x="36" y="122" width="168" height="12" rx="3" fill="#1a2d4a" stroke="#2d4a78" strokeWidth="1"/>
    </svg>
  )
}

function GolfTop({ className }) {
  return (
    <svg viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Canopy (top view) */}
      <rect x="24" y="14" width="152" height="88" rx="6" fill="#243b5e" stroke="#2d4a78" strokeWidth="1.5"/>
      {/* Seat area */}
      <rect x="28" y="106" width="144" height="60" rx="4" fill="#1e3558" stroke="#2d4a78" strokeWidth="1"/>
      <line x1="100" y1="106" x2="100" y2="166" stroke="#162b46" strokeWidth="1.5"/>
      {/* Rear cargo */}
      <rect x="28" y="170" width="144" height="80" rx="4" fill="#162b46" stroke="#2d4a78" strokeWidth="1"/>
      {/* Chassis */}
      <rect x="20" y="100" width="160" height="10" rx="2" fill="#1a2d4a"/>
      <rect x="20" y="164" width="160" height="10" rx="2" fill="#1a2d4a"/>
      {/* Headlights */}
      <rect x="28" y="14" width="36" height="14" rx="2" fill="#fbbf24" opacity="0.6"/>
      <rect x="136" y="14" width="36" height="14" rx="2" fill="#fbbf24" opacity="0.6"/>
      {/* Taillights */}
      <rect x="28" y="246" width="36" height="14" rx="2" fill="#ef4444" opacity="0.6"/>
      <rect x="136" y="246" width="36" height="14" rx="2" fill="#ef4444" opacity="0.6"/>
      {/* Wheels */}
      <ellipse cx="24" cy="76" rx="10" ry="20" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="176" cy="76" rx="10" ry="20" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="24" cy="220" rx="10" ry="20" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="176" cy="220" rx="10" ry="20" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      {/* Steering wheel (top) */}
      <circle cx="100" cy="130" r="16" fill="none" stroke="#374151" strokeWidth="3"/>
      <circle cx="100" cy="130" r="5" fill="#1e2535"/>
    </svg>
  )
}

function GolfInterior({ className }) {
  return (
    <svg viewBox="0 0 280 190" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="0" y="0" width="280" height="190" rx="8" fill="#0a1220"/>
      {/* Open canopy - sky/course view */}
      <path d="M 0 0 L 280 0 L 280 60 L 0 60 Z" fill="#0d2340"/>
      <path d="M 20 5 L 260 5 L 258 52 L 22 52 Z" fill="rgba(100,200,255,0.04)"/>
      {/* Canopy frame */}
      <rect x="0" y="60" width="280" height="8" fill="#243b5e"/>
      <rect x="0" y="56" width="16" height="60" rx="4" fill="#374151"/>
      <rect x="264" y="56" width="16" height="60" rx="4" fill="#374151"/>
      {/* Dashboard */}
      <path d="M 16 68 L 264 68 Q 280 70 280 88 L 280 110 L 0 110 L 0 88 Q 0 70 16 68 Z" fill="#1e2535"/>
      {/* Instrument panel */}
      <rect x="70" y="72" width="140" height="32" rx="4" fill="#0f1c2e" stroke="#2d4a78" strokeWidth="1"/>
      <circle cx="105" cy="88" r="12" fill="#111827" stroke="#374151" strokeWidth="1"/>
      <circle cx="140" cy="88" r="8" fill="#111827" stroke="#374151" strokeWidth="1"/>
      <circle cx="175" cy="88" r="12" fill="#111827" stroke="#374151" strokeWidth="1"/>
      <line x1="105" y1="88" x2="108" y2="78" stroke="#F5A623" strokeWidth="1.5"/>
      {/* Steering wheel */}
      <circle cx="90" cy="145" r="28" fill="none" stroke="#374151" strokeWidth="5"/>
      <circle cx="90" cy="145" r="9" fill="#1e2535" stroke="#4b5563" strokeWidth="2"/>
      <line x1="90" y1="117" x2="90" y2="136" stroke="#374151" strokeWidth="4"/>
      <line x1="62" y1="145" x2="81" y2="145" stroke="#374151" strokeWidth="4"/>
      <line x1="99" y1="145" x2="118" y2="145" stroke="#374151" strokeWidth="4"/>
      {/* Bench seat */}
      <path d="M 0 110 L 280 110 L 280 190 L 0 190 Z" fill="#1a2535"/>
      <line x1="0" y1="130" x2="280" y2="130" stroke="#243b5e" strokeWidth="1.5" opacity="0.6"/>
      <line x1="140" y1="110" x2="140" y2="190" stroke="#243b5e" strokeWidth="1.5" opacity="0.4"/>
    </svg>
  )
}
