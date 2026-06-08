export default function ATVSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <ATVFront className={className} />
  if (view === 'rear') return <ATVRear className={className} />
  if (view === 'top') return <ATVTop className={className} />
  if (view === 'interior') return <ATVInterior className={className} />
  const mirror = view === 'left'
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      style={mirror ? { transform: 'scaleX(-1)' } : {}}>
      <ellipse cx="170" cy="152" rx="140" ry="7" fill="rgba(0,0,0,0.45)"/>
      {/* Rear wheel - fat ATV tire */}
      <circle cx="240" cy="116" r="36" fill="#111827"/>
      <circle cx="240" cy="116" r="29" fill="#1f2937"/>
      <circle cx="240" cy="116" r="22" fill="#374151"/>
      <circle cx="240" cy="116" r="14" fill="#4b5563"/>
      <line x1="240" y1="94" x2="240" y2="138" stroke="#9ca3af" strokeWidth="2.5" opacity="0.7"/>
      <line x1="218" y1="116" x2="262" y2="116" stroke="#9ca3af" strokeWidth="2.5" opacity="0.7"/>
      <line x1="224" y1="100" x2="256" y2="132" stroke="#9ca3af" strokeWidth="2" opacity="0.6"/>
      <line x1="256" y1="100" x2="224" y2="132" stroke="#9ca3af" strokeWidth="2" opacity="0.6"/>
      <line x1="220" y1="108" x2="260" y2="124" stroke="#9ca3af" strokeWidth="1" opacity="0.4"/>
      <line x1="260" y1="108" x2="220" y2="124" stroke="#9ca3af" strokeWidth="1" opacity="0.4"/>
      <circle cx="240" cy="116" r="6" fill="#d1d5db"/>
      {/* Front wheel */}
      <circle cx="90" cy="116" r="36" fill="#111827"/>
      <circle cx="90" cy="116" r="29" fill="#1f2937"/>
      <circle cx="90" cy="116" r="22" fill="#374151"/>
      <circle cx="90" cy="116" r="14" fill="#4b5563"/>
      <line x1="90" y1="94" x2="90" y2="138" stroke="#9ca3af" strokeWidth="2.5" opacity="0.7"/>
      <line x1="68" y1="116" x2="112" y2="116" stroke="#9ca3af" strokeWidth="2.5" opacity="0.7"/>
      <line x1="74" y1="100" x2="106" y2="132" stroke="#9ca3af" strokeWidth="2" opacity="0.6"/>
      <line x1="106" y1="100" x2="74" y2="132" stroke="#9ca3af" strokeWidth="2" opacity="0.6"/>
      <circle cx="90" cy="116" r="6" fill="#d1d5db"/>
      {/* Fender arches - wide for fat tires */}
      <path d="M 54 102 Q 90 80 126 102" fill="none" stroke="#162b46" strokeWidth="4"/>
      <path d="M 204 102 Q 240 80 276 102" fill="none" stroke="#162b46" strokeWidth="4"/>
      {/* Front fender */}
      <path d="M 60 96 Q 90 78 120 96 L 116 106 Q 90 88 64 106 Z" fill="#1e3558" stroke="#2d4a78" strokeWidth="1"/>
      {/* Rear fender */}
      <path d="M 206 96 Q 240 78 274 96 L 270 106 Q 240 88 210 106 Z" fill="#1e3558" stroke="#2d4a78" strokeWidth="1"/>
      {/* Main frame / chassis */}
      <path d="M 90 80 L 240 80 L 240 90 L 90 90 Z" fill="#2d4a78" stroke="#374151" strokeWidth="1"/>
      <path d="M 90 90 L 240 90 L 240 106 L 90 106 Z" fill="#162b46"/>
      {/* Engine block */}
      <path d="M 128 76 L 202 76 L 210 100 L 124 100 Z" fill="#1e3558" stroke="#2d4a78" strokeWidth="1"/>
      <rect x="132" y="80" width="70" height="16" rx="3" fill="#111827" stroke="#1e3558" strokeWidth="0.5"/>
      {[138,144,150,156,162,168,174,180,186,192].map(x => <line key={x} x1={x} y1="80" x2={x} y2="96" stroke="#243b5e" strokeWidth="1"/>)}
      {/* Seat */}
      <path d="M 122 68 L 218 68 L 218 80 L 122 80 Z" fill="#1a2535" stroke="#243b5e" strokeWidth="1"/>
      <path d="M 124 70 L 216 70 L 216 78 L 124 78 Z" fill="#111c2e"/>
      {/* Fuel tank hint */}
      <path d="M 126 60 L 214 60 L 216 68 L 124 68 Z" fill="#243b5e" stroke="#2d4a78" strokeWidth="1"/>
      {/* Front rack */}
      <path d="M 90 68 L 126 68 L 126 76 L 90 76 Z" fill="#2d4a78" stroke="#374151" strokeWidth="1"/>
      <line x1="96" y1="68" x2="96" y2="76" stroke="#374151" strokeWidth="1.5"/>
      <line x1="106" y1="68" x2="106" y2="76" stroke="#374151" strokeWidth="1.5"/>
      <line x1="116" y1="68" x2="116" y2="76" stroke="#374151" strokeWidth="1.5"/>
      {/* Rear rack */}
      <path d="M 218 68 L 248 68 L 248 76 L 218 76 Z" fill="#2d4a78" stroke="#374151" strokeWidth="1"/>
      <line x1="226" y1="68" x2="226" y2="76" stroke="#374151" strokeWidth="1.5"/>
      <line x1="236" y1="68" x2="236" y2="76" stroke="#374151" strokeWidth="1.5"/>
      <line x1="242" y1="68" x2="242" y2="76" stroke="#374151" strokeWidth="1.5"/>
      {/* Handlebars - T shape */}
      <rect x="96" y="54" width="6" height="20" rx="2" fill="#374151"/>
      <rect x="72" y="50" width="52" height="8" rx="4" fill="#243b5e" stroke="#374151" strokeWidth="1"/>
      <circle cx="72" cy="54" r="5" fill="#4b5563" stroke="#6b7280" strokeWidth="1"/>
      <circle cx="124" cy="54" r="5" fill="#4b5563" stroke="#6b7280" strokeWidth="1"/>
      {/* Front suspension / A-arms */}
      <line x1="90" y1="88" x2="110" y2="106" stroke="#374151" strokeWidth="2"/>
      <line x1="90" y1="102" x2="110" y2="106" stroke="#374151" strokeWidth="2"/>
      {/* Rear suspension */}
      <line x1="240" y1="88" x2="222" y2="106" stroke="#374151" strokeWidth="2"/>
      <line x1="240" y1="102" x2="222" y2="106" stroke="#374151" strokeWidth="2"/>
      {/* Headlight */}
      <rect x="54" y="70" width="38" height="22" rx="4" fill="#1e3558"/>
      <rect x="56" y="72" width="34" height="18" rx="3" fill="#fbbf24" opacity="0.9"/>
      <path d="M 58 73 L 58 82 L 84 82 L 84 73 Z" fill="#fef3c7" opacity="0.5"/>
      {/* Taillight */}
      <rect x="246" y="70" width="24" height="18" rx="3" fill="#ef4444" opacity="0.85"/>
      <path d="M 248 72 L 248 80 L 268 80 Z" fill="#fca5a5" opacity="0.4"/>
      {/* Exhaust */}
      <path d="M 214 98 C 224 100 234 102 244 102" stroke="#4b5563" strokeWidth="4" strokeLinecap="round"/>
      <ellipse cx="246" cy="102" rx="5" ry="4" fill="#1f2937" stroke="#6b7280" strokeWidth="1"/>
      {/* Skid plate */}
      <path d="M 120 100 L 210 100 L 210 108 L 120 108 Z" fill="#162b46" stroke="#2d4a78" strokeWidth="0.5"/>
    </svg>
  )
}

function ATVFront({ className }) {
  return (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="120" cy="196" rx="110" ry="6" fill="rgba(0,0,0,0.4)"/>
      {/* Fat tires */}
      <circle cx="22" cy="138" r="36" fill="#111827"/><circle cx="22" cy="138" r="28" fill="#1f2937"/><circle cx="22" cy="138" r="20" fill="#374151"/><circle cx="22" cy="138" r="12" fill="#4b5563"/><circle cx="22" cy="138" r="5" fill="#9ca3af"/>
      <circle cx="218" cy="138" r="36" fill="#111827"/><circle cx="218" cy="138" r="28" fill="#1f2937"/><circle cx="218" cy="138" r="20" fill="#374151"/><circle cx="218" cy="138" r="12" fill="#4b5563"/><circle cx="218" cy="138" r="5" fill="#9ca3af"/>
      {/* Front fenders */}
      <path d="M 30 108 C 26 100 22 96 22 102 C 22 108 26 112 30 108 Z" fill="#1e3558"/>
      <path d="M 210 108 C 214 100 218 96 218 102 C 218 108 214 112 210 108 Z" fill="#1e3558"/>
      {/* A-arms */}
      <line x1="58" y1="106" x2="76" y2="126" stroke="#374151" strokeWidth="2.5"/>
      <line x1="58" y1="118" x2="76" y2="126" stroke="#374151" strokeWidth="2.5"/>
      <line x1="182" y1="106" x2="164" y2="126" stroke="#374151" strokeWidth="2.5"/>
      <line x1="182" y1="118" x2="164" y2="126" stroke="#374151" strokeWidth="2.5"/>
      {/* Body / fairing */}
      <path d="M 56 98 L 56 72 L 184 72 L 184 98 Z" fill="#243b5e" stroke="#2d4a78" strokeWidth="1.5"/>
      <path d="M 60 72 C 60 48 75 28 120 20 C 165 28 180 48 180 72 Z" fill="#1e3558" stroke="#2d4a78" strokeWidth="1"/>
      {/* Headlights - twin */}
      <rect x="60" y="80" width="38" height="22" rx="4" fill="#fbbf24" opacity="0.85"/>
      <path d="M 62 82 L 62 92 L 92 92 L 92 82 Z" fill="#fef9c3" opacity="0.5"/>
      <rect x="142" y="80" width="38" height="22" rx="4" fill="#fbbf24" opacity="0.85"/>
      <path d="M 144 82 L 144 92 L 174 92 L 174 82 Z" fill="#fef9c3" opacity="0.5"/>
      {/* Grille center */}
      <rect x="100" y="80" width="40" height="22" rx="3" fill="#0f1c2e" stroke="#2d4a78" strokeWidth="1"/>
      {[106,112,118,124,130].map(x => <line key={x} x1={x} y1="82" x2={x} y2="100" stroke="#243b5e" strokeWidth="1"/>)}
      {/* Front bumper/skid */}
      <rect x="44" y="98" width="152" height="14" rx="4" fill="#162b46" stroke="#2d4a78" strokeWidth="1.5"/>
      {/* Handlebars visible */}
      <rect x="50" y="64" width="30" height="8" rx="4" fill="#374151"/>
      <rect x="160" y="64" width="30" height="8" rx="4" fill="#374151"/>
      {/* Front rack */}
      <rect x="72" y="58" width="96" height="12" rx="3" fill="#2d4a78" stroke="#374151" strokeWidth="1"/>
      {[82,94,106,118,130,142,152].map(x => <line key={x} x1={x} y1="58" x2={x} y2="70" stroke="#374151" strokeWidth="1"/>)}
    </svg>
  )
}

function ATVRear({ className }) {
  return (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="120" cy="196" rx="110" ry="6" fill="rgba(0,0,0,0.4)"/>
      <circle cx="22" cy="138" r="36" fill="#111827"/><circle cx="22" cy="138" r="28" fill="#1f2937"/><circle cx="22" cy="138" r="20" fill="#374151"/><circle cx="22" cy="138" r="12" fill="#4b5563"/><circle cx="22" cy="138" r="5" fill="#9ca3af"/>
      <circle cx="218" cy="138" r="36" fill="#111827"/><circle cx="218" cy="138" r="28" fill="#1f2937"/><circle cx="218" cy="138" r="20" fill="#374151"/><circle cx="218" cy="138" r="12" fill="#4b5563"/><circle cx="218" cy="138" r="5" fill="#9ca3af"/>
      <line x1="58" y1="106" x2="76" y2="126" stroke="#374151" strokeWidth="2.5"/>
      <line x1="58" y1="118" x2="76" y2="126" stroke="#374151" strokeWidth="2.5"/>
      <line x1="182" y1="106" x2="164" y2="126" stroke="#374151" strokeWidth="2.5"/>
      <line x1="182" y1="118" x2="164" y2="126" stroke="#374151" strokeWidth="2.5"/>
      <path d="M 56 98 L 56 72 L 184 72 L 184 98 Z" fill="#1e3558" stroke="#2d4a78" strokeWidth="1.5"/>
      <path d="M 60 72 C 60 50 74 32 120 26 C 166 32 180 50 180 72 Z" fill="#1e3558"/>
      {/* Taillights - wide horizontal */}
      <rect x="56" y="74" width="128" height="18" rx="3" fill="#1e3558"/>
      <rect x="58" y="76" width="56" height="14" rx="2" fill="#ef4444" opacity="0.9"/>
      <rect x="126" y="76" width="56" height="14" rx="2" fill="#ef4444" opacity="0.9"/>
      <rect x="116" y="78" width="8" height="10" rx="1" fill="#fbbf24" opacity="0.7"/>
      {/* Seat top edge */}
      <path d="M 62 68 L 178 68 L 180 74 L 60 74 Z" fill="#1a2535"/>
      {/* Rear rack */}
      <rect x="68" y="56" width="104" height="12" rx="3" fill="#2d4a78" stroke="#374151" strokeWidth="1"/>
      {[78,90,102,114,126,138,150,160].map(x => <line key={x} x1={x} y1="56" x2={x} y2="68" stroke="#374151" strokeWidth="1"/>)}
      {/* Rear bumper */}
      <rect x="48" y="96" width="144" height="14" rx="4" fill="#162b46" stroke="#2d4a78" strokeWidth="1.5"/>
      {/* Exhaust */}
      <ellipse cx="76" cy="108" rx="10" ry="5" fill="#1f2937" stroke="#374151" strokeWidth="1.5"/>
      {/* License plate */}
      <rect x="88" y="100" width="64" height="18" rx="2" fill="#374151"/>
      <rect x="90" y="102" width="60" height="14" rx="1" fill="#d1d5db" opacity="0.7"/>
    </svg>
  )
}

function ATVTop({ className }) {
  return (
    <svg viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Body (top view) - compact ATV shape */}
      <path d="M 48 20 C 30 20 18 32 16 48 L 14 68 L 14 212 L 16 232 C 18 248 30 260 48 260 L 152 260 C 170 260 182 248 184 232 L 186 212 L 186 68 L 184 48 C 182 32 170 20 152 20 Z" fill="#243b5e" stroke="#2d4a78" strokeWidth="1.5"/>
      {/* Front rack */}
      <rect x="44" y="22" width="112" height="26" rx="4" fill="#2d4a78" stroke="#374151" strokeWidth="1"/>
      {[56,68,80,92,104,116,128,140].map(x => <line key={x} x1={x} y1="22" x2={x} y2="48" stroke="#374151" strokeWidth="1"/>)}
      {/* Headlights */}
      <rect x="44" y="24" width="38" height="18" rx="2" fill="#fbbf24" opacity="0.6"/>
      <rect x="118" y="24" width="38" height="18" rx="2" fill="#fbbf24" opacity="0.6"/>
      {/* Handlebars */}
      <rect x="22" y="58" width="30" height="8" rx="4" fill="#374151"/>
      <rect x="148" y="58" width="30" height="8" rx="4" fill="#374151"/>
      {/* Tank */}
      <rect x="52" y="50" width="96" height="50" rx="6" fill="#1e3558"/>
      {/* Seat */}
      <rect x="56" y="104" width="88" height="80" rx="8" fill="#1a2535" stroke="#243b5e" strokeWidth="1"/>
      {/* Rear rack */}
      <rect x="44" y="188" width="112" height="26" rx="4" fill="#2d4a78" stroke="#374151" strokeWidth="1"/>
      {[56,68,80,92,104,116,128,140].map(x => <line key={x} x1={x} y1="188" x2={x} y2="214" stroke="#374151" strokeWidth="1"/>)}
      {/* Taillights */}
      <rect x="44" y="236" width="38" height="18" rx="2" fill="#ef4444" opacity="0.6"/>
      <rect x="118" y="236" width="38" height="18" rx="2" fill="#ef4444" opacity="0.6"/>
      {/* Wheels - fat */}
      <ellipse cx="18" cy="78" rx="13" ry="24" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="182" cy="78" rx="13" ry="24" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="18" cy="202" rx="13" ry="24" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="182" cy="202" rx="13" ry="24" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
    </svg>
  )
}

function ATVInterior({ className }) {
  return (
    <svg viewBox="0 0 280 190" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="0" y="0" width="280" height="190" rx="8" fill="#0a1220"/>
      {/* Open air view */}
      <path d="M 0 0 L 280 0 L 280 50 L 0 50 Z" fill="#0d2340" opacity="0.7"/>
      {/* Front fender visible */}
      <path d="M 0 50 L 60 50 L 60 90 L 0 90 Z" fill="#1e3558"/>
      <path d="M 220 50 L 280 50 L 280 90 L 220 90 Z" fill="#1e3558"/>
      {/* Dash panel / instrument area */}
      <path d="M 60 50 L 220 50 L 230 90 L 50 90 Z" fill="#162b46" stroke="#2d4a78" strokeWidth="1"/>
      {/* Digital display */}
      <rect x="80" y="56" width="120" height="28" rx="4" fill="#0a1220" stroke="#2d4a78" strokeWidth="1.5"/>
      <rect x="84" y="59" width="112" height="22" rx="2" fill="#0d2340"/>
      <circle cx="108" cy="70" r="9" fill="#111827" stroke="#374151" strokeWidth="1"/>
      <line x1="108" y1="70" x2="111" y2="62" stroke="#F5A623" strokeWidth="1.5"/>
      <circle cx="140" cy="70" r="7" fill="#111827" stroke="#374151" strokeWidth="1"/>
      <circle cx="172" cy="70" r="9" fill="#111827" stroke="#374151" strokeWidth="1"/>
      <line x1="172" y1="70" x2="175" y2="62" stroke="#ef4444" strokeWidth="1.5"/>
      {/* Handlebars - prominent T-bar */}
      <rect x="0" y="90" width="280" height="12" rx="0" fill="#1e2535"/>
      <rect x="0" y="90" width="110" height="12" rx="6" fill="#374151"/>
      <rect x="170" y="90" width="110" height="12" rx="6" fill="#374151"/>
      <circle cx="16" cy="96" r="10" fill="#1e2535" stroke="#F5A623" strokeWidth="2"/>
      <circle cx="264" cy="96" r="10" fill="#1e2535" stroke="#4b5563" strokeWidth="2"/>
      {/* Kill switch */}
      <rect x="30" y="90" width="18" height="12" rx="5" fill="#ef4444" opacity="0.8"/>
      {/* Thumb throttle */}
      <rect x="232" y="90" width="18" height="12" rx="5" fill="#243b5e" stroke="#374151" strokeWidth="1"/>
      {/* Tank pad visible */}
      <path d="M 96 102 L 184 102 L 188 150 L 92 150 Z" fill="#1e3558" stroke="#2d4a78" strokeWidth="1"/>
      {/* Knee area */}
      <path d="M 0 102 L 96 102 L 96 190 L 0 190 Z" fill="#1a2535"/>
      <path d="M 184 102 L 280 102 L 280 190 L 184 190 Z" fill="#1a2535"/>
      {/* Seat */}
      <path d="M 92 150 L 188 150 L 188 190 L 92 190 Z" fill="#111c2e" stroke="#1e3558" strokeWidth="1"/>
    </svg>
  )
}
