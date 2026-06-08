export default function ATVSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <ATVFront className={className} />
  if (view === 'rear') return <ATVRear className={className} />
  if (view === 'top') return <ATVTop className={className} />
  if (view === 'interior') return <ATVInterior className={className} />
  const mirror = view === 'left'
  return (
    <svg viewBox="0 0 240 130" fill="none" className={className}
      style={mirror ? { transform: 'scaleX(-1)' } : {}}>
      {/* Large knobby wheels */}
      <circle cx="55" cy="98" r="26" fill="#1e2535" stroke="#475569" strokeWidth="3"/>
      <circle cx="55" cy="98" r="15" fill="#334155"/>
      <circle cx="55" cy="98" r="5" fill="#64748b"/>
      <circle cx="185" cy="98" r="26" fill="#1e2535" stroke="#475569" strokeWidth="3"/>
      <circle cx="185" cy="98" r="15" fill="#334155"/>
      <circle cx="185" cy="98" r="5" fill="#64748b"/>
      {/* Tread marks */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
        <line key={a}
          x1={55 + 26*Math.cos((a*Math.PI)/180)} y1={98 + 26*Math.sin((a*Math.PI)/180)}
          x2={55 + 21*Math.cos((a*Math.PI)/180)} y2={98 + 21*Math.sin((a*Math.PI)/180)}
          stroke="#475569" strokeWidth="2.5"/>
      ))}
      {/* Body */}
      <path d="M34 86 Q40 68 60 64 L180 64 Q200 68 206 86 Z" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      {/* Body underside */}
      <rect x="34" y="86" width="172" height="10" rx="2" fill="#1e3352" stroke="#2d4a7a" strokeWidth="1"/>
      {/* Fuel tank / seat area */}
      <rect x="88" y="50" width="64" height="18" rx="4" fill="#334155" stroke="#475569" strokeWidth="1.5"/>
      {/* Handlebars */}
      <line x1="76" y1="50" x2="76" y2="68" stroke="#475569" strokeWidth="3" strokeLinecap="round"/>
      <path d="M58 44 Q76 38 94 44" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Front fender */}
      <path d="M36 72 Q44 58 60 64" fill="#1e3352" stroke="#2d4a7a" strokeWidth="1.2"/>
      {/* Rear fender */}
      <path d="M180 64 Q196 58 204 72" fill="#1e3352" stroke="#2d4a7a" strokeWidth="1.2"/>
      {/* Headlight */}
      <rect x="26" y="70" width="16" height="10" rx="3" fill="#fbbf24" opacity="0.85"/>
      {/* Taillight */}
      <rect x="198" y="70" width="16" height="10" rx="3" fill="#dc2626" opacity="0.8"/>
      {/* Exhaust pipe */}
      <path d="M176 78 Q200 76 208 82" stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Skid plate */}
      <rect x="34" y="86" width="172" height="5" rx="2" fill="#374151"/>
    </svg>
  )
}

function ATVFront({ className }) {
  return (
    <svg viewBox="0 0 200 170" fill="none" className={className}>
      <rect x="25" y="80" width="150" height="70" rx="4" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      <path d="M32 80 Q36 44 100 36 Q164 44 168 80 Z" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      <rect x="30" y="52" width="60" height="24" rx="4" fill="#fbbf24" opacity="0.8"/>
      <rect x="110" y="52" width="60" height="24" rx="4" fill="#fbbf24" opacity="0.8"/>
      <rect x="70" y="56" width="60" height="16" rx="3" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1"/>
      <rect x="24" y="118" width="36" height="24" rx="6" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <rect x="140" y="118" width="36" height="24" rx="6" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <line x1="100" y1="80" x2="100" y2="150" stroke="#1e3a6e" strokeWidth="1"/>
      <rect x="72" y="36" width="56" height="10" rx="3" fill="#334155" stroke="#475569" strokeWidth="1.5"/>
    </svg>
  )
}

function ATVRear({ className }) {
  return (
    <svg viewBox="0 0 200 170" fill="none" className={className}>
      <rect x="25" y="80" width="150" height="70" rx="4" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      <rect x="28" y="84" width="144" height="62" rx="3" fill="#1e3352" stroke="#2d4a7a" strokeWidth="1"/>
      <rect x="28" y="92" width="40" height="14" rx="2" fill="#dc2626" opacity="0.8"/>
      <rect x="132" y="92" width="40" height="14" rx="2" fill="#dc2626" opacity="0.8"/>
      <rect x="76" y="92" width="48" height="14" rx="2" fill="#fbbf24" opacity="0.5"/>
      <rect x="24" y="118" width="36" height="24" rx="6" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <rect x="140" y="118" width="36" height="24" rx="6" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <rect x="72" y="56" width="56" height="26" rx="4" fill="#334155" stroke="#475569" strokeWidth="1.5"/>
      <line x1="100" y1="80" x2="100" y2="150" stroke="#1e3a6e" strokeWidth="1"/>
    </svg>
  )
}

function ATVTop({ className }) {
  return (
    <svg viewBox="0 0 200 280" fill="none" className={className}>
      <rect x="22" y="15" width="156" height="250" rx="12" fill="#243b5e" stroke="#3b5998" strokeWidth="2"/>
      <rect x="30" y="26" width="140" height="228" rx="8" fill="#1e3352" stroke="#2d4a7a" strokeWidth="1"/>
      <rect x="40" y="90" width="120" height="100" rx="6" fill="#334155" stroke="#475569" strokeWidth="1.5"/>
      <path d="M60 44 Q80 36 100 34 Q120 36 140 44" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <rect x="22" y="19" width="156" height="18" rx="4" fill="#fbbf24" opacity="0.45"/>
      <rect x="22" y="243" width="156" height="18" rx="4" fill="#dc2626" opacity="0.45"/>
      <circle cx="30" cy="28" r="7" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <circle cx="170" cy="28" r="7" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <circle cx="30" cy="252" r="7" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <circle cx="170" cy="252" r="7" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
    </svg>
  )
}

function ATVInterior({ className }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className}>
      <rect x="10" y="10" width="180" height="140" rx="6" fill="#1e2535" stroke="#334155" strokeWidth="1.5"/>
      <rect x="22" y="100" width="156" height="40" rx="4" fill="#243b5e" stroke="#3b5998" strokeWidth="1"/>
      <ellipse cx="80" cy="60" rx="44" ry="44" fill="none" stroke="#475569" strokeWidth="3"/>
      <ellipse cx="80" cy="60" rx="30" ry="30" fill="#172840" stroke="#2d4a7a" strokeWidth="1.5"/>
      <circle cx="80" cy="60" r="6" fill="#334155"/>
      <line x1="80" y1="32" x2="80" y2="54" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="138" y="24" width="40" height="60" rx="5" fill="#172840" stroke="#2d4a7a" strokeWidth="1"/>
      <rect x="143" y="30" width="30" height="12" rx="2" fill="#0d2340"/>
      <rect x="143" y="46" width="30" height="12" rx="2" fill="#0d2340"/>
      <rect x="143" y="62" width="30" height="12" rx="2" fill="#0d2340"/>
    </svg>
  )
}
