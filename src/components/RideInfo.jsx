/* Ride facts and key terms, shared by the ride details sheet and the Travel details page,
   so the traveller reads the same promises at selection and right before paying.
   Wording comes from hoppa's "More Info" sheet and Terms & Conditions. */
import { Icon } from './ui.jsx'
import { facts, money, pax, plural, bagsCap } from '../data.js'

export function RideFacts({ r, large }) {
  return (
    <ul className={`facts ${large ? 'facts-lg' : ''}`}>
      {facts(r).map((f, i) => <li key={i} className={f.warn ? 'is-warn' : ''}><Icon name={f.icon} size={large ? 18 : 16} />{f.text}</li>)}
    </ul>
  )
}

export function RideTerms({ r, g, withLuggage }) {
  return (
    <dl className="terms">
      <div><dt>Price</dt><dd>{r.type === 'shared' ? `${money(r.price)} per seat × ${pax(g)}` : 'For the whole vehicle, not per person'}. Fixed fare.</dd></div>
      <div><dt>Cancelling</dt><dd>Free until 48 hours before pickup. After that the full fare is charged.</dd></div>
      <div><dt>If your flight is late</dt><dd>Pickup is set to your landing time, and up to 60 minutes of waiting after landing is free.</dd></div>
      {withLuggage && (
        <div><dt>Luggage</dt><dd>This ride takes up to {plural(bagsCap(r, g), 'suitcase', 'suitcases')}. hoppa’s terms ask you to choose a vehicle that fits your party and bags.</dd></div>
      )}
    </dl>
  )
}
