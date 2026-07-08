<script setup lang="ts">
import { computed } from 'vue'
import {
  boardLayout,
  moduleLabel,
  type BoardSlot,
  type PairingState,
  type PlayerRole,
} from '../../data/pairing'
import { factionName } from '../../data/factions'
import RoleIcon from './RoleIcon.vue'

const props = defineProps<{ state: PairingState }>()

const layout = computed(() => boardLayout(props.state))
const currentModule = computed(() => moduleLabel(props.state.moduleQueue[props.state.moduleIndex]!))

const roleLabels: Record<PlayerRole, string> = {
  defender: 'Defender',
  attacker: 'Attacker',
  refused: 'Refused',
}

const legend: PlayerRole[] = ['defender', 'attacker', 'refused']

function cellClass(slot: BoardSlot | null): string {
  if (!slot) return 'pending'
  return slot.role ? `role-${slot.role}` : 'role-none'
}
</script>

<template>
  <section class="board">
    <header class="board-head">
      <h2 class="board-title">Live pairing board</h2>
      <p class="board-subtitle">Now pairing: {{ currentModule }}</p>
    </header>

    <div class="team-heads">
      <span class="team-head team-a">
        <span class="team-dot" />
        {{ state.config.teamA.name }}
      </span>
      <span class="team-head-spacer" />
      <span class="team-head team-b">
        {{ state.config.teamB.name }}
        <span class="team-dot" />
      </span>
    </div>

    <ul class="rows">
      <li
        v-for="(row, i) in layout.rows"
        :key="i"
        class="row"
        :class="{ committed: row.committed }"
      >
        <div class="cell" :class="cellClass(row.a)">
          <template v-if="row.a">
            <div class="logo-tile">
              <img
                v-if="row.a.player.faction"
                :src="`/images/factions/${row.a.player.faction}.png`"
                :alt="row.a.player.faction"
                width="28"
                height="28"
                loading="lazy"
              />
              <span v-else class="logo-fallback">·</span>
            </div>
            <span class="cell-name">{{ factionName(row.a.player.faction) }}</span>
            <RoleIcon v-if="row.a.role" :role="row.a.role" />
          </template>
          <span v-else class="pending-text">pending</span>
        </div>

        <span class="vs">vs</span>

        <div class="cell" :class="cellClass(row.b)">
          <template v-if="row.b">
            <div class="logo-tile">
              <img
                v-if="row.b.player.faction"
                :src="`/images/factions/${row.b.player.faction}.png`"
                :alt="row.b.player.faction"
                width="28"
                height="28"
                loading="lazy"
              />
              <span v-else class="logo-fallback">·</span>
            </div>
            <span class="cell-name">{{ factionName(row.b.player.faction) }}</span>
            <RoleIcon v-if="row.b.role" :role="row.b.role" />
          </template>
          <span v-else class="pending-text">pending</span>
        </div>
      </li>
    </ul>

    <div v-if="layout.poolA.length || layout.poolB.length" class="pool">
      <p class="pool-label">Waiting</p>
      <div class="pool-columns">
        <ul class="pool-col">
          <li
            v-for="slot in layout.poolA"
            :key="slot.player.id"
            class="chip"
            :class="cellClass(slot)"
          >
            <div class="logo-tile">
              <img
                v-if="slot.player.faction"
                :src="`/images/factions/${slot.player.faction}.png`"
                :alt="slot.player.faction"
                width="24"
                height="24"
                loading="lazy"
              />
              <span v-else class="logo-fallback">·</span>
            </div>
            <span class="cell-name">{{ factionName(slot.player.faction) }}</span>
            <RoleIcon v-if="slot.role" :role="slot.role" />
          </li>
        </ul>
        <ul class="pool-col">
          <li
            v-for="slot in layout.poolB"
            :key="slot.player.id"
            class="chip"
            :class="cellClass(slot)"
          >
            <div class="logo-tile">
              <img
                v-if="slot.player.faction"
                :src="`/images/factions/${slot.player.faction}.png`"
                :alt="slot.player.faction"
                width="24"
                height="24"
                loading="lazy"
              />
              <span v-else class="logo-fallback">·</span>
            </div>
            <span class="cell-name">{{ factionName(slot.player.faction) }}</span>
            <RoleIcon v-if="slot.role" :role="slot.role" />
          </li>
        </ul>
      </div>
    </div>

    <footer class="legend">
      <span v-for="role in legend" :key="role" class="legend-item">
        <span class="role-badge" :class="`role-${role}`">
          <RoleIcon :role="role" />
        </span>
        <span class="legend-label">{{ roleLabels[role] }}</span>
      </span>
    </footer>
  </section>
</template>

<style scoped>
.board {
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.board-head {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs);
}

.board-title {
  font-size: 18px;
  letter-spacing: -0.2px;
}

.board-subtitle {
  font-size: 13px;
  color: var(--color-muted);
}

.team-heads {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--spacing-sm);
}

.team-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-ink);
}

.team-b {
  justify-content: flex-end;
}

.team-head-spacer {
  width: 24px;
}

.team-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-pill);
  background: var(--color-accent-teal);
  flex-shrink: 0;
}

.team-b .team-dot {
  background: var(--color-accent-amber);
}

.rows {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--spacing-sm);
}

.row.committed {
  opacity: 0.82;
}

.vs {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-muted);
  text-transform: uppercase;
}

.cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-md);
  min-height: 48px;
}

.cell.pending {
  border-style: dashed;
  border-color: var(--color-hairline);
  background: var(--color-canvas);
  color: var(--color-muted-soft);
}

.pending-text {
  font-size: 13px;
  color: var(--color-muted-soft);
}

.logo-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-soft);
  flex-shrink: 0;
}

.logo-tile img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.logo-fallback {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-muted);
}

.cell-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell :deep(svg) {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.role-defender {
  background: var(--color-role-defender-tint);
  border-color: var(--color-role-defender);
  color: var(--color-role-defender);
}

.role-attacker {
  background: var(--color-role-attacker-tint);
  border-color: var(--color-role-attacker);
  color: var(--color-role-attacker);
}

.role-refused {
  background: var(--color-role-refused-tint);
  border-color: var(--color-role-refused);
  color: var(--color-role-refused);
}

.role-none {
  background: var(--color-canvas);
  border-color: var(--color-hairline);
}

.pool {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-hairline-soft);
}

.pool-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--color-muted);
}

.pool-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
}

.pool-col {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs);
}

.chip {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xxs) var(--spacing-sm);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-md);
}

.chip .logo-tile {
  width: 28px;
  height: 28px;
}

.chip .logo-tile img {
  width: 24px;
  height: 24px;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-hairline-soft);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xxs);
}

.role-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-pill);
  flex-shrink: 0;
}

.role-badge :deep(svg) {
  width: 14px;
  height: 14px;
}

.legend-label {
  font-size: 12px;
  color: var(--color-muted);
}

@media (max-width: 640px) {
  .team-heads {
    grid-template-columns: 1fr;
    gap: var(--spacing-xxs);
  }

  .team-head-spacer {
    display: none;
  }

  .row {
    grid-template-columns: 1fr;
    gap: var(--spacing-xxs);
  }

  .vs {
    justify-self: center;
  }

  .pool-columns {
    grid-template-columns: 1fr;
  }
}
</style>
