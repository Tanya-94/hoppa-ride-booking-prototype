/* Flat vector vehicles in a three-quarter view, in the spirit of ride-hailing option lists.
   Each vehicle is a side profile extruded along one depth vector (oblique projection), so every type
   shares the same light, angle and scale. Faces are shaded by which way they point; glass faces are tinted.
   Neutral bodies (white, silver, graphite, black) carry the class; the brand colour only appears as a stripe,
   so a partner brand drops in through --brand. */
import { useId } from 'react'

const D = [11, -7] // depth vector: we see the top and the front of every vehicle
const LIGHT = norm([-0.35, -1])

function norm([x, y]) { const l = Math.hypot(x, y) || 1; return [x / l, y / l] }
function hex(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255] }
function mix(a, b, t) { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})` }
const shade = (c, k) => (k >= 0 ? mix(c, '#ffffff', k) : mix(c, '#000000', -k))
const pts = (P) => P.map((p) => p.join(',')).join(' ')
const add = (p, d = D) => [p[0] + d[0], p[1] + d[1]]

/* Profiles: side view facing right, ground at y≈84. glass = indices of edges (i → i+1) that are windows. */
const SHAPES = {
  sedan: {
    P: [[16, 74], [13, 60], [16, 54], [34, 51], [52, 38], [96, 36], [118, 49], [148, 53], [154, 59], [153, 70], [148, 74]],
    glass: [3, 5], wheels: [42, 126], r: 11,
    windows: [[[56, 41], [76, 40.3], [76, 50.6], [54, 50.5]], [[80, 40.2], [94, 39.5], [110, 50], [80, 50.4]]],
    doors: [[78, 51, 70], [104, 51, 69]], line: [[18, 58], [150, 57]],
    head: [[154, 60], [165, 53], [165, 56.5], [154, 63.5]], tail: [14, 56, 3, 6],
  },
  suv: {
    P: [[13, 74], [11, 48], [18, 33], [100, 31], [124, 46], [150, 51], [156, 58], [155, 70], [150, 74]],
    glass: [1, 3], wheels: [40, 128], r: 12,
    windows: [[[22, 36], [46, 35.2], [46, 47], [17, 47]], [[50, 35.1], [74, 34.4], [74, 47], [50, 47]], [[78, 34.3], [98, 34], [116, 47], [78, 47]]],
    doors: [[76, 48, 70], [104, 48, 69]], line: [[14, 56], [152, 55]],
    head: [[156, 59], [167, 52], [167, 55.5], [156, 62.5]], tail: [12, 52, 3, 8],
  },
  van: {
    P: [[10, 74], [9, 26], [13, 21], [120, 20], [136, 36], [156, 46], [159, 56], [158, 70], [153, 74]],
    glass: [3], wheels: [36, 132], r: 11.5,
    windows: [[[16, 25], [38, 25], [38, 42], [16, 42]], [[42, 25], [64, 25], [64, 42], [42, 42]], [[68, 25], [90, 25], [90, 42], [68, 42]], [[94, 25], [118, 24.5], [131, 42], [94, 42]]],
    doors: [[66, 44, 70], [92, 44, 70]], line: [[11, 50], [156, 50]],
    head: [[159, 57], [170, 50], [170, 53.5], [159, 60.5]], tail: [10, 46, 3, 9],
  },
  bus: {
    P: [[8, 74], [7, 20], [12, 16], [142, 16], [156, 30], [160, 40], [160, 70], [155, 74]],
    glass: [3], wheels: [34, 136], r: 11.5,
    windows: [[[14, 22], [36, 22], [36, 42], [14, 42]], [[40, 22], [62, 22], [62, 42], [40, 42]], [[66, 22], [88, 22], [88, 42], [66, 42]], [[92, 22], [114, 22], [114, 42], [92, 42]], [[118, 22], [140, 22], [152, 42], [118, 42]]],
    doors: [[118, 44, 70]], line: null,
    head: [[160, 58], [171, 51], [171, 54.5], [160, 61.5]], tail: [8, 46, 3, 9],
  },
  coach: {
    P: [[6, 74], [5, 18], [10, 13], [160, 12], [168, 20], [170, 70], [165, 74]],
    glass: [3], wheels: [32, 50, 142], r: 10.5,
    windows: Array.from({ length: 8 }, (_, i) => { const x = 12 + i * 18.5; return [[x, 19], [x + 16, 19], [x + 16, 43], [x, 43]] }),
    doors: [[150, 46, 70]], line: null, front: true,
    head: [[170, 60], [181, 53], [181, 56.5], [170, 63.5]], tail: [6, 48, 3, 10],
  },
}

/* Ride → shape, body colour, extras. Class shows through the paint, like Uber's standard / Black. */
export function artFor(r) {
  const body = r.cls === 'Luxury' ? '#1F2327' : r.cls === 'Executive' ? '#3B4249' : null
  switch (r.type) {
    case 'car': return { shape: 'sedan', body: body || '#E8EBEE' }
    case 'mpv': return { shape: 'suv', body: body || '#D9DEE2' }
    case 'bus': return { shape: 'van', body: '#F3F4F5' }
    case 'access': return { shape: 'van', body: '#F3F4F5', stripe: true, badge: true }
    case 'shared': return { shape: 'bus', body: '#F3F4F5', stripe: true }
    case 'coach': return { shape: 'coach', body: '#F5F6F7', stripe: true }
    default: return { shape: 'sedan', body: '#E8EBEE' }
  }
}

export const TYPE_ART = {
  car: { type: 'car', cls: 'Standard' }, mpv: { type: 'mpv', cls: 'Standard' }, bus: { type: 'bus', cls: 'Standard' },
  access: { type: 'access', cls: 'Standard' }, coach: { type: 'coach', cls: 'Standard' }, shared: { type: 'shared', cls: 'Standard' },
}

export default function VehicleArt({ ride, width = 120, className = '', title }) {
  const uid = useId().replace(/:/g, '')
  const a = artFor(ride)
  const s = SHAPES[a.shape]
  const P = s.P
  const area = P.reduce((acc, p, i) => { const q = P[(i + 1) % P.length]; return acc + p[0] * q[1] - q[0] * p[1] }, 0)
  const sign = area > 0 ? 1 : -1
  const glassC = '#27323B'
  const dark = a.body === '#1F2327' || a.body === '#3B4249'

  const faces = P.map((p, i) => {
    const q = P[(i + 1) % P.length]
    const n = norm([sign * (q[1] - p[1]), -sign * (q[0] - p[0])])
    const vis = n[0] * D[0] + n[1] * D[1] > 0
    const lit = n[0] * LIGHT[0] + n[1] * LIGHT[1]
    const glass = s.glass.includes(i)
    const base = glass ? glassC : a.body
    const fill = glass ? shade(base, lit > 0 ? 0.14 * lit : -0.1) : shade(base, lit > 0 ? (dark ? 0.16 : 0.06) * lit : (dark ? -0.25 : -0.16))
    return { vis, quad: [p, q, add(q), add(p)], fill, i }
  })

  const xs = P.map((p) => p[0])
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const wheel = (cx, far) => {
    const c = far ? add([cx, 84 - s.r]) : [cx, 84 - s.r]
    return (
      <g key={`${cx}-${far}`}>
        <circle cx={c[0]} cy={c[1]} r={s.r} fill={far ? '#1a1d20' : '#23272b'} />
        {!far && <>
          <circle cx={c[0]} cy={c[1]} r={s.r * 0.56} fill="#B9C0C6" />
          <circle cx={c[0]} cy={c[1]} r={s.r * 0.56} fill={`url(#${uid}-hub)`} />
          <circle cx={c[0]} cy={c[1]} r={s.r * 0.16} fill="#7E878F" />
        </>}
      </g>
    )
  }

  return (
    <svg className={`vart ${className}`} viewBox="0 0 192 96" width={width} height={width / 2} role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <linearGradient id={`${uid}-side`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(a.body, dark ? 0.1 : 0.08)} />
          <stop offset="0.55" stopColor={a.body} />
          <stop offset="1" stopColor={shade(a.body, dark ? -0.2 : -0.1)} />
        </linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3C4954" />
          <stop offset="0.45" stopColor={glassC} />
          <stop offset="0.5" stopColor="#4A5965" />
          <stop offset="0.62" stopColor={glassC} />
        </linearGradient>
        <radialGradient id={`${uid}-hub`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".7" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-shadow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#0b1410" stopOpacity=".22" />
          <stop offset="1" stopColor="#0b1410" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx={(minX + maxX) / 2 + 6} cy={83} rx={(maxX - minX) / 2 + 12} ry={6.5} fill={`url(#${uid}-shadow)`} />
      {s.wheels.map((x) => wheel(x, true))}
      <polygon points={pts(P.map((p) => add(p)))} fill={shade(a.body, -0.2)} />
      {faces.filter((f) => !f.vis).map((f) => <polygon key={f.i} points={pts(f.quad)} fill={f.fill} />)}
      {faces.filter((f) => f.vis).map((f) => <polygon key={f.i} points={pts(f.quad)} fill={f.fill} stroke={f.fill} strokeWidth=".4" strokeLinejoin="round" />)}
      {s.front && <polygon points={pts([[171, 20.5], [179, 15.5], [180, 44], [172, 49]])} fill={`url(#${uid}-glass)`} />}
      <polygon points={pts(P)} fill={`url(#${uid}-side)`} strokeLinejoin="round" />

      {a.stripe && <rect x={minX + 2} y={a.shape === 'van' ? 52 : 50} width={maxX - minX - 4} height={4} rx={1} fill="var(--brand, #3F8A45)" />}
      {s.line && <polyline points={pts(s.line)} fill="none" stroke={shade(a.body, dark ? 0.18 : -0.12)} strokeWidth=".8" />}
      {s.windows.map((w, i) => <polygon key={i} points={pts(w)} fill={`url(#${uid}-glass)`} strokeLinejoin="round" stroke={glassC} strokeWidth=".6" />)}
      {s.doors.map(([x, y1, y2], i) => <line key={i} x1={x} y1={y1} x2={x} y2={y2} stroke={shade(a.body, dark ? 0.14 : -0.14)} strokeWidth=".8" />)}
      <polygon points={pts(s.head)} fill="#FFF4CF" stroke="#E8DDB4" strokeWidth=".4" />
      <rect x={s.tail[0]} y={s.tail[1]} width={s.tail[2]} height={s.tail[3]} rx="1" fill="#D2463B" />
      {a.badge && (
        <g transform="translate(44 56)">
          <circle r="7" fill="#2D6CDF" />
          <path d="M-1 -4.2a1.2 1.2 0 1 0 0.01 0M-1.6 -2v3.2h3.4l1.6 2.6M-2.4 -0.4a3.4 3.4 0 1 0 4.2 4.4" fill="none" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
        </g>
      )}

      {s.wheels.map((x) => (
        <path key={`arch-${x}`} d={`M${x - s.r - 2.5} 74 a${s.r + 2.5} ${s.r + 2.5} 0 0 1 ${2 * (s.r + 2.5)} 0`} fill={shade(a.body, dark ? -0.35 : -0.28)} />
      ))}
      {s.wheels.map((x) => wheel(x, false))}
    </svg>
  )
}
