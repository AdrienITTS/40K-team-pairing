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
import {
  estimateCount,
  projectRound,
  readEstimate,
  type LayoutStance,
  type ProjectedTable,
} from '../data/estimates'
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

// The estimates card sits in the live layout's right column. It shows by default
// so the whole round reads on one page; the toggle hides it when the device is
// handed to the opposing captain (it holds one team's private prep).
const estimatesOpen = ref(true)

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

// Our recorded want/avoid layout stance per match-up, keyed by id, so each
// MatchupCard can tint its A/B/C picker the same way the live board does.
const layoutStancesByMatchup = computed<
  Record<string, Partial<Record<LayoutLetter, LayoutStance>>>
>(() => {
  const s = state.value
  if (!s || !hasEstimates.value) return {}
  const side = s.config.estimateSide ?? 'A'
  const out: Record<string, Partial<Record<LayoutLetter, LayoutStance>>> = {}
  for (const m of s.matchups) {
    const ours = side === 'A' ? m.playerA : m.playerB
    const theirs = side === 'A' ? m.playerB : m.playerA
    const layouts = readEstimate(s.config.estimates, ours.id, theirs.id).layouts
    if (layouts) out[m.id] = layouts
  }
  return out
})

// PairingSetup unmounts once a round starts; when it reappears (e.g. after
// "Change rosters") send the wizard back to step 1 so it doesn't resume mid-flow.
watch(state, (s) => {
  if (!s) setupStep.value = 'mode'
})

// A fresh pairing starts with the estimates card shown again.
function resetEstimateUi() {
  estimatesOpen.value = true
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

// The estimates card only belongs to the live step: a round set up with
// estimates, still running, with the toggle on.
const showEstimates = computed(
  () => estimatesOpen.value && Boolean(state.value) && !isComplete.value && hasEstimates.value,
)

function onLayout(matchupId: string, value: LayoutLetter) {
  session.layout(matchupId, value)
}
</script>

<template>
  <main
    class="pairing"
    :class="{
      running: Boolean(state),
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
          <!-- The active selection card leads, full width, faction choices on one row. -->
          <section class="panel selection-panel">
            <PairingRunner
              :state="state"
              @defender="session.defender"
              @attackers="session.attackers"
              @counter="session.counter"
              @next="session.next"
            />
          </section>

          <!-- Below it, the live board (what's happening) beside the estimates. -->
          <div class="live-columns" :class="{ 'with-estimates': showEstimates }">
            <PairingBoard :state="state" @layout="onLayout" @view-layout="layoutRequest = $event" />
            <EstimateDrawer v-if="showEstimates" :state="state" @close="estimatesOpen = false" />
          </div>
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
            :layout-stances="layoutStancesByMatchup[m.id]"
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

    <LayoutLightbox :request="layoutRequest" @close="layoutRequest = null" />
  </main>
</template>

<style scoped>
.pairing {
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

/* Live step, top to bottom: the active selection card full width, then the live
   board beside the estimates. Everything is in normal document flow — one
   scrolling page rather than a fixed overlay. */
.live {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.live > * {
  min-width: 0;
}

.selection-panel {
  margin-top: 0;
  /* The selection bar is deliberately short — trim the card padding so it reads
     as a compact control strip above the board, not a tall panel. */
  padding: var(--spacing-sm) var(--spacing-md);
}

/* Board (left) beside estimates (right). With no estimates the board takes the
   whole width; the second track only appears once the estimates card is shown. */
.live-columns {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--spacing-md);
  align-items: start;
}

.live-columns.with-estimates {
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
}

.live-columns > * {
  min-width: 0;
}

/* Below this there isn't room for two columns, so the board and estimates stack. */
@media (max-width: 1024px) {
  .live-columns.with-estimates {
    grid-template-columns: minmax(0, 1fr);
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
