# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

static HTML/CSS — confirmed by the user for this phase. The demo mockup ships as plain HTML + Tailwind + Chart.js with both libraries vendored locally so it opens by double-click, offline, on a laptop in front of a prospect. The production stack is an explicitly deferred decision, to be taken after the mockup is validated.

## Users

Three distinct audiences, one product:

- **Line Up staff (primary):** a small creative agency team — direction, art direction, video (shooting/editing), community management, sales. They work in the office and on location; the person driving the app all day is the one who has to know what is due, what is stuck waiting on a client, and what publishes tomorrow. They currently have no single place holding all of that.
- **Line Up clients (secondary, high frequency, low expertise):** business owners on subscriptions (e.g. Papi Ours, Kalpy). They connect occasionally, from a phone as often as a desktop, to ask for something, see where their requests stand, approve a quote, approve a creative, and check what got published.
- **Line Up management (occasional):** the same app is where HR lives — leave, expense claims, payslips, client appointments.

## Product Purpose

One system that runs a creative/social-media agency end to end: intake a client request, turn it into a costed job, break it into production sub-tasks, produce the creative, get it validated by the client, then schedule and push it to the client's social networks — and account for the people, time and money that made it happen. Success is that no request, validation or publication is ever tracked outside the app, and that a client can answer "where is my stuff?" without emailing anyone.

## Positioning

Project tools stop at "task done"; scheduling tools start at "post ready". Line Up's system spans the whole line: **request → quote → validation → production sub-tasks → client approval → automated multi-network publication → invoice**, on top of a per-client brand record (logo, colors, typography, tone, past work) that is both the brief for the team and the source material for AI-assisted creative. Subscription cadence is a first-class object: each client's plan defines how many posts per network per month are owed, and the system tracks consumption against it.

## Operating Context

- Work arrives as client requests ("créations"), which become **chantiers** (jobs) moving through states: brief received → quoted → awaiting client validation → validated → in production → revisions → delivered.
- A chantier holds several **sous-tâches** with their own states, drawn from real production vocabulary: shooting ("aller tourner"), rushes ingest/dérushage, editing, art direction, copywriting, export, scheduling.
- Publication happens on Facebook, Instagram and LinkedIn through their APIs; a creative validated in the app is scheduled and pushed automatically. Publication can fail (expired token, API rejection) and that failure is an operational state the team must see.
- Clients hold **subscriptions** with different publication cadences; consumption against the plan drives both production planning and billing.
- Each client has a brand record: logo files, color palette, typography, tone of voice, and a library of past deliverables. Recurring calendar occasions (Mother's Day, seasonal openings) are a normal reason for a creative.
- HR runs in the same app: leave requests and balances, expense claims and reimbursements, client appointments, and payslips held in a private per-employee vault.

## Capabilities and Constraints

- Two front-ends: the Line Up back-office and a client-facing app. Confirmed scope for the mockup: jobs/kanban with sub-tasks, editorial calendar and multi-network publication queue, client records and brand charters, AI creative studio, HR (leave, expenses, payslip vault, appointments), subscriptions and invoicing, social API connection status.
- **The client portal carries Line Up's identity, not the client's** (user decision). No per-client white-labelling.
- French-language interface.
- Mockup constraint: no backend, no auth, no real API calls — all data is authored demo data and must be labelled as such where a viewer could mistake it for real reporting.
- Undecided: production stack, hosting, pricing of the SaaS itself, which social API tiers are actually available to the agency.

## Brand Commitments

- Name and wordmark: **line up.** — "l'agence créative". Registered wordmark; the `up.` is set in a cyan → blue → violet → magenta gradient.
- Assets on hand: `../logo_white.png` (wordmark for dark grounds), `../logo_dark.png`, `../spot_lineup.mp4`, `PLAQUETTE LINE UP.pdf`.
- Existing brand system in code (`../site/src/styles.css`): ground `#05060f`, cyan `#00d8ff`, blue `#2f6bff`, violet `#8b5cff`, magenta `#ff5cf4`; Poppins, light weights; a gradient at ~100°. This is the confirmed identity the SaaS inherits and extends.
- "Line up" is itself a broadcast/production term — a running order. The name is a durable asset, not incidental.

## Evidence on Hand

- Real client logos for the two demo accounts: `clients/papiours.png` (black-and-white bear mark, wordmark PAPI OURS), `clients/KALPY quadri + Baseline.png` (indigo `#2B2255` wordmark, chevron in cyan→pink gradient, baseline "Build. Automate. Elevate.").
- Real Line Up brand assets and the existing coming-soon site.
- **Absent, must not be fabricated as fact:** actual client contracts, prices, subscription tiers, follower counts, revenue, employee names and salaries, real post performance. Everything of this kind in the mockup is authored demonstration data and is labelled as such in the interface.

## Product Principles

1. **One line, end to end.** Every screen exists to move a request one step further down the line, from intake to published post to invoice. Anything that does not advance or reveal that line is out.
2. **State is the product.** Users come to find out where something stands. Status, ownership and deadline must be readable before anything else on any screen.
3. **The client sees the same truth as the team.** The portal is not a summary of the back-office; it is the same objects with the client's permissions.
4. **The brand record is operational, not decorative.** A client's colors, logo and past work are what the team briefs from and what AI generation is grounded in.
5. **Demonstration data is honest.** Synthetic content is authored at full fidelity and labelled; commercial claims are never invented.

## Accessibility & Inclusion

No client-specific standard was established. Baseline: readable contrast on the dark ground (the brand's near-black plus low-weight type is the known risk), full keyboard reachability of the primary flows, and status never carried by color alone — every state also has a label or shape.
