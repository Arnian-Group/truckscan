export default function CanAmSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <CanAmFront className={className} />
  if (view === 'rear') return <CanAmRear className={className} />
  if (view === 'top') return <CanAmTop className={className} />
  if (view === 'interior') return <CanAmInterior className={className} />
  const mirror = view === 'left'
  return (
    <svg viewBox="0 0 240 130" fill="none" className={className}
      style={mirror ? { transform: 'scaleX(-1)' } : {}}>
      {/* Big off-road wheels */}
      <circle cx="55" cy="100" r="24" fill="#1e2535" stroke="#475569" strokeWidth="3"/>
      <circle cx="55" cy="100" r="14" fill="#334155"/>
      <circle cx="55" cy="100" r="5" fill="#64748b"/>
      <circle cx="185" cy="100" r="24" fill="#1e2535" stroke="#475569" strokeWidth="3"/>
      <circle cx="185" cy="100" r="14" fill="#334155"/>
      <circle cx="185" cy="100" r="5" fill="#64748b"/>
      {/* Tread marks */}
      {[-18,-10,-2,6,14].map(a => (
        <line key={a} x1={55 + 24*Math.cos((a*Math.PI)/180)} y1={100 + 24*Math.sin((a*Math.PI)/180)}
          x2={55 + 20*Math.cos((a*Math.PI)/180)} y2={100 + 20*Math.sin((a*Math.PI)/180)}
          stroke="#475569" strokeWidth="2"/>
      ))}
      {/* Roll cage */}
      <line x1="72" y1="76" x2="72" y2="44" stroke="#475569" strokeWidth="3" strokeLinecap="round"/>
      <line x1="168" y1="76" x2="168" y2="44" stroke="#475569" strokeWidth="3" strokeLinecap="round"/>
      <rect x="68" y="40" width="104" height="6" rx="3" fill="#475569" stroke="#64748b" strokeWidth="1"/>
      {/* X braces */}
      <line x1="72" y1="44" x2="168" y2="76" stroke="#374151" strokeWidth="1.5"/>
      <line x1="168" y1="44" x2="72" y2="76" stroke="#374151" strokeWidth="1.5"/>
      {/* Body low */}
      <path d="M30 90 L35 76 L210 76 L215 90 Z" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      {/* Body panel */}
      <rect x="35" y="76" width="175" height="14" fill="#1e3352" stroke="#3b5998" strokeWidth="1"/>
      {/* Seats suggestion */}
      <rect x="80" y="62" width="40" height="16" rx="3" fill="#334155" stroke="#475569" strokeWidth="1"/>
      <rect x="128" y="62" width="40" height="16" rx="3" fill="#334155" stroke="#475569" strokeWidth="1"/>
      {/* Headlight */}
      <rect x="24" y="78" width="14" height="8" rx="2" fill="#fbbf24" opacity="0.85"/>
      {/* Taillight */}
      <rect x="202" y="78" width="14" height="8" rx="2" fill="#dc2626" opacity="0.8"/>
      {/* Skid plate */}
      <rect x="30" y="90" width="180" height="6" rx="1" fill="#1e3352" stroke="#2d4a7a" strokeWidth="1"/>
    </svg>
  )
}

function CanAmFront({ className }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className}>
      <rect x="20" y="80" width="160" height="60" rx="4" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      <line x1="40" y1="30" x2="40" y2="80" stroke="#475569" strokeWidth="3" strokeLinecap="round"/>
      <line x1="160" y1="30" x2="160" y2="80" stroke="#475569" strokeWidth="3" strokeLinecap="round"/>
      <rect x="36" y="26" width="128" height="6" rx="3" fill="#475569" stroke="#64748b" strokeWidth="1"/>
      <line x1="40" y1="30" x2="160" y2="80" stroke="#374151" strokeWidth="1.5"/>
      <line x1="160" y1="30" x2="40" y2="80" stroke="#374151" strokeWidth="1.5"/>
      <rect x="22" y="88" width="44" height="20" rx="3" fill="#fbbf24" opacity="0.8"/>
      <rect x="134" y="88" width="44" height="20" rx="3" fill="#fbbf24" opacity="0.8"/>
      <rect x="74" y="92" width="52" height="14" rx="3" fill="#1e2535" stroke="#334155" strokeWidth="1"/>
      <rect x="20" y="118" width="32" height="20" rx="5" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <rect x="148" y="118" width="32" height="20" rx="5" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <line x1="100" y1="80" x2="100" y2="140" stroke="#1e3a6e" strokeWidth="1"/>
    </svg>
  )
}

function CanAmRear({ className }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className}>
      <rect x="20" y="80" width="160" height="60" rx="4" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      <line x1="40" y1="30" x2="40" y2="80" stroke="#475569" strokeWidth="3" strokeLinecap="round"/>
      <line x1="160" y1="30" x2="160" y2="80" stroke="#475569" strokeWidth="3" strokeLinecap="round"/>
      <rect x="36" y="26" width="128" height="6" rx="3" fill="#475569"/>
      <line x1="40" y1="30" x2="160" y2="80" stroke="#374151" strokeWidth="1.5"/>
      <line x1="160" y1="30" x2="40" y2="80" stroke="#374151" strokeWidth="1.5"/>
      <rect x="22" y="88" width="40" height="14" rx="2" fill="#dc2626" opacity="0.8"/>
      <rect x="138" y="88" width="40" height="14" rx="2" fill="#dc2626" opacity="0.8"/>
      <rect x="20" y="118" width="32" height="20" rx="5" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <rect x="148" y="118" width="32" height="20" rx="5" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
    </svg>
  )
}

function CanAmTop({ className }) {
  return (
    <svg viewBox="0 0 200 280" fill="none" className={className}>
      <rect x="20" y="20" width="160" height="240" rx="12" fill="#243b5e" stroke="#3b5998" strokeWidth="2"/>
      <rect x="32" y="40" width="136" height="100" rx="5" fill="#1e3352" stroke="#2d4a7a" strokeWidth="1"/>
      <rect x="40" y="50" width="52" height="80" rx="3" fill="#334155" stroke="#475569" strokeWidth="1"/>
      <rect x="108" y="50" width="52" height="80" rx="3" fill="#334155" stroke="#475569" strokeWidth="1"/>
      <rect x="22" y="24" width="156" height="14" rx="3" fill="#fbbf24" opacity="0.45"/>
      <rect x="22" y="242" width="156" height="14" rx="3" fill="#dc2626" opacity="0.45"/>
      <circle cx="30" cy="31" r="7" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <circle cx="170" cy="31" r="7" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <circle cx="30" cy="249" r="7" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <circle cx="170" cy="249" r="7" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <rect x="30" y="22" width="3" height="236" fill="#475569"/>
      <rect x="167" y="22" width="3" height="236" fill="#475569"/>
    </svg>
  )
}

function CanAmInterior({ className }) {
  return (
    <svg viewBox="0 0 240 140" fill="none" className={className}>
      <rect x="10" y="10" width="220" height="120" rx="6" fill="#1e2535" stroke="#334155" strokeWidth="1.5"/>
      <rect x="18" y="60" width="100" height="55" rx="4" fill="#243b5e" stroke="#3b5998" strokeWidth="1"/>
      <rect x="122" y="60" width="100" height="55" rx="4" fill="#243b5e" stroke="#3b5998" strokeWidth="1"/>
      <rect x="18" y="18" width="204" height="38" rx="4" fill="#172840" stroke="#2d4a7a" strokeWidth="1"/>
      <circle cx="68" cy="37" r="14" fill="none" stroke="#475569" strokeWidth="2.5"/>
      <circle cx="68" cy="37" r="4" fill="#334155"/>
      <rect x="130" y="22" width="84" height="30" rx="3" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1"/>
      <line x1="120" y1="58" x2="120" y2="118" stroke="#334155" strokeWidth="1.5"/>
    </svg>
  )
}
