# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React 19 + Tailwind CSS v4 SPA (front-end), Hono REST API + Prisma/PostgreSQL (back-end), pnpm monorepo with a shared Zod schema package.

## Users

Fictitious mid-luxury leisure traveler looking for a boutique hotel stay in Basel. The visitor arrives on the site, searches for available rooms by dates and number of guests, picks a room, fills in guest details, and confirms the booking. No real user base — the site exists solely as a demo target for the MCP creator.

## Product Purpose

Hotel Rheinblick is a fictitious boutique hotel booking website. It exists to demonstrate the MCP creator product: an AI agent should be able to search rooms and book a stay on this site through a generated MCP, live, during a pitch. Success means the end-to-end flow (search → select → book → confirm) works both for a human visitor and for an AI agent consuming the generated MCP.

## Positioning

A small, intimate boutique hotel (10 rooms and suites) with a prime location right on the Rhine, in the heart of Basel's old town. Not a chain — personal, quiet, with views of the river and the old town.

## Operating Context

- **Hackathon deliverable** (2 days, 6 people): favour a working demo over completeness.
- **Pitch + live demo**: the site must be visually credible and the booking flow must work end-to-end.
- **Fictitious data only**: no real payment, no real personal data. The site says so explicitly.
- **Human confirmation before any irreversible action**: the booking flow requires an explicit "Confirm booking" step.

## Capabilities and Constraints

### Implemented
- Room search by check-in / check-out / number of adults.
- Room detail page with image, description, capacity, price.
- Booking flow: guest details → pending booking (15-minute hold) → explicit confirmation.
- Booking reference generated on confirmation.
- 10 seeded rooms across Single, Double, Twin, Family, and Suite types (CHF 120–450/night).

### Constraints
- No authentication, no user accounts.
- No real payment processing.
- PostgreSQL required (Docker Compose provided).
- Room images are placeholder (picsum.photos).

### Undecided
- Final project name (currently "TBD" in AGENTS.md header).

## Brand Commitments

- **Name**: Hotel Rheinblick
- **Address**: Rheinsprung 1, 4051 Basel (fictitious)
- **Colors**: cream (#f7f2e8) background, forest green (#1f3d2e) text and accents
- **Typography**: Georgia serif for headings and brand name
- **Tone**: clean, modern, understated mid-luxury — explicitly not "AI-generated looking"
- **Currency**: CHF (Swiss Francs)

## Evidence on Hand

- Working SPA with 5 routes: home, rooms list, room detail, booking form, confirmation.
- Working REST API with room search and booking endpoints.
- 10 fictitious rooms with descriptions and pricing.
- No logo, no photography — placeholder images only. Future work must not fabricate testimonials, reviews, or awards.

## Product Principles

1. **Demo-first**: every decision serves the live demo; polish only what the audience sees.
2. **Credibly real**: the site should look and feel like a real boutique hotel website, not a prototype.
3. **Safe by design**: human confirmation before irreversible actions; fictitious data only; never automate third-party sites.
4. **Clean over clever**: modern, restrained design — no gratuitous effects, no "AI slop."
5. **End-to-end over feature-complete**: a working search-to-confirmation flow matters more than extra features.
