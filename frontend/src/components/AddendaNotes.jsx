const VIEW_LABELS = {
  front: 'Frontal', right: 'Derecha', left: 'Izquierda',
  rear: 'Trasera', top: 'Techo', interior: 'Interior',
}

// "Version 2" of the final note: built from post-completion addenda so the
// original signed note stays untouched.
export default function AddendaNotes({ damages, showAuthor = false }) {
  const addenda = damages
    .filter(d => d.is_addendum)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  if (addenda.length === 0) return null

  return (
    <section>
      <h2 className="text-xs font-mono text-[#F5A623] uppercase tracking-widest mb-2">
        Actualizaciones posteriores al cierre
      </h2>
      <div className="space-y-1.5">
        {addenda.map(d => (
          <div key={d.id} className="bg-[#161b27] border border-[#F5A623]/20 p-3">
            <p className="text-[10px] font-mono text-white/40 mb-1">
              {new Date(d.created_at).toLocaleString('es-MX')}
              {showAuthor && d.creator_name && ` · ${d.creator_name}`}
              {` · ${VIEW_LABELS[d.view] || d.view} · ${d.photos?.length || 0} foto${d.photos?.length !== 1 ? 's' : ''}`}
            </p>
            <p className="text-white/70 text-sm whitespace-pre-wrap">{d.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
