# AGENTS.md

## Project overview
A Warhammer 40,000 Teams Event companion app (Vue 3 + TypeScript + Vite, `create-vue` scaffold): generates fair pairings between team members, walks through the mission sequence, tallies VP/BP/TP scoring per the official Teams Event rules, and provides reference views for the faction roster and the full Secondary Mission deck. Domain logic and UI are built out: `src/views/` (`HomeView`, `HowItWorksView`, `PairingView`, `FactionsView`, `SecondariesView`), `src/components/` (`AppFooter`, `CodeWindowCard`, `FactionModal`, `SecondaryMissionCard` — one secondary's rules text, rendered by `SecondariesView` both on screen and in an off-screen stack that measures the tallest card; the `icons/` set repurposed by `HomeView`'s feature cards; and the `pairing/` module — `HandoffGate`, `MatchupCard`, `PairingBoard`, `PairingRunner`, `PairingSetup`, `RoleIcon`), `src/composables/` (`useTheme`, `usePairingSession`), and `src/data/` (`factions.ts`, `pairing.ts`, `secondaries.ts`). `src/stores/counter.ts` is an unused scaffold leftover from `create-vue`, not part of the app.

## Vue reference
When working with Vue 3 APIs, SFC conventions, or Vue Router/Pinia usage and you're unsure of current best practice or an API's exact shape, consult https://vuejs.org/llms.txt (the official LLM-oriented documentation index) rather than relying on possibly-stale training knowledge.

## Design system
`DESIGN.md` at the repo root is the styling source of truth for this app's UI — a warm cream/coral editorial system (colors, typography, spacing, radii, components, do's/don'ts), adapted from an Anthropic-brand reference design. Read it before building new components. Key points:
- Light theme by default, with a user-toggleable dark theme (`theme-toggle` in the header). The choice persists in `localStorage`; there is no `prefers-color-scheme` auto-detection — new visitors always start light. Implemented via `data-theme` on `<html>`, the `useTheme` composable, and light/dark blocks in `src/assets/base.css`.
- Light theme maps directly to `DESIGN.md`'s cream/coral palette (`canvas` #faf9f5 → `surface-soft` → `surface-card` → `surface-strong`). Dark theme is a warm dark-navy inverse built from the same system's `surface-dark` family, re-purposed as a full theme rather than just card islands. A separate `surface-dark` token group (footer, code-window card, hero art) is theme-invariant — it stays dark in both themes, and coincides with the dark theme's own canvas by design. The handoff gate (whose secret-selection cover was removed in favour of a plain team-selecting banner) is now a theme-aware `surface-card`, not part of the theme-invariant group, so it no longer reads as a near-black block on the cream pairing page.
- `colors.primary` (coral, `#cc785c`) is the *only* primary CTA color and stays coral in **both** themes — unlike a neutral primary, it already reads at full contrast against both the cream canvas and the dark canvas, so it never needs to invert. No drop shadows anywhere — elevation comes from the surface ladder; every card carries a hairline 1px border (`colors.hairline`).
- Typography pairs a serif display face (`Cormorant Garamond` — the documented open-source substitute for Anthropic's proprietary Copernicus/Tiempos Headline, weight 500 with negative letter-spacing) for headlines with Inter for body/UI text; `font-feature-settings: "calt","kern","liga","ss03"` stays enabled site-wide on the Inter body font, unaffected by theme.
- Radius scale runs 4–16px (`rounded.xs` → `rounded.xl`), plus `rounded.full` for pills.
- Never hardcode a hex/rgba color literal in a component — every color resolves through a `--color-*` custom property (with light + dark values, or a theme-invariant one) defined in `base.css` and documented in `DESIGN.md`.
- Reference tokens directly (`{colors.*}`, `{typography.*}`, `{component.*}`) per `DESIGN.md`'s own Iteration Guide — check whether an existing token/component fits before inventing a new one.

## Domain rules (game logic)
`GAME.MD` at the repo root is the Warhammer 40,000 Teams Event Companion rulebook and is the source of truth for all pairing/scoring logic. Load-bearing mechanics:
- **Team composition:** only one player per team may use a given faction keyword; Force Disposition selections are capped at one per 5 players (rounding up) per team.
- **Pairing modules by team size** (3–8 players) — each round combines Initial Skirmish / Main Engagement / Champion System depending on team size; each module resolves via secret-select → reveal → secret-counter-select → reveal (blind blind-pairing, not simple seeding).
- **Scoring:** VP caps at 45 (Primary) + 45 (Secondary) + 10 (Battle Ready) = 100 max; VP differential maps to Battle Points via an 11-band lookup table (0–5 through 51+, symmetric so both players' BP sum to 20); a team's total BP must exceed the opponent's by a team-size-dependent threshold (4/6/6/8/10/12 BP for 3/4/5/6/7/8-player teams) to count as a win rather than a draw; match winner scores 3 Team Points, loser 1TP, draw is 2TP each.
- **Tournament pairing/ranking:** round pairing priority is Team Points → cumulative individual wins → random; end-of-event ranking priority is record → cumulative individual wins → cumulative BP.
- These are exact rules values — pull literal numbers from `GAME.MD` when implementing scoring/pairing logic rather than re-deriving them.

## Assets
`public/images/` holds the app's static art:
- `logo.png` — app logo. `home.png` / `error.png` — default imagery for the home and error states.
- `public/images/factions/*.png` — 27 faction logos, one per codex, filenamed as the `snake_case` faction key: `adepta_sororitas`, `adeptus_custodes`, `adeptus_mechanicus`, `aeldari`, `astra_militarum`, `black_templars`, `blood_angels`, `chaos_daemons`, `chaos_knights`, `chaos_space_marines`, `dark_angels`, `death_guard`, `deathwatch`, `drukhari`, `emperors_children`, `genestealer_cults`, `grey_knights`, `imperial_knights`, `leagues_of_votann`, `necrons`, `orks`, `space_marines`, `space_wolves`, `tau`, `thousand_sons`, `tyranids`, `world_eaters`.
- These live under `public/`, so Vite serves them at the root — reference them at runtime as `/images/factions/<key>.png`, not via `src` imports.
- If a new faction/codex is added later, keep the same `snake_case` naming convention so any faction-picker UI can resolve the logo path programmatically from the faction key.

## Setup
```sh
npm install
```
Node: `^22.18.0 || >=24.12.0` (see `engines` in `package.json`).

## Commands
- `npm run dev` — start the Vite dev server.
- `npm run build` — type-check (`vue-tsc --build`) and production-build in parallel.
- `npm run preview` — preview the production build.
- `npm run type-check` — type-check only.
- `npm run lint` — run `oxlint --fix` then `eslint --fix --cache`. Run this after any source change.
- `npm run format` — Prettier `--write` on `src/`.
- `npm run test:unit` — Vitest unit tests. Run this after any source change.
- `npm run test:e2e` — Playwright e2e tests. First run requires `npx playwright install`; in CI, build the app first (`npm run build`) before running e2e.

## Code style
- TypeScript throughout; Vue components use `<script setup>` SFC style (match existing components).
- Formatting/linting is enforced via Prettier (`.prettierrc.json`), ESLint flat config (`eslint.config.ts`), oxlint (`.oxlintrc.json`), and `.editorconfig`. Don't hand-format — run `npm run lint` / `npm run format` instead.

## Testing conventions
- Unit tests (Vitest) live colocated under `__tests__/` next to the code they cover, e.g. `src/components/__tests__/`.
- E2E tests (Playwright) live under `e2e/`.

## Notes for agents
- Before considering a change done, run `npm run lint` and `npm run test:unit`; run `npm run type-check` if you touched `.vue` or `.ts` files.
- See the Design system section above before styling anything, and the Domain rules section before implementing pairing or scoring logic.
