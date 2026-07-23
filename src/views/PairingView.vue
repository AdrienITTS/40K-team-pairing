<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import PairingSetup, { type SetupStep } from '../components/pairing/PairingSetup.vue'
import PairingRunner from '../components/pairing/PairingRunner.vue'
import PairingBoard from '../components/pairing/PairingBoard.vue'
import MatchupCard from '../components/pairing/MatchupCard.vue'
import LayoutLightbox from '../components/pairing/LayoutLightbox.vue'
import EstimateDrawer from '../components/pairing/EstimateDrawer.vue'
import RoundProjection from '../components/pairing/RoundProjection.vue'
import { usePairingSession } from '../composables/usePairingSession'
import { layoutForRound, type LayoutLetter } from '../data/pairing'
import { estimateCount, projectRound, type ProjectedTable } from '../data/estimates'
import { serializePairingConfig } from '../data/pairingText'
import type { DispositionKey } from '../data/dispositions'

const session = usePairingSession()

// The layout map open in the shared lightbox (live board + results share one).
const layoutRequest = ref<{
  a: DispositionKey
  b: DispositionKey
  letter: LayoutLetter
  fixed: boolean
} | null>(null)

// Which step of the setup wizard is showing. Past the mode chooser every step is
// a picker, and the intro copy steps aside so the picker gets full focus.
const setupStep = ref<SetupStep>('mode')

// The estimates rail is opt-in: it holds one team's private prep work, and the
// device is passed between captains, so it stays shut until asked for.
const estimatesOpen = ref(false)

const state = computed(() => session.state.value)
// Top-level ref so the template auto-unwraps it for the "Previous choice" link.
const canUndo = session.canUndo

// Whether this round was set up with any estimates at all — no estimates, no rail.
const hasEstimates = computed(() => estimateCount(state.value?.config.estimates) > 0)

// One projected table per match-up, keyed by id, so each MatchupCard can carry
// its own grade/BP inline (the same projection the summary card totals).
const projectionByMatchup = computed<Record<string, ProjectedTable>>(() => {
  const s = state.value
  if (!s || !hasEstimates.value) return {}
  const { tables } = projectRound(
    s.matchups,
    s.config.estimateSide ?? 'A',
    s.config.estimates,
    {},
    s.config.teamA.players.length,
  )
  return Object.fromEntries(tables.map((t) => [t.matchup.id, t]))
})

// PairingSetup unmounts once a round starts; when it reappears (e.g. after
// "Change rosters") send the wizard back to step 1 so it doesn't resume mid-flow.
watch(state, (s) => {
  if (!s) setupStep.value = 'mode'
})

// A fresh pairing starts with the estimates rail shut again.
function resetEstimateUi() {
  estimatesOpen.value = false
}

function startRound(config: Parameters<typeof session.start>[0]) {
  resetEstimateUi()
  session.start(config)
}

function restartRound() {
  resetEstimateUi()
  session.restart()
}

function changeRosters() {
  resetEstimateUi()
  session.reset()
}
const isComplete = computed(() => state.value?.phase.kind === 'complete')
const teamSize = computed(() => state.value?.config.teamA.players.length ?? 0)
const decided = computed(() => state.value?.matchups.length ?? 0)

// The rail only exists while the round is running (see the EstimateDrawer's own
// `v-if`), so the page gutter it reserves has to be gated on exactly the same
// condition — otherwise a rail left open when the last table resolves keeps its
// 440px reserved on the results page, with nothing in it, and the whole page
// reads as shifted left of centre.
const railOpen = computed(
  () => estimatesOpen.value && Boolean(state.value) && !isComplete.value && hasEstimates.value,
)

function onLayout(matchupId: string, value: LayoutLetter) {
  session.layout(matchupId, value)
}

// The other half of Quick pairing: a round set up here can be copied back out as
// the same text the paste step reads, so next week's round starts from this one.
const copyState = ref<'idle' | 'copied' | 'failed'>('idle')

async function copySetup() {
  if (!state.value) return
  try {
    await navigator.clipboard.writeText(serializePairingConfig(state.value.config))
    copyState.value = 'copied'
  } catch {
    copyState.value = 'failed'
  }
  setTimeout(() => (copyState.value = 'idle'), 2400)
}
</script>

<template>
  <main
    class="pairing"
    :class="{
      'rail-open': railOpen,
      running: Boolean(state),
      'viewport-locked': state && !isComplete,
    }"
  >
    <section class="hero">
      <p class="badge-pill">Warhammer 40,000 · Teams Event</p>
      <h1>Pairing tool</h1>
      <p v-if="!state && setupStep === 'mode'" class="lede">
        Run a round's pairings on one shared device. Each captain makes their selections in turn,
        revealed simultaneously — exactly as the Initial Skirmish, Main Engagement, and Champion
        System modules require.
      </p>
    </section>

    <div class="pairing-body">
      <!-- 1 · Setup -->
      <section v-if="!state" class="panel">
        <h2 v-if="setupStep === 'mode'" class="panel-title">Set up the round</h2>
        <PairingSetup v-model:step="setupStep" @start="startRound" />
      </section>

      <!-- 2 · Running the modules -->
      <template v-else-if="!isComplete">
        <div class="progress">
          <div class="progress-bar">
            <span class="progress-fill" :style="{ width: `${(decided / teamSize) * 100}%` }" />
          </div>
          <span class="progress-text">{{ decided }} / {{ teamSize }} tables set</span>
          <button
            v-if="hasEstimates"
            type="button"
            class="estimates-toggle"
            :class="{ active: estimatesOpen }"
            :aria-pressed="estimatesOpen"
            @click="estimatesOpen = !estimatesOpen"
          >
            {{ estimatesOpen ? 'Hide' : 'Show' }} estimates
          </button>
          <button type="button" class="text-link reset" :disabled="!canUndo" @click="session.back">
            ← Previous choice
          </button>
        </div>

        <div class="live">
          <PairingBoard :state="state" @layout="onLayout" @view-layout="layoutRequest = $event" />

          <section class="panel">
            <PairingRunner
              :state="state"
              @defender="session.defender"
              @attackers="session.attackers"
              @counter="session.counter"
              @next="session.next"
            />
          </section>
        </div>
      </template>

      <!-- 3 · Results -->
      <template v-else>
        <div class="results-head">
          <div>
            <h2 class="panel-title">Round {{ state.config.round }} pairings</h2>
            <p class="results-sub">
              <span class="team-key team-a">{{ state.config.teamA.name }}</span> vs
              <span class="team-key team-b">{{ state.config.teamB.name }}</span> ·
              {{ teamSize }} tables · fixed layouts use Layout
              {{ layoutForRound(state.config.round) }} this round
            </p>
          </div>
          <div class="results-actions">
            <button
              type="button"
              class="btn-secondary"
              title="Copy this round's setup as text you can paste back into Quick pairing"
              @click="copySetup"
            >
              {{
                copyState === 'copied'
                  ? 'Copied ✓'
                  : copyState === 'failed'
                    ? 'Copy failed'
                    : 'Copy setup'
              }}
            </button>
            <button type="button" class="btn-secondary" @click="changeRosters">
              Change rosters
            </button>
            <button type="button" class="btn-primary" @click="restartRound">New pairing →</button>
          </div>
        </div>

        <RoundProjection v-if="hasEstimates" :state="state" class="results-projection" />

        <div class="results-grid">
          <MatchupCard
            v-for="(m, i) in state.matchups"
            :key="m.id"
            :matchup="m"
            :index="i + 1"
            :team-a-name="state.config.teamA.name"
            :team-b-name="state.config.teamB.name"
            :projection="projectionByMatchup[m.id]"
            @layout="(value) => onLayout(m.id, value)"
            @view-layout="layoutRequest = $event"
          />
        </div>

        <p class="results-note">
          Defender match-ups: the Defender declares Layout A, B or C. Refused Attacker and Champion
          tables roll off for Attacker/Defender and use the fixed layout for the round. Where both
          players set a Force Disposition, “View layout” shows the terrain maps for that table.
        </p>
      </template>
    </div>

    <EstimateDrawer
      v-if="state && !isComplete && hasEstimates"
      :state="state"
      :open="railOpen"
      @close="estimatesOpen = false"
    />

    <LayoutLightbox :request="layoutRequest" @close="layoutRequest = null" />
  </main>
</template>

<style scoped>
.pairing {
  /* Shared with EstimateDrawer, which pins itself to this width on the right. */
  --rail-width: 440px;
  padding: var(--spacing-lg) var(--spacing-md) var(--spacing-xl);
  /* Wider than the site's 1200px `.container`: this is the one page whose job is
     to hold a whole round — up to eight tables — in view at once, so it takes
     every pixel a large screen offers rather than the reading measure the
     content pages use. */
  max-width: 1560px;
  margin: 0 auto;
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  transition: padding-right 0.22s ease;
}

/* Only the live step is bound to the viewport: there the board and the
   selection card have to stay on screen together, so the hero is pinned and the
   body scrolls inside itself. Setup and results are ordinary documents — they
   run as long as they need to and the page scrolls, which is also what keeps
   the results column reading as a centred page rather than a short pane with
   dead space under it. Below the breakpoint nothing is pinned: a nested
   scroller inside a phone viewport buries the controls. */
@media (min-width: 1025px) {
  .pairing.viewport-locked {
    height: calc(100dvh - 65px);
    min-height: 0;
    padding-bottom: 0;
  }

  .pairing.viewport-locked .hero {
    flex-shrink: 0;
  }

  .pairing.viewport-locked .pairing-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding-bottom: var(--spacing-lg);
  }
}

/* Give the open rail its width back out of the page rather than letting it sit
   on top of the selection card — the captain has to keep picking while reading
   the estimates. Below the breakpoint there isn't the room, and the rail goes
   full-screen instead (see EstimateDrawer). */
@media (min-width: 1101px) {
  .pairing.rail-open {
    padding-right: var(--rail-width);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pairing {
    transition: none;
  }
}

.hero {
  margin-bottom: var(--spacing-md);
}

.hero h1 {
  font-size: 44px;
  letter-spacing: -1px;
  margin: var(--spacing-md) 0;
}

/* Once a round is running the hero is pure chrome, and every pixel it keeps is
   one the board or the results grid doesn't get. Shrink it hard so more of the
   round stays on screen without scrolling. */
.pairing.running .hero {
  margin-bottom: var(--spacing-sm);
}

.pairing.running .hero h1 {
  font-size: 28px;
  letter-spacing: -0.5px;
  margin: var(--spacing-xs) 0 0;
}

.pairing.running .badge-pill {
  display: none;
}

.lede {
  font-size: 17px;
  line-height: 1.6;
  color: var(--color-body);
  max-width: 660px;
}

.pairing-body {
  min-width: 0;
}

/* Live step: the pairing board and the active selection card sit side by side
   on one line rather than stacked, so both stay on screen together. The board
   takes all the room it can; the selection card is pinned narrow so its logo
   grid wraps onto several short rows (filling the otherwise-dead space beneath
   it) instead of forcing a wide, half-empty column. That extra width lets the
   board float each table choice inline with its match-up. */
.live {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 320px);
  gap: var(--spacing-md);
  align-items: start;
}

/* Grid items default to min-width:auto, which lets their content overflow the
   narrow fr tracks (a horizontal-scroll break around ~900–1000px). Pin to 0. */
.live > * {
  min-width: 0;
}

.live .panel {
  margin-top: 0;
}

/* Only split into two columns when there is genuinely room; below this the
   board and card stack, which is the layout that fits mid-size viewports.
   Stacked, the selection card goes first: it is the thing the captain acts on,
   and the board is reference they can scroll down to. */
@media (max-width: 1024px) {
  .live {
    grid-template-columns: 1fr;
  }

  .live .panel {
    order: -1;
  }
}

.panel {
  background: var(--color-surface-soft);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xl);
  padding: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.panel-title {
  font-size: 19px;
  letter-spacing: -0.3px;
  margin-bottom: var(--spacing-md);
}

.progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.progress-bar {
  flex: 1;
  height: 6px;
  border-radius: var(--radius-pill);
  background: var(--color-surface-strong);
  overflow: hidden;
}

.progress-fill {
  display: block;
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-pill);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-muted);
  white-space: nowrap;
}

/* Opens the estimates rail. Sits in the progress row rather than floating over
   the board, so it reads as one of the round's controls. */
.estimates-toggle {
  padding: 5px var(--spacing-sm);
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-hairline);
  background: var(--color-canvas);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-muted);
  cursor: pointer;
  white-space: nowrap;
}

.estimates-toggle:hover {
  color: var(--color-ink);
}

.estimates-toggle.active {
  border-color: var(--color-primary);
  background: var(--color-primary-tint);
  color: var(--color-primary);
}

.reset {
  font-size: 13px;
  cursor: pointer;
  background: none;
  border: none;
  white-space: nowrap;
}

.reset:disabled {
  opacity: 0.45;
  cursor: default;
}

.results-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.results-sub {
  font-size: 14px;
  color: var(--color-muted);
  margin-top: 4px;
}

/* Tie each team name to its card-edge gradient colour (teal = A, amber = B). */
.team-key {
  font-weight: 600;
}

.team-key.team-a {
  color: var(--color-accent-teal);
}

.team-key.team-b {
  color: var(--color-accent-amber);
}

/* "Change rosters" (back to setup) sits beside the primary "New pairing"
   (same rosters, fresh live pairing). */
.results-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.results-projection {
  margin-bottom: var(--spacing-md);
}

/* The whole round in as few rows as the width allows: one column on a phone, two
   from tablet up, three from desktop, four once the page is at its full width —
   at which point an eight-player round is two rows and a four-player one is a
   single line. The card sheds its Disposition names as the track narrows (a
   container query in MatchupCard), so the columns stay legible. Tracks are
   pinned to 0 so a long faction name ellipsises inside its card rather than
   widening the track. */
.results-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--spacing-sm);
  align-items: start;
}

@media (min-width: 760px) {
  .results-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1240px) {
  .results-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1500px) {
  .results-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.results-note {
  margin-top: var(--spacing-md);
  font-size: 13px;
  line-height: 1.55;
  color: var(--color-muted);
}

@media (max-width: 720px) {
  .pairing {
    padding: var(--spacing-md) var(--spacing-sm) var(--spacing-lg);
  }

  /* The hero is pure chrome once a round is running; on a phone it costs a
     third of the viewport, so shrink it hard and drop the badge entirely. */
  .hero {
    margin-bottom: var(--spacing-sm);
  }

  .hero h1 {
    font-size: 28px;
    margin: var(--spacing-xs) 0 0;
  }

  .badge-pill {
    display: none;
  }

  .panel {
    padding: var(--spacing-sm);
    border-radius: var(--radius-lg);
  }

  .panel-title {
    font-size: 17px;
    margin-bottom: var(--spacing-sm);
  }

  /* The progress row carries four things; let them wrap onto two lines with the
     bar spanning the first, rather than crushing the labels. */
  .progress {
    flex-wrap: wrap;
    gap: var(--spacing-xs) var(--spacing-sm);
  }

  .progress-bar {
    flex-basis: 100%;
  }

  .estimates-toggle,
  .reset {
    padding-block: 8px;
    font-size: 13px;
  }

  .reset {
    margin-left: auto;
  }

  .results-head {
    gap: var(--spacing-sm);
  }

  .results-actions {
    width: 100%;
  }

  .results-actions > * {
    flex: 1;
  }
}
</style>
