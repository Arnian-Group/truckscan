const OPTIONS = {
  c_nc_na: [
    { value: 'C', label: 'Cumple', on: 'text-[#22C55E] bg-[#22C55E22] border-[#22C55E60]' },
    { value: 'NC', label: 'No cumple', on: 'text-red-400 bg-red-400/15 border-red-400/60' },
    { value: 'NA', label: 'N/A', on: 'text-white/70 bg-white/10 border-white/40' },
  ],
  si_no_na: [
    { value: 'Si', label: 'Sí', on: 'text-[#22C55E] bg-[#22C55E22] border-[#22C55E60]' },
    { value: 'No', label: 'No', on: 'text-red-400 bg-red-400/15 border-red-400/60' },
    { value: 'NA', label: 'N/A', on: 'text-white/70 bg-white/10 border-white/40' },
  ],
}

// The "fail" value per response_type — drives whether the observation/photo fields
// below the control should be forced open (see ChecklistFill.jsx).
export function isFailValue(responseType, value) {
  return responseType === 'si_no_na' ? value === 'No' : value === 'NC'
}

export default function ChecklistItemControl({ responseType, value, onChange, disabled }) {
  const options = OPTIONS[responseType] || OPTIONS.c_nc_na
  return (
    <div className="flex gap-1.5">
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(active ? null : opt.value)}
            className={`flex-1 min-h-[44px] text-xs font-mono font-bold uppercase tracking-wide border transition-all disabled:opacity-40 ${
              active ? opt.on : 'text-white/40 border-white/10 hover:text-white/70 hover:border-white/25'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
