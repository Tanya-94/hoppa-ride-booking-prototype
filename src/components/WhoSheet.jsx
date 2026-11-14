import { useState, useEffect } from 'react'
import { Sheet, Stepper, Icon } from './ui.jsx'
import { SPECIAL, RIDES, fits, pax, plural } from '../data.js'

/* "Who's travelling?" — passengers and bags in one place. The button counts the rides that fit, live. */
export default function WhoSheet({ open, group, onClose, onApply, cta = 'Show' }) {
  const [g, setG] = useState(group)
  useEffect(() => { if (open) setG(group) }, [open, group])
  const set = (k) => (v) => setG((s) => ({ ...s, [k]: v }))
  const toggle = (x) => setG((s) => ({ ...s, special: s.special.includes(x) ? s.special.filter((y) => y !== x) : [...s.special, x] }))
  const n = RIDES.filter((r) => fits(r, g)).length
  const shuttlesOut = RIDES.filter((r) => r.type === 'shared').every((r) => !fits(r, g))

  return (
    <Sheet open={open} onClose={onClose} title="Who's travelling?"
      footer={
        <>
          <p className="foot-note">
            {n === 0 ? 'No single vehicle fits this group. Try fewer bags or split the group.'
              : shuttlesOut && g.bags > pax(g) ? 'Shared shuttles take 1 suitcase per seat, so they drop out.'
                : 'We only show rides with room for everyone and everything.'}
          </p>
          <button type="button" className="btn btn-primary btn-block" disabled={n === 0} onClick={() => onApply(g)}>
            {cta} <span className="tick" key={n}>{n}</span> {n === 1 ? 'ride' : 'rides'}
          </button>
        </>
      }>
      <p className="sheet-lede">Tell us once and we'll match you to vehicles that fit.</p>
      <h3 className="eyebrow">Passengers</h3>
      <Stepper label="Adults" hint="25–57 years" value={g.adults} min={1} onChange={set('adults')} />
      <Stepper label="Youths" hint="0–24 years" value={g.youths} onChange={set('youths')} />
      <Stepper label="Seniors" hint="58+ years" value={g.seniors} onChange={set('seniors')} />
      <h3 className="eyebrow">Luggage</h3>
      <Stepper label="Suitcases" hint="Large bags that go in the boot" value={g.bags} max={60} onChange={set('bags')} />
      <div className="special">
        <span className="special-label">Anything bigger?</span>
        <div className="tags" role="group" aria-label="Bigger items">
          {SPECIAL.map((x) => {
            const on = g.special.includes(x)
            return (
              <button type="button" key={x} className={`tag ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={() => toggle(x)}>
                {on && <Icon name="check" size={14} className="draw" />}{x}
              </button>
            )
          })}
        </div>
        {g.special.length > 0 && (
          <p className="hint-inline"><Icon name="info" size={14} /> We'll pass {plural(g.special.length, 'item', 'items')} on to the provider to confirm.</p>
        )}
      </div>
    </Sheet>
  )
}
