<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import PairingSetup from '../components/pairing/PairingSetup.vue'
import PairingRunner from '../components/pairing/PairingRunner.vue'
import PairingBoard from '../components/pairing/PairingBoard.vue'
import MatchupCard from '../components/pairing/MatchupCard.vue'
import { usePairingSession } from '../composables/usePairingSession'
import { layoutForRound, type LayoutLetter } from '../data/pairing'

const session = usePairingSession()

// Which step of the setup wizard is showing; steps 2 & 3 (army pickers) drop
// the intro copy so the picker gets full focus.
const setupStep = ref<1 | 2 | 3>(1)

const state = computed(() => session.state.value)

// PairingSetup unmounts once a round starts; when it reappears (e.g. after
// "Start over") send the wizard back to step 1 so it doesn't resume mid-flow.
watch(state, (s) => {
  if (!s) setupStep.value = 1
})
const isComplete = computed(() => state.value?.phase.kind === 'complete')
const teamSize = computed(() => state.value?.config.teamA.players.length ?? 0)
const decided = computed(() => state.value?.matchups.length ?? 0)

function onLayout(matchupId: string, value: LayoutLetter) {
  session.layout(matchupId, value)
}
</script>

<template>
  <main class="pairing">
    <section class="hero">
      <p class="badge-pill">Warhammer 40,000 · Teams Event</p>
      <h1>Pairing tool</h1>
      <p v-if="!state && setupStep === 1" class="lede">
        Run a round's pairings on one shared device. Each captain makes their selections in turn,
        revealed simultaneously — exactly as the Initial Skirmish, Main Engagement, and Champion
        System modules require.
      </p>
    </section>

    <div class="pairing-body">
    <!-- 1 · Setup -->
    <section v-if="!state" class="panel">
      <h2 v-if="setupStep === 1" class="panel-title">Set up the round</h2>
      <PairingSetup v-model:step="setupStep" @start="session.start" />
    </section>

    <!-- 2 · Running the modules -->
    <template v-else-if="!isComplete">
      <div class="progress">
        <div class="progress-bar">
          <span class="progress-fill" :style="{ width: `${(decided / teamSize) * 100}%` }" />
        </div>
        <span class="progress-text">{{ decided }} / {{ teamSize }} tables set</span>
        <button type="button" class="text-link reset" @click="session.reset">Start over</button>
      </div>

      <div class="live">
        <PairingBoard :state="state" @layout="onLayout" />

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
            {{ state.config.teamA.name }} vs {{ state.config.teamB.name }} · {{ teamSize }} tables ·
            fixed layouts use Layout {{ layoutForRound(state.config.round) }} this round
          </p>
        </div>
        <div class="results-actions">
          <button type="button" class="btn-secondary" @click="session.reset">Change rosters</button>
          <button type="button" class="btn-primary" @click="session.restart">New pairing →</button>
        </div>
      </div>

      <div class="results-grid">
        <MatchupCard
          v-for="(m, i) in state.matchups"
          :key="m.id"
          :matchup="m"
          :index="i + 1"
          :team-a-name="state.config.teamA.name"
          :team-b-name="state.config.teamB.name"
          @layout="(value) => onLayout(m.id, value)"
        />
      </div>

      <p class="results-note">
        Defender match-ups: the Defender declares Layout A, B or C. Refused Attacker and Champion
        tables roll off for Attacker/Defender and use the fixed layout for the round.
      </p>
    </template>
    </div>
  </main>
</template>

<style scoped>
/* The pairing tool is bound to the viewport height (below the 64px header) and
   laid out as a fixed hero + an internally-scrolling body, so the working area
   fits the screen and the page itself never scrolls. */
.pairing {
  padding: var(--spacing-lg) var(--spacing-md) 0;
  max-width: 1280px;
  margin: 0 auto;
  height: calc(100dvh - 65px);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.hero {
  flex-shrink: 0;
  margin-bottom: var(--spacing-md);
}

.hero h1 {
  font-size: 44px;
  letter-spacing: -1px;
  margin: var(--spacing-md) 0;
}

.lede {
  font-size: 17px;
  line-height: 1.6;
  color: var(--color-body);
  max-width: 660px;
}

.pairing-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: var(--spacing-lg);
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
   board and card stack, which is the layout that fits mid-size viewports. */
@media (max-width: 1024px) {
  .live {
    grid-template-columns: 1fr;
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

.reset {
  font-size: 13px;
  cursor: pointer;
  background: none;
  border: none;
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

/* "Change rosters" (back to setup) sits beside the primary "New pairing"
   (same rosters, fresh live pairing). */
.results-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

/* Two match-ups per row so the whole round fits the screen without scrolling.
   When the table count is odd, the trailing card straddles both columns and is
   centred at one-column width — pure CSS, keyed off it being the last child at
   an odd position. */
.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
  align-items: start;
}

.results-grid > :last-child:nth-child(odd) {
  grid-column: 1 / -1;
  justify-self: center;
  width: calc((100% - var(--spacing-sm)) / 2);
}

/* Below the two-column breakpoint the cards stack full-width again. */
@media (max-width: 1024px) {
  .results-grid {
    grid-template-columns: 1fr;
  }

  .results-grid > :last-child:nth-child(odd) {
    grid-column: auto;
    justify-self: stretch;
    width: auto;
  }
}

.results-note {
  margin-top: var(--spacing-md);
  font-size: 13px;
  line-height: 1.55;
  color: var(--color-muted);
}

@media (max-width: 640px) {
  .pairing {
    padding: var(--spacing-md) var(--spacing-md) 0;
  }

  .hero h1 {
    font-size: 32px;
  }

  .panel {
    padding: var(--spacing-md);
  }
}
</style>
