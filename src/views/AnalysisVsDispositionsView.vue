<script setup lang="ts">
import { computed, ref } from 'vue'
import { dispositions, dispositionName, type DispositionKey } from '../data/dispositions'
import { primaryMissions } from '../data/primaries'
import {
  dispositionAnalysis,
  dispositionAnalyses,
  matchupAnalysis,
  analysisSource,
} from '../data/analysis'
import DispositionIcon from '../components/DispositionIcon.vue'
import ProseBlocks from '../components/ProseBlocks.vue'

// Inline custom-property bindings keep the disposition accent a base.css token
// reference rather than a hardcoded literal in the SFC.
const dispAccent = (key: DispositionKey) => ({
  '--disp': `var(--color-disposition-${key})`,
  '--disp-tint': `var(--color-disposition-${key}-tint)`,
})

const symbolOf = (key: DispositionKey) => dispositions.find((d) => d.key === key)!.symbol

// A five-band diverging scale: 3 is an even matchup, higher favours the player
// whose row it is, lower is against them.
function ratingBand(r: number): 'verylow' | 'low' | 'even' | 'high' | 'veryhigh' {
  if (r < 2) return 'verylow'
  if (r < 2.75) return 'low'
  if (r <= 3.25) return 'even'
  if (r <= 4) return 'high'
  return 'veryhigh'
}
const cellVars = (r: number) => ({
  '--cell-bg': `var(--color-rating-${ratingBand(r)})`,
  '--cell-fg': `var(--color-rating-${ratingBand(r)}-fg)`,
})

// The Primary Mission `you` plays against `faced` (for the detailed section).
const missionName = (you: DispositionKey, faced: DispositionKey) =>
  primaryMissions.find((p) => p.you === you && p.faced === faced)?.name ?? ''

// Detailed pair selection. Defaults to the first two Dispositions; a table cell
// or the pickers set both.
const selYou = ref<DispositionKey>('take-and-hold')
const selFaced = ref<DispositionKey>('purge-the-foe')
const isMirror = computed(() => selYou.value === selFaced.value)

function selectPair(you: DispositionKey, faced: DispositionKey) {
  selYou.value = you
  selFaced.value = faced
  document.getElementById('detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// One direction of the selected matchup, resolved for the template.
const detail = (you: DispositionKey, faced: DispositionKey) => ({
  you,
  mission: missionName(you, faced),
  ...matchupAnalysis(you, faced),
  reviewUrl: dispositionAnalysis[you].reviewUrl,
})

// Both directions of the selected pair (one for a mirror), most-relevant first.
const directions = computed(() =>
  isMirror.value
    ? [detail(selYou.value, selFaced.value)]
    : [detail(selYou.value, selFaced.value), detail(selFaced.value, selYou.value)],
)
</script>

<template>
  <main class="analysis">
    <section class="hero">
      <p class="badge-pill">Warhammer 40,000 · Teams Event</p>
      <h1>Dispositions, head to head</h1>
      <p class="lede">
        How does each Force Disposition fare against the others? These ratings come from
        <a :href="dispositionAnalysis['take-and-hold'].reviewUrl" target="_blank" rel="noopener">
          {{ analysisSource.name }}</a
        >' 11th-edition Force Disposition reviews, which score each of a Disposition's five missions
        on a <strong>1–5</strong> scale (5 favours you, 1 is an uphill climb). Ratings are read
        <strong>from the row Disposition's point of view</strong>, so a matchup isn't necessarily
        the mirror of its opposite.
      </p>
    </section>

    <!-- Global matrix -->
    <section class="matrix-section">
      <div class="matrix-head">
        <h2>The matchup grid</h2>
        <ul class="legend" aria-label="Rating scale">
          <li><span class="swatch" :style="cellVars(1.5)"></span>Against</li>
          <li><span class="swatch" :style="cellVars(3)"></span>Even</li>
          <li><span class="swatch" :style="cellVars(5)"></span>Favoured</li>
        </ul>
      </div>
      <p class="matrix-hint">
        Read a row as “when I play this Disposition, here's how each opponent feels.” Tap any cell
        for the full breakdown.
      </p>

      <div class="matrix-scroll">
        <table class="matrix">
          <thead>
            <tr>
              <th class="corner" scope="col"><span class="corner-you">You play ↓</span></th>
              <th
                v-for="d in dispositions"
                :key="d.key"
                scope="col"
                class="col-head"
                :style="dispAccent(d.key)"
              >
                <span class="chip"><DispositionIcon :symbol="d.symbol" /></span>
                <span class="col-name">{{ d.name }}</span>
              </th>
              <th class="avg-head" scope="col">Avg</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in dispositionAnalyses" :key="row.you" :style="dispAccent(row.you)">
              <th scope="row" class="row-head">
                <span class="chip filled"><DispositionIcon :symbol="symbolOf(row.you)" /></span>
                <span class="row-name">{{ dispositionName(row.you) }}</span>
              </th>
              <td v-for="m in row.matchups" :key="m.faced" class="cell-wrap">
                <button
                  type="button"
                  class="cell"
                  :class="{
                    selected: selYou === row.you && selFaced === m.faced,
                    mirror: row.you === m.faced,
                  }"
                  :style="cellVars(m.rating)"
                  :aria-label="`${dispositionName(row.you)} versus ${dispositionName(m.faced)}: ${m.rating} out of 5`"
                  @click="selectPair(row.you, m.faced)"
                >
                  {{ m.rating.toFixed(1) }}
                </button>
              </td>
              <td class="avg-cell">{{ row.average.toFixed(1) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Detailed pair breakdown -->
    <section id="detail" class="detail-section">
      <h2>Two Dispositions, up close</h2>

      <div class="pickers">
        <div class="picker">
          <span class="picker-label">You play</span>
          <div class="picker-row" role="group" aria-label="Disposition you play">
            <button
              v-for="d in dispositions"
              :key="d.key"
              type="button"
              class="picker-btn"
              :class="{ active: selYou === d.key }"
              :style="dispAccent(d.key)"
              @click="selYou = d.key"
            >
              <span class="chip"><DispositionIcon :symbol="d.symbol" /></span>
              <span>{{ d.name }}</span>
            </button>
          </div>
        </div>
        <div class="picker">
          <span class="picker-label">Opponent plays</span>
          <div class="picker-row" role="group" aria-label="Disposition your opponent plays">
            <button
              v-for="d in dispositions"
              :key="d.key"
              type="button"
              class="picker-btn"
              :class="{ active: selFaced === d.key }"
              :style="dispAccent(d.key)"
              @click="selFaced = d.key"
            >
              <span class="chip"><DispositionIcon :symbol="d.symbol" /></span>
              <span>{{ d.name }}</span>
            </button>
          </div>
        </div>
      </div>

      <p v-if="isMirror" class="mirror-note">
        A mirror match — both players bring the same stance.
      </p>

      <div class="directions">
        <article
          v-for="dir in directions"
          :key="`${dir.you}-${dir.faced}`"
          class="direction"
          :style="dispAccent(dir.you)"
        >
          <header class="dir-head">
            <span class="dir-pair">
              <span class="chip filled"><DispositionIcon :symbol="symbolOf(dir.you)" /></span>
              <span class="dir-vs">vs</span>
              <span class="chip bordered" :style="dispAccent(dir.faced)">
                <DispositionIcon :symbol="symbolOf(dir.faced)" />
              </span>
            </span>
            <span class="dir-rating" :style="cellVars(dir.rating)">
              {{ dir.rating.toFixed(1) }}<span class="dir-rating-max">/5</span>
            </span>
          </header>

          <p class="dir-title">
            {{ dispositionName(dir.you) }} facing {{ dispositionName(dir.faced) }}
          </p>
          <p v-if="dir.mission" class="dir-mission">
            You play <strong>{{ dir.mission }}</strong>
          </p>

          <p class="dir-verdict">{{ dir.verdict }}</p>

          <!-- Tactics: shown up front, this is the actionable read. -->
          <div class="tips">
            <section class="tip">
              <h3 class="tip-label tip-off">Playing offense</h3>
              <ProseBlocks :text="dir.offense" />
            </section>
            <section class="tip">
              <h3 class="tip-label tip-def">Playing defense</h3>
              <ProseBlocks :text="dir.defense" />
            </section>
          </div>
          <section v-if="dir.listbuilding" class="tip tip-wide">
            <h3 class="tip-label tip-list">Listbuilding</h3>
            <ProseBlocks :text="dir.listbuilding" />
          </section>

          <!-- Scoring maths: deeper detail, collapsed by default. -->
          <details class="scoring">
            <summary>
              <span class="sum-label">How you score</span>
              <span v-if="dir.mission" class="sum-mission">{{ dir.mission }}</span>
            </summary>
            <ProseBlocks :text="dir.scoreYou" />
          </details>
          <details class="scoring">
            <summary>
              <span class="sum-label">How {{ dispositionName(dir.faced) }} scores</span>
            </summary>
            <ProseBlocks :text="dir.scoreOpponent" />
          </details>

          <a class="dir-source" :href="dir.reviewUrl" target="_blank" rel="noopener">
            Full {{ dispositionName(dir.you) }} review ↗
          </a>
        </article>
      </div>
    </section>

    <p class="attribution">
      Ratings, scoring notes and tactics condensed from {{ analysisSource.name }} —
      {{ analysisSource.edition }} Force Disposition reviews. Follow a card's link for the full
      article.
    </p>
  </main>
</template>

<style scoped>
.analysis {
  padding: var(--spacing-xl) var(--spacing-lg) var(--spacing-section);
  max-width: 1100px;
  margin: 0 auto;
}

.hero {
  margin-bottom: var(--spacing-xl);
}

.hero h1 {
  font-size: 48px;
  letter-spacing: -1px;
  margin: var(--spacing-md) 0;
}

.lede {
  font-size: 18px;
  line-height: 1.6;
  color: var(--color-body);
  max-width: 760px;
}

.lede strong {
  color: var(--color-ink);
  font-weight: 600;
}

h2 {
  font-size: 24px;
  letter-spacing: -0.3px;
}

/* --- Matrix --- */
.matrix-section {
  margin-bottom: var(--spacing-xl);
}

.matrix-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.legend {
  list-style: none;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-muted);
}

.legend li {
  display: flex;
  align-items: center;
  gap: var(--spacing-xxs);
}

.swatch {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-xs);
  background: var(--cell-bg);
}

.matrix-hint {
  font-size: 14px;
  color: var(--color-muted);
  margin: var(--spacing-xs) 0 var(--spacing-md);
}

.matrix-scroll {
  overflow-x: auto;
}

.matrix {
  border-collapse: separate;
  border-spacing: 4px;
  width: 100%;
  min-width: 560px;
}

.corner {
  text-align: left;
  vertical-align: bottom;
}

.corner-you {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--color-muted);
}

.col-head,
.avg-head {
  vertical-align: bottom;
  padding-bottom: var(--spacing-xs);
}

.col-head {
  min-width: 88px;
}

.col-name {
  display: block;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.15;
  color: var(--color-body-strong);
  margin-top: 4px;
}

.avg-head {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--color-muted);
}

.row-head {
  text-align: left;
  padding-right: var(--spacing-sm);
  white-space: nowrap;
}

.row-name {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-ink);
  vertical-align: middle;
}

/* Disposition symbol chips (bordered by default, filled on row headers). */
.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 4px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--disp);
  color: var(--disp);
  vertical-align: middle;
}

.chip.filled {
  background: var(--disp);
  border-color: var(--disp);
  color: var(--color-on-primary);
  margin-right: 6px;
}

.col-head .chip {
  margin: 0 auto;
}

.cell {
  display: block;
  width: 100%;
  min-width: 64px;
  padding: var(--spacing-sm) 0;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: var(--cell-bg);
  color: var(--cell-fg);
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.1s ease,
    outline-color 0.1s ease;
}

.cell:hover,
.cell:focus-visible {
  transform: translateY(-1px);
}

.cell.mirror {
  opacity: 0.82;
}

.cell.selected {
  outline: 2.5px solid var(--color-ink);
  outline-offset: 1px;
}

.avg-cell {
  text-align: center;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-ink);
}

/* --- Detailed section --- */
.detail-section {
  border-top: 1px solid var(--color-hairline);
  padding-top: var(--spacing-lg);
}

.pickers {
  display: grid;
  gap: var(--spacing-md);
  margin: var(--spacing-md) 0 var(--spacing-lg);
}

.picker-label {
  display: block;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: var(--spacing-xs);
}

.picker-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.picker-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xxs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-pill);
  background: var(--color-surface-card);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-body);
  cursor: pointer;
  transition:
    border-color 0.12s ease,
    background 0.12s ease;
}

.picker-btn:hover {
  border-color: var(--disp);
}

.picker-btn.active {
  border-color: var(--disp);
  background: var(--disp-tint);
  color: var(--color-ink);
  font-weight: 600;
}

.picker-btn .chip {
  width: 20px;
  height: 20px;
  padding: 3px;
}

.mirror-note {
  font-size: 14px;
  font-style: italic;
  color: var(--color-muted);
  margin-bottom: var(--spacing-md);
}

.directions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.direction {
  border: 1px solid var(--color-hairline);
  border-top: 3px solid var(--disp);
  border-radius: var(--radius-lg);
  background: var(--color-surface-card);
  padding: var(--spacing-lg);
}

.dir-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.dir-pair {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.chip.bordered {
  margin: 0;
}

.dir-vs {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-muted);
}

.dir-rating {
  display: inline-flex;
  align-items: baseline;
  padding: var(--spacing-xxs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  background: var(--cell-bg);
  color: var(--cell-fg);
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
}

.dir-rating-max {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.8;
  margin-left: 1px;
}

.dir-title {
  font-family: var(--font-display);
  font-size: 22px;
  letter-spacing: -0.3px;
  margin-top: var(--spacing-sm);
  color: var(--color-ink);
}

.dir-mission {
  font-size: 13px;
  color: var(--color-muted);
  margin-top: 2px;
}

.dir-mission strong {
  color: var(--color-body-strong);
  font-weight: 600;
}

.dir-verdict {
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-body-strong);
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm) 0 var(--spacing-md);
  border-bottom: 1px solid var(--color-hairline);
  white-space: pre-line;
}

/* Tactics — offense / defense side by side, always visible. */
.tips {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.tip {
  min-width: 0;
}

.tip-wide {
  margin-top: var(--spacing-md);
}

.tip-label {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-bottom: var(--spacing-xs);
  padding-left: var(--spacing-sm);
  border-left: 3px solid var(--color-muted);
  color: var(--color-muted);
}

.tip-off {
  border-left-color: var(--disp);
  color: var(--disp);
}

.tip-def {
  border-left-color: var(--color-primary);
  color: var(--color-primary);
}

.tip-list {
  border-left-color: var(--color-ink);
  color: var(--color-ink);
}

/* Scoring maths — collapsible, opened when the reader wants the numbers. */
.scoring {
  margin-top: var(--spacing-md);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-md);
  background: var(--color-surface-soft);
}

.scoring summary {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  list-style: none;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-ink);
}

.scoring summary::-webkit-details-marker {
  display: none;
}

.scoring summary::before {
  content: '▸';
  color: var(--color-muted);
  transition: transform 0.15s ease;
}

.scoring[open] summary::before {
  transform: rotate(90deg);
}

.sum-mission {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--disp);
}

.scoring :deep(.prose) {
  padding: 0 var(--spacing-md) var(--spacing-md);
}

.dir-source {
  display: inline-block;
  margin-top: var(--spacing-lg);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
}

.attribution {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-hairline);
  font-size: 13px;
  color: var(--color-muted);
}

@media (min-width: 720px) {
  .pickers {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .tips {
    grid-template-columns: 1fr;
  }

  /* Tighten the matrix and pin the row-header column so the Disposition label
     stays visible while the cells scroll horizontally. */
  .matrix {
    min-width: 0;
    border-spacing: 3px;
  }

  .corner,
  .row-head {
    position: sticky;
    left: 0;
    z-index: 1;
    background: var(--color-canvas);
  }

  .row-head {
    padding-right: var(--spacing-xs);
  }

  .row-name {
    font-size: 12px;
  }

  .chip.filled {
    margin-right: 4px;
  }

  .col-head {
    min-width: 52px;
  }

  .col-name {
    font-size: 10px;
  }

  .cell {
    min-width: 46px;
    padding: var(--spacing-xs) 0;
    font-size: 17px;
  }
}

@media (max-width: 560px) {
  .analysis {
    padding: var(--spacing-lg) var(--spacing-md) var(--spacing-xxl);
  }

  .hero h1 {
    font-size: 32px;
  }
}
</style>
