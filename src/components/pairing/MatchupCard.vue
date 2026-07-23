<script setup lang="ts">
import { computed } from 'vue'
import { moduleLabel, type LayoutLetter, type Matchup } from '../../data/pairing'
import { factionName } from '../../data/factions'
import { getDisposition, type Disposition, type DispositionKey } from '../../data/dispositions'
import type { ProjectedTable } from '../../data/estimates'
import DispositionIcon from '../DispositionIcon.vue'
import GradeChip from './GradeChip.vue'

const props = defineProps<{
  matchup: Matchup
  teamAName: string
  teamBName: string
  index: number
  /** This table's projected estimate, when the round was set up with estimates. */
  projection?: ProjectedTable
}>()

// How the projected grade was arrived at — the same reasoning the summary card
// gives, surfaced here as the estimate's tooltip.
const estimateTitle = computed(() => {
  const p = props.projection
  if (!p || !p.grade) return 'No estimate was recorded for this table'
  switch (p.source) {
    case 'layout':
      return 'Scored on the column you rated for this layout'
    case 'defender':
      return "Scored from the Defender role — you didn't rate this layout"
    default:
      return "The round's fixed layout, and one you didn't rate — assumed to suit you"
  }
})

interface ViewLayoutRequest {
  a: DispositionKey
  b: DispositionKey
  letter: LayoutLetter
  /** Refused/Champion tables play one fixed layout — no A/B/C browsing. */
  fixed: boolean
}

const emit = defineEmits<{
  layout: [value: LayoutLetter]
  viewLayout: [request: ViewLayoutRequest]
}>()

const layouts: LayoutLetter[] = ['A', 'B', 'C']

// The terrain layouts are set by the two players' Dispositions, so a map is
// only available once both are assigned (Dispositions are optional in setup).
const dispositionPair = computed(() => {
  const a = props.matchup.playerA.disposition
  const b = props.matchup.playerB.disposition
  return a && b ? { a, b } : null
})

function viewLayout() {
  const pair = dispositionPair.value
  if (!pair) return
  const { layout } = props.matchup
  emit('viewLayout', { ...pair, letter: layout.value ?? 'A', fixed: layout.kind === 'fixed' })
}

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

// Each player's Force Disposition (or null), shown beside their role.
function dispOf(key: DispositionKey | null | undefined): Disposition | null {
  return key ? getDisposition(key) : null
}
const dispA = computed(() => dispOf(props.matchup.playerA.disposition))
const dispB = computed(() => dispOf(props.matchup.playerB.disposition))

function dispAccent(key: DispositionKey) {
  return {
    '--accent': `var(--color-disposition-${key})`,
    '--accent-tint': `var(--color-disposition-${key}-tint)`,
  }
}
</script>

<template>
  <article class="matchup">
    <header class="matchup-head">
      <span class="table-no">Table {{ index }}</span>
      <span class="head-meta">
        <span class="module-badge">{{ moduleLabel(matchup.module) }}</span>
        <span v-if="projection" class="estimate" :title="estimateTitle">
          <template v-if="projection.grade">
            <GradeChip :grade="projection.grade" />
            <span class="est-bp">{{ projection.bp }} BP</span>
          </template>
          <span v-else class="est-none">No estimate</span>
        </span>
      </span>
    </header>

    <!-- Both players are full-width rows with an identical column grid (logo ·
         name · role · disposition), so every label lines up between the two and
         faction names get the whole row rather than a cramped half-column. -->
    <div class="players">
      <div class="prow side-a">
        <span class="sr-only">{{ teamAName }}</span>
        <div class="logo-tile">
          <img
            v-if="matchup.playerA.faction"
            :src="`/images/factions/${matchup.playerA.faction}.webp`"
            :alt="matchup.playerA.faction"
            width="34"
            height="34"
            loading="lazy"
          />
          <span v-else class="logo-fallback">·</span>
        </div>
        <span class="prow-name">{{ factionName(matchup.playerA.faction) }}</span>
        <span class="prow-role" :class="roleA ? `role-${roleA.toLowerCase()}` : ''">{{
          roleA
        }}</span>
        <span
          class="prow-disp"
          :style="dispA ? dispAccent(dispA.key) : undefined"
          :title="dispA?.name"
        >
          <template v-if="dispA"
            ><DispositionIcon :symbol="dispA.symbol" /><span class="disp-name">{{
              dispA.name
            }}</span></template
          >
        </span>
      </div>

      <div class="prow side-b">
        <span class="sr-only">{{ teamBName }}</span>
        <div class="logo-tile">
          <img
            v-if="matchup.playerB.faction"
            :src="`/images/factions/${matchup.playerB.faction}.webp`"
            :alt="matchup.playerB.faction"
            width="34"
            height="34"
            loading="lazy"
          />
          <span v-else class="logo-fallback">·</span>
        </div>
        <span class="prow-name">{{ factionName(matchup.playerB.faction) }}</span>
        <span class="prow-role" :class="roleB ? `role-${roleB.toLowerCase()}` : ''">{{
          roleB
        }}</span>
        <span
          class="prow-disp"
          :style="dispB ? dispAccent(dispB.key) : undefined"
          :title="dispB?.name"
        >
          <template v-if="dispB"
            ><DispositionIcon :symbol="dispB.symbol" /><span class="disp-name">{{
              dispB.name
            }}</span></template
          >
        </span>
      </div>
    </div>

    <footer class="matchup-foot">
      <div class="foot-main">
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
      </div>

      <button v-if="dispositionPair" type="button" class="view-layout" @click="viewLayout">
        View layout →
      </button>
    </footer>
  </article>
</template>

<style scoped>
.matchup {
  /* Queried below: how much a card can show depends on the grid track it landed
     in, not on the viewport — the results grid runs anywhere from one column to
     four at the same window width as the round grows. */
  container-type: inline-size;
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.matchup-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.table-no {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-ink);
}

.head-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
}

.module-badge {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-muted);
}

/* The table's projected grade + BP, read from the same round projection the
   summary card totals — the per-table detail now lives on its own card. */
.estimate {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xxs);
  flex-shrink: 0;
}

.est-bp {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-body);
  font-variant-numeric: tabular-nums;
}

.est-none {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-muted-soft);
}

/* Shared 4-track grid: the two player rows use `subgrid` so their logo / name /
   role / disposition columns line up with each other. */
.players {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  column-gap: var(--spacing-sm);
  row-gap: var(--spacing-xxs);
}

.prow {
  position: relative;
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  align-items: center;
  padding: var(--spacing-xxs) var(--spacing-sm) var(--spacing-xxs) var(--spacing-xs);
  border-left: 3px solid transparent;
  border-radius: var(--radius-sm);
}

/* Team identity: a coloured left edge with a matching tint fading inward. */
.prow.side-a {
  border-left-color: var(--color-accent-teal);
  background: linear-gradient(90deg, var(--color-accent-teal-tint), transparent 55%);
}

.prow.side-b {
  border-left-color: var(--color-accent-amber);
  background: linear-gradient(90deg, var(--color-accent-amber-tint), transparent 55%);
}

.logo-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-canvas);
  flex-shrink: 0;
}

.logo-tile img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.side-a .logo-tile {
  background: var(--color-accent-teal-tint);
}

.side-b .logo-tile {
  background: var(--color-accent-amber-tint);
}

.logo-fallback {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-muted);
}

/* Full row width now, so the name stays on one line and truncates only in the
   rare extreme rather than wrapping unpredictably to two. */
.prow-name {
  min-width: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prow-role {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.prow-disp {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  white-space: nowrap;
}

.prow-disp :deep(svg) {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
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

.matchup-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-xs);
  border-top: 1px solid var(--color-hairline-soft);
}

.foot-main {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
}

.foot-label {
  font-size: 12px;
  color: var(--color-muted);
  white-space: nowrap;
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

.view-layout {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  white-space: nowrap;
}

.view-layout:hover,
.view-layout:focus-visible {
  color: var(--color-primary-active);
  text-decoration: underline;
}

/* Fallback for engines without `subgrid`: fall back to a flat flex row so the
   layout stays clean (columns just won't share widths between the two rows). */
@supports not (grid-template-columns: subgrid) {
  .prow {
    display: flex;
    gap: var(--spacing-sm);
  }

  .prow-name {
    flex: 1;
  }
}

/* The Disposition name costs more width than the army it sits beside, and its
   symbol already carries the meaning (with the full name on the title), so once
   the card is narrow — a phone, or a four-up results grid — only the glyph
   stays and the faction name gets the room back. */
@container (max-width: 400px) {
  .disp-name {
    display: none;
  }
}

@media (max-width: 720px) {
  .matchup {
    padding: var(--spacing-sm);
  }

  .players {
    column-gap: var(--spacing-xs);
  }

  .prow {
    padding-right: var(--spacing-xs);
  }

  .matchup-foot {
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }

  .layout-btn {
    width: 36px;
    height: 36px;
  }

  .view-layout {
    padding: 6px 0;
  }
}
</style>
