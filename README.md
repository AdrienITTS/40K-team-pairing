# 40k Team Pairing

A companion web app for **Warhammer 40,000 Teams Events**. It generates fair
pairings between team members, walks a round through the official mission
sequence, and tallies VP / BP / TP scoring per the Teams Event rules — plus
reference views for the faction roster, the Force Disposition cards, and the
Primary and Secondary Mission decks.

Built with Vue 3 + TypeScript + Vite.

## Features

- **Pairing** (`/pairing`) — set up two teams (3–8 players), then run the
  blind-pairing modules (Initial Skirmish / Main Engagement / Champion System)
  round by round, with a handoff gate between the two captains' secret picks.
- **How it works** (`/how-it-works`) — a walkthrough of the round and scoring
  sequence.
- **Factions** (`/factions`) — the 27 codices grouped by allegiance, with a
  detail modal per faction.
- **Force Dispositions** (`/dispositions`) — the five disposition cards and the
  opponent → Primary Mission table each one resolves to.
- **Primary Missions** (`/primaries`) — the deck of Primary Missions, indexed by
  the disposition pairing that selects each one.
- **Secondary Missions** (`/secondaries`) — the full deck, viewable as the
  printed card image or as structured text, with keyboard-navigable browsing.
- **Deployment Layouts** (`/layouts`) — a 3-step picker (your Disposition, your
  opponent's, then the maps) that shows the three A/B/C terrain layouts for that
  pairing, with a measurements toggle and a click-to-zoom lightbox.

The domain logic (pairing modules, the VP→BP conversion table, win/draw
thresholds, and Team Point scoring) follows `GAME.MD`, the bundled Teams Event
rulebook, which is the source of truth for all rules values.

## Design system

`DESIGN.md` is the styling source of truth — a warm cream/coral editorial
system with a user-toggleable dark theme (persisted in `localStorage`, no
`prefers-color-scheme` auto-detection). All colors resolve through `--color-*`
custom properties defined in `src/assets/base.css`; components never hardcode
color literals. Read `DESIGN.md` before building or restyling UI.

## Setup

Requires Node `^22.18.0 || >=24.12.0`.

```sh
npm install
```

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server. |
| `npm run build` | Type-check and produce a production build. |
| `npm run preview` | Preview the production build. |
| `npm run type-check` | Type-check only (`vue-tsc --build`). |
| `npm run lint` | Run `oxlint --fix`, then `eslint --fix --cache`. |
| `npm run format` | Prettier `--write` on `src/`. |
| `npm run test:unit` | Run Vitest unit tests. |
| `npm run test:e2e` | Run Playwright e2e tests. |

Run `npm run lint` and `npm run test:unit` after any source change; add
`npm run type-check` if you touched `.vue`/`.ts` files.

### End-to-end tests

The first run needs the Playwright browsers, and CI must build first:

```sh
npx playwright install   # once
npm run build            # required on CI before e2e
npm run test:e2e
npm run test:e2e -- --project=chromium   # Chromium only
npm run test:e2e -- --debug              # debug mode
```

## Project structure

- `src/views/` — routed pages: `HomeView`, `HowItWorksView`, `PairingView`,
  `FactionsView`, `DispositionsView`, `PrimariesView`, `SecondariesView`,
  `LayoutsView`.
- `src/components/` — `AppFooter`, `CodeWindowCard`, `FactionModal`,
  `DispositionIcon`, `PrimaryMissionCard`, `SecondaryMissionCard`, and the
  `pairing/` module.
- `src/composables/` — `useTheme`, `usePairingSession`.
- `src/data/` — `factions.ts`, `pairing.ts`, `dispositions.ts`, `primaries.ts`
  (+ `primaries.content.ts`), `secondaries.ts`, `layouts.ts`.
- `public/images/` — app art, faction logos, the disposition / primary /
  secondary card art, and the deployment-layout maps (all served from the root).

State is kept local to components and composables — there is no Pinia/global
store — so `main.ts` registers only Vue Router.

Reference docs at the repo root: `DESIGN.md` (styling), `GAME.MD` (rules), and
`AGENTS.md` (guidance for AI coding agents).

## Recommended IDE setup

[VS Code](https://code.visualstudio.com/) +
[Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
(disable Vetur). TypeScript type-checking for `.vue` files uses `vue-tsc`
instead of `tsc`.
