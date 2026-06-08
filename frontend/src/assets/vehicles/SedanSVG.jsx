export default function SedanSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <SedanFront className={className} />
  if (view === 'rear') return <SedanRear className={className} />
  if (view === 'top') return <SedanTop className={className} />
  if (view === 'interior') return <SedanInterior className={className} />
  const mirror = view === 'left'
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      style={mirror ? { transform: 'scaleX(-1)' } : {}}>
      <defs>
        <radialGradient id="sw1" cx="50%" cy="40%" r="60%"><stop offset="0%" stopColor="#2d4a78"/><stop offset="100%" stopColor="#243b5e"/></radialGradient>
        <radialGradient id="rim1" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#6b7280"/><stop offset="100%" stopColor="#1f2937"/></radialGradient>
      </defs>
      {/* Ground shadow */}
      <ellipse cx="162" cy="152" rx="140" ry="8" fill="rgba(0,0,0,0.45)"/>
      {/* Rear wheel */}
      <circle cx="242" cy="126" r="25" fill="#111827"/>
      <circle cx="242" cy="126" r="20" fill="#1f2937"/>
      <circle cx="242" cy="126" r="15" fill="#374151"/>
      <circle cx="242" cy="126" r="10" fill="#4b5563"/>
      <line x1="242" y1="111" x2="242" y2="141" stroke="#9ca3af" strokeWidth="1.5" opacity="0.7"/>
      <line x1="227" y1="126" x2="257" y2="126" stroke="#9ca3af" strokeWidth="1.5" opacity="0.7"/>
      <line x1="232" y1="115" x2="252" y2="137" stroke="#9ca3af" strokeWidth="1.2" opacity="0.6"/>
      <line x1="252" y1="115" x2="232" y2="137" stroke="#9ca3af" strokeWidth="1.2" opacity="0.6"/>
      <circle cx="242" cy="126" r="4" fill="#d1d5db"/>
      {/* Front wheel */}
      <circle cx="88" cy="126" r="25" fill="#111827"/>
      <circle cx="88" cy="126" r="20" fill="#1f2937"/>
      <circle cx="88" cy="126" r="15" fill="#374151"/>
      <circle cx="88" cy="126" r="10" fill="#4b5563"/>
      <line x1="88" y1="111" x2="88" y2="141" stroke="#9ca3af" strokeWidth="1.5" opacity="0.7"/>
      <line x1="73" y1="126" x2="103" y2="126" stroke="#9ca3af" strokeWidth="1.5" opacity="0.7"/>
      <line x1="78" y1="115" x2="98" y2="137" stroke="#9ca3af" strokeWidth="1.2" opacity="0.6"/>
      <line x1="98" y1="115" x2="78" y2="137" stroke="#9ca3af" strokeWidth="1.2" opacity="0.6"/>
      <circle cx="88" cy="126" r="4" fill="#d1d5db"/>
      {/* Fender arches */}
      <path d="M63 110 Q88 95 113 110" fill="none" stroke="#162b46" strokeWidth="3"/>
      <path d="M217 110 Q242 95 267 110" fill="none" stroke="#162b46" strokeWidth="3"/>
      {/* Rocker / body sill */}
      <path d="M113 110 L217 110 L217 118 L113 118 Z" fill="#162b46"/>
      {/* Main body - lower */}
      <path d="M38 108 L38 116 Q40 122 50 124 L270 124 Q280 122 282 116 L282 108 Q266 108 242 108 L88 108 Q63 108 38 108 Z" fill="#1a2d4a"/>
      {/* Main body - full silhouette */}
      <path d="
        M 42 116
        L 42 104 C 42 100 44 95 48 92
        L 60 88 L 66 88
        C 68 80 72 74 78 70
        L 95 62 C 100 56 110 52 122 50
        L 200 50 C 216 50 228 56 236 66
        L 248 80 C 254 86 258 92 260 98
        L 278 100 L 278 116
        Z
      " fill="url(#sw1)"/>
      {/* Hood panel */}
      <path d="M 42 104 C 42 100 44 95 48 92 L 60 88 L 78 88 L 78 104 Z" fill="#1e3558"/>
      {/* Trunk panel */}
      <path d="M 248 80 C 254 86 258 92 260 98 L 278 100 L 278 108 L 252 108 L 248 88 Z" fill="#1e3558"/>
      {/* Character line */}
      <path d="M 58 96 L 258 96" stroke="#2d4a78" strokeWidth="1" opacity="0.6"/>
      {/* A-pillar + windshield frame */}
      <path d="M 95 62 L 78 88 L 78 104 L 88 104 L 100 68 Z" fill="#162b46"/>
      {/* C-pillar */}
      <path d="M 200 50 L 236 66 L 248 80 L 240 80 L 210 56 Z" fill="#162b46"/>
      {/* Windshield */}
      <path d="M 100 68 C 104 58 114 52 124 51 L 170 51 L 158 84 L 100 84 Z" fill="#0d2340"/>
      <path d="M 106 70 C 110 62 118 57 126 56 L 152 56 L 143 78 L 108 78 Z" fill="rgba(120,200,255,0.08)"/>
      {/* Rear window */}
      <path d="M 194 52 L 208 54 C 220 56 230 62 237 72 L 240 80 L 200 80 L 194 52 Z" fill="#0d2340"/>
      {/* Door glass (x2) */}
      <path d="M 162 51 L 192 51 L 198 80 L 160 80 Z" fill="#0d2340"/>
      <path d="M 125 84 L 196 84 L 196 104 L 125 104 Z" fill="none"/>
      <path d="M 160 51 L 194 52 L 194 51 L 160 51 Z" fill="#162b46" strokeWidth="0"/>
      {/* Window divider B-pillar */}
      <rect x="158" y="51" width="5" height="33" fill="#162b46"/>
      {/* Door line vertical */}
      <line x1="162" y1="84" x2="162" y2="110" stroke="#162b46" strokeWidth="2"/>
      {/* Door handles */}
      <rect x="126" y="96" width="22" height="4" rx="2" fill="#4b5563"/>
      <rect x="188" y="96" width="22" height="4" rx="2" fill="#4b5563"/>
      {/* Headlight cluster */}
      <path d="M 36 90 L 36 108 L 48 106 L 50 96 L 48 90 Z" fill="#1e3558"/>
      <path d="M 37 93 L 37 105 L 47 103 L 49 96 L 47 93 Z" fill="#fbbf24" opacity="0.9"/>
      <path d="M 37 93 L 37 100 L 47 98 L 47 93 Z" fill="#fef3c7" opacity="0.7"/>
      <line x1="36" y1="90" x2="36" y2="108" stroke="#374151" strokeWidth="0.5"/>
      {/* DRL strip */}
      <path d="M 42 90 L 64 89" stroke="#fbbf24" strokeWidth="1.5" opacity="0.7"/>
      {/* Rear taillight */}
      <path d="M 278 92 L 280 110 L 268 110 L 265 96 L 268 92 Z" fill="#1e3558"/>
      <path d="M 278 94 L 279 108 L 270 108 L 267 97 L 270 94 Z" fill="#ef4444" opacity="0.9"/>
      <path d="M 278 94 L 278 100 L 270 99 L 270 94 Z" fill="#fca5a5" opacity="0.5"/>
      {/* Trunk line */}
      <path d="M 248 80 L 270 84" stroke="#2d4a78" strokeWidth="1" opacity="0.5"/>
      {/* Mirror */}
      <path d="M 96 68 L 110 64 L 112 72 L 97 74 Z" fill="#162b46" stroke="#243b5e" strokeWidth="0.5"/>
      {/* Antenna */}
      <line x1="204" y1="50" x2="208" y2="30" stroke="#374151" strokeWidth="1.5"/>
      {/* License plate area rear */}
      <rect x="260" y="110" width="18" height="10" rx="1" fill="#374151"/>
      <rect x="262" y="112" width="14" height="6" rx="1" fill="#d1d5db" opacity="0.6"/>
      {/* Exhaust */}
      <ellipse cx="258" cy="122" rx="5" ry="3" fill="#1f2937" stroke="#374151" strokeWidth="1"/>
    </svg>
  )
}

function SedanFront({ className }) {
  return (
    <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="120" cy="155" rx="108" ry="6" fill="rgba(0,0,0,0.4)"/>
      {/* Wheels */}
      <circle cx="28" cy="124" r="22" fill="#111827"/>
      <circle cx="28" cy="124" r="17" fill="#1f2937"/>
      <circle cx="28" cy="124" r="11" fill="#374151"/>
      <circle cx="28" cy="124" r="6" fill="#4b5563"/>
      <circle cx="28" cy="124" r="2.5" fill="#9ca3af"/>
      <circle cx="212" cy="124" r="22" fill="#111827"/>
      <circle cx="212" cy="124" r="17" fill="#1f2937"/>
      <circle cx="212" cy="124" r="11" fill="#374151"/>
      <circle cx="212" cy="124" r="6" fill="#4b5563"/>
      <circle cx="212" cy="124" r="2.5" fill="#9ca3af"/>
      {/* Body */}
      <path d="M 28 120 L 28 90 C 28 88 30 86 32 86 L 208 86 C 210 86 212 88 212 90 L 212 120 Z" fill="#1a2d4a"/>
      <path d="M 34 86 C 34 86 38 40 80 28 L 160 28 C 202 40 206 86 206 86 Z" fill="#243b5e"/>
      {/* Windshield */}
      <path d="M 42 86 C 44 52 68 34 120 28 C 172 34 196 52 198 86 Z" fill="#0d2340"/>
      <path d="M 55 86 C 57 58 76 42 120 37 L 120 86 Z" fill="rgba(100,180,255,0.07)"/>
      <path d="M 185 86 C 183 58 164 42 120 37 L 120 86 Z" fill="rgba(100,180,255,0.05)"/>
      {/* Headlights */}
      <path d="M 30 88 L 30 106 L 66 108 L 68 90 L 46 86 Z" fill="#1e3558"/>
      <path d="M 32 90 L 32 104 L 63 106 L 65 92 L 48 88 Z" fill="#fbbf24" opacity="0.85"/>
      <path d="M 34 90 L 34 98 L 56 99 L 57 91 Z" fill="#fef9c3" opacity="0.6"/>
      <path d="M 210 88 L 210 106 L 174 108 L 172 90 L 194 86 Z" fill="#1e3558"/>
      <path d="M 208 90 L 208 104 L 177 106 L 175 92 L 192 88 Z" fill="#fbbf24" opacity="0.85"/>
      <path d="M 206 90 L 206 98 L 184 99 L 183 91 Z" fill="#fef9c3" opacity="0.6"/>
      {/* Grille */}
      <path d="M 70 104 L 70 118 L 170 118 L 170 104 Q 120 100 70 104 Z" fill="#0f1c2e" stroke="#2d4a78" strokeWidth="1"/>
      <line x1="70" y1="108" x2="170" y2="108" stroke="#243b5e" strokeWidth="1"/>
      <line x1="70" y1="112" x2="170" y2="112" stroke="#243b5e" strokeWidth="1"/>
      <line x1="70" y1="116" x2="170" y2="116" stroke="#243b5e" strokeWidth="1"/>
      {/* Bumper */}
      <rect x="26" y="120" width="188" height="14" rx="4" fill="#162b46" stroke="#243b5e" strokeWidth="1"/>
      <rect x="75" y="122" width="90" height="8" rx="2" fill="#0f1c2e"/>
      {/* Hood center crease */}
      <line x1="120" y1="28" x2="120" y2="86" stroke="#1e3558" strokeWidth="1.5" opacity="0.5"/>
      {/* Front logo */}
      <circle cx="120" cy="110" r="6" fill="#162b46" stroke="#94a3b8" strokeWidth="1"/>
    </svg>
  )
}

function SedanRear({ className }) {
  return (
    <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="120" cy="155" rx="108" ry="6" fill="rgba(0,0,0,0.4)"/>
      {/* Wheels */}
      <circle cx="28" cy="124" r="22" fill="#111827"/>
      <circle cx="28" cy="124" r="17" fill="#1f2937"/>
      <circle cx="28" cy="124" r="11" fill="#374151"/>
      <circle cx="28" cy="124" r="6" fill="#4b5563"/>
      <circle cx="28" cy="124" r="2.5" fill="#9ca3af"/>
      <circle cx="212" cy="124" r="22" fill="#111827"/>
      <circle cx="212" cy="124" r="17" fill="#1f2937"/>
      <circle cx="212" cy="124" r="11" fill="#374151"/>
      <circle cx="212" cy="124" r="6" fill="#4b5563"/>
      <circle cx="212" cy="124" r="2.5" fill="#9ca3af"/>
      {/* Body */}
      <path d="M 28 120 L 28 88 L 212 88 L 212 120 Z" fill="#1a2d4a"/>
      <path d="M 32 88 C 34 56 56 36 120 32 C 184 36 206 56 208 88 Z" fill="#243b5e"/>
      {/* Rear window */}
      <path d="M 48 88 C 52 60 72 44 120 40 C 168 44 188 60 192 88 Z" fill="#0d2340"/>
      <path d="M 65 88 C 68 64 82 50 120 46 L 120 88 Z" fill="rgba(100,180,255,0.07)"/>
      {/* Taillights */}
      <path d="M 28 88 L 28 110 L 66 112 L 68 90 Z" fill="#1e3558"/>
      <path d="M 30 90 L 30 108 L 63 110 L 65 92 Z" fill="#ef4444" opacity="0.9"/>
      <path d="M 32 90 L 32 100 L 57 101 Z" fill="#fca5a5" opacity="0.5"/>
      <path d="M 212 88 L 212 110 L 174 112 L 172 90 Z" fill="#1e3558"/>
      <path d="M 210 90 L 210 108 L 177 110 L 175 92 Z" fill="#ef4444" opacity="0.9"/>
      <path d="M 208 90 L 208 100 L 183 101 Z" fill="#fca5a5" opacity="0.5"/>
      {/* License plate */}
      <rect x="82" y="106" width="76" height="16" rx="2" fill="#374151"/>
      <rect x="84" y="108" width="72" height="12" rx="1" fill="#d1d5db" opacity="0.7"/>
      {/* Bumper */}
      <rect x="26" y="118" width="188" height="16" rx="4" fill="#162b46" stroke="#243b5e" strokeWidth="1"/>
      {/* Exhaust pipes */}
      <ellipse cx="75" cy="132" rx="7" ry="4" fill="#1f2937" stroke="#374151" strokeWidth="1"/>
      <ellipse cx="165" cy="132" rx="7" ry="4" fill="#1f2937" stroke="#374151" strokeWidth="1"/>
      {/* Trunk/hatch line */}
      <path d="M 34 88 L 206 88" stroke="#2d4a78" strokeWidth="0.5" opacity="0.5" strokeDasharray="4,3"/>
      {/* Rear logo */}
      <circle cx="120" cy="98" r="6" fill="#162b46" stroke="#94a3b8" strokeWidth="1"/>
    </svg>
  )
}

function SedanTop({ className }) {
  return (
    <svg viewBox="0 0 200 320" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Body outline */}
      <path d="M 50 20 C 30 20 18 35 16 55 L 14 80 L 14 240 L 16 265 C 18 285 30 300 50 300 L 150 300 C 170 300 182 285 184 265 L 186 240 L 186 80 L 184 55 C 182 35 170 20 150 20 Z" fill="#243b5e" stroke="#2d4a78" strokeWidth="1.5"/>
      {/* Hood */}
      <path d="M 50 20 L 150 20 L 152 72 L 48 72 Z" fill="#1e3558"/>
      {/* Windshield */}
      <rect x="48" y="72" width="104" height="52" rx="4" fill="#0d2340" opacity="0.9"/>
      {/* Roof */}
      <rect x="52" y="128" width="96" height="80" rx="6" fill="#1a2d4a"/>
      {/* Rear window */}
      <rect x="50" y="212" width="100" height="44" rx="4" fill="#0d2340" opacity="0.9"/>
      {/* Trunk */}
      <path d="M 48 256 L 152 256 L 150 300 L 50 300 Z" fill="#1e3558"/>
      {/* Door lines */}
      <line x1="48" y1="128" x2="152" y2="128" stroke="#162b46" strokeWidth="1.5"/>
      <line x1="48" y1="208" x2="152" y2="208" stroke="#162b46" strokeWidth="1.5"/>
      <line x1="100" y1="128" x2="100" y2="208" stroke="#162b46" strokeWidth="1.5"/>
      {/* Front headlights */}
      <rect x="18" y="28" width="22" height="38" rx="3" fill="#fbbf24" opacity="0.6"/>
      <rect x="160" y="28" width="22" height="38" rx="3" fill="#fbbf24" opacity="0.6"/>
      {/* Rear taillights */}
      <rect x="18" y="254" width="22" height="38" rx="3" fill="#ef4444" opacity="0.6"/>
      <rect x="160" y="254" width="22" height="38" rx="3" fill="#ef4444" opacity="0.6"/>
      {/* Wheels */}
      <ellipse cx="24" cy="90" rx="10" ry="18" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="176" cy="90" rx="10" ry="18" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="24" cy="230" rx="10" ry="18" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="176" cy="230" rx="10" ry="18" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      {/* Hood crease */}
      <line x1="100" y1="20" x2="100" y2="72" stroke="#162b46" strokeWidth="1" opacity="0.5"/>
      {/* Mirrors */}
      <path d="M 14 124 L 4 120 L 4 130 L 14 128 Z" fill="#162b46"/>
      <path d="M 186 124 L 196 120 L 196 130 L 186 128 Z" fill="#162b46"/>
    </svg>
  )
}

function SedanInterior({ className }) {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Background - windshield */}
      <rect x="0" y="0" width="280" height="180" rx="8" fill="#0a1220"/>
      <path d="M 20 0 L 260 0 L 260 70 Q 260 90 240 95 L 40 95 Q 20 90 20 70 Z" fill="#0d2340"/>
      <path d="M 40 5 L 240 5 L 235 80 L 45 80 Z" fill="rgba(100,180,255,0.06)"/>
      {/* Dashboard */}
      <path d="M 10 95 L 270 95 Q 280 96 280 110 L 280 140 L 0 140 L 0 110 Q 0 96 10 95 Z" fill="#1e2535"/>
      <path d="M 15 95 L 265 95 L 265 100 L 15 100 Z" fill="#243b5e"/>
      {/* Instrument cluster */}
      <rect x="70" y="100" width="140" height="35" rx="6" fill="#0f1c2e" stroke="#2d4a78" strokeWidth="1"/>
      <circle cx="105" cy="117" r="14" fill="#111827" stroke="#374151" strokeWidth="1"/>
      <circle cx="140" cy="117" r="10" fill="#111827" stroke="#374151" strokeWidth="1"/>
      <circle cx="175" cy="117" r="14" fill="#111827" stroke="#374151" strokeWidth="1"/>
      {/* Speedometer needle */}
      <line x1="105" y1="117" x2="110" y2="107" stroke="#F5A623" strokeWidth="1.5"/>
      {/* Infotainment screen */}
      <rect x="100" y="105" width="80" height="45" rx="4" fill="#0a1220" stroke="#2d4a78" strokeWidth="1"/>
      <rect x="104" y="108" width="72" height="38" rx="2" fill="#0d2340"/>
      <line x1="115" y1="115" x2="175" y2="115" stroke="#243b5e" strokeWidth="1" opacity="0.7"/>
      <line x1="115" y1="122" x2="175" y2="122" stroke="#243b5e" strokeWidth="1" opacity="0.7"/>
      <line x1="115" y1="129" x2="155" y2="129" stroke="#243b5e" strokeWidth="1" opacity="0.7"/>
      {/* Steering wheel */}
      <circle cx="90" cy="150" r="28" fill="none" stroke="#374151" strokeWidth="5"/>
      <circle cx="90" cy="150" r="8" fill="#1e2535" stroke="#4b5563" strokeWidth="2"/>
      <line x1="90" y1="122" x2="90" y2="142" stroke="#374151" strokeWidth="4"/>
      <line x1="62" y1="150" x2="82" y2="150" stroke="#374151" strokeWidth="4"/>
      <line x1="98" y1="150" x2="118" y2="150" stroke="#374151" strokeWidth="4"/>
      {/* Center console */}
      <rect x="128" y="140" width="24" height="40" rx="4" fill="#162b46" stroke="#243b5e" strokeWidth="1"/>
      <rect x="132" y="148" width="16" height="8" rx="2" fill="#0f1c2e"/>
      <circle cx="140" cy="165" r="5" fill="#1e2535" stroke="#4b5563" strokeWidth="1"/>
      {/* Seats */}
      <path d="M 10 140 L 10 180 L 118 180 L 118 140 Q 80 138 10 140 Z" fill="#1a2535"/>
      <path d="M 162 140 L 162 180 L 270 180 L 270 140 Q 200 138 162 140 Z" fill="#1a2535"/>
      <line x1="10" y1="155" x2="118" y2="155" stroke="#243b5e" strokeWidth="1" opacity="0.6"/>
      <line x1="162" y1="155" x2="270" y2="155" stroke="#243b5e" strokeWidth="1" opacity="0.6"/>
      {/* HVAC vents */}
      <rect x="16" y="100" width="30" height="12" rx="2" fill="#111827" stroke="#2d4a78" strokeWidth="0.5"/>
      <rect x="234" y="100" width="30" height="12" rx="2" fill="#111827" stroke="#2d4a78" strokeWidth="0.5"/>
      <line x1="22" y1="104" x2="22" y2="110" stroke="#374151" strokeWidth="1"/>
      <line x1="27" y1="104" x2="27" y2="110" stroke="#374151" strokeWidth="1"/>
      <line x1="32" y1="104" x2="32" y2="110" stroke="#374151" strokeWidth="1"/>
      <line x1="37" y1="104" x2="37" y2="110" stroke="#374151" strokeWidth="1"/>
      <line x1="240" y1="104" x2="240" y2="110" stroke="#374151" strokeWidth="1"/>
      <line x1="245" y1="104" x2="245" y2="110" stroke="#374151" strokeWidth="1"/>
      <line x1="250" y1="104" x2="250" y2="110" stroke="#374151" strokeWidth="1"/>
      <line x1="255" y1="104" x2="255" y2="110" stroke="#374151" strokeWidth="1"/>
      {/* Rearview mirror */}
      <rect x="122" y="12" width="36" height="16" rx="3" fill="#1e2535" stroke="#374151" strokeWidth="1"/>
      <rect x="124" y="14" width="32" height="12" rx="2" fill="#0d2340"/>
      <line x1="140" y1="28" x2="140" y2="40" stroke="#374151" strokeWidth="2"/>
    </svg>
  )
}
