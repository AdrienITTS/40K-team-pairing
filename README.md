# 40k Team Pairing

A companion web app for **Warhammer 40,000 Teams Events**. It generates fair
pairings between team members, walks a round through the official mission
sequence, and tallies VP / BP / TP scoring per the Teams Event rules — plus
reference views for the faction roster and the full Secondary Mission deck.

Built with Vue 3 + TypeScript + Vite.

## Features

- **Pairing** (`/pairing`) — set up two teams (3–8 players), then run the
  blind-pairing modules (Initial Skirmish / Main Engagement / Champion System)
  round by round, with a handoff gate between the two captains' secret picks.
- **How it works** (`/how-it-works`) — a walkthrough of the round and scoring
  sequence.
- **Factions** (`/factions`) — the 27 codices grouped by allegiance, with a
  detail modal per faction.
- **Secondary Missions** (`/secondaries`) — the full deck, viewable as the
  printed card image or as structured text, with keyboard-navigable browsing.

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
  `FactionsView`, `SecondariesView`.
- `src/components/` — `AppFooter`, `CodeWindowCard`, `FactionModal`,
  `SecondaryMissionCard`, and the `pairing/` module.
- `src/composables/` — `useTheme`, `usePairingSession`.
- `src/data/` — `factions.ts`, `pairing.ts`, `secondaries.ts`.
- `public/images/` — app art and faction logos (served from the root).

Reference docs at the repo root: `DESIGN.md` (styling), `GAME.MD` (rules), and
`AGENTS.md` (guidance for AI coding agents).

## Recommended IDE setup

[VS Code](https://code.visualstudio.com/) +
[Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
(disable Vetur). TypeScript type-checking for `.vue` files uses `vue-tsc`
instead of `tsc`.
