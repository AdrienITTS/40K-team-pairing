<script setup lang="ts">
import { computed } from 'vue'
import GradeChip from './GradeChip.vue'
import DispositionIcon from '../DispositionIcon.vue'
import { factionName } from '../../data/factions'
import { getDisposition, type Disposition, type DispositionKey } from '../../data/dispositions'
import type { LayoutLetter, Player } from '../../data/pairing'
import {
  cycleLayoutStance,
  estimateGrades,
  gradeSlug,
  readEstimate,
  writeEstimate,
  writeLayoutStance,
  type EstimateGrade,
  type EstimateTable,
  type LayoutStance,
  type TableQuality,
} from '../../data/estimates'

const props = defineProps<{
  /** The estimating team's lists — one row each. */
  ourPlayers: Player[]
  /** The opposing team's lists — one column each. */
  oppPlayers: Player[]
}>()

const table = defineModel<EstimateTable>({ required: true })

const qualities: TableQuality[] = ['good', 'bad']

const qualityLabels: Record<TableQuality, string> = {
  good: 'on a table that suits us',
  bad: "on a table that doesn't",
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

function grade(our: Player, opp: Player, quality: TableQuality) {
  return readEstimate(table.value, our.id, opp.id)[quality]
}

function setGrade(our: Player, opp: Player, quality: TableQuality, value: string) {
  const next = (value || null) as EstimateGrade | null
  table.value = writeEstimate(table.value, our.id, opp.id, quality, next)
}

// The select doubles as the grade chip: the band colour rides in as a custom
// property, the same way GradeChip does it, so no band is named in CSS here.
function gradeAccent(g: EstimateGrade | null) {
  return g
    ? {
        '--grade': `var(--color-grade-${gradeSlug(g)})`,
        '--grade-fg': `var(--color-grade-${gradeSlug(g)}-fg)`,
      }
    : undefined
}

function cellLabel(our: Player, opp: Player, quality: TableQuality): string {
  const current = grade(our, opp, quality)
  return `${factionName(our.faction)} vs ${factionName(opp.faction)} ${qualityLabels[quality]} — ${
    current ?? 'not set'
  }`
}

// --- Layout stances: which of the matchup's three tables we want -------------

const letters: LayoutLetter[] = ['A', 'B', 'C']

const stanceLabels: Record<LayoutStance, string> = {
  favour: 'want to play on',
  avoid: 'want to avoid',
}

function stance(our: Player, opp: Player, letter: LayoutLetter): LayoutStance | undefined {
  return readEstimate(table.value, our.id, opp.id).layouts?.[letter]
}

function stepStance(our: Player, opp: Player, letter: LayoutLetter) {
  const next = cycleLayoutStance(stance(our, opp, letter))
  table.value = writeLayoutStance(table.value, our.id, opp.id, letter, next)
}

function stanceLabel(our: Player, opp: Player, letter: LayoutLetter): string {
  const s = stance(our, opp, letter)
  const verdict = s ? stanceLabels[s] : 'no preference'
  return `${factionName(our.faction)} vs ${factionName(opp.faction)}, layout ${letter} — ${verdict}`
}

const filled = computed(() =>
  props.ourPlayers.reduce(
    (n, our) =>
      n +
      props.oppPlayers.reduce((m, opp) => {
        const cell = readEstimate(table.value, our.id, opp.id)
        return m + (cell.good ? 1 : 0) + (cell.bad ? 1 : 0)
      }, 0),
    0,
  ),
)

const total = computed(() => props.ourPlayers.length * props.oppPlayers.length * 2)
</script>

<template>
  <div class="estimate-grid">
    <div class="scroller">
      <table class="grid">
        <thead>
          <tr>
            <th scope="col" class="corner">
              <span class="corner-label">our list ↓ / theirs →</span>
            </th>
            <th v-for="opp in oppPlayers" :key="opp.id" scope="col" class="col-head">
              <span class="col-head-inner">
                <span class="head-tile">
                  <img
                    v-if="opp.faction"
                    :src="`/images/factions/${opp.faction}.webp`"
                    :alt="factionName(opp.faction)"
                    width="28"
                    height="28"
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
                <span class="head-name">{{ factionName(opp.faction) }}</span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="our in ourPlayers" :key="our.id">
            <th scope="row" class="row-head">
              <span class="row-head-inner">
                <span class="head-tile">
                  <img
                    v-if="our.faction"
                    :src="`/images/factions/${our.faction}.webp`"
                    :alt="factionName(our.faction)"
                    width="28"
                    height="28"
                    loading="lazy"
                  />
                  <span v-else aria-hidden="true">·</span>
                </span>
                <span class="row-name">{{ factionName(our.faction) }}</span>
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
            <td v-for="opp in oppPlayers" :key="opp.id" class="cell">
              <div class="cell-inner">
                <select
                  v-for="quality in qualities"
                  :key="quality"
                  class="pick"
                  :class="[quality, { blank: !grade(our, opp, quality) }]"
                  :style="gradeAccent(grade(our, opp, quality))"
                  :value="grade(our, opp, quality) ?? ''"
                  :aria-label="cellLabel(our, opp, quality)"
                  :title="cellLabel(our, opp, quality)"
                  @change="setGrade(our, opp, quality, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="">–</option>
                  <option v-for="g in estimateGrades" :key="g.key" :value="g.key">
                    {{ g.key }}
                  </option>
                </select>
              </div>
              <!-- Which of this matchup's three terrain layouts land in which
                   column. Each letter cycles neutral → want → avoid. -->
              <div class="cell-layouts">
                <button
                  v-for="letter in letters"
                  :key="letter"
                  type="button"
                  class="layout-pick"
                  :class="stance(our, opp, letter) ?? 'neutral'"
                  :aria-label="stanceLabel(our, opp, letter)"
                  :title="stanceLabel(our, opp, letter)"
                  @click="stepStance(our, opp, letter)"
                >
                  {{ letter }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="grid-foot">
      <p class="progress">{{ filled }} / {{ total }} estimates set</p>
      <ul class="legend">
        <li v-for="g in estimateGrades" :key="g.key" class="legend-item">
          <GradeChip :grade="g.key" />
          <span class="legend-text">
            {{ g.name }} · {{ g.band[0] }}–{{ g.band[1] }}<span class="legend-unit">BP</span>
          </span>
        </li>
        <li class="legend-item">
          <span class="layout-pick favour" aria-hidden="true">A</span>
          <span class="legend-text">Layout we want</span>
        </li>
        <li class="legend-item">
          <span class="layout-pick avoid" aria-hidden="true">A</span>
          <span class="legend-text">Layout we'd avoid</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.estimate-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

/* Eight opposing lists × two columns each outruns most viewports, so the table
   scrolls inside its own box rather than pushing the page sideways. */
.scroller {
  overflow-x: auto;
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  background: var(--color-canvas);
}

.grid {
  border-collapse: collapse;
  width: 100%;
}

/* The row-header column is pinned so the faction you're grading stays on screen
   while the opponent columns scroll past it (same treatment as the Analysis
   matrix). Both pinned cells need an opaque background to scroll cleanly over. */
.corner,
.row-head {
  position: sticky;
  left: 0;
  z-index: 1;
}

.corner {
  text-align: left;
  padding: var(--spacing-xs);
  vertical-align: bottom;
  min-width: 150px;
  z-index: 2;
}

.corner-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-muted-soft);
}

.col-head {
  padding: var(--spacing-xs) var(--spacing-xxs);
  border-left: 1px solid var(--color-hairline-soft);
  vertical-align: bottom;
}

.col-head,
.row-head {
  background: var(--color-surface-soft);
}

.col-head {
  text-align: center;
}

.head-tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-card);
  flex-shrink: 0;
}

.head-tile img {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.col-head-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.head-name {
  max-width: 84px;
  font-size: 10px;
  font-weight: 500;
  line-height: 1.25;
  color: var(--color-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-head {
  padding: var(--spacing-xxs) var(--spacing-xs);
  border-top: 1px solid var(--color-hairline-soft);
  text-align: left;
  min-width: 150px;
}

.row-head-inner {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.row-name {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.disp-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 3px;
  border-radius: var(--radius-xs);
  background: var(--accent-tint);
  color: var(--accent);
  flex-shrink: 0;
}

.disp-badge :deep(svg) {
  width: 14px;
  height: 14px;
}

/* A cell is two rows: the grades (left = the good table, right = the bad one,
   the same reading as the source spreadsheet) over the three layout letters that
   decide which of the two a given table turns out to be. */
.cell {
  padding: 2px;
  border-left: 1px solid var(--color-hairline-soft);
  border-top: 1px solid var(--color-hairline-soft);
}

.cell-inner {
  display: flex;
  gap: 2px;
}

.cell-layouts {
  display: flex;
  gap: 2px;
  margin-top: 2px;
}

/* The pick is a native select styled as a grade chip: one click and one more to
   set a cell, which beats stepping through seven grades when a whole matrix has
   to be filled in. Appearance is stripped (arrow included) so it reads as the
   same chip the rail and the projection show. */
.pick {
  flex: 1;
  min-width: 0;
  appearance: none;
  padding: 3px 2px;
  border: none;
  border-radius: var(--radius-xs);
  background: var(--grade);
  color: var(--grade-fg);
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.02em;
  text-align: center;
  text-align-last: center;
  cursor: pointer;
}

.pick.blank {
  background: none;
  box-shadow: inset 0 0 0 1px var(--color-hairline);
  color: var(--color-muted-soft);
  font-weight: 500;
}

.pick.blank:hover {
  background: var(--color-surface-soft);
}

.pick:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -1px;
}

/* Tri-state layout letters. They borrow the W and L grade bands rather than
   inventing tokens: a favoured layout is literally the one that puts this table
   on the victory column, and an avoided one puts it on the loss column. */
.layout-pick {
  flex: 1;
  min-width: 0;
  padding: 2px 0;
  border: none;
  border-radius: var(--radius-xs);
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 700;
  line-height: 1.4;
  cursor: pointer;
}

.layout-pick.neutral {
  background: none;
  box-shadow: inset 0 0 0 1px var(--color-hairline);
  color: var(--color-muted-soft);
  font-weight: 500;
}

.layout-pick.neutral:hover {
  background: var(--color-surface-soft);
  color: var(--color-body);
}

.layout-pick.favour {
  background: var(--color-grade-w);
  color: var(--color-grade-w-fg);
}

.layout-pick.avoid {
  background: var(--color-grade-l);
  color: var(--color-grade-l-fg);
}

.layout-pick:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -1px;
}

/* The legend swatches reuse the button classes but are plain spans. */
.legend-item .layout-pick {
  flex: none;
  min-width: 22px;
  padding: 2px 5px;
  cursor: default;
}

/* The dropdown list is drawn by the platform, so give it readable defaults
   rather than inheriting the chip's band colour. */
.pick option {
  background: var(--color-canvas);
  color: var(--color-ink);
  font-weight: 500;
}

.grid-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-xs) var(--spacing-md);
}

.progress {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-muted);
  white-space: nowrap;
}

.legend {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs) var(--spacing-sm);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xxs);
}

.legend-text {
  font-size: 11px;
  color: var(--color-muted);
  white-space: nowrap;
}

.legend-unit {
  margin-left: 2px;
}

/* On a phone the matrix is always wider than the screen, so it becomes a
   horizontally-scrolling table with the faction column pinned (already sticky
   above). The row header narrows to just the logo and disposition badge — the
   name would eat the width the actual controls need — and every control grows
   to a finger-sized target. */
@media (max-width: 720px) {
  .corner,
  .row-head {
    min-width: 0;
  }

  .corner-label {
    display: none;
  }

  .row-name {
    display: none;
  }

  .head-name {
    max-width: 60px;
  }

  .head-tile {
    width: 28px;
    height: 28px;
  }

  .head-tile img {
    width: 24px;
    height: 24px;
  }

  .pick {
    min-width: 42px;
    padding: 8px 2px;
    font-size: 12px;
  }

  .layout-pick {
    min-width: 26px;
    padding: 7px 0;
    font-size: 11px;
  }

  .legend-item .layout-pick {
    padding: 2px 5px;
  }

  .grid-foot {
    gap: var(--spacing-xs);
  }
}
</style>
