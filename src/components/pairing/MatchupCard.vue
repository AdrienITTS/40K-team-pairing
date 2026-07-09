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

// Refused and Champion match-ups have no Defender/Attacker side — label both
// players by the match-up's own type instead.
function roleFor(side: 'A' | 'B'): string | null {
  const m = props.matchup
  if (m.matchType === 'refused') return 'Refused'
  if (m.matchType === 'champion') return 'Champion'
  if (m.defenderSide === side) return 'Defender'
  if (m.defenderSide) return 'Attacker'
  return null
}

const roleA = computed(() => roleFor('A'))
const roleB = computed(() => roleFor('B'))
</script>

<template>
  <article class="matchup">
    <div class="matchup-info">
      <span class="table-no">Table {{ index }}</span>
      <span class="module-badge">{{ moduleLabel(matchup.module) }}</span>
    </div>

    <div class="players">
      <div class="player side-a">
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
          <span class="player-team">
            <span class="team-tag">{{ teamAName }}</span>
            <template v-if="roleA">
              · <span class="role-tag" :class="`role-${roleA.toLowerCase()}`">{{ roleA }}</span>
            </template>
          </span>
        </div>
      </div>

      <span class="vs">vs</span>

      <div class="player player-right side-b">
        <div class="player-meta">
          <span class="player-name">{{ factionName(matchup.playerB.faction) }}</span>
          <span class="player-team">
            <span class="team-tag">{{ teamBName }}</span>
            <template v-if="roleB">
              · <span class="role-tag" :class="`role-${roleB.toLowerCase()}`">{{ roleB }}</span>
            </template>
          </span>
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
        <span class="foot-label">Defender's choice</span>
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
  padding: var(--spacing-xs) var(--spacing-md);
  display: grid;
  grid-template-columns: 100px 1fr 140px;
  align-items: center;
  gap: var(--spacing-sm);
  /* Keep every card the same height so the two columns stay in sync, even when
     one card's faction name wraps to two lines and another's doesn't. */
  min-height: 89px;
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
  gap: var(--spacing-xs);
  min-width: 0;
}

.player {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
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
  width: 46px;
  height: 46px;
  border-radius: var(--radius-md);
  background: var(--color-canvas);
  flex-shrink: 0;
}

.logo-tile img {
  width: 38px;
  height: 38px;
  object-fit: contain;
}

.logo-fallback {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-muted);
}

/* Take all the room the logo leaves so long names wrap within the column
   instead of spilling under the logo or getting clipped. */
.player-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* At two-per-row the name column is narrow, so wrap to a second line rather
   than truncating — "Adepta Sororitas" and "Adeptus Custodes" must stay
   tellable apart. */
.player-name {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  color: var(--color-ink);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.player-team {
  font-size: 12px;
  color: var(--color-muted);
}

/* Colour the team name by side and the role by its board colour, so results
   read at a glance. */
.side-a .team-tag {
  color: var(--color-accent-teal);
  font-weight: 600;
}

.side-b .team-tag {
  color: var(--color-accent-amber);
  font-weight: 600;
}

.role-tag {
  font-weight: 600;
}

.role-defender {
  color: var(--color-role-defender);
}

.role-attacker {
  color: var(--color-role-attacker);
}

.role-refused {
  color: var(--color-role-refused);
}

.role-champion {
  color: var(--color-role-champion);
}

.side-a .logo-tile {
  background: var(--color-accent-teal-tint);
}

.side-b .logo-tile {
  background: var(--color-accent-amber-tint);
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
  padding-left: var(--spacing-md);
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
