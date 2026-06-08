export default function VanSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <VanFront className={className} />
  if (view === 'rear') return <VanRear className={className} />
  if (view === 'top') return <VanTop className={className} />
  if (view === 'interior') return <VanInterior className={className} />
  const mirror = view === 'left'
  return (
    <svg viewBox="0 0 240 130" fill="none" className={className}
      style={mirror ? { transform: 'scaleX(-1)' } : {}}>
      <circle cx="55" cy="106" r="19" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <circle cx="55" cy="106" r="10" fill="#334155"/>
      <circle cx="55" cy="106" r="4" fill="#64748b"/>
      <circle cx="185" cy="106" r="19" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <circle cx="185" cy="106" r="10" fill="#334155"/>
      <circle cx="185" cy="106" r="4" fill="#64748b"/>
      {/* Main box body */}
      <rect x="20" y="36" width="200" height="50" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      {/* Lower skirt */}
      <rect x="20" y="86" width="200" height="20" rx="0" fill="#1e3352" stroke="#3b5998" strokeWidth="1"/>
      {/* Front face */}
      <path d="M20 36 Q24 22 40 18 L60 18 L60 36 Z" fill="#1e3352" stroke="#3b5998" strokeWidth="1.2"/>
      {/* Windshield */}
      <path d="M22 34 L28 18 L58 18 L58 34 Z" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1" opacity="0.85"/>
      {/* Side windows (slider) */}
      <rect x="70" y="44" width="48" height="30" rx="2" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1" opacity="0.85"/>
      <rect x="126" y="44" width="48" height="30" rx="2" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1" opacity="0.85"/>
      {/* Door line */}
      <line x1="120" y1="36" x2="120" y2="86" stroke="#1e3a6e" strokeWidth="1.2"/>
      {/* Rear doors line */}
      <line x1="180" y1="36" x2="180" y2="86" stroke="#1e3a6e" strokeWidth="1.2"/>
      <line x1="196" y1="36" x2="196" y2="86" stroke="#1e3a6e" strokeWidth="1.2"/>
      {/* Headlight */}
      <rect x="20" y="24" width="16" height="10" rx="2" fill="#fbbf24" opacity="0.85"/>
      {/* Taillight */}
      <rect x="204" y="24" width="16" height="10" rx="2" fill="#dc2626" opacity="0.8"/>
      {/* Roof rack suggestion */}
      <rect x="30" y="33" width="170" height="4" rx="1" fill="#1a2d4a" stroke="#2d4a7a" strokeWidth="0.5"/>
    </svg>
  )
}

function VanFront({ className }) {
  return (
    <svg viewBox="0 0 200 170" fill="none" className={className}>
      <rect x="10" y="60" width="180" height="90" rx="3" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      <rect x="10" y="30" width="180" height="32" rx="3" fill="#1e3352" stroke="#3b5998" strokeWidth="1.5"/>
      <rect x="16" y="34" width="168" height="24" rx="2" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1" opacity="0.85"/>
      <rect x="12" y="68" width="46" height="24" rx="3" fill="#fbbf24" opacity="0.75"/>
      <rect x="142" y="68" width="46" height="24" rx="3" fill="#fbbf24" opacity="0.75"/>
      <rect x="70" y="72" width="60" height="18" rx="3" fill="#1e2535" stroke="#334155" strokeWidth="1"/>
      <rect x="14" y="120" width="36" height="22" rx="5" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
      <rect x="150" y="120" width="36" height="22" rx="5" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
      <line x1="100" y1="60" x2="100" y2="150" stroke="#1e3a6e" strokeWidth="1"/>
    </svg>
  )
}

function VanRear({ className }) {
  return (
    <svg viewBox="0 0 200 170" fill="none" className={className}>
      <rect x="10" y="40" width="180" height="110" rx="3" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      <line x1="100" y1="40" x2="100" y2="150" stroke="#1e3a6e" strokeWidth="2"/>
      <rect x="14" y="44" width="82" height="60" rx="2" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1" opacity="0.7"/>
      <rect x="104" y="44" width="82" height="60" rx="2" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1" opacity="0.7"/>
      <rect x="12" y="112" width="40" height="12" rx="2" fill="#dc2626" opacity="0.8"/>
      <rect x="148" y="112" width="40" height="12" rx="2" fill="#dc2626" opacity="0.8"/>
      <rect x="70" y="115" width="60" height="8" rx="2" fill="#fbbf24" opacity="0.5"/>
      <rect x="14" y="132" width="34" height="16" rx="4" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
      <rect x="152" y="132" width="34" height="16" rx="4" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
    </svg>
  )
}

function VanTop({ className }) {
  return (
    <svg viewBox="0 0 200 300" fill="none" className={className}>
      <rect x="15" y="10" width="170" height="280" rx="8" fill="#243b5e" stroke="#3b5998" strokeWidth="2"/>
      <rect x="22" y="20" width="156" height="260" rx="5" fill="#1e3352" stroke="#2d4a7a" strokeWidth="1"/>
      <rect x="25" y="25" width="150" height="80" rx="4" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1" opacity="0.8"/>
      <line x1="100" y1="25" x2="100" y2="105" stroke="#1e3a6e" strokeWidth="1.5"/>
      <rect x="22" y="14" width="156" height="10" rx="2" fill="#fbbf24" opacity="0.45"/>
      <rect x="22" y="276" width="156" height="10" rx="2" fill="#dc2626" opacity="0.45"/>
      <circle cx="28" cy="19" r="6" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
      <circle cx="172" cy="19" r="6" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
      <circle cx="28" cy="281" r="6" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
      <circle cx="172" cy="281" r="6" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
    </svg>
  )
}

function VanInterior({ className }) {
  return (
    <svg viewBox="0 0 240 160" fill="none" className={className}>
      <rect x="10" y="10" width="220" height="140" rx="6" fill="#1e2535" stroke="#334155" strokeWidth="1.5"/>
      <rect x="18" y="18" width="204" height="68" rx="4" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1"/>
      <rect x="24" y="24" width="92" height="56" rx="3" fill="#0a1a30" opacity="0.8"/>
      <rect x="124" y="24" width="92" height="56" rx="3" fill="#0a1a30" opacity="0.8"/>
      <rect x="60" y="88" width="120" height="18" rx="5" fill="#334155" stroke="#475569" strokeWidth="1.5"/>
      <circle cx="82" cy="97" r="7" fill="#1e2535" stroke="#F5A623" strokeWidth="1.5"/>
      <circle cx="120" cy="97" r="7" fill="#1e2535" stroke="#475569" strokeWidth="1.5"/>
      <circle cx="158" cy="97" r="7" fill="#1e2535" stroke="#475569" strokeWidth="1.5"/>
      <rect x="18" y="112" width="90" height="28" rx="4" fill="#243b5e" stroke="#3b5998" strokeWidth="1"/>
      <rect x="132" y="112" width="90" height="28" rx="4" fill="#243b5e" stroke="#3b5998" strokeWidth="1"/>
      <line x1="120" y1="88" x2="120" y2="142" stroke="#334155" strokeWidth="1.5"/>
    </svg>
  )
}
