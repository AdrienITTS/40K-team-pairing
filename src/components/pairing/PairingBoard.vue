<script setup lang="ts">
import { computed } from 'vue'
import {
  boardLayout,
  moduleLabel,
  type BoardRow,
  type BoardSlot,
  type LayoutLetter,
  type Matchup,
  type PairingState,
  type PlayerRole,
} from '../../data/pairing'
import { factionName } from '../../data/factions'
import { getDisposition, type Disposition, type DispositionKey } from '../../data/dispositions'
import { readEstimate, type LayoutStance } from '../../data/estimates'
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

// The layout stances our team recorded for a match-up, used to tint its A/B/C
// picker. Estimates are one team's own prep, keyed our-player|their-player, so
// read them from whichever side owns them.
const estimateSide = computed(() => props.state.config.estimateSide ?? 'A')

function layoutStances(m: Matchup): Partial<Record<LayoutLetter, LayoutStance>> | undefined {
  const ours = estimateSide.value === 'A' ? m.playerA : m.playerB
  const theirs = estimateSide.value === 'A' ? m.playerB : m.playerA
  return readEstimate(props.state.config.estimates, ours.id, theirs.id).layouts
}

// Per-letter class for the picker: favour = a table we want, avoid = one we
// don't, neutral = no impact (only once a preference is recorded for the table,
// so a match-up with none keeps the plain buttons). `active` stays the declared
// letter, shown as a ring on top of whatever stance colour it carries.
function layoutBtnClass(m: Matchup | undefined, letter: LayoutLetter) {
  if (!m) return {}
  const stances = layoutStances(m)
  const stance = stances?.[letter]
  const hasPrefs = Boolean(stances && Object.keys(stances).length > 0)
  return {
    active: m.layout.value === letter,
    favour: stance === 'favour',
    avoid: stance === 'avoid',
    neutral: hasPrefs && !stance,
  }
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

// One side of a row is normally a single cell (a player, or a pending seat), but
// while a Defender's opponent is being counter-picked it becomes the two Attacker
// candidates — so each side renders as a short list of cells.
function sideItems(
  row: BoardRow,
  side: 'a' | 'b',
): { slot: BoardSlot | null; candidate: boolean }[] {
  const candidates = side === 'a' ? row.aCandidates : row.bCandidates
  if (candidates?.length) return candidates.map((slot) => ({ slot, candidate: true }))
  return [{ slot: side === 'a' ? row.a : row.b, candidate: false }]
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
    </div>

    <ul class="rows">
      <li
        v-for="(row, i) in layout.rows"
        :key="i"
        class="row"
        :class="{ committed: row.committed }"
      >
        <div class="matchup-line">
          <div class="side">
            <div
              v-for="(item, k) in sideItems(row, 'a')"
              :key="k"
              class="cell"
              :class="[cellClass(item.slot), { candidate: item.candidate }]"
              :title="item.candidate ? 'Possible opponent' : undefined"
            >
              <template v-if="item.slot">
                <div class="logo-tile">
                  <img
                    v-if="item.slot.player.faction"
                    :src="`/images/factions/${item.slot.player.faction}.webp`"
                    :alt="item.slot.player.faction"
                    width="28"
                    height="28"
                    loading="lazy"
                  />
                  <span v-else class="logo-fallback">·</span>
                </div>
                <span class="cell-name">{{ factionName(item.slot.player.faction) }}</span>
                <span
                  v-if="disp(item.slot)"
                  class="disp-badge"
                  :style="dispAccent(disp(item.slot)!.key)"
                  :title="disp(item.slot)!.name"
                >
                  <DispositionIcon :symbol="disp(item.slot)!.symbol" />
                </span>
                <RoleIcon v-if="item.slot.role" :role="item.slot.role" />
              </template>
              <span v-else class="pending-text">pending</span>
            </div>
          </div>

          <span class="vs">vs</span>

          <div class="side">
            <div
              v-for="(item, k) in sideItems(row, 'b')"
              :key="k"
              class="cell"
              :class="[cellClass(item.slot), { candidate: item.candidate }]"
              :title="item.candidate ? 'Possible opponent' : undefined"
            >
              <template v-if="item.slot">
                <div class="logo-tile">
                  <img
                    v-if="item.slot.player.faction"
                    :src="`/images/factions/${item.slot.player.faction}.webp`"
                    :alt="item.slot.player.faction"
                    width="28"
                    height="28"
                    loading="lazy"
                  />
                  <span v-else class="logo-fallback">·</span>
                </div>
                <span class="cell-name">{{ factionName(item.slot.player.faction) }}</span>
                <span
                  v-if="disp(item.slot)"
                  class="disp-badge"
                  :style="dispAccent(disp(item.slot)!.key)"
                  :title="disp(item.slot)!.name"
                >
                  <DispositionIcon :symbol="disp(item.slot)!.symbol" />
                </span>
                <RoleIcon v-if="item.slot.role" :role="item.slot.role" />
              </template>
              <span v-else class="pending-text">pending</span>
            </div>
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
                  :class="layoutBtnClass(row.matchup, letter)"
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
  /* Queried below so the waiting pool can go two-up. It has to be the board's
     own width, not the viewport's: the estimates rail takes its width out of
     the board while the viewport stays exactly as wide as it was. */
  container-type: inline-size;
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

/* The match-up and its table choice sit on one row: the cells give up whatever
   width the layout picker needs rather than pushing it onto a second line — a
   whole 8-player board then costs eight rows, not sixteen. */
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
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

/* Pending rows (and committed rows without a table choice) render an empty
   slot — drop it so it adds no stray gap under the match-up line. */
.row-table:empty {
  display: none;
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

/* Layout-preference tints, borrowing the same W/L grade bands the setup grid
   uses: a favoured table is the one that scores us the victory column, an
   avoided one the loss column, and neutral is a recorded no-preference. */
.layout-btn.favour {
  background: var(--color-grade-w);
  border-color: transparent;
  color: var(--color-grade-w-fg);
}

.layout-btn.avoid {
  background: var(--color-grade-l);
  border-color: transparent;
  color: var(--color-grade-l-fg);
}

.layout-btn.neutral {
  color: var(--color-muted-soft);
}

/* The declared letter is a coral ring layered over whatever stance colour the
   button already carries, so "which is chosen" and "how it rates" both read. */
.layout-btn.active {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
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

/* One grid column per side; normally one cell, but two stacked candidate cells
   while a Defender's opponent is being counter-picked. */
.side {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs);
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

/* A proposed Attacker facing a Defender — one of two possibilities until the
   counter-pick settles it. The dotted border marks it as not-yet-final. */
.cell.candidate {
  border-style: dotted;
  border-width: 2px;
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

/* Grid items default to min-width:auto, so a long faction name would push the
   chip past its track and out of the board card once the page narrows (which
   the estimates rail does). Pin the tracks to 0 and let the names ellipsise. */
.pool-col {
  list-style: none;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs);
}

/* Given the room, each team's waiting chips go two across rather than one — an
   eight-player round then costs the pool four lines instead of eight, which is
   what keeps the whole board on screen beside the selection card. */
@container (min-width: 860px) {
  .pool-col {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-content: start;
  }
}

.chip {
  min-width: 0;
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

@media (max-width: 720px) {
  .board {
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
  }

  /* The two team headings stay side by side even on a phone: they are the key
     to which column of the waiting pool belongs to whom, so collapsing them to
     one line would leave the pool unlabelled. Only the table-choice gutter,
     which no longer sits inline, is dropped. */
  .team-heads-inner {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-xs);
  }

  .team-head-spacer {
    display: none;
  }

  /* The name is a bare text node beside the dot, so it clips on the flex
     container rather than carrying its own ellipsis. */
  .team-head {
    font-size: 12px;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
  }

  /* On a phone the cells go single-column, so the table choice stacks under the
     match-up again and a hairline separates the rows. */
  .row {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-xxs);
    padding-bottom: var(--spacing-xs);
    border-bottom: 1px solid var(--color-hairline-soft);
  }

  .rows > .row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .layout-btn,
  .row-view {
    width: 34px;
    height: 34px;
  }

  .matchup-line {
    grid-template-columns: 1fr;
    gap: var(--spacing-xxs);
  }

  .vs {
    justify-self: center;
  }

  /* Keep the pool two-up so each chip stays under its own team heading. */
  .pool-columns {
    gap: var(--spacing-xs);
  }

  .chip {
    padding: var(--spacing-xxs);
    gap: var(--spacing-xxs);
  }

  .chip .cell-name {
    font-size: 12px;
  }
}
</style>
