export default function VanSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <VanFront className={className} />
  if (view === 'rear') return <VanRear className={className} />
  if (view === 'top') return <VanTop className={className} />
  if (view === 'interior') return <VanInterior className={className} />
  const mirror = view === 'left'
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      style={mirror ? { transform: 'scaleX(-1)' } : {}}>
      <ellipse cx="162" cy="152" rx="148" ry="8" fill="rgba(0,0,0,0.45)"/>
      {/* Rear wheel */}
      <circle cx="248" cy="128" r="24" fill="#111827"/><circle cx="248" cy="128" r="18" fill="#1f2937"/><circle cx="248" cy="128" r="13" fill="#374151"/><circle cx="248" cy="128" r="8" fill="#4b5563"/>
      <line x1="248" y1="115" x2="248" y2="141" stroke="#9ca3af" strokeWidth="1.5" opacity="0.7"/>
      <line x1="235" y1="128" x2="261" y2="128" stroke="#9ca3af" strokeWidth="1.5" opacity="0.7"/>
      <circle cx="248" cy="128" r="3.5" fill="#d1d5db"/>
      {/* Front wheel */}
      <circle cx="76" cy="128" r="24" fill="#111827"/><circle cx="76" cy="128" r="18" fill="#1f2937"/><circle cx="76" cy="128" r="13" fill="#374151"/><circle cx="76" cy="128" r="8" fill="#4b5563"/>
      <line x1="76" y1="115" x2="76" y2="141" stroke="#9ca3af" strokeWidth="1.5" opacity="0.7"/>
      <line x1="63" y1="128" x2="89" y2="128" stroke="#9ca3af" strokeWidth="1.5" opacity="0.7"/>
      <circle cx="76" cy="128" r="3.5" fill="#d1d5db"/>
      {/* Fender arches */}
      <path d="M 52 114 Q 76 98 100 114" fill="none" stroke="#162b46" strokeWidth="3"/>
      <path d="M 224 114 Q 248 98 272 114" fill="none" stroke="#162b46" strokeWidth="3"/>
      {/* Van box body */}
      <path d="M 36 114 L 36 96 C 36 90 38 84 44 80 L 56 74 L 64 70 C 68 56 78 46 92 42 L 100 40 L 102 34 L 108 30 L 116 28 L 118 24 L 130 20 L 268 20 C 278 20 284 28 284 38 L 284 114 Z" fill="#243b5e"/>
      {/* Roof */}
      <path d="M 118 24 L 130 20 L 268 20 L 284 24 L 118 24 Z" fill="#1e3558"/>
      {/* Front face */}
      <path d="M 36 96 C 36 90 38 84 44 80 L 56 74 L 64 70 L 80 42 L 80 96 Z" fill="#1e3558"/>
      {/* Windshield */}
      <path d="M 64 70 C 68 56 78 46 92 42 L 116 28 L 118 24 L 108 30 L 86 46 L 72 86 Z" fill="#0d2340"/>
      <path d="M 70 72 C 74 60 82 50 94 46 L 112 34 L 113 36 L 96 48 L 78 80 Z" fill="rgba(120,200,255,0.08)"/>
      {/* Side windows */}
      <rect x="126" y="28" width="36" height="38" rx="2" fill="#0d2340"/>
      <rect x="168" y="28" width="36" height="38" rx="2" fill="#0d2340"/>
      <rect x="210" y="28" width="36" height="38" rx="2" fill="#0d2340"/>
      {/* Pillar dividers */}
      <rect x="120" y="20" width="4" height="70" fill="#162b46"/>
      <rect x="162" y="20" width="4" height="70" fill="#162b46"/>
      <rect x="204" y="20" width="4" height="70" fill="#162b46"/>
      <rect x="246" y="20" width="4" height="70" fill="#162b46"/>
      {/* Body lines */}
      <path d="M 86 70 L 282 70" stroke="#2d4a78" strokeWidth="1" opacity="0.6"/>
      <path d="M 36 96 L 284 96" stroke="#1a2d4a" strokeWidth="2"/>
      {/* Headlights */}
      <path d="M 34 82 L 34 106 L 50 104 L 52 86 L 46 82 Z" fill="#1e3558"/>
      <path d="M 36 84 L 36 102 L 48 101 L 50 88 L 46 84 Z" fill="#fbbf24" opacity="0.9"/>
      <path d="M 37 84 L 37 92 L 47 91 L 46 84 Z" fill="#fef3c7" opacity="0.6"/>
      <path d="M 38 80 L 66 74" stroke="#fbbf24" strokeWidth="1.5" opacity="0.6"/>
      {/* Taillights */}
      <path d="M 280 28 L 286 32 L 286 110 L 280 110 Z" fill="#1e3558"/>
      <path d="M 281 32 L 285 36 L 285 106 L 281 36 Z" fill="#ef4444" opacity="0.8"/>
      {/* Sliding door handle */}
      <rect x="200" y="90" width="18" height="4" rx="2" fill="#4b5563"/>
      {/* Roof rails */}
      <rect x="118" y="18" width="164" height="4" rx="2" fill="#2d4a78"/>
      {/* Mirror */}
      <path d="M 62 68 L 80 64 L 82 74 L 63 76 Z" fill="#162b46"/>
      {/* License plate */}
      <rect x="258" y="106" width="22" height="12" rx="1" fill="#374151"/>
      <rect x="260" y="108" width="18" height="8" rx="1" fill="#d1d5db" opacity="0.6"/>
    </svg>
  )
}

function VanFront({ className }) {
  return (
    <svg viewBox="0 0 240 170" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="120" cy="165" rx="108" ry="6" fill="rgba(0,0,0,0.4)"/>
      <circle cx="22" cy="132" r="22" fill="#111827"/><circle cx="22" cy="132" r="16" fill="#1f2937"/><circle cx="22" cy="132" r="10" fill="#374151"/><circle cx="22" cy="132" r="6" fill="#4b5563"/><circle cx="22" cy="132" r="2.5" fill="#9ca3af"/>
      <circle cx="218" cy="132" r="22" fill="#111827"/><circle cx="218" cy="132" r="16" fill="#1f2937"/><circle cx="218" cy="132" r="10" fill="#374151"/><circle cx="218" cy="132" r="6" fill="#4b5563"/><circle cx="218" cy="132" r="2.5" fill="#9ca3af"/>
      <rect x="20" y="16" width="200" height="116" rx="4" fill="#243b5e" stroke="#2d4a78" strokeWidth="1.5"/>
      <path d="M 34 94 L 34 40 C 34 30 44 22 54 22 L 186 22 C 196 22 206 30 206 40 L 206 94 Z" fill="#0d2340"/>
      <path d="M 50 94 L 50 34 C 50 28 55 24 60 24 L 120 24 L 120 94 Z" fill="rgba(100,180,255,0.07)"/>
      <rect x="20" y="14" width="200" height="6" rx="2" fill="#1e3558"/>
      <path d="M 20 94 L 20 118 L 56 120 L 60 96 Z" fill="#1e3558"/>
      <path d="M 22 96 L 22 116 L 54 118 L 57 98 Z" fill="#fbbf24" opacity="0.85"/>
      <path d="M 24 96 L 24 107 L 48 108 L 48 98 Z" fill="#fef9c3" opacity="0.5"/>
      <path d="M 220 94 L 220 118 L 184 120 L 180 96 Z" fill="#1e3558"/>
      <path d="M 218 96 L 218 116 L 186 118 L 183 98 Z" fill="#fbbf24" opacity="0.85"/>
      <path d="M 216 96 L 216 107 L 192 108 L 192 98 Z" fill="#fef9c3" opacity="0.5"/>
      <rect x="58" y="108" width="124" height="22" rx="2" fill="#0f1c2e" stroke="#2d4a78" strokeWidth="1"/>
      {[66,78,90,102,114,126,138,150,162,174].map(x => <line key={x} x1={x} y1="110" x2={x} y2="128" stroke="#243b5e" strokeWidth="1"/>)}
      <rect x="18" y="130" width="204" height="18" rx="3" fill="#162b46" stroke="#2d4a78" strokeWidth="1"/>
      <rect x="100" y="114" width="40" height="16" rx="2" fill="#162b46" stroke="#94a3b8" strokeWidth="1"/>
      <line x1="120" y1="16" x2="120" y2="96" stroke="#162b46" strokeWidth="1.5" opacity="0.3"/>
    </svg>
  )
}

function VanRear({ className }) {
  return (
    <svg viewBox="0 0 240 170" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="120" cy="165" rx="108" ry="6" fill="rgba(0,0,0,0.4)"/>
      <circle cx="22" cy="132" r="22" fill="#111827"/><circle cx="22" cy="132" r="16" fill="#1f2937"/><circle cx="22" cy="132" r="10" fill="#374151"/><circle cx="22" cy="132" r="6" fill="#4b5563"/><circle cx="22" cy="132" r="2.5" fill="#9ca3af"/>
      <circle cx="218" cy="132" r="22" fill="#111827"/><circle cx="218" cy="132" r="16" fill="#1f2937"/><circle cx="218" cy="132" r="10" fill="#374151"/><circle cx="218" cy="132" r="6" fill="#4b5563"/><circle cx="218" cy="132" r="2.5" fill="#9ca3af"/>
      <rect x="20" y="16" width="200" height="116" rx="4" fill="#243b5e" stroke="#2d4a78" strokeWidth="1.5"/>
      <line x1="120" y1="16" x2="120" y2="132" stroke="#162b46" strokeWidth="2.5"/>
      <rect x="22" y="18" width="96" height="112" rx="2" fill="#1e3558"/>
      <rect x="122" y="18" width="96" height="112" rx="2" fill="#1e3558"/>
      <rect x="28" y="24" width="84" height="62" rx="3" fill="#0d2340"/>
      <rect x="128" y="24" width="84" height="62" rx="3" fill="#0d2340"/>
      <rect x="20" y="18" width="20" height="70" rx="2" fill="#1e3558"/>
      <rect x="22" y="20" width="16" height="66" rx="1" fill="#ef4444" opacity="0.9"/>
      <rect x="200" y="18" width="20" height="70" rx="2" fill="#1e3558"/>
      <rect x="202" y="20" width="16" height="66" rx="1" fill="#ef4444" opacity="0.9"/>
      <rect x="42" y="86" width="28" height="14" rx="2" fill="#f3f4f6" opacity="0.7"/>
      <rect x="170" y="86" width="28" height="14" rx="2" fill="#f3f4f6" opacity="0.7"/>
      <rect x="82" y="108" width="76" height="16" rx="2" fill="#374151"/>
      <rect x="84" y="110" width="72" height="12" rx="1" fill="#d1d5db" opacity="0.7"/>
      <rect x="18" y="130" width="204" height="18" rx="3" fill="#162b46" stroke="#2d4a78" strokeWidth="1"/>
      <rect x="102" y="70" width="14" height="4" rx="2" fill="#4b5563"/>
      <rect x="124" y="70" width="14" height="4" rx="2" fill="#4b5563"/>
    </svg>
  )
}

function VanTop({ className }) {
  return (
    <svg viewBox="0 0 200 340" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="18" y="14" width="164" height="312" rx="8" fill="#243b5e" stroke="#2d4a78" strokeWidth="1.5"/>
      <rect x="28" y="18" width="144" height="52" rx="4" fill="#0d2340" opacity="0.9"/>
      <rect x="32" y="74" width="136" height="48" rx="4" fill="#1e3558"/>
      <rect x="22" y="126" width="156" height="188" rx="2" fill="#1a2d4a"/>
      <rect x="28" y="280" width="144" height="40" rx="4" fill="#1e3558"/>
      <rect x="22" y="124" width="156" height="4" rx="2" fill="#2d4a78"/>
      <rect x="18" y="20" width="18" height="44" rx="2" fill="#fbbf24" opacity="0.6"/>
      <rect x="164" y="20" width="18" height="44" rx="2" fill="#fbbf24" opacity="0.6"/>
      <rect x="18" y="286" width="18" height="34" rx="2" fill="#ef4444" opacity="0.6"/>
      <rect x="164" y="286" width="18" height="34" rx="2" fill="#ef4444" opacity="0.6"/>
      <ellipse cx="22" cy="88" rx="9" ry="20" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="178" cy="88" rx="9" ry="20" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="22" cy="268" rx="9" ry="20" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="178" cy="268" rx="9" ry="20" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <line x1="18" y1="126" x2="182" y2="126" stroke="#162b46" strokeWidth="2"/>
      <line x1="100" y1="126" x2="100" y2="314" stroke="#162b46" strokeWidth="1.5"/>
      <path d="M 18 84 L 6 78 L 6 90 L 18 90 Z" fill="#162b46"/>
      <path d="M 182 84 L 194 78 L 194 90 L 182 90 Z" fill="#162b46"/>
    </svg>
  )
}

function VanInterior({ className }) {
  return (
    <svg viewBox="0 0 280 190" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="0" y="0" width="280" height="190" rx="8" fill="#0a1220"/>
      <path d="M 8 0 L 272 0 L 272 80 Q 272 100 250 106 L 30 106 Q 8 100 8 80 Z" fill="#0d2340"/>
      <path d="M 28 4 L 252 4 L 246 88 L 34 88 Z" fill="rgba(100,180,255,0.06)"/>
      <path d="M 0 106 L 280 106 L 280 148 L 0 148 Z" fill="#1e2535"/>
      <path d="M 0 106 L 280 106 L 280 112 L 0 112 Z" fill="#243b5e"/>
      <rect x="55" y="110" width="160" height="32" rx="4" fill="#0f1c2e" stroke="#2d4a78" strokeWidth="1"/>
      <circle cx="95" cy="126" r="12" fill="#111827" stroke="#374151" strokeWidth="1"/>
      <circle cx="185" cy="126" r="12" fill="#111827" stroke="#374151" strokeWidth="1"/>
      <line x1="95" y1="126" x2="99" y2="116" stroke="#F5A623" strokeWidth="1.5"/>
      <rect x="106" y="113" width="68" height="26" rx="2" fill="#0a1220" stroke="#2d4a78" strokeWidth="1"/>
      <circle cx="85" cy="165" r="26" fill="none" stroke="#374151" strokeWidth="5"/>
      <circle cx="85" cy="165" r="9" fill="#1e2535" stroke="#4b5563" strokeWidth="2"/>
      <line x1="85" y1="139" x2="85" y2="156" stroke="#374151" strokeWidth="4"/>
      <line x1="59" y1="165" x2="76" y2="165" stroke="#374151" strokeWidth="4"/>
      <line x1="94" y1="165" x2="111" y2="165" stroke="#374151" strokeWidth="4"/>
      <path d="M 0 148 L 0 190 L 124 190 L 124 148 Q 70 146 0 148 Z" fill="#1a2535"/>
      <path d="M 156 148 L 156 190 L 280 190 L 280 148 Q 210 146 156 148 Z" fill="#1a2535"/>
      <line x1="0" y1="164" x2="124" y2="164" stroke="#243b5e" strokeWidth="1" opacity="0.5"/>
      <line x1="156" y1="164" x2="280" y2="164" stroke="#243b5e" strokeWidth="1" opacity="0.5"/>
      <rect x="8" y="110" width="44" height="18" rx="3" fill="#111827" stroke="#2d4a78" strokeWidth="0.5"/>
      <rect x="228" y="110" width="44" height="18" rx="3" fill="#111827" stroke="#2d4a78" strokeWidth="0.5"/>
      {[14,20,26,32,38,44].map(x => <line key={x} x1={x} y1="114" x2={x} y2="124" stroke="#374151" strokeWidth="1"/>)}
      {[234,240,246,252,258,264].map(x => <line key={x} x1={x} y1="114" x2={x} y2="124" stroke="#374151" strokeWidth="1"/>)}
    </svg>
  )
}
