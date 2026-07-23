<script setup lang="ts">
import { computed } from 'vue'
import GradeChip from './GradeChip.vue'
import DispositionIcon from '../DispositionIcon.vue'
import { factionName } from '../../data/factions'
import { getDisposition, type Disposition, type DispositionKey } from '../../data/dispositions'
import { boardLayout, type BoardRow, type PairingState, type Player } from '../../data/pairing'
import {
  bpWinThreshold,
  columnBp,
  columnGrade,
  readEstimate,
  type EstimateGrade,
  type TableColumn,
  type TableQuality,
} from '../../data/estimates'

const props = defineProps<{ state: PairingState }>()
const emit = defineEmits<{ close: [] }>()

const ourSide = computed(() => props.state.config.estimateSide ?? 'A')
const estimates = computed(() => props.state.config.estimates)
const ourTeam = computed(() =>
  ourSide.value === 'A' ? props.state.config.teamA : props.state.config.teamB,
)
const oppTeam = computed(() =>
  ourSide.value === 'A' ? props.state.config.teamB : props.state.config.teamA,
)

const board = computed(() => boardLayout(props.state))

/**
 * The tables currently up for grabs: while a Defender's opponent is being
 * counter-picked, the two proposed Attackers sit facing the Defender as
 * candidates. Collect each possible pairing so the grid can highlight the
 * estimate for every proposed-but-not-yet-chosen match-up while the pick is
 * live. Keyed `<our id>|<their id>` to line up with the matrix cells.
 */
const proposedKeys = computed(() => {
  const keys = new Set<string>()
  for (const row of board.value.rows) {
    const aCands = row.aCandidates
    const bCands = row.bCandidates
    if (!aCands?.length && !bCands?.length) continue
    const aPlayers = aCands?.length ? aCands.map((s) => s.player) : row.a ? [row.a.player] : []
    const bPlayers = bCands?.length ? bCands.map((s) => s.player) : row.b ? [row.b.player] : []
    for (const pa of aPlayers) {
      for (const pb of bPlayers) {
        keys.add(ourSide.value === 'A' ? `${pa.id}|${pb.id}` : `${pb.id}|${pa.id}`)
      }
    }
  }
  return keys
})

const proposedOurIds = computed(
  () => new Set([...proposedKeys.value].map((k) => k.split('|')[0]!)),
)
const proposedOppIds = computed(
  () => new Set([...proposedKeys.value].map((k) => k.split('|')[1]!)),
)

/** Rows whose two seats are both filled — the match-up is settled either way. */
const settledRows = computed(() => board.value.rows.filter((r) => r.a && r.b))

function ourSlot(row: BoardRow) {
  return ourSide.value === 'A' ? row.a : row.b
}

function oppSlot(row: BoardRow) {
  return ourSide.value === 'A' ? row.b : row.a
}

/**
 * Which estimate column a settled table falls under.
 *
 * Once we've declared layout preferences for the table, the layout in play
 * decides outright: a letter we marked `avoid` scores the bad column, a
 * `favour` one the good column, and a neutral one the midpoint of the two. With
 * no preferences recorded we read the Defender role instead — they declare the
 * layout, so our Defender means a table that suits us and theirs one that
 * doesn't. Roll-off tables on an unrated letter imply neither.
 */
function qualityOf(row: BoardRow, ours: Player, theirs: Player): TableColumn | null {
  const letter = row.matchup?.layout.value
  const layouts = readEstimate(estimates.value, ours.id, theirs.id).layouts
  if (letter && layouts && Object.keys(layouts).length > 0) {
    const stance = layouts[letter]
    return stance === 'avoid' ? 'bad' : stance === 'favour' ? 'good' : 'neutral'
  }
  if (ourSlot(row)?.role === 'defender') return 'good'
  if (oppSlot(row)?.role === 'defender') return 'bad'
  return null
}

interface SettledTable {
  key: string
  ours: Player
  theirs: Player
  quality: TableColumn | null
  grade: EstimateGrade | null
  bp: number | null
}

const settled = computed<SettledTable[]>(() =>
  settledRows.value.map((row) => {
    const ours = ourSlot(row)!.player
    const theirs = oppSlot(row)!.player
    const quality = qualityOf(row, ours, theirs)
    const cell = readEstimate(estimates.value, ours.id, theirs.id)
    // With no implied column, fall back to the neutral one — the midpoint of the
    // two estimates — and the panel flags it as a roll-off rather than assuming
    // the table suits us.
    const column = quality ?? 'neutral'
    return {
      key: `${ours.id}|${theirs.id}`,
      ours,
      theirs,
      quality,
      grade: columnGrade(cell, column),
      bp: columnBp(cell, column),
    }
  }),
)

const lockedIds = computed(() => new Set(settled.value.flatMap((t) => [t.ours.id, t.theirs.id])))

/** Everyone still up for grabs — the only rows worth reading mid-pairing. */
const ourOpen = computed(() => ourTeam.value.players.filter((p) => !lockedIds.value.has(p.id)))
const oppOpen = computed(() => oppTeam.value.players.filter((p) => !lockedIds.value.has(p.id)))

const graded = computed(() => settled.value.filter((t) => t.bp !== null))
const ourBp = computed(() => graded.value.reduce((n, t) => n + t.bp!, 0))
const oppBp = computed(() => graded.value.length * 20 - ourBp.value)
const margin = computed(() => ourBp.value - oppBp.value)
const threshold = computed(() => bpWinThreshold(props.state.config.teamA.players.length))
const verdict = computed(() =>
  margin.value >= threshold.value ? 'win' : margin.value <= -threshold.value ? 'loss' : 'draw',
)
const verdictLabel = computed(
  () => ({ win: 'Winning', draw: 'Drawing', loss: 'Losing' })[verdict.value],
)

const qualities: TableQuality[] = ['good', 'bad']

function cellGrade(our: Player, opp: Player, quality: TableQuality) {
  return readEstimate(estimates.value, our.id, opp.id)[quality]
}

function disp(player: Player): Disposition | null {
  return player.disposition ? getDisposition(player.disposition) : null
}

function dispAccent(key: DispositionKey) {
  return {
    '--accent': `var(--color-disposition-${key})`,
    '--accent-tint': `var(--color-disposition-${key}-tint)`,
  }
}
</script>

<template>
  <aside class="drawer" aria-label="Matchup estimates">
    <header class="drawer-head">
      <div>
        <p class="drawer-eyebrow">Estimates</p>
        <h2 class="drawer-title">{{ ourTeam.name }}</h2>
      </div>
      <button type="button" class="drawer-close" aria-label="Hide estimates" @click="emit('close')">
        ✕
      </button>
    </header>

    <div class="drawer-body">
      <section class="block open-block">
        <h3 class="block-title">Still open</h3>
        <p v-if="!ourOpen.length" class="empty">Every table is settled.</p>
        <div v-else class="scroller">
          <table class="matrix" :style="{ '--cols': oppOpen.length }">
            <thead>
              <tr>
                <th scope="col" class="corner"></th>
                <th
                  v-for="opp in oppOpen"
                  :key="opp.id"
                  scope="col"
                  class="col-head"
                  :class="{ proposed: proposedOppIds.has(opp.id) }"
                >
                  <span class="col-head-inner">
                    <span class="tile">
                      <img
                        v-if="opp.faction"
                        :src="`/images/factions/${opp.faction}.webp`"
                        :alt="factionName(opp.faction)"
                        width="24"
                        height="24"
                        loading="lazy"
                      />
                      <span v-else aria-hidden="true">·</span>
                    </span>
                    <span
                      v-if="disp(opp)"
                      class="disp-badge"
                      :style="dispAccent(disp(opp)!.key)"
                      :title="disp(opp)!.name"
                    >
                      <DispositionIcon :symbol="disp(opp)!.symbol" />
                    </span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="our in ourOpen" :key="our.id">
                <th
                  scope="row"
                  class="row-head"
                  :class="{ proposed: proposedOurIds.has(our.id) }"
                >
                  <span class="row-head-inner">
                    <span class="tile" :title="factionName(our.faction)">
                      <img
                        v-if="our.faction"
                        :src="`/images/factions/${our.faction}.webp`"
                        :alt="factionName(our.faction)"
                        width="24"
                        height="24"
                        loading="lazy"
                      />
                      <span v-else aria-hidden="true">·</span>
                    </span>
                    <span
                      v-if="disp(our)"
                      class="disp-badge"
                      :style="dispAccent(disp(our)!.key)"
                      :title="disp(our)!.name"
                    >
                      <DispositionIcon :symbol="disp(our)!.symbol" />
                    </span>
                  </span>
                </th>
                <td
                  v-for="opp in oppOpen"
                  :key="opp.id"
                  class="cell"
                  :class="{ proposed: proposedKeys.has(`${our.id}|${opp.id}`) }"
                >
                  <span class="cell-inner">
                    <GradeChip
                      v-for="quality in qualities"
                      :key="quality"
                      :grade="cellGrade(our, opp, quality)"
                    />
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="hint">Left chip = a table that suits you, right = one that doesn't.</p>
      </section>

      <!-- The estimate each already-decided match-up scores, so the running tally
           is auditable table by table. -->
      <section v-if="settled.length" class="block">
        <h3 class="block-title">Settled ({{ settled.length }})</h3>
        <ul class="settled-list">
          <li v-for="t in settled" :key="t.key" class="settled-row">
            <span class="tile">
              <img
                v-if="t.ours.faction"
                :src="`/images/factions/${t.ours.faction}.webp`"
                :alt="factionName(t.ours.faction)"
                width="22"
                height="22"
                loading="lazy"
              />
              <span v-else aria-hidden="true">·</span>
            </span>
            <span class="settled-vs">vs</span>
            <span class="tile">
              <img
                v-if="t.theirs.faction"
                :src="`/images/factions/${t.theirs.faction}.webp`"
                :alt="factionName(t.theirs.faction)"
                width="22"
                height="22"
                loading="lazy"
              />
              <span v-else aria-hidden="true">·</span>
            </span>
            <span class="settled-quality" :class="t.quality ?? 'rolloff'">
              {{
                t.quality === 'good'
                  ? 'our table'
                  : t.quality === 'bad'
                    ? 'their table'
                    : t.quality === 'neutral'
                      ? 'neutral table'
                      : 'roll-off'
              }}
            </span>
            <GradeChip :grade="t.grade" />
            <span class="settled-bp">{{ t.bp !== null ? `${t.bp} BP` : '—' }}</span>
          </li>
        </ul>
      </section>
    </div>

    <footer class="drawer-foot" :class="verdict">
      <div class="tally">
        <span class="tally-bp">{{ ourBp }} – {{ oppBp }}</span>
        <span class="tally-verdict">{{ verdictLabel }}</span>
      </div>
      <p class="tally-note">
        {{ graded.length }} of {{ ourTeam.players.length }} tables estimated · needs a
        {{ threshold }} BP margin to win
      </p>
    </footer>
  </aside>
</template>

<style scoped>
/* An in-flow card in the live layout's right column, beside the board. It is
   one team's private prep, so the header carries a hide button that collapses
   it (the device is passed between captains). */
.drawer {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.drawer-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-hairline);
}

.drawer-eyebrow {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-primary);
}

.drawer-title {
  font-size: 20px;
  letter-spacing: -0.3px;
}

.drawer-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-hairline);
  background: var(--color-canvas);
  color: var(--color-muted);
  font-size: 13px;
  cursor: pointer;
  flex-shrink: 0;
}

.drawer-close:hover {
  color: var(--color-ink);
}

.drawer-body {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.block {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 0;
}

.block-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-muted);
}

.empty,
.hint {
  font-size: 12px;
  color: var(--color-muted-soft);
}

.scroller {
  overflow-x: auto;
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-md);
  background: var(--color-canvas);
}

/* Fixed layout, not auto: with auto the row-head column grows to whatever the
   longest faction name needs (~170px) and squeezes the opponent columns out of
   the rail. Fixed pins it and lets the names ellipsise instead.
   The min-width is the table's honest width for the columns still in play (set
   from the column count on the element) — under it the scroller takes over
   rather than crushing the chips, and as the pairing settles players out the
   remaining columns fit the rail on their own. */
.matrix {
  border-collapse: collapse;
  width: 100%;
  min-width: calc(68px + var(--cols, 6) * 56px);
  table-layout: fixed;
}

/* Just wide enough for the row's logo and Disposition badge — the faction names
   are gone from the grid, so the row header stays a compact identifier. */
.corner {
  width: 68px;
}

.col-head {
  padding: var(--spacing-xxs);
  border-left: 1px solid var(--color-hairline-soft);
  background: var(--color-surface-soft);
}

/* Opponent identity reads on one line — logo then Disposition badge — rather
   than stacked, matching the row heads down the left edge. */
.col-head-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.row-head {
  padding: 2px var(--spacing-xs);
  border-top: 1px solid var(--color-hairline-soft);
  background: var(--color-surface-soft);
  text-align: center;
}

.row-head-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xxs);
}

.cell {
  padding: 2px;
  border-left: 1px solid var(--color-hairline-soft);
  border-top: 1px solid var(--color-hairline-soft);
}

.cell-inner {
  display: flex;
  gap: 2px;
  justify-content: center;
}

/* The tables in play while a Defender's opponent is being counter-picked: each
   proposed pairing's estimate lights up so the live choice reads at a glance.
   The header tint marks the players involved; the cell ring points at the
   grades that actually decide the pick. */
.col-head.proposed,
.row-head.proposed {
  background: var(--color-primary-tint);
  color: var(--color-primary);
}

.cell.proposed {
  background: var(--color-primary-tint);
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

/* Sized for legibility now the rail is wider — a six/seven-a-side round's
   columns all fit, and an eight overflows into the scroller. */
.cell-inner :deep(.grade) {
  min-width: 22px;
  padding: 2px 4px;
  font-size: 11px;
}

.tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-xs);
  background: var(--color-surface-card);
  flex-shrink: 0;
}

.tile img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.disp-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 2px;
  border-radius: var(--radius-xs);
  background: var(--accent-tint);
  color: var(--accent);
  flex-shrink: 0;
}

.disp-badge :deep(svg) {
  width: 14px;
  height: 14px;
}

.settled-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs);
}

.settled-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xxs) var(--spacing-xs);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-md);
  background: var(--color-canvas);
}

.settled-vs {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-muted-soft);
}

.settled-quality {
  flex: 1;
  min-width: 0;
  font-size: 11px;
  color: var(--color-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.settled-quality.rolloff {
  font-style: italic;
}

.settled-bp {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-body);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.drawer-foot {
  padding: var(--spacing-sm) var(--spacing-md);
  border-top: 1px solid var(--color-hairline);
  background: var(--color-surface-soft);
}

.tally {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
}

.tally-bp {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 500;
  letter-spacing: -0.5px;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
}

.tally-verdict {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.drawer-foot.win .tally-verdict {
  color: var(--color-grade-gw);
}

.drawer-foot.draw .tally-verdict {
  color: var(--color-warning);
}

.drawer-foot.loss .tally-verdict {
  color: var(--color-error);
}

.tally-note {
  margin-top: 2px;
  font-size: 11px;
  color: var(--color-muted);
}

@media (max-width: 720px) {
  .drawer-head,
  .drawer-body {
    padding: var(--spacing-sm);
  }

  .drawer-close {
    width: 40px;
    height: 40px;
  }

  .drawer-foot {
    padding: var(--spacing-sm);
  }
}
</style>
