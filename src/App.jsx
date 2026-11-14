import { useEffect, useState, useCallback, useRef } from 'react'
import Search from './components/Search.jsx'
import Results from './components/Results.jsx'
import WhoSheet from './components/WhoSheet.jsx'
import { Details, Payment, Done } from './components/Checkout.jsx'
import { RIDES, fits, fitting, picks } from './data.js'

/* Brand tokens. Everything visual reads from these, so a partner's brand drops in (white-label). */
const THEMES = {
  hoppa: {
    name: 'hoppa', wordmark: ['hopp', 'a'],
    css: { '--brand': '#3F8A45', '--brand-strong': '#2F6E35', '--brand-soft': '#EDF5EC', '--offer': '#E8701F', '--font': '"Open Sans", system-ui, sans-serif' },
  },
  partner: {
    name: 'Partner app', wordmark: ['partner', '.'],
    css: { '--brand': '#4B4FD8', '--brand-strong': '#3A3DB8', '--brand-soft': '#EEEFFD', '--offer': '#D9480F', '--font': '"DM Sans", system-ui, sans-serif' },
  },
}

const START_GROUP = { adults: 1, youths: 0, seniors: 0, bags: 2, special: [] }
const START_FORM = { name: '', email: '', phone: '', flight: '', refund: false, extras: {}, method: 'card' }

export default function App() {
  const [themeKey, setThemeKey] = useState('hoppa')
  const theme = THEMES[themeKey]
  const [step, setStep] = useState('search')
  const [group, setGroup] = useState(START_GROUP)
  const [who, setWho] = useState(false)
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState(null)
  const [selected, setSelected] = useState(() => fitting(START_GROUP)[0]?.id ?? 0)
  const [form, setForm] = useState(START_FORM)

  useEffect(() => {
    const root = document.documentElement
    Object.entries(theme.css).forEach(([k, v]) => root.style.setProperty(k, v))
  }, [theme])

  const scroller = useRef(null)
  useEffect(() => { scroller.current?.scrollTo({ top: 0 }) }, [step, view])

  // Keep the selection valid when the group changes: if the chosen ride no longer fits, move to the best fit.
  const applyGroup = useCallback((g) => {
    setGroup(g)
    setWho(false)
    const cur = RIDES[selected]
    if (!cur || !fits(cur, g)) setSelected(picks(g)[0]?.ride.id ?? selected)
    if (step === 'search') runSearch()
  }, [selected, step]) // eslint-disable-line react-hooks/exhaustive-deps

  const runSearch = () => {
    setStep('results'); setView(null); setLoading(true)
    setTimeout(() => setLoading(false), 1300)
  }

  const r = RIDES[selected]
  const restart = () => { setStep('search'); setGroup(START_GROUP); setForm(START_FORM); setView(null); setSelected(fitting(START_GROUP)[0].id) }

  return (
    <div className="stage">
    <div className="device">
    <div className="scroller" ref={scroller}>
      {(step === 'search' || step === 'done') && <header className="appbar">
        <button type="button" className="wordmark" onClick={() => step !== 'done' && setStep('search')} aria-label={`${theme.name} home`}>
          {theme.wordmark[0]}<b>{theme.wordmark[1]}</b>
        </button>
        <span className="concept-tag">Concept</span>
      </header>}

      <div className="screen-wrap" key={step}>
        {step === 'search' && <Search group={group} onEditGroup={() => setWho(true)} onSearch={runSearch} />}
        {step === 'results' && (
          <Results group={group} loading={loading} selected={selected} onSelect={setSelected} view={view} setView={setView}
            onEdit={() => setWho(true)} onBack={() => setStep('search')}
            onBook={() => setStep('details')} />
        )}
        {step === 'details' && r && (
          <Details r={r} g={group} form={form} setForm={setForm} onBack={() => setStep('results')}
            onChangeRide={() => setStep('results')} onContinue={() => setStep('pay')} />
        )}
        {step === 'pay' && r && <Payment r={r} g={group} form={form} setForm={setForm} onBack={() => setStep('details')} onPay={() => setStep('done')} />}
        {step === 'done' && <Done onRestart={restart} />}
      </div>


      <footer className="foot">
        <p>Concept prototype for a design exercise. Not affiliated with or used by hoppa or Elife. Rides and prices from a live hoppa.com search (ALC → Meliá Benidorm, 4 Dec 2026). No bookings or payments are made.</p>
        <div className="theme-switch" role="group" aria-label="Brand theme">
          <span>White-label preview</span>
          {Object.entries(THEMES).map(([k, t]) => (
            <button key={k} type="button" className={k === themeKey ? 'is-on' : ''} aria-pressed={k === themeKey} onClick={() => setThemeKey(k)}>{t.name}</button>
          ))}
        </div>
      </footer>
      </div>

      <WhoSheet open={who} group={group} onClose={() => setWho(false)} onApply={applyGroup} cta={step === 'search' ? 'Search' : 'Show'} />

    </div>
    </div>
  )
}
