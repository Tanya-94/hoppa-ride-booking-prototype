import { useEffect, useRef } from 'react'

const PATHS = {
  back: 'M15 18l-6-6 6-6',
  chev: 'M9 6l6 6-6 6',
  down: 'M6 9l6 6 6-6',
  x: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0',
  bag: 'M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M6 7h12a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2zM9 7v13M15 7v13',
  clock: 'M12 7v5l3 2M12 21a9 9 0 100-18 9 9 0 000 18z',
  route: 'M6 19a2 2 0 100-4 2 2 0 000 4zM18 9a2 2 0 100-4 2 2 0 000 4zM6 15V9a3 3 0 013-3h3M18 9v6a3 3 0 01-3 3h-3',
  shield: 'M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z',
  plane: 'M10.5 21l1.5-1v-5l8 3v-2l-8-5V5.5a1.5 1.5 0 00-3 0V11l-8 5v2l8-3v5l1.5 1z',
  pin: 'M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21zm0-9a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  cal: 'M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z',
  info: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v5M12 8h.01',
  warn: 'M12 4l9 16H3l9-16zM12 10v4M12 17h.01',
  edit: 'M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4',
  seat: 'M7 4v9a2 2 0 002 2h7M7 15l-1 5M16 15l2 5M10 11h6',
  card: 'M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM3 10h18M7 15h3',
  lock: 'M7 11V8a5 5 0 0110 0v3M6 11h12a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1v-8a1 1 0 011-1z',
  swap: 'M7 4v16M7 4L4 7M7 4l3 3M17 20V4M17 20l-3-3M17 20l3-3',
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6',
  mail: 'M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1zM3.5 7l8.5 6 8.5-6',
  cube: 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM12 12l8-4.5M12 12v9M12 12L4 7.5',
}

export function Icon({ name, size = 18, className = '', stroke = 1.8 }) {
  return (
    <svg className={`ic ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}

export function Stepper({ label, hint, value, min = 0, max = 20, onChange }) {
  return (
    <div className="stepper">
      <div className="stepper-text">
        <span className="stepper-label">{label}</span>
        {hint && <span className="stepper-hint">{hint}</span>}
      </div>
      <div className="stepper-ctl">
        <button type="button" className="round" disabled={value <= min} onClick={() => onChange(value - 1)} aria-label={`Fewer ${label.toLowerCase()}`}>−</button>
        <span className="stepper-val" aria-live="polite">{value}</span>
        <button type="button" className="round" disabled={value >= max} onClick={() => onChange(value + 1)} aria-label={`More ${label.toLowerCase()}`}>+</button>
      </div>
    </div>
  )
}

/* Bottom sheet on phones, side drawer on desktop (handled in CSS). Escape and the scrim close it. */
export function Sheet({ open, onClose, title, children, footer, wide }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const t = setTimeout(() => ref.current?.querySelector('button, input')?.focus(), 60)
    return () => { window.removeEventListener('keydown', onKey); clearTimeout(t) }
  }, [open, onClose])
  return (
    <div className={`sheet-wrap ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="scrim" onClick={onClose} />
      <section ref={ref} className={`sheet ${wide ? 'sheet-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <span className="grab" aria-hidden="true" />
        <header className="sheet-head">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        </header>
        <div className="sheet-body">{open && children}</div>
        {footer && <footer className="sheet-foot">{footer}</footer>}
      </section>
    </div>
  )
}

export function Pill({ tone = 'neutral', icon, children }) {
  return <span className={`pill pill-${tone}`}>{icon && <Icon name={icon} size={14} />}{children}</span>
}

export function Fact({ icon, children, warn }) {
  return <li className={`fact ${warn ? 'fact-warn' : ''}`}><Icon name={icon} size={16} /><span>{children}</span></li>
}
