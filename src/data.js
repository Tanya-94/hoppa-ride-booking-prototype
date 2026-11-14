/* Real data: hoppa.com search ALC -> Meliá Benidorm, Thu 4 Dec 2026, captured 13 Nov 2026 (35 results, in hoppa's order).
   Stated assumptions (same as the boards):
   - suitcase capacity = hoppa's luggage "Max." (it always equals the passenger Max.)
   - private vehicles are priced per vehicle; shuttles per seat, with one suitcase per seat
   - refund protection is about 11% of the ride (matches £0.73, £7.10, £10.31, £11.83 seen live)
   - waiting and cancellation wording comes from hoppa's "More Info" sheet and Terms & Conditions
   - stop counts are assumed (hoppa's live results don't list them): Shuttle 8 hotel stops, Speedy shuttle 3;
     every private vehicle goes direct with no stops */

const RAW = [
  ['shared', 'Shuttle', '', 1, 90, 6.66, 7.83],
  ['shared', 'Speedy shuttle', '', 1, 43, 16.86, 19.84],
  ['car', 'Private car', '', 3, 43, 64.54, 75.93],
  ['car', 'Private car', '', 4, 43, 66.73, 78.5],
  ['car', 'Private car', 'Toyota Corolla or similar', 3, 43, 80.89, 95.16],
  ['bus', 'Minibus', '', 6, 43, 93.75, 110.29],
  ['car', 'Executive car', '', 4, 43, 94.64, 111.34],
  ['bus', 'Minibus', '', 8, 43, 95.88, 112.8],
  ['mpv', 'Executive MPV', '', 6, 43, 99.9, 117.53],
  ['car', 'Executive car', '', 7, 43, 105.16, 123.72],
  ['car', 'Executive car', 'Mercedes E Class or similar', 3, 43, 107.56, 126.54],
  ['mpv', 'Private MPV', 'Toyota Highlander or similar', 4, 43, 108.89, 128.1],
  ['mpv', 'Private MPV', 'Toyota Sienna or similar', 5, 43, 112.89, 132.81],
  ['car', 'Luxury car', '', 3, 43, 115.68, 136.09],
  ['access', 'Wheelchair adapted', '', 4, 43, 117.18, 137.86],
  ['mpv', 'Luxury MPV', '', 7, 43, 126.19, 148.46],
  ['bus', 'Minibus', '', 10, 43, 126.77, 149.14],
  ['bus', 'Minibus', '', 13, 43, 127.83, 150.39],
  ['mpv', 'Executive MPV', 'BMW X5 or similar', 4, 43, 134.22, 157.91],
  ['bus', 'Minibus', '', 16, 43, 136.01, 160.01],
  ['bus', 'Minibus', 'Ford Transit or similar', 8, 43, 150.22, 176.73],
  ['coach', 'Coach', '', 18, 43, 191.75, 225.59],
  ['coach', 'Coach', '', 20, 43, 192.07, 225.97],
  ['coach', 'Coach', '', 24, 43, 196.23, 230.86],
  ['coach', 'Coach', '', 35, 43, 311.47, 366.44],
  ['coach', 'Coach', '', 55, 43, 342.63, 403.09],
  ['bus', 'Minibus', 'Ford Transit or similar', 10, 43, 467.56, 550.07],
  ['bus', 'Minibus', 'Toyota Hiace or similar', 12, 43, 514.22, 604.97],
  ['bus', 'Minibus', 'Toyota Coaster or similar', 14, 43, 560.89, 659.87],
  ['bus', 'Minibus', 'Ford E-450 or similar', 16, 43, 607.56, 714.77],
  ['coach', 'Coach', 'Ford F-550 or similar', 23, 43, 700.89, 824.58],
  ['coach', 'Coach', 'Ford F-550 or similar', 27, 43, 747.56, 879.48],
  ['coach', 'Coach', 'Ford F-650 or similar', 36, 43, 794.22, 934.38],
  ['coach', 'Coach', 'Volvo coach or similar', 44, 43, 840.89, 989.28],
  ['coach', 'Coach', 'Prevost motorcoach or similar', 55, 43, 934.22, 1099.08],
]

const STOPS = { Shuttle: 8, 'Speedy shuttle': 3 }

export const RIDES = RAW.map(([type, name, model, cap, mins, price, was], id) => ({
  id, type, name, model, cap, mins, price, was, stops: STOPS[name] || 0,
  cls: /Executive/.test(name) ? 'Executive' : /Luxury/.test(name) ? 'Luxury' : 'Standard',
}))

/* Child seats seen on the live site for these two rides; the others offered none, or weren't checked. */
export const EXTRAS = { 10: [{ name: 'Baby seat (0–2 years)', price: 8.87 }], 26: [{ name: 'Baby seat (0–2 years)', price: 8.87 }] }

export const TYPES = {
  car: { name: 'Private car', short: 'Car', blurb: 'Just your group, door to door' },
  mpv: { name: 'MPV', short: 'MPV', blurb: 'More legroom and boot space' },
  bus: { name: 'Minibus', short: 'Minibus', blurb: 'Groups, sports kit and lots of bags' },
  access: { name: 'Wheelchair adapted', short: 'Accessible', blurb: 'Ramp or lift, room for a wheelchair' },
  coach: { name: 'Coach', short: 'Coach', blurb: 'Large groups travelling together' },
  shared: { name: 'Shared shuttle', short: 'Shared', blurb: 'Lowest price, shared with other travellers' },
}

export const SPECIAL = ['Pushchair', 'Golf bag', 'Ski or snowboard', 'Bicycle', 'Wheelchair']

export const TRIP = {
  from: 'Alicante Airport (ALC)',
  to: 'Meliá Benidorm',
  toArea: 'Benidorm',
  date: 'Thu 4 Dec',
  lands: '14:00',
}

export const money = (n) => '£' + n.toFixed(2)
/* Journey times are hoppa's estimates, not a promise: traffic and stops change them. */
export const eta = (m) => `est. ${m} min`
export const etaRange = (rides) => {
  const ms = rides.map((r) => r.mins)
  const lo = Math.min(...ms), hi = Math.max(...ms)
  return lo === hi ? `Est. journey ${lo} min` : `Est. journey ${lo}–${hi} min`
}
/* Stops, said the same way on every page. */
export const stopsText = (r) => (r.stops ? `${r.stops} stops` : 'Direct, no stops')
export const stopsRange = (rides) => {
  const s = rides.map((r) => r.stops)
  const lo = Math.min(...s), hi = Math.max(...s)
  return !hi ? 'Direct, no stops' : lo === hi ? `${hi} stops` : `${lo}–${hi} stops`
}
export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`
export const pax = (g) => g.adults + g.youths + g.seniors

export function who(g) {
  const p = []
  if (g.adults) p.push(plural(g.adults, 'adult', 'adults'))
  if (g.youths) p.push(plural(g.youths, 'youth', 'youths'))
  if (g.seniors) p.push(plural(g.seniors, 'senior', 'seniors'))
  p.push(plural(g.bags, 'suitcase', 'suitcases'))
  if (g.special.length) p.push(`+${g.special.length} bigger`)
  return p.join(' · ')
}

export const seatsOk = (r, g) => (r.type === 'shared' ? true : r.cap >= pax(g))
export const bagsCap = (r, g) => (r.type === 'shared' ? pax(g) : r.cap)
export const fits = (r, g) => seatsOk(r, g) && g.bags <= bagsCap(r, g) && (!g.special.includes('Wheelchair') || r.type === 'access')
export const priceOf = (r, g) => (r.type === 'shared' ? r.price * pax(g) : r.price)
export const wasOf = (r, g) => (r.type === 'shared' ? r.was * pax(g) : r.was)
export const refundOf = (r, g) => Math.round(priceOf(r, g) * 0.11 * 100) / 100

export function whyNot(r, g) {
  if (!seatsOk(r, g)) return `Not enough seats for ${pax(g)}`
  if (g.special.includes('Wheelchair') && r.type !== 'access') return 'No wheelchair space'
  if (g.bags > bagsCap(r, g)) return r.type === 'shared'
    ? `1 suitcase per seat · you have ${g.bags}`
    : `Room for ${plural(r.cap, 'suitcase', 'suitcases')} · you have ${g.bags}`
  return ''
}

export const subtitle = (r) =>
  r.model || (r.type === 'shared' ? 'Shared ride' : r.cls === 'Standard' ? 'Standard class' : `${r.cls} class`)

/* Journey facts, all from hoppa's More Info sheet and terms. */
export function facts(r) {
  if (r.type === 'shared') return [
    { icon: 'route', text: `${r.stops} stops at other hotels · ${eta(r.mins)}` },
    { icon: 'clock', text: 'Leaves up to 60 min after you meet the driver', warn: true },
    { icon: 'shield', text: 'Free cancellation until 48 h before pickup' },
  ]
  return [
    { icon: 'route', text: `Direct to your hotel, no stops · ${eta(r.mins)}` },
    { icon: 'clock', text: 'Driver waits up to 60 min free after you land' },
    { icon: 'shield', text: 'Free cancellation until 48 h before pickup' },
  ]
}

export const fitting = (g) => RIDES.filter((r) => fits(r, g)).sort((a, b) => priceOf(a, g) - priceOf(b, g))

/* Three picks, like a ride-hailing option list: best value, more room, premium. Each is a real ride. */
export function picks(g) {
  const f = fitting(g)
  if (!f.length) return []
  const best = f[0]
  const room = f.find((r) => r.id !== best.id && r.cap >= Math.max(pax(g), g.bags) + 2)
  const prem = f.find((r) => r.cls !== 'Standard' && r.id !== best.id && r.id !== room?.id)
  return [
    { key: 'value', label: 'Best value', ride: best },
    room && { key: 'room', label: 'More room', ride: room },
    prem && { key: 'premium', label: 'Premium', ride: prem },
  ].filter(Boolean)
}

/* Ride types with counts, size range and "from" price; types that don't fit go last. */
export function typeSummary(g) {
  return Object.keys(TYPES).map((t) => {
    const rides = RIDES.filter((r) => r.type === t)
    const fit = rides.filter((r) => fits(r, g))
    const caps = rides.map((r) => r.cap)
    const pool = fit.length ? fit : rides
    return {
      type: t, rides, fit,
      lo: Math.min(...caps), hi: Math.max(...caps),
      from: Math.min(...pool.map((r) => priceOf(r, g))),
      reason: fit.length ? '' : whyNot(rides[0], g),
    }
  }).sort((a, b) => (!!b.fit.length - !!a.fit.length) || a.from - b.from)
}

/* Inside a type: one row per class + size, and bigger always costs more.
   hoppa lists some smaller vehicles above the price of bigger ones in the same class (e.g. Executive car:
   4 people £94.64, but a named-model 3-seater £107.56). Those offers are "dominated": a same-class vehicle
   with at least as many seats costs less. They fold behind that cheaper, roomier row instead of getting
   their own, so prices only go up as the vehicle gets bigger. */
export function offerGroups(type, g, sort = 'recommended') {
  const all = RIDES.filter((r) => r.type === type)
  const key = (r) => `${r.cls}|${r.type === 'shared' ? r.name : ''}`
  const leads = all.filter((r) => !all.some((o) => o.id !== r.id && key(o) === key(r) && o.cap >= r.cap &&
    (o.price < r.price || (o.price === r.price && (o.cap > r.cap || o.id < r.id)))))
  const rows = leads.map((lead) => ({ lead, more: [], ok: fits(lead, g) }))
  all.filter((r) => !leads.includes(r)).forEach((r) => {
    const home = rows.filter((x) => key(x.lead) === key(r) && x.lead.cap >= r.cap).sort((a, b) => a.lead.cap - b.lead.cap)[0]
    if (fits(r, g)) home.more.push(r)
  })
  rows.forEach((x) => x.more.sort((a, b) => a.price - b.price))
  const cmp = {
    recommended: (a, b) => a.lead.cap - b.lead.cap || a.lead.price - b.lead.price,
    low: (a, b) => a.lead.price - b.lead.price,
    high: (a, b) => b.lead.price - a.lead.price,
    fast: (a, b) => a.lead.mins - b.lead.mins || a.lead.price - b.lead.price,
    room: (a, b) => b.lead.cap - a.lead.cap || a.lead.price - b.lead.price,
  }[sort]
  rows.sort((a, b) => (b.ok - a.ok) || cmp(a, b))
  if (sort !== 'recommended') return [{ cls: null, rows }]
  const order = ['Standard', 'Executive', 'Luxury']
  const classes = [...new Set(rows.map((r) => r.lead.cls))]
  return classes.sort((a, b) => order.indexOf(a) - order.indexOf(b)).map((cls) => ({ cls, rows: rows.filter((r) => r.lead.cls === cls) }))
}

export const SORTS = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'low', label: 'Lowest price' },
  { key: 'high', label: 'Highest price' },
  { key: 'fast', label: 'Fastest' },
  { key: 'room', label: 'Most room' },
]

/* The smallest vehicle that fits, for the live preview on the search screen. */
export function smallestFit(g) {
  const f = fitting(g).filter((r) => r.type !== 'shared')
  if (!f.length) return null
  return f.slice().sort((a, b) => a.cap - b.cap || a.price - b.price)[0]
}
