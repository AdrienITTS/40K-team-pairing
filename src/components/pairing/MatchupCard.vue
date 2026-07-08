<script setup lang="ts">
import { computed } from 'vue'
import { moduleLabel, type LayoutLetter, type Matchup } from '../../data/pairing'
import { factionName } from '../../data/factions'

const props = defineProps<{
  matchup: Matchup
  teamAName: string
  teamBName: string
  index: number
}>()

const emit = defineEmits<{ layout: [value: LayoutLetter] }>()

const layouts: LayoutLetter[] = ['A', 'B', 'C']

const roleA = computed(() =>
  props.matchup.defenderSide === 'A'
    ? 'Defender'
    : props.matchup.defenderSide === 'B'
      ? 'Attacker'
      : null,
)
const roleB = computed(() =>
  props.matchup.defenderSide === 'B'
    ? 'Defender'
    : props.matchup.defenderSide === 'A'
      ? 'Attacker'
      : null,
)
</script>

<template>
  <article class="matchup">
    <div class="matchup-info">
      <span class="table-no">Table {{ index }}</span>
      <span class="module-badge">{{ moduleLabel(matchup.module) }}</span>
    </div>

    <div class="players">
      <div class="player">
        <div class="logo-tile">
          <img
            v-if="matchup.playerA.faction"
            :src="`/images/factions/${matchup.playerA.faction}.png`"
            :alt="matchup.playerA.faction"
            width="36"
            height="36"
            loading="lazy"
          />
          <span v-else class="logo-fallback">·</span>
        </div>
        <div class="player-meta">
          <span class="player-name">{{ factionName(matchup.playerA.faction) }}</span>
          <span class="player-team"
            >{{ teamAName }}<template v-if="roleA"> · {{ roleA }}</template></span
          >
        </div>
      </div>

      <span class="vs">vs</span>

      <div class="player player-right">
        <div class="player-meta">
          <span class="player-name">{{ factionName(matchup.playerB.faction) }}</span>
          <span class="player-team"
            >{{ teamBName }}<template v-if="roleB"> · {{ roleB }}</template></span
          >
        </div>
        <div class="logo-tile">
          <img
            v-if="matchup.playerB.faction"
            :src="`/images/factions/${matchup.playerB.faction}.png`"
            :alt="matchup.playerB.faction"
            width="36"
            height="36"
            loading="lazy"
          />
          <span v-else class="logo-fallback">·</span>
        </div>
      </div>
    </div>

    <footer class="matchup-foot">
      <template v-if="matchup.layout.kind === 'defender-choice'">
        <span class="foot-label">Layout — Defender's choice</span>
        <div class="layout-picker">
          <button
            v-for="letter in layouts"
            :key="letter"
            type="button"
            class="layout-btn"
            :class="{ active: matchup.layout.value === letter }"
            @click="emit('layout', letter)"
          >
            {{ letter }}
          </button>
        </div>
      </template>
      <template v-else>
        <span class="foot-label">Roll off for sides</span>
        <span class="layout-fixed">Layout {{ matchup.layout.value }}</span>
      </template>
    </footer>
  </article>
</template>

<style scoped>
.matchup {
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  padding: var(--spacing-sm) var(--spacing-lg);
  display: grid;
  grid-template-columns: 130px 1fr 180px;
  align-items: center;
  gap: var(--spacing-lg);
}

.matchup-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 90px;
}

.table-no {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-ink);
}

.module-badge {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-muted);
}

.players {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
}

.player {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
}

.player-right {
  justify-content: flex-end;
  text-align: right;
}

.logo-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-canvas);
  flex-shrink: 0;
}

.logo-tile img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.logo-fallback {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-muted);
}

.player-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.player-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-team {
  font-size: 12px;
  color: var(--color-muted);
}

.vs {
  font-family: var(--font-display);
  font-size: 15px;
  font-style: italic;
  color: var(--color-muted-soft);
}

.matchup-foot {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-xxs);
  padding-left: var(--spacing-lg);
  border-left: 1px solid var(--color-hairline-soft);
}

.foot-label {
  font-size: 12px;
  color: var(--color-muted);
}

.layout-picker {
  display: flex;
  gap: var(--spacing-xxs);
}

.layout-btn {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-hairline);
  background: var(--color-canvas);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-body);
  cursor: pointer;
}

.layout-btn:hover {
  background: var(--color-surface-soft);
}

.layout-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary);
}

.layout-fixed {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-ink);
}

@media (max-width: 720px) {
  .matchup {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }

  .matchup-info {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
  }

  .players {
    grid-template-columns: 1fr auto 1fr;
  }

  .matchup-foot {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding-left: 0;
    padding-top: var(--spacing-sm);
    border-left: none;
    border-top: 1px solid var(--color-hairline-soft);
  }
}
</style>
