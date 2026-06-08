const COLORS = {
  scratched: '#EF4444',
  dented:    '#F97316',
  stained:   '#3B82F6',
  cracked:   '#8B5CF6',
  missing:   '#6B7280',
  other:     '#F5A623',
}

export default function DamagePin({ x_pct, y_pct, damage_type, index, onClick }) {
  const color = COLORS[damage_type] || COLORS.other
  return (
    <button
      onClick={onClick}
      className="absolute flex items-center justify-center rounded-full border-2 border-white/80 shadow-lg text-white font-mono font-bold text-[9px] hover:scale-110 active:scale-95 transition-transform"
      style={{
        left: `${x_pct}%`,
        top: `${y_pct}%`,
        transform: 'translate(-50%, -50%)',
        backgroundColor: color,
        width: 22,
        height: 22,
        zIndex: 10,
      }}
      aria-label={damage_type}
    >
      {index != null ? index + 1 : ''}
    </button>
  )
}
