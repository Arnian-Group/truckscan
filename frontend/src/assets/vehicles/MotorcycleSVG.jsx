export default function MotorcycleSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <MotoFront className={className} />
  if (view === 'rear') return <MotoRear className={className} />
  if (view === 'top') return <MotoTop className={className} />
  if (view === 'interior') return <MotoInterior className={className} />
  const mirror = view === 'left'
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      style={mirror ? { transform: 'scaleX(-1)' } : {}}>
      <ellipse cx="170" cy="152" rx="130" ry="7" fill="rgba(0,0,0,0.45)"/>
      {/* Rear wheel - larger */}
      <circle cx="236" cy="118" r="34" fill="#111827"/>
      <circle cx="236" cy="118" r="27" fill="#1f2937"/>
      <circle cx="236" cy="118" r="20" fill="#374151"/>
      <circle cx="236" cy="118" r="13" fill="#4b5563"/>
      <line x1="236" y1="98" x2="236" y2="138" stroke="#9ca3af" strokeWidth="2" opacity="0.7"/>
      <line x1="216" y1="118" x2="256" y2="118" stroke="#9ca3af" strokeWidth="2" opacity="0.7"/>
      <line x1="222" y1="104" x2="250" y2="132" stroke="#9ca3af" strokeWidth="1.5" opacity="0.6"/>
      <line x1="250" y1="104" x2="222" y2="132" stroke="#9ca3af" strokeWidth="1.5" opacity="0.6"/>
      <line x1="226" y1="99" x2="246" y2="137" stroke="#9ca3af" strokeWidth="1" opacity="0.4"/>
      <line x1="246" y1="99" x2="226" y2="137" stroke="#9ca3af" strokeWidth="1" opacity="0.4"/>
      <circle cx="236" cy="118" r="5" fill="#d1d5db"/>
      {/* Front wheel */}
      <circle cx="94" cy="118" r="34" fill="#111827"/>
      <circle cx="94" cy="118" r="27" fill="#1f2937"/>
      <circle cx="94" cy="118" r="20" fill="#374151"/>
      <circle cx="94" cy="118" r="13" fill="#4b5563"/>
      <line x1="94" y1="98" x2="94" y2="138" stroke="#9ca3af" strokeWidth="2" opacity="0.7"/>
      <line x1="74" y1="118" x2="114" y2="118" stroke="#9ca3af" strokeWidth="2" opacity="0.7"/>
      <line x1="80" y1="104" x2="108" y2="132" stroke="#9ca3af" strokeWidth="1.5" opacity="0.6"/>
      <line x1="108" y1="104" x2="80" y2="132" stroke="#9ca3af" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="94" cy="118" r="5" fill="#d1d5db"/>
      {/* Front fork */}
      <path d="M 94 84 L 88 108 L 100 108 L 100 84 C 98 78 96 76 94 76 Z" fill="#4b5563"/>
      <path d="M 98 76 L 108 62 L 118 64 L 110 78 Z" fill="#374151"/>
      {/* Triple clamp / handlebar area */}
      <path d="M 106 58 L 134 48 L 138 56 L 112 64 Z" fill="#374151"/>
      {/* Handlebars */}
      <path d="M 122 46 L 148 40 L 150 46 L 124 52 Z" fill="#243b5e" stroke="#374151" strokeWidth="1"/>
      <circle cx="148" cy="43" r="4" fill="#4b5563" stroke="#6b7280" strokeWidth="1"/>
      <circle cx="122" cy="49" r="4" fill="#4b5563"/>
      {/* Fairing / body - sport bike style */}
      <path d="
        M 108 64 C 116 56 126 50 136 48
        L 200 44 C 216 44 228 50 234 60
        L 236 84 L 200 86 L 200 92 L 148 92 L 148 86 L 120 84 L 110 76 Z
      " fill="#243b5e" stroke="#2d4a78" strokeWidth="1.5"/>
      {/* Upper fairing / windscreen area */}
      <path d="M 108 64 C 112 58 118 54 128 52 L 168 48 L 170 62 L 116 70 Z" fill="#1e3558"/>
      {/* Windscreen */}
      <path d="M 116 62 C 120 56 128 52 140 50 L 164 48 L 166 60 L 118 66 Z" fill="#0d2340" opacity="0.8"/>
      {/* Tank - central body mass */}
      <path d="M 148 54 L 200 52 L 210 66 L 210 86 L 148 86 Z" fill="#243b5e"/>
      <path d="M 150 56 L 198 54 L 205 64 L 205 78 L 150 78 Z" fill="#1e3558" opacity="0.5"/>
      {/* Seat */}
      <path d="M 148 86 L 210 86 C 224 86 232 88 234 90 L 234 96 L 148 96 Z" fill="#1a2535" stroke="#243b5e" strokeWidth="1"/>
      {/* Tail / rear section */}
      <path d="M 200 86 L 236 84 L 236 96 L 200 96 Z" fill="#1e3558"/>
      {/* Tail light */}
      <path d="M 230 86 L 238 82 L 242 90 L 236 94 Z" fill="#ef4444" opacity="0.85"/>
      {/* Engine mass */}
      <path d="M 148 86 L 148 110 L 202 110 L 202 86 Z" fill="#162b46" stroke="#243b5e" strokeWidth="1"/>
      <rect x="152" y="90" width="46" height="16" rx="3" fill="#111827" stroke="#1e3558" strokeWidth="0.5"/>
      {/* Engine fins */}
      {[156,162,168,174,180,186,192].map(x => <line key={x} x1={x} y1="90" x2={x} y2="106" stroke="#243b5e" strokeWidth="1"/>)}
      {/* Exhaust pipe */}
      <path d="M 196 102 C 204 104 214 106 224 108 L 234 110 L 236 114 L 222 112 C 212 110 202 108 196 106 Z" fill="#4b5563" stroke="#6b7280" strokeWidth="1"/>
      {/* Exhaust outlet */}
      <ellipse cx="236" cy="112" rx="5" ry="3.5" fill="#1f2937" stroke="#6b7280" strokeWidth="1"/>
      {/* Chain guard */}
      <path d="M 202 106 L 236 106 L 236 112 L 202 112 Z" fill="#1e3558" opacity="0.5"/>
      {/* Headlight */}
      <path d="M 64 104 C 60 98 60 88 64 82 L 76 82 C 82 86 84 92 82 98 C 80 104 74 108 64 104 Z" fill="#fbbf24" opacity="0.85"/>
      <path d="M 66 104 C 62 98 62 88 66 82 L 74 82 C 79 86 80 92 78 98 Z" fill="#fef9c3" opacity="0.5"/>
      {/* Front fender */}
      <path d="M 66 100 C 62 96 60 90 62 84 L 68 80 L 68 84 C 66 88 66 94 68 98 Z" fill="#1e3558"/>
      {/* Rear fender */}
      <path d="M 208 92 C 218 90 228 90 236 88 L 242 88 L 240 96 C 230 96 220 94 210 96 Z" fill="#1e3558"/>
      {/* Front axle */}
      <circle cx="94" cy="118" r="3" fill="#94a3b8"/>
      {/* Rear axle */}
      <circle cx="236" cy="118" r="3" fill="#94a3b8"/>
      {/* Foot peg */}
      <rect x="168" y="108" width="18" height="4" rx="1" fill="#374151"/>
    </svg>
  )
}

function MotoFront({ className }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="100" cy="196" rx="80" ry="5" fill="rgba(0,0,0,0.4)"/>
      {/* Single wheel */}
      <circle cx="100" cy="148" r="40" fill="#111827"/>
      <circle cx="100" cy="148" r="32" fill="#1f2937"/>
      <circle cx="100" cy="148" r="23" fill="#374151"/>
      <circle cx="100" cy="148" r="15" fill="#4b5563"/>
      <line x1="100" y1="125" x2="100" y2="171" stroke="#9ca3af" strokeWidth="2" opacity="0.7"/>
      <line x1="77" y1="148" x2="123" y2="148" stroke="#9ca3af" strokeWidth="2" opacity="0.7"/>
      <line x1="84" y1="131" x2="116" y2="165" stroke="#9ca3af" strokeWidth="1.5" opacity="0.6"/>
      <line x1="116" y1="131" x2="84" y2="165" stroke="#9ca3af" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="100" cy="148" r="6" fill="#d1d5db"/>
      {/* Fork legs */}
      <rect x="83" y="84" width="8" height="68" rx="4" fill="#4b5563"/>
      <rect x="109" y="84" width="8" height="68" rx="4" fill="#4b5563"/>
      {/* Fairing */}
      <path d="M 58 100 C 52 80 60 50 100 32 C 140 50 148 80 142 100 Z" fill="#243b5e" stroke="#2d4a78" strokeWidth="1.5"/>
      {/* Windscreen */}
      <path d="M 66 100 C 62 82 70 58 100 44 C 130 58 138 82 134 100 Z" fill="#0d2340" opacity="0.85"/>
      <path d="M 74 100 C 71 84 76 64 100 52 L 100 100 Z" fill="rgba(100,200,255,0.08)"/>
      {/* Headlight */}
      <ellipse cx="100" cy="100" rx="22" ry="18" fill="#1e3558"/>
      <ellipse cx="100" cy="100" rx="18" ry="14" fill="#fbbf24" opacity="0.9"/>
      <ellipse cx="100" cy="96" rx="14" ry="8" fill="#fef9c3" opacity="0.5"/>
      {/* Mirrors */}
      <path d="M 56 80 L 40 72 L 38 82 L 54 86 Z" fill="#162b46" stroke="#374151" strokeWidth="0.5"/>
      <path d="M 144 80 L 160 72 L 162 82 L 146 86 Z" fill="#162b46" stroke="#374151" strokeWidth="0.5"/>
      {/* Handlebars */}
      <rect x="32" y="82" width="30" height="6" rx="3" fill="#374151"/>
      <rect x="138" y="82" width="30" height="6" rx="3" fill="#374151"/>
      {/* Turn signals */}
      <rect x="52" y="62" width="14" height="8" rx="2" fill="#fbbf24" opacity="0.7"/>
      <rect x="134" y="62" width="14" height="8" rx="2" fill="#fbbf24" opacity="0.7"/>
    </svg>
  )
}

function MotoRear({ className }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="100" cy="196" rx="80" ry="5" fill="rgba(0,0,0,0.4)"/>
      <circle cx="100" cy="148" r="40" fill="#111827"/><circle cx="100" cy="148" r="32" fill="#1f2937"/><circle cx="100" cy="148" r="23" fill="#374151"/><circle cx="100" cy="148" r="15" fill="#4b5563"/>
      <line x1="100" y1="125" x2="100" y2="171" stroke="#9ca3af" strokeWidth="2" opacity="0.7"/>
      <line x1="77" y1="148" x2="123" y2="148" stroke="#9ca3af" strokeWidth="2" opacity="0.7"/>
      <circle cx="100" cy="148" r="6" fill="#d1d5db"/>
      <rect x="86" y="84" width="8" height="68" rx="4" fill="#374151"/>
      <rect x="106" y="84" width="8" height="68" rx="4" fill="#374151"/>
      {/* Tail section */}
      <path d="M 62 100 C 56 80 64 52 100 40 C 136 52 144 80 138 100 Z" fill="#243b5e" stroke="#2d4a78" strokeWidth="1.5"/>
      {/* Tail light - prominent */}
      <path d="M 70 56 L 130 56 L 136 72 L 64 72 Z" fill="#1e3558"/>
      <path d="M 74 58 L 126 58 L 131 70 L 69 70 Z" fill="#ef4444" opacity="0.9"/>
      <path d="M 78 58 L 122 58 L 122 66 L 78 66 Z" fill="#fca5a5" opacity="0.4"/>
      {/* Seat edge */}
      <path d="M 68 78 L 132 78 L 136 86 L 64 86 Z" fill="#1a2535"/>
      {/* License plate */}
      <rect x="78" y="106" width="44" height="22" rx="2" fill="#374151"/>
      <rect x="80" y="108" width="40" height="18" rx="1" fill="#d1d5db" opacity="0.7"/>
      {/* Turn signals */}
      <rect x="62" y="90" width="18" height="10" rx="2" fill="#fbbf24" opacity="0.7"/>
      <rect x="120" y="90" width="18" height="10" rx="2" fill="#fbbf24" opacity="0.7"/>
    </svg>
  )
}

function MotoTop({ className }) {
  return (
    <svg viewBox="0 0 120 320" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Front wheel (top) */}
      <ellipse cx="60" cy="54" rx="26" ry="14" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      {/* Fork */}
      <rect x="50" y="68" width="8" height="38" rx="3" fill="#4b5563"/>
      <rect x="62" y="68" width="8" height="38" rx="3" fill="#4b5563"/>
      {/* Fairing (top view) */}
      <path d="M 32 80 C 28 80 24 90 26 100 L 28 106 L 92 106 L 94 100 C 96 90 92 80 88 80 C 80 76 40 76 32 80 Z" fill="#243b5e" stroke="#2d4a78" strokeWidth="1"/>
      {/* Windscreen */}
      <path d="M 36 84 C 34 86 33 92 34 98 L 36 104 L 84 104 L 86 98 C 87 92 86 86 84 84 C 76 80 44 80 36 84 Z" fill="#0d2340" opacity="0.8"/>
      {/* Handlebars */}
      <rect x="10" y="100" width="30" height="6" rx="3" fill="#374151"/>
      <rect x="80" y="100" width="30" height="6" rx="3" fill="#374151"/>
      {/* Tank (wider middle section) */}
      <path d="M 28 106 L 92 106 L 94 176 L 26 176 Z" fill="#1e3558" stroke="#2d4a78" strokeWidth="1"/>
      {/* Seat */}
      <path d="M 30 176 L 90 176 L 88 236 L 32 236 Z" fill="#1a2535" stroke="#243b5e" strokeWidth="1"/>
      {/* Tail section */}
      <path d="M 36 236 L 84 236 L 80 268 L 40 268 Z" fill="#243b5e" stroke="#2d4a78" strokeWidth="1"/>
      {/* Rear wheel */}
      <ellipse cx="60" cy="286" rx="26" ry="14" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      {/* Exhaust (side) */}
      <path d="M 90 200 L 106 206 L 104 212 L 88 210 Z" fill="#4b5563"/>
      {/* Mirrors */}
      <path d="M 10" y1="102" x2="18" y2="94"/>
      <rect x="2" y="94" width="18" height="10" rx="3" fill="#162b46"/>
      <rect x="100" y="94" width="18" height="10" rx="3" fill="#162b46"/>
    </svg>
  )
}

function MotoInterior({ className }) {
  return (
    <svg viewBox="0 0 280 190" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="0" y="0" width="280" height="190" rx="8" fill="#0a1220"/>
      {/* Windscreen view */}
      <path d="M 20 0 L 260 0 L 240 70 L 40 70 Z" fill="#0d2340"/>
      <path d="M 40 5 L 240 5 L 222 58 L 58 58 Z" fill="rgba(100,200,255,0.06)"/>
      {/* Top fairing / instrument cluster */}
      <path d="M 0 70 L 280 70 Q 280 85 265 90 L 15 90 Q 0 85 0 70 Z" fill="#1e2535"/>
      {/* Full digital dash */}
      <rect x="60" y="74" width="160" height="48" rx="6" fill="#0a1220" stroke="#2d4a78" strokeWidth="1.5"/>
      <rect x="64" y="77" width="152" height="42" rx="4" fill="#0d2340"/>
      {/* Speedometer (large round digital) */}
      <circle cx="104" cy="98" r="18" fill="#111827" stroke="#374151" strokeWidth="1"/>
      <circle cx="104" cy="98" r="13" fill="#0a1820" stroke="#1e3558" strokeWidth="0.5"/>
      <line x1="104" y1="98" x2="108" y2="84" stroke="#F5A623" strokeWidth="2"/>
      <circle cx="104" cy="98" r="3" fill="#F5A623"/>
      {/* Tach */}
      <circle cx="174" cy="98" r="14" fill="#111827" stroke="#374151" strokeWidth="1"/>
      <line x1="174" y1="98" x2="178" y2="86" stroke="#ef4444" strokeWidth="1.5"/>
      {/* Gear indicator */}
      <rect x="126" y="86" width="26" height="24" rx="3" fill="#111827"/>
      <text x="132" y="104" fill="#22c55e" fontSize="14" fontFamily="monospace">4</text>
      {/* Handlebar view */}
      <rect x="0" y="90" width="55" height="12" rx="6" fill="#374151"/>
      <rect x="225" y="90" width="55" height="12" rx="6" fill="#374151"/>
      <circle cx="42" cy="96" r="8" fill="#1e2535" stroke="#4b5563" strokeWidth="2"/>
      <circle cx="238" cy="96" r="8" fill="#1e2535" stroke="#F5A623" strokeWidth="2"/>
      {/* Switch cluster left */}
      <rect x="4" y="90" width="22" height="12" rx="5" fill="#243b5e" stroke="#374151" strokeWidth="0.5"/>
      {/* Mirror left */}
      <rect x="0" y="70" width="32" height="18" rx="3" fill="#162b46" stroke="#374151" strokeWidth="1"/>
      <rect x="2" y="72" width="28" height="14" rx="2" fill="#0d2340"/>
      {/* Mirror right */}
      <rect x="248" y="70" width="32" height="18" rx="3" fill="#162b46" stroke="#374151" strokeWidth="1"/>
      <rect x="250" y="72" width="28" height="14" rx="2" fill="#0d2340"/>
      {/* Tank top (between rider's knees) */}
      <path d="M 80" y="130" x2="200" y2="130"/>
      <path d="M 85 125 L 195 125 L 200 190 L 80 190 Z" fill="#1e3558" stroke="#2d4a78" strokeWidth="1"/>
      {/* Knee grip areas */}
      <path d="M 40 130 L 85 125 L 85 190 L 40 190 Z" fill="#1a2535"/>
      <path d="M 195 125 L 240 130 L 240 190 L 195 190 Z" fill="#1a2535"/>
    </svg>
  )
}
