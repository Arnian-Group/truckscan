export default function RacerSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <RacerFront className={className} />
  if (view === 'rear') return <RacerRear className={className} />
  if (view === 'top') return <RacerTop className={className} />
  if (view === 'interior') return <RacerInterior className={className} />
  const mirror = view === 'left'
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      style={mirror ? { transform: 'scaleX(-1)' } : {}}>
      <ellipse cx="170" cy="152" rx="145" ry="8" fill="rgba(0,0,0,0.5)"/>
      {/* Rear wheel - large off-road */}
      <circle cx="248" cy="116" r="36" fill="#111827"/>
      <circle cx="248" cy="116" r="28" fill="#1f2937"/>
      <circle cx="248" cy="116" r="20" fill="#374151"/>
      <circle cx="248" cy="116" r="12" fill="#4b5563"/>
      <line x1="248" y1="94" x2="248" y2="138" stroke="#9ca3af" strokeWidth="2.5" opacity="0.7"/>
      <line x1="226" y1="116" x2="270" y2="116" stroke="#9ca3af" strokeWidth="2.5" opacity="0.7"/>
      <line x1="233" y1="101" x2="263" y2="131" stroke="#9ca3af" strokeWidth="2" opacity="0.6"/>
      <line x1="263" y1="101" x2="233" y2="131" stroke="#9ca3af" strokeWidth="2" opacity="0.6"/>
      <line x1="228" y1="108" x2="268" y2="124" stroke="#9ca3af" strokeWidth="1" opacity="0.4"/>
      <line x1="268" y1="108" x2="228" y2="124" stroke="#9ca3af" strokeWidth="1" opacity="0.4"/>
      <circle cx="248" cy="116" r="5.5" fill="#d1d5db"/>
      {/* Front wheel */}
      <circle cx="84" cy="116" r="36" fill="#111827"/>
      <circle cx="84" cy="116" r="28" fill="#1f2937"/>
      <circle cx="84" cy="116" r="20" fill="#374151"/>
      <circle cx="84" cy="116" r="12" fill="#4b5563"/>
      <line x1="84" y1="94" x2="84" y2="138" stroke="#9ca3af" strokeWidth="2.5" opacity="0.7"/>
      <line x1="62" y1="116" x2="106" y2="116" stroke="#9ca3af" strokeWidth="2.5" opacity="0.7"/>
      <line x1="69" y1="101" x2="99" y2="131" stroke="#9ca3af" strokeWidth="2" opacity="0.6"/>
      <line x1="99" y1="101" x2="69" y2="131" stroke="#9ca3af" strokeWidth="2" opacity="0.6"/>
      <circle cx="84" cy="116" r="5.5" fill="#d1d5db"/>
      {/* Wide fenders */}
      <path d="M 48 100 Q 84 78 120 100" fill="none" stroke="#162b46" strokeWidth="5"/>
      <path d="M 212 100 Q 248 78 284 100" fill="none" stroke="#162b46" strokeWidth="5"/>
      {/* Roll cage - prominent */}
      <path d="M 130 80 L 130 32" stroke="#374151" strokeWidth="5"/>
      <path d="M 200 80 L 200 32" stroke="#374151" strokeWidth="5"/>
      <path d="M 130 32 C 130 22 148 16 165 16 L 185 16 C 202 16 200 22 200 32" fill="none" stroke="#374151" strokeWidth="5"/>
      {/* Diagonal bracing */}
      <line x1="130" y1="32" x2="200" y2="58" stroke="#374151" strokeWidth="3" opacity="0.6"/>
      <line x1="200" y1="32" x2="130" y2="58" stroke="#374151" strokeWidth="3" opacity="0.6"/>
      <line x1="130" y1="58" x2="200" y2="80" stroke="#374151" strokeWidth="2" opacity="0.4"/>
      {/* Front cage bars */}
      <line x1="120" y1="80" x2="130" y2="44" stroke="#374151" strokeWidth="4"/>
      <line x1="130" y1="44" x2="140" y2="80" stroke="#374151" strokeWidth="3" opacity="0.5"/>
      {/* Rear cage extension */}
      <line x1="200" y1="40" x2="220" y2="60" stroke="#374151" strokeWidth="3"/>
      <line x1="218" y1="62" x2="248" y2="80" stroke="#374151" strokeWidth="2.5"/>
      {/* Lower frame */}
      <path d="M 84 96 L 248 96" stroke="#243b5e" strokeWidth="6"/>
      <path d="M 84 104 L 248 104" stroke="#1a2d4a" strokeWidth="4"/>
      {/* Body panels - low and wide */}
      <path d="M 120 80 L 130 80 L 130 100 L 84 100 L 84 92 Z" fill="#1e3558" stroke="#2d4a78" strokeWidth="1"/>
      <path d="M 200 80 L 248 92 L 248 100 L 200 100 Z" fill="#1e3558" stroke="#2d4a78" strokeWidth="1"/>
      {/* Center floor panel */}
      <path d="M 130 80 L 200 80 L 200 100 L 130 100 Z" fill="#243b5e" stroke="#2d4a78" strokeWidth="1"/>
      {/* Seat (inside cage) */}
      <rect x="142" y="60" width="30" height="22" rx="3" fill="#1a2d4a" stroke="#2d4a78" strokeWidth="1"/>
      <rect x="145" y="55" width="24" height="8" rx="3" fill="#243b5e"/>
      {/* Steering (small quick-release wheel) */}
      <circle cx="152" cy="72" r="12" fill="none" stroke="#4b5563" strokeWidth="3"/>
      <circle cx="152" cy="72" r="4" fill="#1e2535" stroke="#374151" strokeWidth="1"/>
      <line x1="140" y1="72" x2="148" y2="72" stroke="#4b5563" strokeWidth="2"/>
      <line x1="156" y1="72" x2="164" y2="72" stroke="#4b5563" strokeWidth="2"/>
      <line x1="152" y1="60" x2="152" y2="68" stroke="#4b5563" strokeWidth="2"/>
      {/* Front bumper / bash plate */}
      <path d="M 46 104 L 46 112 L 86 112 L 86 104 Z" fill="#162b46" stroke="#2d4a78" strokeWidth="1.5"/>
      {/* Headlight - bug eye */}
      <rect x="48" y="84" width="36" height="20" rx="4" fill="#1e3558"/>
      <rect x="50" y="86" width="32" height="16" rx="3" fill="#fbbf24" opacity="0.9"/>
      <path d="M 52 88 L 52 96 L 76 96 L 76 88 Z" fill="#fef3c7" opacity="0.5"/>
      {/* Rear light bar */}
      <rect x="246" y="72" width="20" height="28" rx="3" fill="#1e3558"/>
      <rect x="248" y="74" width="16" height="24" rx="2" fill="#ef4444" opacity="0.85"/>
      <path d="M 250 74 L 250 86 L 262 80 Z" fill="#fca5a5" opacity="0.4"/>
      {/* Spoiler / wing hint */}
      <path d="M 200 28 C 210 24 230 22 248 24 L 250 30 C 232 28 214 30 200 32 Z" fill="#2d4a78" stroke="#374151" strokeWidth="1"/>
      {/* Skid plate */}
      <path d="M 130 100 L 200 100 L 200 108 L 130 108 Z" fill="#162b46" stroke="#2d4a78" strokeWidth="0.5"/>
      {/* Exhaust */}
      <path d="M 210 96 C 222 96 235 96 246 98" stroke="#4b5563" strokeWidth="5" strokeLinecap="round"/>
      <ellipse cx="248" cy="98" rx="5" ry="4" fill="#1f2937" stroke="#6b7280" strokeWidth="1"/>
      {/* Shoulder harness hint */}
      <path d="M 156 58 L 162 44 L 168 44" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    </svg>
  )
}

function RacerFront({ className }) {
  return (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="120" cy="196" rx="118" ry="6" fill="rgba(0,0,0,0.5)"/>
      {/* Large off-road wheels */}
      <circle cx="16" cy="140" r="36" fill="#111827"/><circle cx="16" cy="140" r="28" fill="#1f2937"/><circle cx="16" cy="140" r="20" fill="#374151"/><circle cx="16" cy="140" r="12" fill="#4b5563"/><circle cx="16" cy="140" r="5" fill="#9ca3af"/>
      <circle cx="224" cy="140" r="36" fill="#111827"/><circle cx="224" cy="140" r="28" fill="#1f2937"/><circle cx="224" cy="140" r="20" fill="#374151"/><circle cx="224" cy="140" r="12" fill="#4b5563"/><circle cx="224" cy="140" r="5" fill="#9ca3af"/>
      {/* Roll cage front view */}
      <line x1="52" y1="10" x2="52" y2="108" stroke="#374151" strokeWidth="5"/>
      <line x1="188" y1="10" x2="188" y2="108" stroke="#374151" strokeWidth="5"/>
      <path d="M 52 10 C 52 6 75 4 120 4 C 165 4 188 6 188 10" fill="none" stroke="#374151" strokeWidth="5"/>
      <line x1="52" y1="48" x2="188" y2="48" stroke="#374151" strokeWidth="3"/>
      <line x1="52" y1="48" x2="188" y2="76" stroke="#374151" strokeWidth="2" opacity="0.5"/>
      <line x1="188" y1="48" x2="52" y2="76" stroke="#374151" strokeWidth="2" opacity="0.5"/>
      {/* Body */}
      <path d="M 52 108 L 52 90 L 188 90 L 188 108 Z" fill="#243b5e" stroke="#2d4a78" strokeWidth="1"/>
      {/* Headlights */}
      <rect x="52" y="110" width="48" height="22" rx="4" fill="#fbbf24" opacity="0.9"/>
      <path d="M 54 112 L 54 122 L 94 122 L 94 112 Z" fill="#fef9c3" opacity="0.5"/>
      <rect x="140" y="110" width="48" height="22" rx="4" fill="#fbbf24" opacity="0.9"/>
      <path d="M 142 112 L 142 122 L 182 122 L 182 112 Z" fill="#fef9c3" opacity="0.5"/>
      {/* Center grille */}
      <rect x="100" y="110" width="40" height="22" rx="3" fill="#0f1c2e" stroke="#2d4a78" strokeWidth="1"/>
      {[106,112,118,124,130].map(x => <line key={x} x1={x} y1="112" x2={x} y2="130" stroke="#243b5e" strokeWidth="1"/>)}
      {/* Front bash plate */}
      <rect x="44" y="130" width="152" height="16" rx="4" fill="#162b46" stroke="#2d4a78" strokeWidth="2"/>
      <rect x="56" y="134" width="128" height="8" rx="2" fill="#111827" stroke="#374151" strokeWidth="1"/>
      {/* Bumper ends */}
      <rect x="38" y="128" width="12" height="20" rx="3" fill="#2d4a78"/>
      <rect x="190" y="128" width="12" height="20" rx="3" fill="#2d4a78"/>
      {/* Skid plate bottom */}
      <rect x="50" y="144" width="140" height="10" rx="3" fill="#111827" stroke="#374151" strokeWidth="1"/>
      {/* Seats visible */}
      <rect x="68" y="80" width="38" height="12" rx="3" fill="#1a2d4a"/>
      <rect x="134" y="80" width="38" height="12" rx="3" fill="#1a2d4a"/>
    </svg>
  )
}

function RacerRear({ className }) {
  return (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="120" cy="196" rx="118" ry="6" fill="rgba(0,0,0,0.5)"/>
      <circle cx="16" cy="140" r="36" fill="#111827"/><circle cx="16" cy="140" r="28" fill="#1f2937"/><circle cx="16" cy="140" r="20" fill="#374151"/><circle cx="16" cy="140" r="12" fill="#4b5563"/><circle cx="16" cy="140" r="5" fill="#9ca3af"/>
      <circle cx="224" cy="140" r="36" fill="#111827"/><circle cx="224" cy="140" r="28" fill="#1f2937"/><circle cx="224" cy="140" r="20" fill="#374151"/><circle cx="224" cy="140" r="12" fill="#4b5563"/><circle cx="224" cy="140" r="5" fill="#9ca3af"/>
      <line x1="52" y1="10" x2="52" y2="108" stroke="#374151" strokeWidth="5"/>
      <line x1="188" y1="10" x2="188" y2="108" stroke="#374151" strokeWidth="5"/>
      <path d="M 52 10 C 52 6 75 4 120 4 C 165 4 188 6 188 10" fill="none" stroke="#374151" strokeWidth="5"/>
      {/* Wing / spoiler */}
      <path d="M 40 22 L 200 22 L 200 28 L 40 28 Z" fill="#2d4a78" stroke="#374151" strokeWidth="1"/>
      <line x1="80" y1="22" x2="80" y2="42" stroke="#374151" strokeWidth="2"/>
      <line x1="160" y1="22" x2="160" y2="42" stroke="#374151" strokeWidth="2"/>
      {/* Body */}
      <path d="M 52 108 L 52 88 L 188 88 L 188 108 Z" fill="#1e3558" stroke="#2d4a78" strokeWidth="1"/>
      {/* Full-width tail lights */}
      <rect x="52" y="88" width="136" height="18" rx="2" fill="#1e3558"/>
      <rect x="54" y="90" width="56" height="14" rx="1" fill="#ef4444" opacity="0.9"/>
      <rect x="130" y="90" width="56" height="14" rx="1" fill="#ef4444" opacity="0.9"/>
      <rect x="112" y="92" width="16" height="10" rx="1" fill="#fbbf24" opacity="0.7"/>
      {/* Rear bumper */}
      <rect x="46" y="108" width="148" height="16" rx="4" fill="#162b46" stroke="#2d4a78" strokeWidth="2"/>
      <rect x="58" y="112" width="124" height="8" rx="2" fill="#111827" stroke="#374151" strokeWidth="1"/>
      {/* Exhaust pipes */}
      <ellipse cx="78" cy="122" rx="12" ry="6" fill="#1f2937" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="162" cy="122" rx="12" ry="6" fill="#1f2937" stroke="#374151" strokeWidth="1.5"/>
      {/* License plate */}
      <rect x="88" y="110" width="64" height="16" rx="2" fill="#374151"/>
      <rect x="90" y="112" width="60" height="12" rx="1" fill="#d1d5db" opacity="0.7"/>
      {/* Tow hook */}
      <circle cx="120" cy="122" r="6" fill="#374151" stroke="#4b5563" strokeWidth="1.5"/>
    </svg>
  )
}

function RacerTop({ className }) {
  return (
    <svg viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Roll cage from above */}
      <rect x="34" y="14" width="132" height="272" rx="12" fill="none" stroke="#374151" strokeWidth="5"/>
      {/* Body */}
      <path d="M 42 14 L 158 14 L 162 272 L 38 272 Z" fill="#243b5e" stroke="#2d4a78" strokeWidth="1"/>
      {/* Wing top view */}
      <rect x="26" y="20" width="148" height="16" rx="4" fill="#2d4a78" stroke="#374151" strokeWidth="1"/>
      {/* Hood */}
      <path d="M 44 36 L 156 36 L 158 82 L 42 82 Z" fill="#1e3558"/>
      {/* Headlights */}
      <rect x="42" y="38" width="40" height="22" rx="3" fill="#fbbf24" opacity="0.6"/>
      <rect x="118" y="38" width="40" height="22" rx="3" fill="#fbbf24" opacity="0.6"/>
      {/* Driver seat */}
      <rect x="52" y="86" width="44" height="60" rx="5" fill="#1a2d4a" stroke="#2d4a78" strokeWidth="1"/>
      {/* Passenger seat */}
      <rect x="104" y="86" width="44" height="60" rx="5" fill="#1a2d4a" stroke="#2d4a78" strokeWidth="1"/>
      {/* Steering wheel (top) */}
      <circle cx="72" cy="106" r="14" fill="none" stroke="#374151" strokeWidth="3"/>
      <circle cx="72" cy="106" r="4" fill="#1e2535"/>
      {/* Rear section */}
      <rect x="46" y="150" width="108" height="100" rx="6" fill="#1e3558"/>
      {/* Taillights */}
      <rect x="42" y="256" width="44" height="16" rx="2" fill="#ef4444" opacity="0.6"/>
      <rect x="114" y="256" width="44" height="16" rx="2" fill="#ef4444" opacity="0.6"/>
      {/* Wheels */}
      <ellipse cx="24" cy="80" rx="14" ry="28" fill="#111827" stroke="#374151" strokeWidth="2"/>
      <ellipse cx="176" cy="80" rx="14" ry="28" fill="#111827" stroke="#374151" strokeWidth="2"/>
      <ellipse cx="24" cy="220" rx="14" ry="28" fill="#111827" stroke="#374151" strokeWidth="2"/>
      <ellipse cx="176" cy="220" rx="14" ry="28" fill="#111827" stroke="#374151" strokeWidth="2"/>
      {/* Exhaust */}
      <path d="M 160" y="220" x2="176" y2="220"/>
      <path d="M 158 226 L 174 220 L 174 228 L 158 232 Z" fill="#4b5563"/>
    </svg>
  )
}

function RacerInterior({ className }) {
  return (
    <svg viewBox="0 0 280 190" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="0" y="0" width="280" height="190" rx="8" fill="#0a1220"/>
      {/* View through windscreen */}
      <path d="M 0 0 L 280 0 L 260 65 L 20 65 Z" fill="#0d2340"/>
      <path d="M 20 4 L 260 4 L 242 55 L 38 55 Z" fill="rgba(100,200,255,0.06)"/>
      {/* Roll cage bars visible */}
      <line x1="0" y1="0" x2="0" y2="190" stroke="#374151" strokeWidth="8"/>
      <line x1="280" y1="0" x2="280" y2="190" stroke="#374151" strokeWidth="8"/>
      <path d="M 4 0 L 276 0 L 276 8 L 4 8 Z" fill="#374151"/>
      {/* Diagonal bar */}
      <line x1="4" y1="65" x2="4" y2="190" stroke="#374151" strokeWidth="5" opacity="0.7"/>
      <line x1="276" y1="65" x2="276" y2="190" stroke="#374151" strokeWidth="5" opacity="0.7"/>
      {/* Dash */}
      <path d="M 8 65 L 272 65 Q 280 68 280 82 L 280 110 L 0 110 L 0 82 Q 0 68 8 65 Z" fill="#1e2535"/>
      <path d="M 8 65 L 272 65 L 272 72 L 8 72 Z" fill="#243b5e"/>
      {/* Digital racing dash */}
      <rect x="70" y="68" width="140" height="36" rx="4" fill="#0a1220" stroke="#2d4a78" strokeWidth="1.5"/>
      <rect x="74" y="71" width="132" height="30" rx="2" fill="#0d2340"/>
      {/* Shift lights (top) */}
      {[80,90,100,110,120,130,140,150,160,170,180,190].map((x,i) => (
        <rect key={x} x={x} y="72" width="8" height="5" rx="1" fill={i < 6 ? '#22c55e' : i < 9 ? '#f59e0b' : '#ef4444'} opacity={i < 5 ? 0.9 : 0.4}/>
      ))}
      {/* Tachometer */}
      <circle cx="110" cy="92" r="15" fill="#111827" stroke="#374151" strokeWidth="1"/>
      <line x1="110" y1="92" x2="113" y2="79" stroke="#ef4444" strokeWidth="2"/>
      <circle cx="110" cy="92" r="4" fill="#ef4444"/>
      {/* Speedometer */}
      <circle cx="170" cy="92" r="15" fill="#111827" stroke="#374151" strokeWidth="1"/>
      <line x1="170" y1="92" x2="175" y2="80" stroke="#F5A623" strokeWidth="2"/>
      <circle cx="170" cy="92" r="4" fill="#F5A623"/>
      {/* Gear */}
      <rect x="130" y="78" width="20" height="20" rx="3" fill="#0a1820"/>
      <text x="134" y="94" fill="#22c55e" fontSize="13" fontFamily="monospace" fontWeight="bold">3</text>
      {/* Small steering wheel - rally style */}
      <circle cx="90" cy="152" r="30" fill="none" stroke="#374151" strokeWidth="5"/>
      <path d="M 66 148 L 82 152 M 98 152 L 114 148" stroke="#374151" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="90" cy="152" r="10" fill="#1e2535" stroke="#4b5563" strokeWidth="2"/>
      {/* Harness */}
      <line x1="90" y1="110" x2="50" y2="190" stroke="#ef4444" strokeWidth="3" opacity="0.7"/>
      <line x1="90" y1="110" x2="130" y2="190" stroke="#ef4444" strokeWidth="3" opacity="0.7"/>
      <line x1="90" y1="132" x2="90" y2="190" stroke="#ef4444" strokeWidth="3" opacity="0.7"/>
      {/* Seat */}
      <path d="M 40 110 L 40 190 L 140 190 L 140 110 Q 90 108 40 110 Z" fill="#1a2535"/>
      <path d="M 160 110 L 160 190 L 280 190 L 280 110 Q 220 108 160 110 Z" fill="#1a2535"/>
      <line x1="40" y1="130" x2="140" y2="130" stroke="#243b5e" strokeWidth="1" opacity="0.5"/>
      {/* Cup holder / map pocket */}
      <rect x="150" y="126" width="8" height="22" rx="3" fill="#374151"/>
    </svg>
  )
}
