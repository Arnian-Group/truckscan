export default function MotorcycleSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <MotoFront className={className} />
  if (view === 'rear') return <MotoRear className={className} />
  if (view === 'top') return <MotoTop className={className} />
  if (view === 'interior') return <MotoInterior className={className} />
  const mirror = view === 'left'
  return (
    <svg viewBox="0 0 240 130" fill="none" className={className}
      style={mirror ? { transform: 'scaleX(-1)' } : {}}>
      {/* Rear wheel */}
      <circle cx="168" cy="96" r="28" fill="#1e2535" stroke="#475569" strokeWidth="3"/>
      <circle cx="168" cy="96" r="16" fill="#334155"/>
      <circle cx="168" cy="96" r="6" fill="#64748b"/>
      {/* Front wheel */}
      <circle cx="68" cy="96" r="26" fill="#1e2535" stroke="#475569" strokeWidth="3"/>
      <circle cx="68" cy="96" r="14" fill="#334155"/>
      <circle cx="68" cy="96" r="5" fill="#64748b"/>
      {/* Frame */}
      <path d="M80 90 L100 60 L140 60 L160 90" stroke="#475569" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <line x1="100" y1="60" x2="80" y2="90" stroke="#374151" strokeWidth="2"/>
      {/* Fuel tank */}
      <path d="M98 52 Q120 44 142 52 L138 66 L102 66 Z" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      {/* Seat */}
      <path d="M132 58 L168 62 L166 70 L128 66 Z" fill="#334155" stroke="#475569" strokeWidth="1.5"/>
      {/* Front fork */}
      <line x1="80" y1="90" x2="68" y2="72" stroke="#475569" strokeWidth="3" strokeLinecap="round"/>
      <line x1="74" y1="85" x2="64" y2="70" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
      {/* Handlebars */}
      <path d="M64 52 Q72 46 80 52" stroke="#475569" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <line x1="72" y1="49" x2="72" y2="68" stroke="#475569" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Engine block */}
      <rect x="100" y="70" width="44" height="22" rx="4" fill="#1e3352" stroke="#2d4a7a" strokeWidth="1.5"/>
      {/* Exhaust */}
      <path d="M140 86 Q160 92 168 86" stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Headlight */}
      <ellipse cx="52" cy="74" rx="8" ry="6" fill="#fbbf24" opacity="0.85"/>
      {/* Taillight */}
      <rect x="188" y="70" width="8" height="6" rx="2" fill="#dc2626" opacity="0.8"/>
      {/* Rear fender */}
      <path d="M164 68 Q175 62 180 68" fill="#1e3352" stroke="#2d4a7a" strokeWidth="1"/>
      {/* Fender front */}
      <path d="M56 70 Q62 58 76 64" fill="#1e3352" stroke="#2d4a7a" strokeWidth="1"/>
    </svg>
  )
}

function MotoFront({ className }) {
  return (
    <svg viewBox="0 0 200 180" fill="none" className={className}>
      <circle cx="100" cy="130" r="32" fill="#1e2535" stroke="#475569" strokeWidth="3"/>
      <circle cx="100" cy="130" r="18" fill="#334155"/>
      <circle cx="100" cy="130" r="7" fill="#64748b"/>
      <path d="M60 50 Q70 30 100 24 Q130 30 140 50" stroke="#475569" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <line x1="100" y1="40" x2="100" y2="100" stroke="#475569" strokeWidth="3" strokeLinecap="round"/>
      <line x1="80" y1="58" x2="88" y2="100" stroke="#374151" strokeWidth="2"/>
      <line x1="120" y1="58" x2="112" y2="100" stroke="#374151" strokeWidth="2"/>
      <ellipse cx="100" cy="68" rx="16" ry="12" fill="#fbbf24" opacity="0.85" stroke="#fbbf24" strokeWidth="1"/>
      <ellipse cx="100" cy="50" rx="20" ry="10" fill="#1e3352" stroke="#3b5998" strokeWidth="1.5"/>
    </svg>
  )
}

function MotoRear({ className }) {
  return (
    <svg viewBox="0 0 200 180" fill="none" className={className}>
      <circle cx="100" cy="130" r="32" fill="#1e2535" stroke="#475569" strokeWidth="3"/>
      <circle cx="100" cy="130" r="18" fill="#334155"/>
      <circle cx="100" cy="130" r="7" fill="#64748b"/>
      <rect x="70" y="55" width="60" height="30" rx="4" fill="#334155" stroke="#475569" strokeWidth="1.5"/>
      <line x1="100" y1="85" x2="100" y2="98" stroke="#475569" strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="68" y="88" width="64" height="12" rx="2" fill="#1e3352" stroke="#2d4a7a" strokeWidth="1"/>
      <rect x="66" y="45" width="68" height="14" rx="2" fill="#dc2626" opacity="0.8"/>
      <rect x="74" y="48" width="52" height="8" rx="1" fill="#b91c1c" opacity="0.6"/>
    </svg>
  )
}

function MotoTop({ className }) {
  return (
    <svg viewBox="0 0 120 280" fill="none" className={className}>
      <ellipse cx="60" cy="240" rx="28" ry="28" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <ellipse cx="60" cy="240" rx="16" ry="16" fill="#334155"/>
      <ellipse cx="60" cy="40" rx="24" ry="24" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <ellipse cx="60" cy="40" rx="14" ry="14" fill="#334155"/>
      <rect x="46" y="64" width="28" height="40" rx="6" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      <rect x="48" y="108" width="24" height="70" rx="4" fill="#334155" stroke="#475569" strokeWidth="1.5"/>
      <rect x="50" y="180" width="20" height="40" rx="3" fill="#1e3352" stroke="#2d4a7a" strokeWidth="1"/>
      <ellipse cx="60" cy="52" rx="18" ry="8" fill="#fbbf24" opacity="0.6"/>
    </svg>
  )
}

function MotoInterior({ className }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className}>
      <rect x="10" y="10" width="180" height="140" rx="6" fill="#1e2535" stroke="#334155" strokeWidth="1.5"/>
      <ellipse cx="80" cy="80" rx="50" ry="50" fill="none" stroke="#475569" strokeWidth="3"/>
      <ellipse cx="80" cy="80" rx="35" ry="35" fill="#172840" stroke="#2d4a7a" strokeWidth="1.5"/>
      <circle cx="80" cy="80" r="6" fill="#334155"/>
      <line x1="80" y1="50" x2="80" y2="74" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="106" y1="56" x2="97" y2="67" stroke="#475569" strokeWidth="2" strokeLinecap="round"/>
      <rect x="145" y="50" width="34" height="56" rx="5" fill="#172840" stroke="#2d4a7a" strokeWidth="1"/>
      <rect x="150" y="56" width="24" height="14" rx="2" fill="#0d2340"/>
      <rect x="150" y="75" width="24" height="10" rx="2" fill="#0d2340"/>
      <rect x="150" y="90" width="24" height="10" rx="2" fill="#0d2340"/>
    </svg>
  )
}
