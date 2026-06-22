export const CITIES = ['Tijuana', 'CSL', 'San Diego']

const CITY_BADGE = {
  Tijuana:    'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  CSL:        'text-pink-400 bg-pink-400/10 border-pink-400/30',
  'San Diego':'text-violet-400 bg-violet-400/10 border-violet-400/30',
}

export function cityBadgeClass(city) {
  return CITY_BADGE[city] || 'text-white/40 bg-white/5 border-white/15'
}
