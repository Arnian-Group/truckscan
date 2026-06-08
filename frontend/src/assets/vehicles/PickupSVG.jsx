export default function PickupSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <PickupFront className={className} />
  if (view === 'rear') return <PickupRear className={className} />
  if (view === 'top') return <PickupTop className={className} />
  if (view === 'interior') return <PickupInterior className={className} />
  const mirror = view === 'left'
  return (
    <svg viewBox="0 0 240 130" fill="none" className={className}
      style={mirror ? { transform: 'scaleX(-1)' } : {}}>
      {/* Wheels */}
      <circle cx="52" cy="104" r="21" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <circle cx="52" cy="104" r="11" fill="#334155"/>
      <circle cx="52" cy="104" r="4" fill="#64748b"/>
      <circle cx="188" cy="104" r="21" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <circle cx="188" cy="104" r="11" fill="#334155"/>
      <circle cx="188" cy="104" r="4" fill="#64748b"/>
      {/* Bed */}
      <rect x="118" y="62" width="96" height="38" fill="#1e3352" stroke="#3b5998" strokeWidth="1.2"/>
      {/* Bed inner lip */}
      <rect x="122" y="65" width="88" height="32" fill="#172840" stroke="#2d4a7a" strokeWidth="0.8"/>
      {/* Cab body */}
      <rect x="22" y="72" width="100" height="28" fill="#243b5e" stroke="#3b5998" strokeWidth="1.2"/>
      {/* Cab roof */}
      <path d="M30 72 Q38 44 60 40 L102 40 Q118 44 122 72 Z" fill="#243b5e" stroke="#3b5998" strokeWidth="1.2"/>
      {/* Windshield */}
      <path d="M62 41 L44 70 L120 70 L118 41 Z" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1" opacity="0.85"/>
      {/* Rear window of cab */}
      <rect x="108" y="46" width="12" height="20" rx="2" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1" opacity="0.7"/>
      {/* Door line */}
      <line x1="88" y1="42" x2="88" y2="70" stroke="#1e3a6e" strokeWidth="1.2"/>
      {/* Door handle */}
      <rect x="92" y="62" width="10" height="3" rx="1.5" fill="#475569"/>
      {/* Hood */}
      <path d="M22 72 Q28 60 30 72" fill="#1e3352" stroke="#3b5998" strokeWidth="1"/>
      {/* Headlight */}
      <path d="M16 74 L24 70 L24 78 L16 80 Z" fill="#fbbf24" opacity="0.85"/>
      {/* Taillight */}
      <path d="M214 74 L222 72 L222 80 L214 78 Z" fill="#dc2626" opacity="0.8"/>
      {/* Truck bed divider / tailgate */}
      <rect x="210" y="62" width="4" height="38" fill="#2d4a7a"/>
    </svg>
  )
}

function PickupFront({ className }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className}>
      <rect x="15" y="80" width="170" height="60" rx="3" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      <path d="M20 80 Q25 30 100 22 Q175 30 180 80 Z" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      <path d="M38 80 Q44 40 100 32 Q156 40 162 80 Z" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1" opacity="0.85"/>
      <rect x="16" y="88" width="44" height="22" rx="3" fill="#fbbf24" opacity="0.8"/>
      <rect x="140" y="88" width="44" height="22" rx="3" fill="#fbbf24" opacity="0.8"/>
      <rect x="70" y="92" width="60" height="16" rx="3" fill="#1e2535" stroke="#334155" strokeWidth="1"/>
      <rect x="18" y="118" width="32" height="18" rx="4" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
      <rect x="150" y="118" width="32" height="18" rx="4" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
      <line x1="100" y1="80" x2="100" y2="140" stroke="#1e3a6e" strokeWidth="1"/>
    </svg>
  )
}

function PickupRear({ className }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className}>
      <rect x="15" y="80" width="170" height="60" rx="3" fill="#1e3352" stroke="#3b5998" strokeWidth="1.5"/>
      <rect x="20" y="85" width="160" height="50" rx="2" fill="#172840" stroke="#2d4a7a" strokeWidth="1"/>
      <rect x="60" y="90" width="80" height="40" rx="2" fill="#243b5e" stroke="#3b5998" strokeWidth="1"/>
      <rect x="18" y="100" width="36" height="10" rx="2" fill="#dc2626" opacity="0.8"/>
      <rect x="146" y="100" width="36" height="10" rx="2" fill="#dc2626" opacity="0.8"/>
      <rect x="80" y="100" width="40" height="10" rx="2" fill="#fbbf24" opacity="0.5"/>
      <rect x="18" y="120" width="32" height="18" rx="4" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
      <rect x="150" y="120" width="32" height="18" rx="4" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
      <rect x="60" y="128" width="80" height="8" rx="2" fill="#2d4a7a"/>
    </svg>
  )
}

function PickupTop({ className }) {
  return (
    <svg viewBox="0 0 200 280" fill="none" className={className}>
      <rect x="20" y="10" width="160" height="260" rx="10" fill="#243b5e" stroke="#3b5998" strokeWidth="2"/>
      <rect x="28" y="20" width="144" height="100" rx="6" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1" opacity="0.85"/>
      <line x1="100" y1="20" x2="100" y2="120" stroke="#1e3a6e" strokeWidth="1.5"/>
      <rect x="28" y="130" width="144" height="128" rx="4" fill="#172840" stroke="#2d4a7a" strokeWidth="1"/>
      <rect x="34" y="136" width="132" height="116" rx="3" fill="#111c2e"/>
      <rect x="22" y="14" width="156" height="18" rx="3" fill="#fbbf24" opacity="0.45"/>
      <rect x="22" y="248" width="156" height="18" rx="3" fill="#dc2626" opacity="0.45"/>
      <circle cx="32" cy="23" r="6" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
      <circle cx="168" cy="23" r="6" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
      <circle cx="32" cy="257" r="6" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
      <circle cx="168" cy="257" r="6" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
    </svg>
  )
}

function PickupInterior({ className }) {
  return (
    <svg viewBox="0 0 240 160" fill="none" className={className}>
      <rect x="10" y="10" width="220" height="140" rx="6" fill="#1e2535" stroke="#334155" strokeWidth="1.5"/>
      <rect x="18" y="18" width="204" height="72" rx="4" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1"/>
      <rect x="24" y="24" width="96" height="60" rx="3" fill="#0a1a30" opacity="0.8"/>
      <rect x="124" y="24" width="92" height="60" rx="3" fill="#0a1a30" opacity="0.8"/>
      <rect x="70" y="90" width="100" height="18" rx="5" fill="#334155" stroke="#475569" strokeWidth="1.5"/>
      <circle cx="88" cy="99" r="7" fill="#1e2535" stroke="#F5A623" strokeWidth="1.5"/>
      <circle cx="120" cy="99" r="7" fill="#1e2535" stroke="#475569" strokeWidth="1.5"/>
      <circle cx="152" cy="99" r="7" fill="#1e2535" stroke="#475569" strokeWidth="1.5"/>
      <rect x="18" y="115" width="90" height="25" rx="4" fill="#243b5e" stroke="#3b5998" strokeWidth="1"/>
      <rect x="132" y="115" width="90" height="25" rx="4" fill="#243b5e" stroke="#3b5998" strokeWidth="1"/>
      <line x1="120" y1="90" x2="120" y2="142" stroke="#334155" strokeWidth="1.5"/>
    </svg>
  )
}
