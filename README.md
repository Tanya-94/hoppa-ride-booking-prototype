# Ride booking prototype

**Live demo:** https://tanya-94.github.io/ride-booking-prototype/

> This is a prototype for demonstration purposes only. It is not a real booking service: nothing is booked, charged or sent.

## How to use

Open the live demo on a phone (on a laptop it shows inside a phone frame), then:

1. Edit **Who's travelling** to set passengers and suitcases, then **Search rides**.
2. Pick a recommended ride, or open a ride type to see every option.
3. Tap **Book** to go to Travel details. Tap **Continue** with empty fields to see the error state.
4. Choose a payment method. The prototype ends before payment.

## Features

- Search with passengers, suitcases and bigger items
- Live count of rides that fit
- Loading state
- Recommended rides: best value, more room, premium
- Ride types with one row per size and other offers folded away
- Rides that don't fit stay visible with the reason
- No vehicle fits empty state
- Travel details with ride facts, terms and price breakdown with discount
- Form validation and error states
- Email me the ride details
- Optional refund protection
- Payment method choice
- White-label theme switch (footer)

## Run locally

```
npm install
npm run dev
```

Build with `npm run build`. Every push to `main` deploys to GitHub Pages.
