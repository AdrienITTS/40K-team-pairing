<script setup lang="ts">
import { computed } from 'vue'
import {
  boardLayout,
  moduleLabel,
  type BoardSlot,
  type LayoutLetter,
  type Matchup,
  type PairingState,
  type PlayerRole,
} from '../../data/pairing'
import { factionName } from '../../data/factions'
import { getDisposition, type Disposition, type DispositionKey } from '../../data/dispositions'
import DispositionIcon from '../DispositionIcon.vue'
import RoleIcon from './RoleIcon.vue'

const props = defineProps<{ state: PairingState }>()

const emit = defineEmits<{
  layout: [matchupId: string, value: LayoutLetter]
  viewLayout: [
    request: { a: DispositionKey; b: DispositionKey; letter: LayoutLetter; fixed: boolean },
  ]
}>()

const layout = computed(() => boardLayout(props.state))

// A layout map is only viewable once both of a match-up's players have a Force
// Disposition (they're optional in setup) — the pair sets the terrain.
function dispositionPair(m: Matchup): { a: DispositionKey; b: DispositionKey } | null {
  const a = m.playerA.disposition
  const b = m.playerB.disposition
  return a && b ? { a, b } : null
}

function viewLayout(m: Matchup) {
  const pair = dispositionPair(m)
  if (!pair) return
  emit('viewLayout', { ...pair, letter: m.layout.value ?? 'A', fixed: m.layout.kind === 'fixed' })
}

// The two waiting pools rendered side by side; one column each.
const pools = computed(() => [
  { side: 'A', slots: layout.value.poolA },
  { side: 'B', slots: layout.value.poolB },
])

const layouts: LayoutLetter[] = ['A', 'B', 'C']

// Guarded so the template can pass a possibly-undefined row match-up directly.
function choose(matchup: Matchup | undefined, value: LayoutLetter) {
  if (matchup) emit('layout', matchup.id, value)
}
const currentModule = computed(() => moduleLabel(props.state.moduleQueue[props.state.moduleIndex]!))

const roleLabels: Record<PlayerRole, string> = {
  defender: 'Defender',
  attacker: 'Attacker',
  refused: 'Refused',
  champion: 'Champion',
}

const legend: PlayerRole[] = ['defender', 'attacker', 'refused', 'champion']

function cellClass(slot: BoardSlot | null): string {
  if (!slot) return 'pending'
  return slot.role ? `role-${slot.role}` : 'role-none'
}

// A player's Force Disposition (or null), shown as a tinted badge on their cell.
function disp(slot: BoardSlot | null): Disposition | null {
  const key = slot?.player.disposition
  return key ? getDisposition(key) : null
}

function dispAccent(key: DispositionKey) {
  return {
    '--accent': `var(--color-disposition-${key})`,
    '--accent-tint': `var(--color-disposition-${key}-tint)`,
  }
}
</script>

<template>
  <section class="board">
    <header class="board-head">
      <h2 class="board-title">Live pairing board</h2>
      <p class="board-subtitle">Now pairing: {{ currentModule }}</p>
    </header>

    <div class="team-heads">
      <div class="team-heads-inner">
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
      <span class="team-heads-table" aria-hidden="true" />
    </div>

    <ul class="rows">
      <li
        v-for="(row, i) in layout.rows"
        :key="i"
        class="row"
        :class="{ committed: row.committed }"
      >
        <div class="matchup-line">
          <div class="cell" :class="cellClass(row.a)">
            <template v-if="row.a">
              <div class="logo-tile">
                <img
                  v-if="row.a.player.faction"
                  :src="`/images/factions/${row.a.player.faction}.webp`"
                  :alt="row.a.player.faction"
                  width="28"
                  height="28"
                  loading="lazy"
                />
                <span v-else class="logo-fallback">·</span>
              </div>
              <span class="cell-name">{{ factionName(row.a.player.faction) }}</span>
              <span
                v-if="disp(row.a)"
                class="disp-badge"
                :style="dispAccent(disp(row.a)!.key)"
                :title="disp(row.a)!.name"
              >
                <DispositionIcon :symbol="disp(row.a)!.symbol" />
              </span>
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
                  :src="`/images/factions/${row.b.player.faction}.webp`"
                  :alt="row.b.player.faction"
                  width="28"
                  height="28"
                  loading="lazy"
                />
                <span v-else class="logo-fallback">·</span>
              </div>
              <span class="cell-name">{{ factionName(row.b.player.faction) }}</span>
              <span
                v-if="disp(row.b)"
                class="disp-badge"
                :style="dispAccent(disp(row.b)!.key)"
                :title="disp(row.b)!.name"
              >
                <DispositionIcon :symbol="disp(row.b)!.symbol" />
              </span>
              <RoleIcon v-if="row.b.role" :role="row.b.role" />
            </template>
            <span v-else class="pending-text">pending</span>
          </div>
        </div>

        <!-- Table choice rides inline at the end of the match-up line. The slot
             is reserved on every row so committed and pending rows stay in
             column alignment; committed Defender rows let the Defender declare
             their table live. -->
        <div class="row-table">
          <template v-if="row.committed && row.matchup">
            <template v-if="row.matchup.layout.kind === 'defender-choice'">
              <span class="row-layout-label">Table</span>
              <div class="layout-picker">
                <button
                  v-for="letter in layouts"
                  :key="letter"
                  type="button"
                  class="layout-btn"
                  :class="{ active: row.matchup?.layout.value === letter }"
                  @click="choose(row.matchup, letter)"
                >
                  {{ letter }}
                </button>
              </div>
            </template>
            <span v-else class="layout-fixed">Layout {{ row.matchup.layout.value }}</span>
            <button
              v-if="dispositionPair(row.matchup)"
              type="button"
              class="row-view"
              title="View layout"
              aria-label="View layout"
              @click="viewLayout(row.matchup)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 9V4h5M20 15v5h-5M15 4h5v5M9 20H4v-5" />
              </svg>
            </button>
          </template>
        </div>
      </li>
    </ul>

    <div v-if="layout.poolA.length || layout.poolB.length" class="pool">
      <p class="pool-label">Waiting</p>
      <div class="pool-columns">
        <ul v-for="pool in pools" :key="pool.side" class="pool-col">
          <li
            v-for="slot in pool.slots"
            :key="slot.player.id"
            class="chip"
            :class="cellClass(slot)"
          >
            <div class="logo-tile">
              <img
                v-if="slot.player.faction"
                :src="`/images/factions/${slot.player.faction}.webp`"
                :alt="slot.player.faction"
                width="24"
                height="24"
                loading="lazy"
              />
              <span v-else class="logo-fallback">·</span>
            </div>
            <span class="cell-name">{{ factionName(slot.player.faction) }}</span>
            <span
              v-if="disp(slot)"
              class="disp-badge"
              :style="dispAccent(disp(slot)!.key)"
              :title="disp(slot)!.name"
            >
              <DispositionIcon :symbol="disp(slot)!.symbol" />
            </span>
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
  /* Width reserved at the end of each match-up line for its table choice (and
     the view-layout button), kept in sync between the rows and the team-heads
     so columns stay aligned. */
  --table-col-width: 172px;
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
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
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.team-heads-inner {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--spacing-sm);
}

/* Mirror the per-row table slot so the team names sit over their cells. */
.team-heads-table {
  width: var(--table-col-width);
  flex-shrink: 0;
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
  gap: var(--spacing-xs);
}

.row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.matchup-line {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--spacing-sm);
}

.row.committed .matchup-line {
  opacity: 0.82;
}

.row-table {
  width: var(--table-col-width);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-xs);
}

.row-layout-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--color-muted);
}

.layout-picker {
  display: flex;
  gap: var(--spacing-xxs);
}

.layout-btn {
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-hairline);
  background: var(--color-canvas);
  font-size: 12px;
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
  font-size: 12px;
  font-weight: 600;
  color: var(--color-muted);
}

.row-view {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-hairline);
  background: var(--color-canvas);
  color: var(--color-muted);
  cursor: pointer;
  flex-shrink: 0;
}

.row-view:hover,
.row-view:focus-visible {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.row-view svg {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
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
  padding: var(--spacing-xxs) var(--spacing-sm);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-md);
  min-height: 40px;
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

/* Force Disposition badge — a tinted square carrying the disposition symbol,
   sat between the faction name and the pairing-role icon. */
.disp-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 3px;
  border-radius: var(--radius-sm);
  background: var(--accent-tint);
  color: var(--accent);
  flex-shrink: 0;
}

.disp-badge :deep(svg) {
  width: 16px;
  height: 16px;
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

.role-champion {
  background: var(--color-role-champion-tint);
  border-color: var(--color-role-champion);
  color: var(--color-role-champion);
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
  .team-heads-inner {
    grid-template-columns: 1fr;
    gap: var(--spacing-xxs);
  }

  .team-heads-table {
    display: none;
  }

  .team-head-spacer {
    display: none;
  }

  /* Stack the table choice back under the match-up on narrow screens. */
  .row {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-xxs);
  }

  .row-table {
    width: auto;
    justify-content: flex-end;
  }

  .matchup-line {
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
