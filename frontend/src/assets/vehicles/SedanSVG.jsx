export default function SedanSVG({ view = 'side', className = '' }) {
  if (view === 'front') return <SedanFront className={className} />
  if (view === 'rear') return <SedanRear className={className} />
  if (view === 'top') return <SedanTop className={className} />
  if (view === 'interior') return <SedanInterior className={className} />
  const mirror = view === 'left'
  return (
    <svg viewBox="0 0 240 130" fill="none" className={className}
      style={mirror ? { transform: 'scaleX(-1)' } : {}}>
      {/* Wheels */}
      <circle cx="57" cy="104" r="20" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <circle cx="57" cy="104" r="11" fill="#334155"/>
      <circle cx="57" cy="104" r="4" fill="#64748b"/>
      <circle cx="183" cy="104" r="20" fill="#1e2535" stroke="#475569" strokeWidth="2.5"/>
      <circle cx="183" cy="104" r="11" fill="#334155"/>
      <circle cx="183" cy="104" r="4" fill="#64748b"/>
      {/* Body lower */}
      <path d="M28 84 L34 100 L206 100 L212 84 Z" fill="#243b5e" stroke="#3b5998" strokeWidth="1.2"/>
      {/* Body upper / cabin */}
      <path d="M72 84 Q85 48 108 42 L162 42 Q188 50 200 84 Z" fill="#243b5e" stroke="#3b5998" strokeWidth="1.2"/>
      {/* Hood slope */}
      <path d="M28 84 Q42 72 72 84" fill="#1e3352" stroke="#3b5998" strokeWidth="1"/>
      {/* Trunk slope */}
      <path d="M200 84 Q210 72 212 84" fill="#1e3352" stroke="#3b5998" strokeWidth="1"/>
      {/* Windshield */}
      <path d="M108 44 L88 82 L160 82 L176 44 Z" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1" opacity="0.85"/>
      {/* Door divider line */}
      <line x1="132" y1="44" x2="132" y2="82" stroke="#1e3a6e" strokeWidth="1.2"/>
      {/* Door handle hints */}
      <rect x="104" y="68" width="12" height="3" rx="1.5" fill="#475569"/>
      <rect x="150" y="68" width="12" height="3" rx="1.5" fill="#475569"/>
      {/* Headlight */}
      <path d="M22 76 L30 72 L30 80 L22 82 Z" fill="#fbbf24" opacity="0.85"/>
      {/* Taillight */}
      <path d="M210 76 L218 74 L218 82 L210 80 Z" fill="#dc2626" opacity="0.8"/>
    </svg>
  )
}

function SedanFront({ className }) {
  return (
    <svg viewBox="0 0 200 150" fill="none" className={className}>
      <rect x="20" y="85" width="160" height="45" rx="4" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      <path d="M30 85 Q40 40 100 32 Q160 40 170 85 Z" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      <path d="M42 85 Q52 48 100 38 Q148 48 158 85 Z" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1" opacity="0.85"/>
      <rect x="22" y="92" width="38" height="18" rx="3" fill="#fbbf24" opacity="0.8"/>
      <rect x="140" y="92" width="38" height="18" rx="3" fill="#fbbf24" opacity="0.8"/>
      <rect x="68" y="96" width="64" height="14" rx="3" fill="#1e2535" stroke="#334155" strokeWidth="1"/>
      <rect x="25" y="120" width="30" height="6" rx="2" fill="#1e2535" stroke="#475569" strokeWidth="1"/>
      <rect x="145" y="120" width="30" height="6" rx="2" fill="#1e2535" stroke="#475569" strokeWidth="1"/>
      <line x1="100" y1="85" x2="100" y2="130" stroke="#1e3a6e" strokeWidth="1"/>
    </svg>
  )
}

function SedanRear({ className }) {
  return (
    <svg viewBox="0 0 200 150" fill="none" className={className}>
      <rect x="20" y="85" width="160" height="45" rx="4" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      <path d="M35 85 Q45 45 100 38 Q155 45 165 85 Z" fill="#243b5e" stroke="#3b5998" strokeWidth="1.5"/>
      <path d="M50 85 Q58 52 100 46 Q142 52 150 85 Z" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1" opacity="0.85"/>
      <rect x="22" y="92" width="36" height="14" rx="2" fill="#dc2626" opacity="0.8"/>
      <rect x="142" y="92" width="36" height="14" rx="2" fill="#dc2626" opacity="0.8"/>
      <rect x="72" y="98" width="56" height="10" rx="2" fill="#374151" stroke="#4b5563" strokeWidth="1"/>
      <rect x="82" y="100" width="36" height="6" rx="1" fill="#1f2937"/>
      <line x1="100" y1="85" x2="100" y2="130" stroke="#1e3a6e" strokeWidth="1"/>
      <circle cx="100" cy="117" r="3" fill="#6b7280"/>
    </svg>
  )
}

function SedanTop({ className }) {
  return (
    <svg viewBox="0 0 200 260" fill="none" className={className}>
      <rect x="30" y="20" width="140" height="220" rx="20" fill="#243b5e" stroke="#3b5998" strokeWidth="2"/>
      <rect x="40" y="50" width="120" height="140" rx="8" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1" opacity="0.85"/>
      <rect x="44" y="54" width="52" height="132" rx="4" fill="#0a1a30" opacity="0.7"/>
      <rect x="104" y="54" width="52" height="132" rx="4" fill="#0a1a30" opacity="0.7"/>
      <line x1="100" y1="50" x2="100" y2="190" stroke="#1e3a6e" strokeWidth="1.5"/>
      <rect x="32" y="25" width="136" height="22" rx="4" fill="#fbbf24" opacity="0.5"/>
      <rect x="32" y="193" width="136" height="22" rx="4" fill="#dc2626" opacity="0.5"/>
      <circle cx="40" cy="36" r="5" fill="#1e2535" stroke="#475569" strokeWidth="1.5"/>
      <circle cx="160" cy="36" r="5" fill="#1e2535" stroke="#475569" strokeWidth="1.5"/>
      <circle cx="40" cy="204" r="5" fill="#1e2535" stroke="#475569" strokeWidth="1.5"/>
      <circle cx="160" cy="204" r="5" fill="#1e2535" stroke="#475569" strokeWidth="1.5"/>
    </svg>
  )
}

function SedanInterior({ className }) {
  return (
    <svg viewBox="0 0 240 160" fill="none" className={className}>
      <rect x="10" y="10" width="220" height="140" rx="6" fill="#1e2535" stroke="#334155" strokeWidth="1.5"/>
      <rect x="18" y="18" width="204" height="75" rx="4" fill="#0d2340" stroke="#1e3a6e" strokeWidth="1"/>
      <rect x="24" y="24" width="96" height="63" rx="3" fill="#0a1a30" opacity="0.8"/>
      <rect x="124" y="24" width="92" height="63" rx="3" fill="#0a1a30" opacity="0.8"/>
      <rect x="60" y="93" width="120" height="20" rx="6" fill="#334155" stroke="#475569" strokeWidth="1.5"/>
      <circle cx="80" cy="103" r="8" fill="#1e2535" stroke="#F5A623" strokeWidth="1.5"/>
      <circle cx="120" cy="103" r="8" fill="#1e2535" stroke="#475569" strokeWidth="1.5"/>
      <circle cx="160" cy="103" r="8" fill="#1e2535" stroke="#475569" strokeWidth="1.5"/>
      <rect x="18" y="118" width="90" height="24" rx="4" fill="#243b5e" stroke="#3b5998" strokeWidth="1"/>
      <rect x="132" y="118" width="90" height="24" rx="4" fill="#243b5e" stroke="#3b5998" strokeWidth="1"/>
      <line x1="120" y1="93" x2="120" y2="142" stroke="#334155" strokeWidth="1.5"/>
    </svg>
  )
}
