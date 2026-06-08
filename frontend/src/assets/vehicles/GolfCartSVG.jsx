export default function GolfCartSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <GolfFront className={className} />
  if (view === 'rear') return <GolfRear className={className} />
  if (view === 'top') return <GolfTop className={className} />
  if (view === 'interior') return <GolfInterior className={className} />
  const mirror = view === 'left'
  return (
    <svg viewBox="0 0 240 130" fill="none" className={className}
      style={mirror ? { transform: 'scaleX(-1)' } : {}}>
      <circle cx="62" cy="104" r="17" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <circle cx="62" cy="104" r="8" fill="#334155"/>
      <circle cx="62" cy="104" r="3" fill="#64748b"/>
      <circle cx="174" cy="104" r="17" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <circle cx="174" cy="104" r="8" fill="#334155"/>
      <circle cx="174" cy="104" r="3" fill="#64748b"/>
      {/* Canopy frame */}
      <rect x="60" y="36" width="100" height="5" rx="2" fill="#475569" stroke="#64748b" strokeWidth="1"/>
      <line x1="62" y1="36" x2="62" y2="76" stroke="#475569" strokeWidth="3" strokeLinecap="round"/>
      <line x1="158" y1="36" x2="158" y2="76" stroke="#475569" strokeWidth="3" strokeLinecap="round"/>
      {/* Canopy top */}
      <rect x="55" y="32" width="112" height="10" rx="3" fill="#1e3352" stroke="#3b5998" strokeWidth="1.5"/>
      {/* Body */}
      <path d="M42 86 L42 76 Q58 68 110 68 L180 68 L185 76 L185 86 Z" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      {/* Lower footrest */}
      <rect x="42" y="86" width="143" height="16" rx="2" fill="#1e3352" stroke="#3b5998" strokeWidth="1"/>
      {/* Seat back */}
      <rect x="104" y="56" width="56" height="16" rx="2" fill="#334155" stroke="#475569" strokeWidth="1"/>
      {/* Seat cushion */}
      <rect x="104" y="70" width="56" height="8" rx="2" fill="#3b4f6a" stroke="#475569" strokeWidth="1"/>
      {/* Windshield */}
      <path d="M58 70 L62 50 L100 50 L102 70 Z" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1" opacity="0.75"/>
      {/* Headlight */}
      <rect x="34" y="74" width="12" height="6" rx="2" fill="#fbbf24" opacity="0.8"/>
      {/* Taillight */}
      <rect x="180" y="74" width="10" height="6" rx="2" fill="#dc2626" opacity="0.7"/>
      {/* Steering wheel hint */}
      <circle cx="80" cy="70" r="8" fill="none" stroke="#475569" strokeWidth="1.5"/>
    </svg>
  )
}

function GolfFront({ className }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className}>
      <rect x="30" y="80" width="140" height="60" rx="4" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      <rect x="28" y="30" width="144" height="54" rx="4" fill="none" stroke="#475569" strokeWidth="2"/>
      <rect x="32" y="34" width="136" height="46" rx="3" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1" opacity="0.6"/>
      <line x1="50" y1="30" x2="50" y2="84" stroke="#475569" strokeWidth="2.5"/>
      <line x1="150" y1="30" x2="150" y2="84" stroke="#475569" strokeWidth="2.5"/>
      <rect x="28" y="26" width="144" height="8" rx="2" fill="#1e3352" stroke="#3b5998" strokeWidth="1.5"/>
      <rect x="32" y="88" width="40" height="16" rx="3" fill="#fbbf24" opacity="0.8"/>
      <rect x="128" y="88" width="40" height="16" rx="3" fill="#fbbf24" opacity="0.8"/>
      <rect x="32" y="120" width="30" height="16" rx="4" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
      <rect x="138" y="120" width="30" height="16" rx="4" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
      <line x1="100" y1="84" x2="100" y2="140" stroke="#1e3a6e" strokeWidth="1"/>
    </svg>
  )
}

function GolfRear({ className }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className}>
      <rect x="30" y="80" width="140" height="60" rx="4" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      <rect x="28" y="30" width="144" height="50" rx="4" fill="none" stroke="#475569" strokeWidth="2"/>
      <line x1="50" y1="30" x2="50" y2="80" stroke="#475569" strokeWidth="2.5"/>
      <line x1="150" y1="30" x2="150" y2="80" stroke="#475569" strokeWidth="2.5"/>
      <rect x="28" y="26" width="144" height="8" rx="2" fill="#1e3352" stroke="#3b5998" strokeWidth="1.5"/>
      <rect x="32" y="88" width="36" height="12" rx="2" fill="#dc2626" opacity="0.8"/>
      <rect x="132" y="88" width="36" height="12" rx="2" fill="#dc2626" opacity="0.8"/>
      <rect x="32" y="120" width="30" height="16" rx="4" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
      <rect x="138" y="120" width="30" height="16" rx="4" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
      <rect x="60" y="56" width="80" height="24" rx="3" fill="#334155" stroke="#475569" strokeWidth="1"/>
    </svg>
  )
}

function GolfTop({ className }) {
  return (
    <svg viewBox="0 0 200 280" fill="none" className={className}>
      <rect x="30" y="10" width="140" height="260" rx="10" fill="#243b5e" stroke="#3b5998" strokeWidth="2"/>
      <rect x="36" y="20" width="128" height="110" rx="5" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1" opacity="0.75"/>
      <line x1="100" y1="20" x2="100" y2="130" stroke="#1e3a6e" strokeWidth="1.5"/>
      <rect x="36" y="140" width="128" height="50" rx="4" fill="#334155" stroke="#475569" strokeWidth="1"/>
      <line x1="100" y1="140" x2="100" y2="190" stroke="#475569" strokeWidth="1.5"/>
      <rect x="32" y="14" width="136" height="10" rx="3" fill="#1e3352" stroke="#3b5998" strokeWidth="1.5"/>
      <rect x="32" y="256" width="136" height="10" rx="3" fill="#1e3352" stroke="#3b5998" strokeWidth="1.5"/>
      <circle cx="40" cy="19" r="5" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
      <circle cx="160" cy="19" r="5" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
      <circle cx="40" cy="261" r="5" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
      <circle cx="160" cy="261" r="5" fill="#1e2535" stroke="#475569" strokeWidth="2"/>
    </svg>
  )
}

function GolfInterior({ className }) {
  return (
    <svg viewBox="0 0 240 140" fill="none" className={className}>
      <rect x="10" y="10" width="220" height="120" rx="6" fill="#1e2535" stroke="#334155" strokeWidth="1.5"/>
      <rect x="18" y="18" width="204" height="50" rx="4" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1" opacity="0.6"/>
      <rect x="18" y="70" width="100" height="50" rx="4" fill="#243b5e" stroke="#3b5998" strokeWidth="1"/>
      <rect x="122" y="70" width="100" height="50" rx="4" fill="#243b5e" stroke="#3b5998" strokeWidth="1"/>
      <circle cx="66" cy="40" r="20" fill="none" stroke="#475569" strokeWidth="3"/>
      <circle cx="66" cy="40" r="5" fill="#334155"/>
      <rect x="56" y="38" width="20" height="4" rx="2" fill="#475569"/>
      <rect x="122" y="22" width="100" height="40" rx="3" fill="#172840" stroke="#2d4a7a" strokeWidth="1"/>
    </svg>
  )
}
