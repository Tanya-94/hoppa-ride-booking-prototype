import { Icon } from './ui.jsx'
import VehicleArt from './VehicleArt.jsx'
import { TRIP, TYPES, fitting, smallestFit, who, plural, priceOf, money } from '../data.js'

export default function Search({ group, onEditGroup, onSearch }) {
  const small = smallestFit(group)
  const f = fitting(group)
  return (
    <main className="screen search">
      <h1 className="hero-title">Where to?</h1>
      <p className="page-sub">Airport transfers, taxis and shuttles at a fixed price.</p>

      <form className="search-form" onSubmit={(e) => { e.preventDefault(); onSearch() }}>
        <div className="route">
          <span className="route-line" aria-hidden="true"><i /><b /><i className="sq" /></span>
          <div className="route-field">
            <label className="sr-only" htmlFor="from">From</label>
            <input id="from" defaultValue={TRIP.from} readOnly />
          </div>
          <div className="route-field">
            <label className="sr-only" htmlFor="to">To</label>
            <input id="to" defaultValue={`${TRIP.to}, ${TRIP.toArea}`} readOnly />
          </div>
        </div>

        <div className="row-2">
          <label className="filled">
            <Icon name="cal" size={18} />
            <span><small>Date</small><input defaultValue={TRIP.date} readOnly /></span>
          </label>
          <label className="filled">
            <Icon name="plane" size={18} />
            <span><small>Flight lands</small><input defaultValue={TRIP.lands} readOnly /></span>
          </label>
        </div>

        <button type="button" className="filled filled-btn" onClick={onEditGroup}>
          <Icon name="user" size={18} />
          <span><small>Who’s travelling</small><strong>{who(group)}</strong></span>
          <Icon name="chev" size={18} className="muted-ic" />
        </button>

        <button type="submit" className="btn btn-primary btn-block btn-lg">Search rides</button>
      </form>

      {small ? (
        <section className="fit-preview" aria-live="polite">
          <div className="fit-preview-art"><VehicleArt ride={small} width={104} className="drive-in" key={small.id} /></div>
          <div className="fit-preview-text">
            <strong>Your group fits a {TYPES[small.type].name.toLowerCase()}</strong>
            <span>{plural(f.length, 'ride', 'rides')} have room for everyone and every bag, from {money(priceOf(f[0], group))}.</span>
          </div>
        </section>
      ) : (
        <section className="fit-preview fit-preview-warn" aria-live="polite">
          <div className="fit-preview-text">
            <strong>No single vehicle fits this group</strong>
            <span>Try fewer bags, or split the group.</span>
          </div>
        </section>
      )}

      <ul className="promises">
        <li><Icon name="shield" size={18} /><span><strong>Free cancellation</strong> until 48 hours before pickup</span></li>
        <li><Icon name="clock" size={18} /><span><strong>60 minutes free waiting</strong> after your flight lands</span></li>
        <li><Icon name="lock" size={18} /><span><strong>Fixed fares</strong>, no hidden costs</span></li>
      </ul>
    </main>
  )
}
