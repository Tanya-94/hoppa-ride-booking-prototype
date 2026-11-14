# proto v2: ride selection redesign (React, mobile)

Copy of proto v1 with: one vehicle image per ride type, and ride details plus terms on Travel details. (A map was tried and removed; parked for later.)

Mobile-first concept prototype for the hoppa ride-selection redesign, search to payment. On a phone it fills the screen; on a laptop it shows inside a phone frame. Rides, prices and capacities are the 35 real results from a live hoppa.com search (ALC → Meliá Benidorm, 4 Dec 2026, captured 13 Nov 2026).

## Run

```
npm install
npm run dev      # http://localhost:5184
npm run build    # static build in dist/
```

## What's in it

- **Search**: route, date, flight time, and "Who's travelling" with suitcases and bigger items. A live preview says which vehicle size the group fits.
- **Results**: best fit first (Best value / More room / Premium), then ride types with counts and from-prices. Inside a type, one row per size: the cheapest offer leads and same-size offers fold behind it, so no vehicle appears twice. Types that don't fit stay visible with the reason and the nearest ride that does.
- **Ride details**: capacity in words, journey, waiting and cancellation terms up front.
- **Travel details**: lead passenger, flight, extras only where seen live, refund protection off by default, inline error state.
- **Payment**: method choice only; no payment details collected. The prototype ends there.
- **White-label**: the footer switch swaps brand tokens (colour, font, radius, and the vehicles' brand stripe).

## What's new in v2

- **Travel details** now repeats the ride facts (route, waiting, cancellation) and the key terms (price, cancelling, late flights, luggage), so the traveller rereads the promises right before paying.
- **One image per ride type**: inside a type, the vehicle sits once in the header; rows are compact with a radio. Where a type has classes (Standard, Executive, Luxury), each class heading carries its own small image.
- **Email me the ride details** on Travel details only: needs a valid email, then confirms inline. Concept only; nothing is sent.

## Design rules

- Visual language after Uber, Airbnb and Wise: white canvas, grey filled inputs, one row style for every list, selection shown as a 2px ink outline, hoppa's Open Sans and radius (4px controls, 8px cards). Brand colour only on the main action and small accents.

- Vehicles are flat vector illustrations in a three-quarter view (ride-hailing style): neutral paint shows the class (silver standard, graphite executive, black luxury); all decisions live in the text and labels.
- Micro-animations only mark a change: a count or price updating, content swapping, a list arriving, an error, a confirmation. All turn off with reduced motion.
- Assumptions: suitcase capacity = hoppa's luggage "Max."; shuttles priced per seat with one suitcase each; refund protection ≈ 11% of the ride.

## Files

- `src/data.js`: ride data, fit logic, grouping
- `src/App.jsx`: flow state and brand themes
- `src/components/`: screens and UI parts
- `src/components/RideInfo.jsx`: ride facts and terms, shared by the ride sheet and Travel details
- `src/components/VehicleArt.jsx`: vector vehicles (side profiles extruded at one angle)
- `src/styles.css`: tokens, layout, animations
