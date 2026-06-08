export default function PickupSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <PickupFront className={className} />
  if (view === 'rear') return <PickupRear className={className} />
  if (view === 'top') return <PickupTop className={className} />
  if (view === 'interior') return <PickupInterior className={className} />
  const mirror = view === 'left'
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      style={mirror ? { transform: 'scaleX(-1)' } : {}}>
      {/* Ground shadow */}
      <ellipse cx="162" cy="152" rx="145" ry="8" fill="rgba(0,0,0,0.45)"/>
      {/* Rear wheel */}
      <circle cx="248" cy="126" r="27" fill="#111827"/>
      <circle cx="248" cy="126" r="21" fill="#1f2937"/>
      <circle cx="248" cy="126" r="15" fill="#374151"/>
      <circle cx="248" cy="126" r="10" fill="#4b5563"/>
      <line x1="248" y1="111" x2="248" y2="141" stroke="#9ca3af" strokeWidth="1.5" opacity="0.7"/>
      <line x1="233" y1="126" x2="263" y2="126" stroke="#9ca3af" strokeWidth="1.5" opacity="0.7"/>
      <line x1="238" y1="115" x2="258" y2="137" stroke="#9ca3af" strokeWidth="1.2" opacity="0.6"/>
      <line x1="258" y1="115" x2="238" y2="137" stroke="#9ca3af" strokeWidth="1.2" opacity="0.6"/>
      <circle cx="248" cy="126" r="4" fill="#d1d5db"/>
      {/* Front wheel */}
      <circle cx="80" cy="126" r="27" fill="#111827"/>
      <circle cx="80" cy="126" r="21" fill="#1f2937"/>
      <circle cx="80" cy="126" r="15" fill="#374151"/>
      <circle cx="80" cy="126" r="10" fill="#4b5563"/>
      <line x1="80" y1="111" x2="80" y2="141" stroke="#9ca3af" strokeWidth="1.5" opacity="0.7"/>
      <line x1="65" y1="126" x2="95" y2="126" stroke="#9ca3af" strokeWidth="1.5" opacity="0.7"/>
      <line x1="70" y1="115" x2="90" y2="137" stroke="#9ca3af" strokeWidth="1.2" opacity="0.6"/>
      <line x1="90" y1="115" x2="70" y2="137" stroke="#9ca3af" strokeWidth="1.2" opacity="0.6"/>
      <circle cx="80" cy="126" r="4" fill="#d1d5db"/>
      {/* Fender arches */}
      <path d="M 53 110 Q 80 94 107 110" fill="none" stroke="#162b46" strokeWidth="3.5"/>
      <path d="M 221 110 Q 248 94 275 110" fill="none" stroke="#162b46" strokeWidth="3.5"/>
      {/* Truck bed */}
      <path d="M 148 68 L 148 110 L 276 110 L 276 68 Z" fill="#1a2d4a" stroke="#2d4a78" strokeWidth="1"/>
      {/* Bed inner liner */}
      <path d="M 152 72 L 152 108 L 272 108 L 272 72 Z" fill="#111c2e" stroke="#243b5e" strokeWidth="0.5"/>
      {/* Bed stakes */}
      <rect x="148" y="60" width="4" height="50" fill="#1e3558" stroke="#2d4a78" strokeWidth="0.5"/>
      <rect x="200" y="62" width="3" height="8" fill="#2d4a78"/>
      <rect x="230" y="62" width="3" height="8" fill="#2d4a78"/>
      {/* Tailgate */}
      <rect x="272" y="68" width="6" height="42" fill="#243b5e" stroke="#2d4a78" strokeWidth="1"/>
      {/* Cab body lower */}
      <path d="M 35 110 L 35 88 L 150 88 L 150 110 Z" fill="#1e3558"/>
      {/* Cab main body */}
      <path d="
        M 38 110
        L 38 96 C 38 92 40 88 44 86
        L 54 84 L 58 84
        C 60 76 64 70 70 66
        L 82 60 C 88 55 98 52 110 52
        L 136 52 C 146 52 150 60 150 68
        L 150 110 Z
      " fill="#243b5e"/>
      {/* Hood */}
      <path d="M 38 96 C 38 92 40 88 44 86 L 58 84 L 58 96 Z" fill="#1e3558"/>
      {/* A-pillar */}
      <path d="M 82 60 C 78 64 74 70 70 78 L 70 88 L 82 88 L 90 66 Z" fill="#162b46"/>
      {/* Windshield */}
      <path d="M 90 66 C 94 57 102 53 112 52 L 134 52 L 130 84 L 82 84 Z" fill="#0d2340"/>
      <path d="M 96 68 C 100 62 106 57 114 56 L 128 56 L 125 78 L 99 78 Z" fill="rgba(120,200,255,0.08)"/>
      {/* Rear cab window */}
      <rect x="136" y="56" width="14" height="28" rx="2" fill="#0d2340"/>
      {/* B-pillar */}
      <rect x="130" y="52" width="6" height="36" fill="#162b46"/>
      {/* Door glass */}
      <path d="M 84 84 L 130 84 L 130 88 L 84 88 Z" fill="none"/>
      {/* Door line */}
      <line x1="110" y1="52" x2="110" y2="88" stroke="#162b46" strokeWidth="2"/>
      <line x1="110" y1="88" x2="110" y2="110" stroke="#162b46" strokeWidth="2"/>
      {/* Door handles */}
      <rect x="88" y="96" width="16" height="4" rx="2" fill="#4b5563"/>
      <rect x="120" y="96" width="16" height="4" rx="2" fill="#4b5563"/>
      {/* Character line */}
      <path d="M 55 94 L 148 94 L 220 96" stroke="#2d4a78" strokeWidth="1" opacity="0.6"/>
      {/* Hood center crease */}
      <line x1="38" y1="88" x2="70" y2="78" stroke="#2d4a78" strokeWidth="1" opacity="0.4"/>
      {/* Headlights */}
      <path d="M 32 80 L 32 104 L 46 102 L 47 90 L 44 80 Z" fill="#1e3558"/>
      <path d="M 33 82 L 33 100 L 44 99 L 45 91 L 43 82 Z" fill="#fbbf24" opacity="0.9"/>
      <path d="M 34 82 L 34 90 L 44 90 L 43 82 Z" fill="#fef3c7" opacity="0.6"/>
      <path d="M 38 80 L 58 78" stroke="#fbbf24" strokeWidth="1.5" opacity="0.6"/>
      {/* Taillights - tailgate */}
      <rect x="272" y="72" width="8" height="16" rx="1" fill="#ef4444" opacity="0.8"/>
      <rect x="272" y="92" width="8" height="10" rx="1" fill="#f97316" opacity="0.7"/>
      {/* Bed rails */}
      <rect x="148" y="62" width="124" height="6" fill="#2d4a78" stroke="#374151" strokeWidth="0.5"/>
      {/* Roof */}
      <path d="M 92 52 L 136 52 L 136 48 L 92 48 Z" fill="#1a2d4a"/>
      {/* Mirror */}
      <path d="M 78 66 L 92 62 L 93 72 L 79 74 Z" fill="#162b46"/>
      {/* Step bars */}
      <rect x="60" y="108" width="80" height="5" rx="2" fill="#2d4a78"/>
      {/* License plate */}
      <rect x="260" y="94" width="18" height="10" rx="1" fill="#374151"/>
      <rect x="262" y="96" width="14" height="6" rx="1" fill="#d1d5db" opacity="0.6"/>
    </svg>
  )
}

function PickupFront({ className }) {
  return (
    <svg viewBox="0 0 240 170" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="120" cy="165" rx="112" ry="6" fill="rgba(0,0,0,0.4)"/>
      {/* Wheels */}
      <circle cx="22" cy="130" r="24" fill="#111827"/>
      <circle cx="22" cy="130" r="18" fill="#1f2937"/>
      <circle cx="22" cy="130" r="12" fill="#374151"/>
      <circle cx="22" cy="130" r="7" fill="#4b5563"/>
      <circle cx="22" cy="130" r="3" fill="#9ca3af"/>
      <circle cx="218" cy="130" r="24" fill="#111827"/>
      <circle cx="218" cy="130" r="18" fill="#1f2937"/>
      <circle cx="218" cy="130" r="12" fill="#374151"/>
      <circle cx="218" cy="130" r="7" fill="#4b5563"/>
      <circle cx="218" cy="130" r="3" fill="#9ca3af"/>
      {/* Main body */}
      <path d="M 22 124 L 22 86 L 218 86 L 218 124 Z" fill="#162b46"/>
      <path d="M 28 86 C 28 86 30 32 80 18 L 160 18 C 210 32 212 86 212 86 Z" fill="#243b5e"/>
      {/* Windshield */}
      <path d="M 36 86 C 38 50 65 28 120 22 C 175 28 202 50 204 86 Z" fill="#0d2340"/>
      <path d="M 52 86 C 55 58 76 40 120 34 L 120 86 Z" fill="rgba(100,180,255,0.07)"/>
      {/* Headlights - wide format */}
      <path d="M 22 86 L 22 110 L 68 114 L 72 88 L 48 84 Z" fill="#1e3558"/>
      <path d="M 24 88 L 24 108 L 65 112 L 68 90 L 50 86 Z" fill="#fbbf24" opacity="0.85"/>
      <path d="M 26 88 L 26 98 L 58 100 L 59 90 Z" fill="#fef9c3" opacity="0.6"/>
      <path d="M 218 86 L 218 110 L 172 114 L 168 88 L 192 84 Z" fill="#1e3558"/>
      <path d="M 216 88 L 216 108 L 175 112 L 172 90 L 190 86 Z" fill="#fbbf24" opacity="0.85"/>
      <path d="M 214 88 L 214 98 L 182 100 L 181 90 Z" fill="#fef9c3" opacity="0.6"/>
      {/* Grille - truck style */}
      <path d="M 68 104 L 68 124 L 172 124 L 172 104 Z" fill="#0f1c2e" stroke="#2d4a78" strokeWidth="1.5"/>
      <rect x="68" y="106" width="104" height="4" rx="1" fill="#243b5e"/>
      <rect x="68" y="112" width="104" height="4" rx="1" fill="#243b5e"/>
      <rect x="68" y="118" width="104" height="4" rx="1" fill="#243b5e"/>
      {/* Front logo badge */}
      <rect x="106" y="108" width="28" height="14" rx="2" fill="#162b46" stroke="#94a3b8" strokeWidth="1"/>
      {/* Bumper */}
      <rect x="20" y="124" width="200" height="18" rx="4" fill="#1a2d4a" stroke="#2d4a78" strokeWidth="1"/>
      {/* Tow hook */}
      <circle cx="120" cy="134" r="5" fill="#374151" stroke="#4b5563" strokeWidth="1"/>
      {/* Hood scoop */}
      <path d="M 90 40 L 150 40 L 148 56 L 92 56 Z" fill="#1e3558" opacity="0.5"/>
      {/* Center hood crease */}
      <line x1="120" y1="18" x2="120" y2="86" stroke="#162b46" strokeWidth="2" opacity="0.4"/>
    </svg>
  )
}

function PickupRear({ className }) {
  return (
    <svg viewBox="0 0 240 170" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="120" cy="165" rx="112" ry="6" fill="rgba(0,0,0,0.4)"/>
      <circle cx="22" cy="130" r="24" fill="#111827"/><circle cx="22" cy="130" r="18" fill="#1f2937"/><circle cx="22" cy="130" r="12" fill="#374151"/><circle cx="22" cy="130" r="7" fill="#4b5563"/><circle cx="22" cy="130" r="3" fill="#9ca3af"/>
      <circle cx="218" cy="130" r="24" fill="#111827"/><circle cx="218" cy="130" r="18" fill="#1f2937"/><circle cx="218" cy="130" r="12" fill="#374151"/><circle cx="218" cy="130" r="7" fill="#4b5563"/><circle cx="218" cy="130" r="3" fill="#9ca3af"/>
      {/* Bed opening */}
      <rect x="22" y="60" width="196" height="76" fill="#111c2e" stroke="#2d4a78" strokeWidth="1.5"/>
      {/* Bed liner visible */}
      <rect x="26" y="64" width="188" height="68" fill="#0a1220" stroke="#162b46" strokeWidth="0.5"/>
      {/* Tailgate */}
      <rect x="22" y="130" width="196" height="12" fill="#162b46" stroke="#2d4a78" strokeWidth="1"/>
      {/* Taillights */}
      <path d="M 22 62 L 22 100 L 52 100 L 56 66 Z" fill="#1e3558"/>
      <path d="M 24 64 L 24 98 L 50 98 L 53 68 Z" fill="#ef4444" opacity="0.9"/>
      <path d="M 24 64 L 24 80 L 45 78 Z" fill="#fca5a5" opacity="0.5"/>
      <path d="M 218 62 L 218 100 L 188 100 L 184 66 Z" fill="#1e3558"/>
      <path d="M 216 64 L 216 98 L 190 98 L 187 68 Z" fill="#ef4444" opacity="0.9"/>
      <path d="M 216 64 L 216 80 L 195 78 Z" fill="#fca5a5" opacity="0.5"/>
      {/* Reverse lights */}
      <rect x="52" y="84" width="24" height="14" rx="2" fill="#f3f4f6" opacity="0.7"/>
      <rect x="164" y="84" width="24" height="14" rx="2" fill="#f3f4f6" opacity="0.7"/>
      {/* License plate */}
      <rect x="82" y="120" width="76" height="16" rx="2" fill="#374151"/>
      <rect x="84" y="122" width="72" height="12" rx="1" fill="#d1d5db" opacity="0.7"/>
      {/* Bumper */}
      <rect x="18" y="140" width="204" height="18" rx="3" fill="#1a2d4a" stroke="#2d4a78" strokeWidth="1"/>
      {/* Tow hitch */}
      <rect x="110" y="152" width="20" height="10" rx="2" fill="#374151" stroke="#4b5563" strokeWidth="1"/>
      <circle cx="120" cy="162" r="4" fill="#4b5563" stroke="#6b7280" strokeWidth="1"/>
      {/* Exhaust */}
      <ellipse cx="70" cy="156" rx="8" ry="4" fill="#1f2937" stroke="#374151" strokeWidth="1"/>
      <ellipse cx="170" cy="156" rx="8" ry="4" fill="#1f2937" stroke="#374151" strokeWidth="1"/>
    </svg>
  )
}

function PickupTop({ className }) {
  return (
    <svg viewBox="0 0 220 340" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Body outline */}
      <path d="M 46 14 C 28 14 16 26 14 44 L 12 72 L 12 180 L 14 186 L 206 186 L 208 180 L 208 72 L 206 44 C 204 26 192 14 174 14 Z" fill="#243b5e" stroke="#2d4a78" strokeWidth="1.5"/>
      {/* Truck bed */}
      <path d="M 14 186 L 14 318 C 14 328 20 334 30 334 L 190 334 C 200 334 206 328 206 318 L 206 186 Z" fill="#1a2d4a" stroke="#2d4a78" strokeWidth="1.5"/>
      {/* Bed liner */}
      <rect x="20" y="192" width="180" height="136" rx="3" fill="#111c2e" stroke="#162b46" strokeWidth="0.5"/>
      {/* Hood */}
      <path d="M 46 14 L 174 14 L 176 68 L 44 68 Z" fill="#1e3558"/>
      {/* Windshield */}
      <rect x="44" y="68" width="132" height="52" rx="4" fill="#0d2340" opacity="0.9"/>
      {/* Cab roof */}
      <rect x="50" y="124" width="120" height="60" rx="6" fill="#1e3558"/>
      {/* Door lines */}
      <line x1="44" y1="124" x2="176" y2="124" stroke="#162b46" strokeWidth="2"/>
      <line x1="110" y1="68" x2="110" y2="184" stroke="#162b46" strokeWidth="2"/>
      {/* Headlights */}
      <rect x="14" y="22" width="24" height="42" rx="3" fill="#fbbf24" opacity="0.6"/>
      <rect x="182" y="22" width="24" height="42" rx="3" fill="#fbbf24" opacity="0.6"/>
      {/* Taillights */}
      <rect x="14" y="302" width="24" height="28" rx="3" fill="#ef4444" opacity="0.6"/>
      <rect x="182" y="302" width="24" height="28" rx="3" fill="#ef4444" opacity="0.6"/>
      {/* Wheels */}
      <ellipse cx="20" cy="92" rx="11" ry="22" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="200" cy="92" rx="11" ry="22" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="20" cy="288" rx="11" ry="22" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="200" cy="288" rx="11" ry="22" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      {/* Bed divider lines */}
      <line x1="110" y1="186" x2="110" y2="332" stroke="#162b46" strokeWidth="1.5"/>
      <line x1="20" y1="256" x2="200" y2="256" stroke="#162b46" strokeWidth="1"/>
    </svg>
  )
}

function PickupInterior({ className }) {
  return (
    <svg viewBox="0 0 280 190" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="0" y="0" width="280" height="190" rx="8" fill="#0a1220"/>
      <path d="M 10 0 L 270 0 L 270 75 Q 270 96 248 100 L 32 100 Q 10 96 10 75 Z" fill="#0d2340"/>
      <path d="M 30 5 L 250 5 L 244 82 L 36 82 Z" fill="rgba(100,180,255,0.06)"/>
      {/* Dashboard - truck style, higher */}
      <path d="M 0 100 L 280 100 L 280 145 L 0 145 Z" fill="#1e2535"/>
      <path d="M 0 100 L 280 100 L 280 106 L 0 106 Z" fill="#243b5e"/>
      {/* Large infotainment */}
      <rect x="90" y="104" width="100" height="52" rx="4" fill="#0a1220" stroke="#2d4a78" strokeWidth="1.5"/>
      <rect x="93" y="107" width="94" height="46" rx="2" fill="#0d2340"/>
      <line x1="103" y1="116" x2="183" y2="116" stroke="#243b5e" strokeWidth="1"/>
      <line x1="103" y1="124" x2="183" y2="124" stroke="#243b5e" strokeWidth="1"/>
      <line x1="103" y1="132" x2="163" y2="132" stroke="#243b5e" strokeWidth="1"/>
      {/* Gauge cluster */}
      <rect x="60" y="108" width="26" height="26" rx="12" fill="#111827" stroke="#374151" strokeWidth="1"/>
      <rect x="194" y="108" width="26" height="26" rx="12" fill="#111827" stroke="#374151" strokeWidth="1"/>
      <circle cx="73" cy="121" r="8" fill="#0f1820" stroke="#374151" strokeWidth="1"/>
      <circle cx="207" cy="121" r="8" fill="#0f1820" stroke="#374151" strokeWidth="1"/>
      <line x1="73" y1="121" x2="76" y2="113" stroke="#F5A623" strokeWidth="1.5"/>
      {/* Steering wheel - large truck style */}
      <circle cx="82" cy="160" r="30" fill="none" stroke="#374151" strokeWidth="6"/>
      <circle cx="82" cy="160" r="10" fill="#1e2535" stroke="#4b5563" strokeWidth="2"/>
      <line x1="82" y1="130" x2="82" y2="150" stroke="#374151" strokeWidth="5"/>
      <line x1="52" y1="160" x2="72" y2="160" stroke="#374151" strokeWidth="5"/>
      <line x1="92" y1="160" x2="112" y2="160" stroke="#374151" strokeWidth="5"/>
      {/* Gear shifter */}
      <rect x="138" y="148" width="20" height="42" rx="4" fill="#162b46" stroke="#243b5e" strokeWidth="1"/>
      <circle cx="148" cy="148" r="8" fill="#1e2535" stroke="#4b5563" strokeWidth="1.5"/>
      {/* Vent cluster */}
      <rect x="12" y="108" width="44" height="16" rx="3" fill="#111827" stroke="#2d4a78" strokeWidth="0.5"/>
      <rect x="224" y="108" width="44" height="16" rx="3" fill="#111827" stroke="#2d4a78" strokeWidth="0.5"/>
      {[18,24,30,36,42,48].map(x => <line key={x} x1={x} y1="112" x2={x} y2="120" stroke="#374151" strokeWidth="1"/>)}
      {[230,236,242,248,254,260].map(x => <line key={x} x1={x} y1="112" x2={x} y2="120" stroke="#374151" strokeWidth="1"/>)}
      {/* Seats */}
      <path d="M 0 145 L 0 190 L 120 190 L 120 145 Q 70 143 0 145 Z" fill="#1a2535"/>
      <path d="M 160 145 L 160 190 L 280 190 L 280 145 Q 210 143 160 145 Z" fill="#1a2535"/>
      <line x1="0" y1="162" x2="120" y2="162" stroke="#243b5e" strokeWidth="1" opacity="0.6"/>
      <line x1="160" y1="162" x2="280" y2="162" stroke="#243b5e" strokeWidth="1" opacity="0.6"/>
      {/* Rearview mirror */}
      <rect x="118" y="10" width="44" height="20" rx="3" fill="#1e2535" stroke="#374151" strokeWidth="1"/>
      <rect x="120" y="12" width="40" height="16" rx="2" fill="#0d2340"/>
      <line x1="140" y1="30" x2="140" y2="44" stroke="#374151" strokeWidth="2"/>
    </svg>
  )
}
