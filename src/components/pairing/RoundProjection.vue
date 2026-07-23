<script setup lang="ts">
import { computed } from 'vue'
import { type PairingState } from '../../data/pairing'
import { projectRound } from '../../data/estimates'

const props = defineProps<{ state: PairingState }>()

const ourSide = computed(() => props.state.config.estimateSide ?? 'A')
const teamSize = computed(() => props.state.config.teamA.players.length)

const ourTeam = computed(() =>
  ourSide.value === 'A' ? props.state.config.teamA : props.state.config.teamB,
)
const oppTeam = computed(() =>
  ourSide.value === 'A' ? props.state.config.teamB : props.state.config.teamA,
)

// Each table's column is read straight from its layout — the letter we rated in
// setup, or the one the Defender declares — with no manual override: the layout
// choice alone decides which estimate applies. The per-table breakdown now lives
// on each MatchupCard; this card keeps only the round-level total.
const projection = computed(() =>
  projectRound(
    props.state.matchups,
    ourSide.value,
    props.state.config.estimates,
    {},
    teamSize.value,
  ),
)

const verdictLabel = computed(
  () =>
    ({ win: 'Projected win', draw: 'Projected draw', loss: 'Projected loss' })[
      projection.value.verdict
    ],
)

const missing = computed(() => projection.value.tables.length - projection.value.scored)
</script>

<template>
  <section class="projection">
    <header class="head" :class="projection.verdict">
      <div class="verdict">
        <p class="verdict-label">{{ verdictLabel }}</p>
        <p class="verdict-score">
          <span class="score-ours">{{ projection.ourBp }}</span>
          <span class="score-sep">–</span>
          <span class="score-theirs">{{ projection.oppBp }}</span>
          <span class="score-unit">BP</span>
        </p>
      </div>
      <ul class="facts">
        <li>
          <span class="fact-label">Margin</span>
          <span class="fact-value">
            {{ projection.margin > 0 ? '+' : '' }}{{ projection.margin }}
          </span>
        </li>
        <li>
          <span class="fact-label">Win needs</span>
          <span class="fact-value">{{ projection.threshold }}</span>
        </li>
        <li>
          <span class="fact-label">Team points</span>
          <span class="fact-value">{{ projection.teamPoints }}</span>
        </li>
      </ul>
    </header>

    <p class="lede">
      {{ ourTeam.name }}'s projected result against {{ oppTeam.name }}, totalling each table's
      estimate — the grade is shown on its own card below.
      <template v-if="missing">
        <strong>{{ missing }}</strong>
        table{{ missing === 1 ? '' : 's' }} had no estimate and {{ missing === 1 ? 'is' : 'are' }}
        left out of the totals.
      </template>
    </p>
  </section>
</template>

<style scoped>
.projection {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-surface-soft);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xl);
}

.head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-hairline);
  border-left-width: 4px;
  border-radius: var(--radius-lg);
  background: var(--color-canvas);
}

.head.win {
  border-left-color: var(--color-grade-gw);
}

.head.draw {
  border-left-color: var(--color-warning);
}

.head.loss {
  border-left-color: var(--color-error);
}

.verdict-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-muted);
}

.head.win .verdict-label {
  color: var(--color-grade-gw);
}

.head.draw .verdict-label {
  color: var(--color-warning);
}

.head.loss .verdict-label {
  color: var(--color-error);
}

.verdict-score {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xxs);
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 500;
  letter-spacing: -0.8px;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
}

.score-sep,
.score-theirs {
  color: var(--color-muted);
}

.score-unit {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-muted);
}

.facts {
  list-style: none;
  display: flex;
  gap: var(--spacing-md);
}

.facts li {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fact-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-muted);
}

.fact-value {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
}

.lede {
  font-size: 13px;
  line-height: 1.55;
  color: var(--color-muted);
}

@media (max-width: 720px) {
  .head {
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .verdict-score {
    font-size: 30px;
  }

  .facts {
    gap: var(--spacing-md);
  }
}
</style>
