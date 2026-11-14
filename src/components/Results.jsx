import { useState, useEffect, useRef } from 'react'
import { Icon } from './ui.jsx'
import VehicleArt, { TYPE_ART } from './VehicleArt.jsx'
import {
  TRIP, TYPES, RIDES, money, eta, etaRange, plural, pax, who, fits, whyNot, priceOf, wasOf, bagsCap, subtitle, facts,
  picks, typeSummary, offerGroups, fitting,
} from '../data.js'

export function TripBar({ group, onEdit, onBack }) {
  return (
    <div className="tripbar">
      <button type="button" className="round-btn" onClick={onBack} aria-label="Back to search"><Icon name="back" size={20} /></button>
      <button type="button" className="trip-pill" onClick={onEdit}>
        <span className="trip-route">{TRIP.from.replace(' (ALC)', '')} → {TRIP.to}</span>
        <span className="trip-meta">{TRIP.date} · {who(group)}</span>
      </button>
    </div>
  )
}

/* Inline capacity, ride-hailing style: person and bag icons with numbers. */
function Cap({ r, g }) {
  const shared = r.type === 'shared'
  return (
    <span className="cap">
      <span><Icon name="user" size={14} stroke={2} />{shared ? pax(g) : r.cap}</span>
      <span><Icon name="bag" size={14} stroke={2} />{bagsCap(r, g)}</span>
    </span>
  )
}

/* Quiet when it fits (the heading already says so); speaks up only when a ride can't take the group. */
function FitLine({ r, g, always }) {
  const ok = fits(r, g)
  if (ok && !always) return null
  if (ok) return <span className="fit fit-ok"><Icon name="check" size={14} stroke={2.4} />Fits your {plural(g.bags, 'suitcase', 'suitcases')}</span>
  return <span className="fit fit-no"><Icon name="warn" size={14} stroke={2} />{whyNot(r, g)}</span>
}

const route = (r) => (r.type === 'shared' ? `Shared · stops on the way · ${eta(r.mins)}` : `Direct · ${eta(r.mins)}`)

/* One row style for every list of rides. The selected row gets a heavy outline and opens its facts. */
function RideRow({ r, g, title, sub, label, selected, onSelect, hideCap, noArt }) {
  const ok = fits(r, g)
  return (
    <div className={`ride ${selected ? 'is-selected' : ''} ${ok ? '' : 'is-off'} ${noArt ? 'ride-compact' : ''}`}>
      <button type="button" className="ride-main" disabled={!ok} aria-pressed={selected} onClick={() => onSelect(r.id)}>
        {noArt ? <span className="radio" aria-hidden="true" /> : <span className="ride-art"><VehicleArt ride={r} width={84} /></span>}
        <span className="ride-text">
          {label && <span className="ride-label">{label}</span>}
          <span className="ride-title">{title || r.name}{!hideCap && <Cap r={r} g={g} />}</span>
          <span className="ride-sub">{sub || r.model || route(r)}</span>
          <FitLine r={r} g={g} />
        </span>
        <span className="ride-price">
          <strong className={selected ? 'tick' : ''} key={`${r.id}-${selected}`}>{money(priceOf(r, g))}</strong>
          <s>{money(wasOf(r, g))}</s>
        </span>
      </button>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="loading" aria-busy="true">
      <p className="loading-text"><span className="pulse-dot" />Finding rides from local providers…</p>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="skel-row" style={{ animationDelay: `${i * 90}ms` }}>
          <span className="skel skel-art" /><span className="skel-lines"><span className="skel skel-l1" /><span className="skel skel-l2" /></span><span className="skel skel-p" />
        </div>
      ))}
    </div>
  )
}

function Recommended({ g, selected, onSelect }) {
  const list = picks(g)
  return (
    <section className="section">
      <h2 className="section-title">Recommended for you</h2>
      <div className="rides">
        {list.map((p, i) => (
          <div key={p.key} className="stagger" style={{ '--d': `${i * 50}ms` }}>
            <RideRow r={p.ride} g={g} label={p.label} selected={selected === p.ride.id} onSelect={onSelect} />
          </div>
        ))}
      </div>
    </section>
  )
}

function TypeList({ g, onOpen }) {
  return (
    <section className="section">
      <h2 className="section-title">All ride types</h2>
      <ul className="types">
        {typeSummary(g).map((t, i) => {
          const none = !t.fit.length
          return (
            <li key={t.type} className="stagger" style={{ '--d': `${120 + i * 40}ms` }}>
              <button type="button" className={`type ${none ? 'is-off' : ''}`} onClick={() => onOpen(t.type)}>
                <span className="ride-art"><VehicleArt ride={TYPE_ART[t.type]} width={84} /></span>
                <span className="ride-text">
                  <span className="ride-title">{t.type === 'access' ? 'Accessible' : TYPES[t.type].name}</span>
                  <span className={none ? 'ride-sub fit-no' : 'ride-sub'}>
                    {none ? (g.bags > bagsCap(t.rides[0], g) ? `Too small for ${plural(g.bags, 'suitcase', 'suitcases')}` : t.reason) : `${plural(t.fit.length, 'ride', 'rides')} · ${t.type === 'shared' ? 'priced per seat' : t.lo === t.hi ? `up to ${t.hi} people` : `${t.lo}–${t.hi} people`}`}
                  </span>
                </span>
                <span className="type-price">{t.rides.length > 1 && <small>from</small>}<strong>{money(t.from)}</strong></span>
                <Icon name="chev" size={18} className="type-chev" />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function OfferRow({ row, g, selected, onSelect }) {
  const [open, setOpen] = useState(false)
  const r = row.lead
  const shared = r.type === 'shared'
  const title = shared ? r.name : `Up to ${r.cap} people`
  const sub = shared ? (r.mins > 60 ? 'Stops at other hotels on the way' : 'Fewer stops, quicker') : `${plural(r.cap, 'suitcase', 'suitcases')}${r.model ? ` · ${r.model}` : ''}`
  return (
    <div className="offer">
      <RideRow r={r} g={g} title={title} sub={sub} hideCap={!shared} noArt selected={selected === r.id} onSelect={onSelect} />
      {row.more.length > 0 && row.ok && (
        <div className={`fold ${open ? 'is-open' : ''}`}>
          <button type="button" className="fold-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? 'Hide other offers' : `${plural(row.more.length, 'more offer', 'more offers')} from ${money(priceOf(row.more[0], g))}`}
            <Icon name="down" size={16} className="fold-chev" />
          </button>
          <div className="fold-body"><div>
            <p className="fold-note">Same seats and suitcases. The listing names a model, but nothing on hoppa explains the higher price.</p>
            {row.more.map((m) => (
              <button key={m.id} type="button" className={`mini ${selected === m.id ? 'is-selected' : ''}`} aria-pressed={selected === m.id} onClick={() => onSelect(m.id)}>
                <span>{m.model || subtitle(m)}</span><strong>{money(priceOf(m, g))}</strong>
              </button>
            ))}
          </div></div>
        </div>
      )}
    </div>
  )
}

function TypeView({ type, g, selected, onSelect, onType, onEdit }) {
  const sum = typeSummary(g)
  const t = sum.find((x) => x.type === type)
  const groups = offerGroups(type, g)
  const none = !t.fit.length
  const nearest = fitting(g).find((r) => r.type !== 'shared')
  const chipsRef = useRef(null)
  useEffect(() => {
    const el = chipsRef.current?.querySelector('.is-on')
    if (el) chipsRef.current.scrollTo({ left: el.offsetLeft - 20, behavior: 'smooth' })
  }, [type])
  return (
    <section>
      <div className="chips" role="tablist" aria-label="Ride types" ref={chipsRef}>
        {sum.map((x) => (
          <button key={x.type} type="button" role="tab" aria-selected={x.type === type}
            className={`chip ${x.type === type ? 'is-on' : ''} ${x.fit.length ? '' : 'is-off'}`} onClick={() => onType(x.type)}>
            {TYPES[x.type].short}
          </button>
        ))}
      </div>
      <div className="type-hero swap-in" key={type}>
        <div className="type-hero-text">
          <h1 className="page-title">{TYPES[type].name}</h1>
          <p className="page-sub">{TYPES[type].blurb}</p>
        </div>
        <span className={`type-hero-art ${none ? 'is-off' : ''}`}><VehicleArt ride={TYPE_ART[type]} width={132} className="drive-in" /></span>
        <div className="type-hero-facts">
          <span>{plural(t.rides.length, 'ride', 'rides')} · {t.type === 'shared' ? 'priced per seat' : t.lo === t.hi ? `up to ${t.hi} people` : `${t.lo}–${t.hi} people`} · from {money(t.from)}</span>
          <span className="type-hero-eta"><Icon name="clock" size={14} />{etaRange(t.rides)}</span>
        </div>
      </div>
      {none && (
        <div className="notice swap-in" role="status">
          <strong>{type === 'shared' ? `Shared shuttles don’t fit ${plural(g.bags, 'suitcase', 'suitcases')}` : `No ${TYPES[type].name.toLowerCase()} fits your group`}</strong>
          <p>{type === 'shared' ? 'Each shuttle seat comes with room for one suitcase.' : `${t.reason}.`}
            {nearest && <> {TYPES[nearest.type].name}s that take {g.bags === 1 ? 'it' : g.bags === 2 ? 'both' : `all ${g.bags}`} start at {money(priceOf(nearest, g))}.</>}</p>
          <div className="notice-actions">
            {nearest && <button type="button" className="btn btn-dark btn-sm" onClick={() => { onType(nearest.type); onSelect(nearest.id) }}>See {TYPES[nearest.type].name.toLowerCase()}s</button>}
            <button type="button" className="btn btn-soft btn-sm" onClick={onEdit}>Change luggage</button>
          </div>
        </div>
      )}
      {groups.map((grp) => (
        <div key={grp.cls} className="section">
          {groups.length > 1 && (
            <h2 className="section-title section-title-art">
              <VehicleArt ride={{ type, cls: grp.cls }} width={64} />{grp.cls}
            </h2>
          )}
          <div className="rides">
            {grp.rows.map((row, i) => (
              <div key={row.lead.id} className="stagger" style={{ '--d': `${i * 35}ms` }}>
                <OfferRow row={row} g={g} selected={selected} onSelect={onSelect} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}

export default function Results({ group, loading, selected, onSelect, view, setView, onEdit, onBack, onBook }) {
  const r = RIDES[selected]
  const ok = r && fits(r, group)
  const n = fitting(group).length
  return (
    <main className="screen results">
      <TripBar group={group} onEdit={onEdit} onBack={view ? () => setView(null) : onBack} />
      {loading ? <Skeleton /> : !n ? (
        <div className="empty swap-in">
          <span className="empty-ic"><Icon name="bag" size={26} /></span>
          <h1 className="page-title">No single vehicle fits</h1>
          <p className="page-sub">The largest vehicle here takes 55 people and 55 suitcases{group.special.includes('Wheelchair') ? ', and the wheelchair-adapted vehicle takes up to 4 people' : ''}. Try fewer bags, or book two rides.</p>
          <button type="button" className="btn btn-primary" onClick={onEdit}>Change group</button>
        </div>
      ) : view ? (
        <TypeView type={view} g={group} selected={selected} onSelect={onSelect} onType={setView} onEdit={onEdit} />
      ) : (
        <>
          <div className="type-head">
            <h1 className="page-title">Choose a ride</h1>
            <p className="page-sub">Showing <span className="tick" key={n}>{n}</span> {n === 1 ? 'ride' : 'rides'} that fit your group and bags</p>
          </div>
          <Recommended g={group} selected={selected} onSelect={onSelect} />
          <TypeList g={group} onOpen={setView} />
        </>
      )}
      {!loading && ok && (
        <div className="bookbar">
          <button type="button" className="btn btn-primary btn-block btn-lg" onClick={onBook}>
            <span>Book {r.name.toLowerCase()}</span>
            <span className="bookbar-price tick" key={r.id}>{money(priceOf(r, group))}</span>
          </button>
        </div>
      )}
    </main>
  )
}
