<script setup lang="ts">
import { computed } from 'vue'
import PairingSetup from '../components/pairing/PairingSetup.vue'
import PairingRunner from '../components/pairing/PairingRunner.vue'
import PairingBoard from '../components/pairing/PairingBoard.vue'
import MatchupCard from '../components/pairing/MatchupCard.vue'
import { usePairingSession } from '../composables/usePairingSession'
import { layoutForRound, type LayoutLetter } from '../data/pairing'
import { factionName } from '../data/factions'

const session = usePairingSession()

const state = computed(() => session.state.value)
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
      <p v-if="!state" class="lede">
        Run a round's pairings on one shared device. Each captain makes their selections in turn,
        revealed simultaneously — exactly as the Initial Skirmish, Main Engagement, and Champion
        System modules require.
      </p>
    </section>

    <!-- 1 · Setup -->
    <section v-if="!state" class="panel">
      <h2 class="panel-title">Set up the round</h2>
      <PairingSetup @start="session.start" />
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

      <PairingBoard :state="state" />

      <section class="panel">
        <PairingRunner
          :state="state"
          @defender="session.defender"
          @attackers="session.attackers"
          @counter="session.counter"
          @next="session.next"
        />
      </section>

      <section v-if="state.matchups.length" class="decided">
        <h3>Match-ups decided so far</h3>
        <ul class="decided-list">
          <li v-for="m in state.matchups" :key="m.id">
            <strong>{{ factionName(m.playerA.faction) }}</strong> vs
            <strong>{{ factionName(m.playerB.faction) }}</strong>
          </li>
        </ul>
      </section>
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
        <button type="button" class="btn-secondary" @click="session.reset">New pairing →</button>
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
  </main>
</template>

<style scoped>
.pairing {
  padding: var(--spacing-xl) var(--spacing-lg) var(--spacing-xxl);
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  margin-bottom: var(--spacing-lg);
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

.panel {
  background: var(--color-surface-soft);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  margin-top: var(--spacing-lg);
}

.panel-title {
  font-size: 24px;
  letter-spacing: -0.3px;
  margin-bottom: var(--spacing-lg);
}

.progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
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

.decided {
  margin-top: var(--spacing-lg);
}

.decided h3 {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-muted);
  margin-bottom: var(--spacing-xs);
}

.decided-list {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs) var(--spacing-md);
}

.decided-list li {
  font-size: 14px;
  color: var(--color-body);
}

.results-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.results-sub {
  font-size: 14px;
  color: var(--color-muted);
  margin-top: 4px;
}

.results-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.results-note {
  margin-top: var(--spacing-lg);
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-muted);
}

@media (max-width: 640px) {
  .pairing {
    padding: var(--spacing-lg) var(--spacing-md) var(--spacing-xxl);
  }

  .hero h1 {
    font-size: 32px;
  }

  .panel {
    padding: var(--spacing-lg);
  }
}
</style>
