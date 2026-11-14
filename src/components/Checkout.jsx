import { useState, useRef } from 'react'
import { Icon, Stepper } from './ui.jsx'
import VehicleArt from './VehicleArt.jsx'
import { RideFacts, RideTerms } from './RideInfo.jsx'
import { TRIP, EXTRAS, SPECIAL, fits, whyNot, eta, stopsText, money, plural, pax, priceOf, wasOf, refundOf, subtitle, bagsCap } from '../data.js'

export function totals(r, g, form) {
  const ride = priceOf(r, g)
  const ex = (EXTRAS[r.id] || []).reduce((s, e, i) => s + e.price * (form.extras[i] || 0), 0)
  const refund = form.refund ? refundOf(r, g) : 0
  return { ride, ex, refund, total: Math.round((ride + ex + refund) * 100) / 100 }
}

function TripSummary({ r, g, onChangeRide }) {
  return (
    <section className="trip-card">
      <div className="trip-card-top">
        <span className="trip-card-art"><VehicleArt ride={r} width={96} /></span>
        <div>
          <strong>{r.name}</strong>
          <span>{subtitle(r)} · {plural(bagsCap(r, g), 'suitcase', 'suitcases')}</span>
        </div>
        {onChangeRide && <button type="button" className="text-btn" onClick={onChangeRide}>Change</button>}
      </div>
      <ol className="journey">
        <li><span className="dot" /><div><strong>{TRIP.from}</strong><span>{TRIP.date} · meet your driver after landing, {TRIP.lands}</span></div></li>
        <li><span className="dot dot-end" /><div><strong>{TRIP.to}</strong><span>{r.type === 'shared' ? `Shared · ${stopsText(r).toLowerCase()}` : 'Direct, no stops'} · {eta(r.mins)}</span></div></li>
      </ol>
    </section>
  )
}

/* The discount is hoppa's own: the struck-out price minus the price shown (15% on every live result). */
function PriceLines({ r, g, form }) {
  const t = totals(r, g, form)
  const was = wasOf(r, g)
  const saved = Math.round((was - t.ride) * 100) / 100
  const pct = Math.round((saved / was) * 100)
  return (
    <section className="block">
      <h2 className="block-title">Price details</h2>
      <dl className="lines">
        <div><dt>{r.type === 'shared' ? `${money(r.was)} × ${plural(pax(g), 'seat', 'seats')}` : 'Ride, whole vehicle'}</dt><dd>{money(was)}</dd></div>
        {saved > 0 && <div className="discount"><dt>Discount ({pct}% off)</dt><dd>−{money(saved)}</dd></div>}
        {t.ex > 0 && <div><dt>Extras</dt><dd>{money(t.ex)}</dd></div>}
        {t.refund > 0 && <div><dt>Refund protection</dt><dd>{money(t.refund)}</dd></div>}
        <div className="total"><dt>Total (GBP)</dt><dd className="tick" key={t.total}>{money(t.total)}</dd></div>
      </dl>
      {saved > 0 && <p className="saved-note">You save {money(saved)} on this ride.</p>}
    </section>
  )
}

function Field({ label, value, onChange, error, type = 'text', help, autoComplete, inputRef, prefix }) {
  const id = 'f-' + label.replace(/\W+/g, '-').toLowerCase()
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <div className="field-box">
        <label htmlFor={id}>{label}</label>
        <div className="field-row">
          {prefix && <span className="prefix">{prefix}</span>}
          <input id={id} ref={inputRef} type={type} value={value} autoComplete={autoComplete}
            aria-invalid={!!error} aria-describedby={error ? id + '-e' : help ? id + '-h' : undefined}
            onChange={(e) => onChange(e.target.value)} />
          {!error && value && <Icon name="check" size={16} stroke={2.4} className="valid draw" />}
        </div>
      </div>
      {error ? <p className="error-text" id={id + '-e'}><Icon name="warn" size={14} />{error}</p>
        : help && <p className="help" id={id + '-h'}>{help}</p>}
    </div>
  )
}

function Top({ back, onBack, step, title }) {
  return (
    <>
      <div className="topline">
        <button type="button" className="round-btn" onClick={onBack} aria-label={`Back to ${back}`}><Icon name="back" size={20} /></button>
        <span className="steps" aria-label={`Step ${step} of 4`}>{[1, 2, 3, 4].map((i) => <i key={i} className={i <= step ? 'on' : ''} />)}</span>
      </div>
      <h1 className="page-title">{title}</h1>
    </>
  )
}

/* Luggage, editable right before payment. The price is per vehicle, so it doesn't change;
   if the bags no longer fit, say so here and offer a bigger ride instead of failing later. */
function Luggage({ r, g, setGroup, onChangeRide, error }) {
  const ok = fits(r, g)
  const toggle = (x) => setGroup((s) => ({ ...s, special: s.special.includes(x) ? s.special.filter((y) => y !== x) : [...s.special, x] }))
  return (
    <section className="block" id="luggage">
      <h2 className="block-title">Luggage</h2>
      <Stepper label="Suitcases" hint={`This ride takes up to ${bagsCap(r, g)}`} value={g.bags} max={60}
        onChange={(v) => setGroup((s) => ({ ...s, bags: v }))} />
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
      </div>
      {ok ? (
        <p className="inline-note"><Icon name="check" size={16} />Fits this ride. The price stays the same.{g.special.length > 0 && ' We’ll pass the bigger items on to the provider to confirm.'}</p>
      ) : (
        <div className={`notice swap-in ${error ? 'shake' : ''}`} role="status" key={error}>
          <strong>Your luggage doesn’t fit this {r.name.toLowerCase()}</strong>
          <p>{whyNot(r, g)}. Remove a bag, or choose a bigger ride.</p>
          <div className="notice-actions">
            <button type="button" className="btn btn-dark btn-sm" onClick={onChangeRide}>Choose a bigger ride</button>
          </div>
        </div>
      )}
    </section>
  )
}

export function Details({ r, g, setGroup, form, setForm, onBack, onContinue, onChangeRide }) {
  const [errors, setErrors] = useState({})
  const [shake, setShake] = useState(0)
  const [emailed, setEmailed] = useState('')
  /* Email me the ride details: needs a valid email; confirms inline. Concept only, nothing is sent. */
  const emailMe = () => {
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setErrors((e) => ({ ...e, email: 'Add your email and we’ll send you the ride details.' }))
      emailRef.current?.focus()
      return
    }
    setEmailed(form.email)
  }
  const nameRef = useRef(null)
  const emailRef = useRef(null)
  const phoneRef = useRef(null)
  const set = (k) => (v) => { setForm((f) => ({ ...f, [k]: v })); if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined })) }
  const extras = EXTRAS[r.id] || []
  const errCount = Object.values(errors).filter(Boolean).length
  const t = totals(r, g, form)

  const submit = (e) => {
    e.preventDefault()
    const er = {}
    if (!form.name.trim()) er.name = 'Add the lead passenger’s name. The driver will look for it.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Add an email so we can send your booking and driver details.'
    if (form.phone.replace(/\D/g, '').length < 7) er.phone = 'Add a mobile number so the driver can call you on arrival.'
    if (!fits(r, g)) er.bags = 'Your luggage doesn’t fit this ride. Remove a bag or choose a bigger ride.'
    setErrors(er)
    if (Object.keys(er).length) { setShake((s) => s + 1); if (er.name || er.email || er.phone) (er.name ? nameRef : er.email ? emailRef : phoneRef).current?.focus()
      else document.getElementById('luggage')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return }
    onContinue()
  }

  return (
    <main className="screen checkout">
      <Top back="rides" onBack={onBack} step={3} title="Travel details" />
      <form noValidate onSubmit={submit}>
        <TripSummary r={r} g={g} onChangeRide={onChangeRide} />
        {errCount > 0 && (
          <div className="error-summary shake" key={shake} role="alert">
            <Icon name="warn" size={18} />
            <div><strong>{errCount > 3 ? 'A few quick things before payment' : errCount > 2 ? 'Three quick things before payment' : errCount > 1 ? 'Two quick things before payment' : 'One quick thing before payment'}</strong>
              <ul>{Object.entries(errors).filter(([, v]) => v).map(([k, v]) => <li key={k}>{v}</li>)}</ul>
            </div>
          </div>
        )}
        <section className="block">
          <h2 className="block-title">Your ride</h2>
          <RideFacts r={r} />
        </section>

        <Luggage r={r} g={g} setGroup={(fn) => { setGroup(fn); setErrors((e) => ({ ...e, bags: undefined })) }} onChangeRide={onChangeRide} error={errors.bags ? shake : 0} />

        <section className="block">
          <h2 className="block-title">Lead passenger</h2>
          <div className="field-stack">
            <Field label="Full name" value={form.name} onChange={set('name')} error={errors.name} autoComplete="name" inputRef={nameRef} />
            <Field label="Email" type="email" value={form.email} onChange={(v) => { set('email')(v); setEmailed('') }} error={errors.email} autoComplete="email" inputRef={emailRef} />
            <Field label="Mobile" type="tel" value={form.phone} onChange={set('phone')} error={errors.phone} autoComplete="tel" prefix="+44" inputRef={phoneRef} />
          </div>
          <p className="help">We send your booking and the driver’s details here, so they can reach you on arrival.</p>
          {emailed ? (
            <p className="emailed swap-in" role="status"><Icon name="check" size={16} stroke={2.4} className="draw" />Ride details sent to {emailed}. Book whenever you’re ready.</p>
          ) : (
            <button type="button" className="btn btn-soft btn-sm email-me" onClick={emailMe}><Icon name="mail" size={16} />Email me the ride details</button>
          )}
        </section>

        <section className="block">
          <h2 className="block-title">Your flight</h2>
          <Field label="Flight number (optional)" value={form.flight} onChange={set('flight')} />
          <p className="inline-note"><Icon name="clock" size={16} />Pickup is set to your landing time, {TRIP.lands}. Up to 60 minutes of waiting after landing is free.</p>
        </section>

        <section className="block">
          <h2 className="block-title">Extras</h2>
          {extras.length ? extras.map((x, i) => (
            <Stepper key={x.name} label={x.name} hint={`${money(x.price)} each`} value={form.extras[i] || 0} max={4}
              onChange={(v) => setForm((f) => ({ ...f, extras: { ...f.extras, [i]: v } }))} />
          )) : <p className="page-sub">This provider doesn’t list extras such as child seats for this ride.</p>}
        </section>

        <section className="block">
          <label className="toggle-row">
            <span>
              <strong>Refund protection · {money(refundOf(r, g))}</strong>
              <span>Optional. Without it, cancelling within 48 hours of pickup isn’t refunded.</span>
            </span>
            <input type="checkbox" className="switch" checked={form.refund} onChange={(e) => set('refund')(e.target.checked)} />
          </label>
        </section>

        <PriceLines r={r} g={g} form={form} />

        <section className="block">
          <h2 className="block-title">Terms and conditions</h2>
          <RideTerms r={r} g={g} withLuggage />
          <p className="help">By continuing you agree to hoppa’s Terms & Conditions for this booking.</p>
        </section>

        <div className="bookbar">
          <button type="submit" className="btn btn-primary btn-block btn-lg">
            <span>Continue to payment</span><span className="bookbar-price tick" key={t.total}>{money(t.total)}</span>
          </button>
        </div>
      </form>
    </main>
  )
}

const METHODS = [
  { id: 'card', label: 'Credit or debit card', hint: 'Visa, Mastercard, Amex', icon: 'card' },
  { id: 'paypal', label: 'PayPal', hint: 'Approve in PayPal', icon: 'lock' },
  { id: 'apple', label: 'Apple Pay', hint: 'Confirm with Face ID or Touch ID', icon: 'lock' },
]

export function Payment({ r, g, form, setForm, onBack, onPay }) {
  const t = totals(r, g, form)
  return (
    <main className="screen checkout">
      <Top back="travel details" onBack={onBack} step={4} title="Payment" />
      <TripSummary r={r} g={g} />
      <section className="block">
        <h2 className="block-title">Pay with</h2>
        <div className="methods" role="radiogroup" aria-label="Payment method">
          {METHODS.map((m) => (
            <label key={m.id} className={`method ${form.method === m.id ? 'is-selected' : ''}`}>
              <span className="method-ic"><Icon name={m.icon} size={18} /></span>
              <span className="method-text"><strong>{m.label}</strong><span>{m.hint}</span></span>
              <input type="radio" name="method" value={m.id} checked={form.method === m.id} onChange={() => setForm((f) => ({ ...f, method: m.id }))} />
              <span className="radio" aria-hidden="true" />
            </label>
          ))}
        </div>
        <p className="inline-note"><Icon name="info" size={16} />This is a concept. Payment details aren’t collected here.</p>
      </section>
      <PriceLines r={r} g={g} form={form} />
      <p className="fine">Free cancellation until 48 hours before pickup. After that, the full fare is charged.</p>
      <div className="bookbar">
        <button type="button" className="btn btn-primary btn-block btn-lg" onClick={onPay}>
          <span className="btn-ic"><Icon name="lock" size={16} />Pay</span><span className="bookbar-price">{money(t.total)}</span>
        </button>
      </div>
    </main>
  )
}

export function Done({ onRestart }) {
  return (
    <main className="screen done">
      <div className="done-card swap-in">
        <span className="done-ic"><Icon name="check" size={30} stroke={2.6} className="draw" /></span>
        <h1 className="page-title">The prototype ends here</h1>
        <p className="page-sub">In the live product, payment is taken here and the booking confirmed. Nothing was booked or charged.</p>
        <button type="button" className="btn btn-primary btn-lg" onClick={onRestart}>Start again</button>
      </div>
    </main>
  )
}
