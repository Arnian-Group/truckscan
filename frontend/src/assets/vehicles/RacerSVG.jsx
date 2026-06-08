export default function RacerSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <RacerFront className={className} />
  if (view === 'rear') return <RacerRear className={className} />
  if (view === 'top') return <RacerTop className={className} />
  if (view === 'interior') return <RacerInterior className={className} />
  const mirror = view === 'left'
  return (
    <svg viewBox="0 0 240 130" fill="none" className={className}
      style={mirror ? { transform: 'scaleX(-1)' } : {}}>
      {/* Wide rear wheels */}
      <ellipse cx="172" cy="100" rx="28" ry="22" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <ellipse cx="172" cy="100" rx="16" ry="13" fill="#334155"/>
      <circle cx="172" cy="100" r="5" fill="#64748b"/>
      {/* Front wheels */}
      <ellipse cx="68" cy="100" rx="22" ry="20" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <ellipse cx="68" cy="100" rx="13" ry="11" fill="#334155"/>
      <circle cx="68" cy="100" r="4" fill="#64748b"/>
      {/* Very low body */}
      <path d="M30 90 Q34 78 50 74 L190 74 Q206 78 212 90 Z" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      {/* Nose cone */}
      <path d="M18 86 Q24 80 34 78 L34 90 L18 90 Z" fill="#1e3352" stroke="#3b5998" strokeWidth="1"/>
      {/* Rear wing */}
      <rect x="182" y="62" width="36" height="5" rx="2" fill="#334155" stroke="#475569" strokeWidth="1.5"/>
      <line x1="190" y1="67" x2="192" y2="78" stroke="#475569" strokeWidth="2" strokeLinecap="round"/>
      <line x1="210" y1="67" x2="208" y2="78" stroke="#475569" strokeWidth="2" strokeLinecap="round"/>
      {/* Open cockpit */}
      <ellipse cx="118" cy="74" rx="28" ry="12" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1" opacity="0.85"/>
      {/* Roll hoop */}
      <path d="M106 68 Q118 56 130 68" stroke="#475569" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Side pod left */}
      <path d="M60 80 Q80 74 100 74 L100 90 L60 90 Z" fill="#1e3352" stroke="#2d4a7a" strokeWidth="1"/>
      {/* Side pod right */}
      <path d="M140 74 Q160 74 180 80 L180 90 L140 90 Z" fill="#1e3352" stroke="#2d4a7a" strokeWidth="1"/>
      {/* Headlight */}
      <rect x="12" y="80" width="14" height="6" rx="2" fill="#fbbf24" opacity="0.85"/>
      {/* Exhaust */}
      <path d="M172 80 Q188 76 196 82" stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Undertray */}
      <rect x="30" y="90" width="182" height="4" rx="1" fill="#374151"/>
    </svg>
  )
}

function RacerFront({ className }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className}>
      <rect x="10" y="80" width="180" height="60" rx="3" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      <path d="M20 80 Q24 40 100 32 Q176 40 180 80 Z" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      <path d="M50 80 Q54 52 100 44 Q146 52 150 80 Z" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1" opacity="0.8"/>
      <rect x="12" y="86" width="50" height="16" rx="3" fill="#fbbf24" opacity="0.85"/>
      <rect x="138" y="86" width="50" height="16" rx="3" fill="#fbbf24" opacity="0.85"/>
      <rect x="78" y="90" width="44" height="10" rx="2" fill="#1e2535" stroke="#334155" strokeWidth="1"/>
      <rect x="8" y="110" width="38" height="28" rx="5" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <rect x="154" y="110" width="38" height="28" rx="5" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <rect x="8" y="30" width="184" height="8" rx="3" fill="#334155" stroke="#475569" strokeWidth="1.5"/>
      <line x1="100" y1="80" x2="100" y2="138" stroke="#1e3a6e" strokeWidth="1"/>
    </svg>
  )
}

function RacerRear({ className }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className}>
      <rect x="10" y="80" width="180" height="60" rx="3" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      <rect x="8" y="24" width="184" height="10" rx="3" fill="#334155" stroke="#475569" strokeWidth="1.5"/>
      <line x1="48" y1="34" x2="48" y2="80" stroke="#475569" strokeWidth="2" strokeLinecap="round"/>
      <line x1="152" y1="34" x2="152" y2="80" stroke="#475569" strokeWidth="2" strokeLinecap="round"/>
      <rect x="12" y="88" width="50" height="12" rx="2" fill="#dc2626" opacity="0.8"/>
      <rect x="138" y="88" width="50" height="12" rx="2" fill="#dc2626" opacity="0.8"/>
      <rect x="72" y="90" width="56" height="8" rx="2" fill="#fbbf24" opacity="0.4"/>
      <rect x="8" y="110" width="38" height="28" rx="5" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <rect x="154" y="110" width="38" height="28" rx="5" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
    </svg>
  )
}

function RacerTop({ className }) {
  return (
    <svg viewBox="0 0 200 280" fill="none" className={className}>
      <path d="M30 20 Q100 10 170 20 L180 260 Q100 270 20 260 Z" fill="#243b5e" stroke="#3b5998" strokeWidth="2"/>
      <ellipse cx="100" cy="100" rx="40" ry="55" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1.5" opacity="0.85"/>
      <rect x="10" y="15" width="180" height="14" rx="5" fill="#334155" stroke="#475569" strokeWidth="1.5"/>
      <rect x="10" y="251" width="180" height="14" rx="5" fill="#334155" stroke="#475569" strokeWidth="1.5"/>
      <ellipse cx="34" cy="25" rx="12" ry="10" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <ellipse cx="166" cy="25" rx="12" ry="10" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <ellipse cx="34" cy="255" rx="14" ry="12" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <ellipse cx="166" cy="255" rx="14" ry="12" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <rect x="8" y="12" width="184" height="6" rx="2" fill="#fbbf24" opacity="0.45"/>
      <rect x="8" y="262" width="184" height="6" rx="2" fill="#dc2626" opacity="0.45"/>
    </svg>
  )
}

function RacerInterior({ className }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className}>
      <rect x="10" y="10" width="180" height="140" rx="6" fill="#1e2535" stroke="#334155" strokeWidth="1.5"/>
      <ellipse cx="80" cy="75" rx="50" ry="50" fill="none" stroke="#475569" strokeWidth="3"/>
      <ellipse cx="80" cy="75" rx="35" ry="35" fill="#172840" stroke="#2d4a7a" strokeWidth="1.5"/>
      <circle cx="80" cy="75" r="6" fill="#334155"/>
      <line x1="80" y1="44" x2="80" y2="69" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="106" y1="51" x2="97" y2="62" stroke="#475569" strokeWidth="2" strokeLinecap="round"/>
      <rect x="18" y="130" width="164" height="18" rx="4" fill="#243b5e" stroke="#3b5998" strokeWidth="1"/>
      <rect x="144" y="30" width="40" height="80" rx="5" fill="#172840" stroke="#2d4a7a" strokeWidth="1"/>
      <rect x="149" y="36" width="30" height="10" rx="2" fill="#0d2340"/>
      <rect x="149" y="52" width="30" height="10" rx="2" fill="#0d2340"/>
      <rect x="149" y="68" width="30" height="10" rx="2" fill="#F5A623" opacity="0.4"/>
      <rect x="149" y="84" width="30" height="10" rx="2" fill="#0d2340"/>
    </svg>
  )
}
