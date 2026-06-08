export default function CanAmSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <CanAmFront className={className} />
  if (view === 'rear') return <CanAmRear className={className} />
  if (view === 'top') return <CanAmTop className={className} />
  if (view === 'interior') return <CanAmInterior className={className} />
  const mirror = view === 'left'
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      style={mirror ? { transform: 'scaleX(-1)' } : {}}>
      <ellipse cx="170" cy="152" rx="145" ry="8" fill="rgba(0,0,0,0.45)"/>
      {/* Rear wheel - large UTV tire */}
      <circle cx="252" cy="122" r="30" fill="#111827"/>
      <circle cx="252" cy="122" r="24" fill="#1f2937"/>
      <circle cx="252" cy="122" r="18" fill="#374151"/>
      <circle cx="252" cy="122" r="12" fill="#4b5563"/>
      <line x1="252" y1="104" x2="252" y2="140" stroke="#9ca3af" strokeWidth="2" opacity="0.7"/>
      <line x1="234" y1="122" x2="270" y2="122" stroke="#9ca3af" strokeWidth="2" opacity="0.7"/>
      <line x1="239" y1="109" x2="265" y2="135" stroke="#9ca3af" strokeWidth="1.5" opacity="0.5"/>
      <line x1="265" y1="109" x2="239" y2="135" stroke="#9ca3af" strokeWidth="1.5" opacity="0.5"/>
      <circle cx="252" cy="122" r="5" fill="#d1d5db"/>
      {/* Front wheel */}
      <circle cx="82" cy="122" r="30" fill="#111827"/>
      <circle cx="82" cy="122" r="24" fill="#1f2937"/>
      <circle cx="82" cy="122" r="18" fill="#374151"/>
      <circle cx="82" cy="122" r="12" fill="#4b5563"/>
      <line x1="82" y1="104" x2="82" y2="140" stroke="#9ca3af" strokeWidth="2" opacity="0.7"/>
      <line x1="64" y1="122" x2="100" y2="122" stroke="#9ca3af" strokeWidth="2" opacity="0.7"/>
      <line x1="69" y1="109" x2="95" y2="135" stroke="#9ca3af" strokeWidth="1.5" opacity="0.5"/>
      <line x1="95" y1="109" x2="69" y2="135" stroke="#9ca3af" strokeWidth="1.5" opacity="0.5"/>
      <circle cx="82" cy="122" r="5" fill="#d1d5db"/>
      {/* Roll cage structure */}
      {/* Main hoop (rear) */}
      <path d="M 196 32 L 196 92 L 210 92 L 210 32 Z" fill="none" stroke="#374151" strokeWidth="4"/>
      {/* A-bar (front) */}
      <path d="M 114 44 L 114 92 L 128 92 L 128 44 Z" fill="none" stroke="#374151" strokeWidth="4"/>
      {/* Roof bar */}
      <path d="M 114 40 C 114 32 128 26 152 24 L 196 24 C 210 24 214 30 214 32" fill="none" stroke="#374151" strokeWidth="4"/>
      {/* Cross bracing */}
      <line x1="128" y1="36" x2="196" y2="36" stroke="#374151" strokeWidth="3"/>
      <line x1="128" y1="36" x2="196" y2="56" stroke="#2d3748" strokeWidth="2" opacity="0.6"/>
      <line x1="196" y1="36" x2="128" y2="56" stroke="#2d3748" strokeWidth="2" opacity="0.6"/>
      {/* Lower frame rails */}
      <path d="M 82 92 L 252 92" stroke="#243b5e" strokeWidth="5"/>
      <path d="M 82 104 L 252 104" stroke="#1a2d4a" strokeWidth="4"/>
      {/* Body panels */}
      <path d="M 82 92 L 114 92 L 114 60 L 82 92 Z" fill="#1e3558" stroke="#2d4a78" strokeWidth="1"/>
      <path d="M 128 58 L 196 58 L 196 92 L 128 92 Z" fill="#243b5e" stroke="#2d4a78" strokeWidth="1"/>
      <path d="M 210 60 L 252 92 L 210 92 Z" fill="#1e3558" stroke="#2d4a78" strokeWidth="1"/>
      {/* Doors / door panels */}
      <path d="M 114 64 L 128 58 L 128 92 L 114 92 Z" fill="#162b46"/>
      <path d="M 196 58 L 210 64 L 210 92 L 196 92 Z" fill="#162b46"/>
      {/* Seats visible */}
      <rect x="136" y="70" width="26" height="22" rx="3" fill="#1a2d4a" stroke="#2d4a78" strokeWidth="1"/>
      <rect x="170" y="70" width="26" height="22" rx="3" fill="#1a2d4a" stroke="#2d4a78" strokeWidth="1"/>
      {/* Headrests */}
      <rect x="140" y="64" width="18" height="8" rx="3" fill="#243b5e"/>
      <rect x="174" y="64" width="18" height="8" rx="3" fill="#243b5e"/>
      {/* Steering wheel (visible from side) */}
      <circle cx="140" cy="82" r="10" fill="none" stroke="#4b5563" strokeWidth="3"/>
      <line x1="130" y1="82" x2="150" y2="82" stroke="#4b5563" strokeWidth="2"/>
      <line x1="140" y1="72" x2="140" y2="92" stroke="#4b5563" strokeWidth="2"/>
      {/* Headlights */}
      <rect x="50" y="84" width="34" height="20" rx="4" fill="#1e3558"/>
      <rect x="52" y="86" width="30" height="16" rx="3" fill="#fbbf24" opacity="0.9"/>
      <path d="M 54 87 L 54 96 L 76 96 L 76 87 Z" fill="#fef3c7" opacity="0.5"/>
      {/* Tail lights */}
      <rect x="252" y="80" width="20" height="20" rx="3" fill="#1e3558"/>
      <rect x="254" y="82" width="16" height="16" rx="2" fill="#ef4444" opacity="0.85"/>
      {/* Rear bumper */}
      <rect x="252" y="96" width="22" height="8" rx="2" fill="#162b46" stroke="#2d4a78" strokeWidth="1"/>
      {/* Skid plate */}
      <path d="M 82 100 L 252 100 L 252 106 L 82 106 Z" fill="#162b46" stroke="#2d4a78" strokeWidth="0.5"/>
      {/* Exhaust */}
      <ellipse cx="236" cy="104" rx="6" ry="4" fill="#1f2937" stroke="#374151" strokeWidth="1"/>
      {/* Can-Am badge area */}
      <rect x="152" y="94" width="30" height="6" rx="1" fill="#1e3558"/>
    </svg>
  )
}

function CanAmFront({ className }) {
  return (
    <svg viewBox="0 0 240 190" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="120" cy="185" rx="116" ry="7" fill="rgba(0,0,0,0.4)"/>
      {/* Wheels */}
      <circle cx="18" cy="138" r="30" fill="#111827"/><circle cx="18" cy="138" r="23" fill="#1f2937"/><circle cx="18" cy="138" r="16" fill="#374151"/><circle cx="18" cy="138" r="10" fill="#4b5563"/><circle cx="18" cy="138" r="4" fill="#9ca3af"/>
      <circle cx="222" cy="138" r="30" fill="#111827"/><circle cx="222" cy="138" r="23" fill="#1f2937"/><circle cx="222" cy="138" r="16" fill="#374151"/><circle cx="222" cy="138" r="10" fill="#4b5563"/><circle cx="222" cy="138" r="4" fill="#9ca3af"/>
      {/* Roll cage */}
      <line x1="40" y1="10" x2="40" y2="108" stroke="#374151" strokeWidth="5"/>
      <line x1="200" y1="10" x2="200" y2="108" stroke="#374151" strokeWidth="5"/>
      <path d="M 40 10 C 40 6 60 4 120 4 C 180 4 200 6 200 10" fill="none" stroke="#374151" strokeWidth="5"/>
      <line x1="40" y1="50" x2="200" y2="50" stroke="#374151" strokeWidth="3"/>
      <line x1="40" y1="50" x2="200" y2="80" stroke="#374151" strokeWidth="2" opacity="0.5"/>
      <line x1="200" y1="50" x2="40" y2="80" stroke="#374151" strokeWidth="2" opacity="0.5"/>
      {/* Body panel */}
      <path d="M 48 108 L 48 80 L 192 80 L 192 108 Z" fill="#243b5e" stroke="#2d4a78" strokeWidth="1"/>
      {/* Headlights */}
      <rect x="40" y="110" width="44" height="22" rx="4" fill="#fbbf24" opacity="0.85"/>
      <path d="M 42 112 L 42 122 L 78 122 L 78 112 Z" fill="#fef9c3" opacity="0.5"/>
      <rect x="156" y="110" width="44" height="22" rx="4" fill="#fbbf24" opacity="0.85"/>
      <path d="M 158 112 L 158 122 L 194 122 L 194 112 Z" fill="#fef9c3" opacity="0.5"/>
      {/* Grille */}
      <rect x="88" y="110" width="64" height="24" rx="3" fill="#0f1c2e" stroke="#2d4a78" strokeWidth="1"/>
      {[94,100,106,112,118,124,130,136,142].map(x => <line key={x} x1={x} y1="112" x2={x} y2="132" stroke="#243b5e" strokeWidth="1"/>)}
      {/* Bumper */}
      <rect x="36" y="132" width="168" height="16" rx="4" fill="#162b46" stroke="#2d4a78" strokeWidth="1.5"/>
      {/* Seats visible from front */}
      <rect x="60" y="88" width="44" height="20" rx="3" fill="#1a2d4a"/>
      <rect x="136" y="88" width="44" height="20" rx="3" fill="#1a2d4a"/>
      {/* Skid plate */}
      <rect x="44" y="146" width="152" height="10" rx="3" fill="#111827" stroke="#374151" strokeWidth="1"/>
    </svg>
  )
}

function CanAmRear({ className }) {
  return (
    <svg viewBox="0 0 240 190" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="120" cy="185" rx="116" ry="7" fill="rgba(0,0,0,0.4)"/>
      <circle cx="18" cy="138" r="30" fill="#111827"/><circle cx="18" cy="138" r="23" fill="#1f2937"/><circle cx="18" cy="138" r="16" fill="#374151"/><circle cx="18" cy="138" r="10" fill="#4b5563"/><circle cx="18" cy="138" r="4" fill="#9ca3af"/>
      <circle cx="222" cy="138" r="30" fill="#111827"/><circle cx="222" cy="138" r="23" fill="#1f2937"/><circle cx="222" cy="138" r="16" fill="#374151"/><circle cx="222" cy="138" r="10" fill="#4b5563"/><circle cx="222" cy="138" r="4" fill="#9ca3af"/>
      <line x1="40" y1="10" x2="40" y2="108" stroke="#374151" strokeWidth="5"/>
      <line x1="200" y1="10" x2="200" y2="108" stroke="#374151" strokeWidth="5"/>
      <path d="M 40 10 C 40 6 60 4 120 4 C 180 4 200 6 200 10" fill="none" stroke="#374151" strokeWidth="5"/>
      <path d="M 48 108 L 48 80 L 192 80 L 192 108 Z" fill="#1e3558" stroke="#2d4a78" strokeWidth="1"/>
      {/* Taillights */}
      <rect x="38" y="112" width="44" height="18" rx="3" fill="#ef4444" opacity="0.85"/>
      <path d="M 40 114 L 40 122 L 76 122 L 76 114 Z" fill="#fca5a5" opacity="0.4"/>
      <rect x="158" y="112" width="44" height="18" rx="3" fill="#ef4444" opacity="0.85"/>
      {/* Reverse lights */}
      <rect x="88" y="112" width="28" height="14" rx="2" fill="#f3f4f6" opacity="0.7"/>
      <rect x="124" y="112" width="28" height="14" rx="2" fill="#f3f4f6" opacity="0.7"/>
      {/* Rear bumper */}
      <rect x="36" y="128" width="168" height="18" rx="4" fill="#162b46" stroke="#2d4a78" strokeWidth="1.5"/>
      {/* Exhaust pipes */}
      <ellipse cx="78" cy="144" rx="10" ry="5" fill="#1f2937" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="162" cy="144" rx="10" ry="5" fill="#1f2937" stroke="#374151" strokeWidth="1.5"/>
      {/* License plate */}
      <rect x="90" y="130" width="60" height="16" rx="2" fill="#374151"/>
      <rect x="92" y="132" width="56" height="12" rx="1" fill="#d1d5db" opacity="0.7"/>
    </svg>
  )
}

function CanAmTop({ className }) {
  return (
    <svg viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Roll cage top view */}
      <rect x="38" y="20" width="124" height="260" rx="10" fill="none" stroke="#374151" strokeWidth="4"/>
      {/* Body */}
      <path d="M 46 20 L 154 20 L 158 270 L 42 270 Z" fill="#243b5e" stroke="#2d4a78" strokeWidth="1"/>
      {/* Seats */}
      <rect x="52" y="80" width="44" height="56" rx="4" fill="#1a2d4a" stroke="#2d4a78" strokeWidth="1"/>
      <rect x="104" y="80" width="44" height="56" rx="4" fill="#1a2d4a" stroke="#2d4a78" strokeWidth="1"/>
      {/* Dash */}
      <rect x="52" y="46" width="96" height="30" rx="4" fill="#162b46" stroke="#2d4a78" strokeWidth="1"/>
      <circle cx="74" cy="61" r="12" fill="none" stroke="#374151" strokeWidth="3"/>
      {/* Steering col */}
      <circle cx="74" cy="76" r="5" fill="#374151"/>
      {/* Rear cargo */}
      <rect x="52" y="140" width="96" height="80" rx="4" fill="#162b46"/>
      {/* Headlights */}
      <rect x="46" y="22" width="32" height="18" rx="2" fill="#fbbf24" opacity="0.6"/>
      <rect x="122" y="22" width="32" height="18" rx="2" fill="#fbbf24" opacity="0.6"/>
      {/* Taillights */}
      <rect x="46" y="258" width="32" height="14" rx="2" fill="#ef4444" opacity="0.6"/>
      <rect x="122" y="258" width="32" height="14" rx="2" fill="#ef4444" opacity="0.6"/>
      {/* Wheels */}
      <ellipse cx="26" cy="76" rx="14" ry="26" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="174" cy="76" rx="14" ry="26" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="26" cy="224" rx="14" ry="26" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="174" cy="224" rx="14" ry="26" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
    </svg>
  )
}

function CanAmInterior({ className }) {
  return (
    <svg viewBox="0 0 280 190" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="0" y="0" width="280" height="190" rx="8" fill="#0a1220"/>
      {/* Open roll cage view */}
      <line x1="0" y1="0" x2="0" y2="190" stroke="#374151" strokeWidth="8"/>
      <line x1="280" y1="0" x2="280" y2="190" stroke="#374151" strokeWidth="8"/>
      <path d="M 4 0 L 276 0 L 276 10 L 4 10 Z" fill="#374151"/>
      {/* View through cage - terrain */}
      <path d="M 0 60 L 280 60 L 280 70 L 0 70 Z" fill="#0d2340"/>
      <path d="M 0 10 L 280 10 L 280 60 L 0 60 Z" fill="#0d2340" opacity="0.7"/>
      {/* Dashboard - UTV style */}
      <path d="M 8 100 L 272 100 Q 280 102 280 118 L 280 140 L 0 140 L 0 118 Q 0 102 8 100 Z" fill="#1e2535"/>
      <path d="M 8 100 L 272 100 L 272 108 L 8 108 Z" fill="#243b5e"/>
      {/* Digital display */}
      <rect x="80" y="104" width="120" height="28" rx="4" fill="#0a1220" stroke="#2d4a78" strokeWidth="1.5"/>
      <rect x="84" y="107" width="112" height="22" rx="2" fill="#0d2340"/>
      <line x1="94" y1="113" x2="186" y2="113" stroke="#243b5e" strokeWidth="1"/>
      <line x1="94" y1="120" x2="160" y2="120" stroke="#243b5e" strokeWidth="1"/>
      {/* Gauges */}
      <circle cx="50" cy="116" r="12" fill="#111827" stroke="#374151" strokeWidth="1"/>
      <circle cx="230" cy="116" r="12" fill="#111827" stroke="#374151" strokeWidth="1"/>
      <line x1="50" y1="116" x2="53" y2="106" stroke="#F5A623" strokeWidth="1.5"/>
      {/* Steering wheel */}
      <circle cx="90" cy="160" r="28" fill="none" stroke="#374151" strokeWidth="6"/>
      <circle cx="90" cy="160" r="9" fill="#1e2535" stroke="#4b5563" strokeWidth="2"/>
      <line x1="90" y1="132" x2="90" y2="151" stroke="#374151" strokeWidth="5"/>
      <line x1="62" y1="160" x2="81" y2="160" stroke="#374151" strokeWidth="5"/>
      <line x1="99" y1="160" x2="118" y2="160" stroke="#374151" strokeWidth="5"/>
      {/* Safety harness hints */}
      <line x1="150" y1="140" x2="150" y2="190" stroke="#ef4444" strokeWidth="3" opacity="0.6"/>
      <line x1="148" y1="140" x2="190" y2="190" stroke="#ef4444" strokeWidth="2" opacity="0.4"/>
      {/* Seats */}
      <path d="M 0 140 L 0 190 L 130 190 L 130 140 Q 70 138 0 140 Z" fill="#1a2535"/>
      <path d="M 150 140 L 150 190 L 280 190 L 280 140 Q 215 138 150 140 Z" fill="#1a2535"/>
    </svg>
  )
}
