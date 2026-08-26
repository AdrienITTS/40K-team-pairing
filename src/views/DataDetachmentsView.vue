<script setup lang="ts">
import { computed, ref } from 'vue'
import { dispositions, dispositionName, type DispositionKey } from '../data/dispositions'
import { allegiances, factionName } from '../data/factions'
import { detachmentsFor, dispositionLean, dispositionTally, mfmSource } from '../data/detachments'
import DispositionIcon from '../components/DispositionIcon.vue'

// Inline custom-property bindings keep the disposition accent a base.css token
// reference rather than a hardcoded literal in the SFC.
const dispAccent = (key: DispositionKey) => ({
  '--disp': `var(--color-disposition-${key})`,
  '--disp-tint': `var(--color-disposition-${key}-tint)`,
})

const symbolOf = (key: DispositionKey) => dispositions.find((d) => d.key === key)!.symbol

// The faction roster, flattened out of its allegiance grouping and sorted by
// name so the grid reads alphabetically rather than Imperium-first.
const factions = computed(() =>
  allegiances
    .flatMap((a) => a.factions)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name)),
)

const selected = ref<string>('adepta_sororitas')

function selectFaction(key: string) {
  selected.value = key
  document.getElementById('by-faction')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const tally = computed(() => dispositionTally(selected.value))
const detachmentCount = computed(() => detachmentsFor(selected.value).length)

// The richest stances. Ties are common — plenty of factions spread two or three
// Detachments across several stances — so this is a list, not a single winner,
// and the summary line below is worded from its length.
const leaders = computed(() => {
  const top = dispositionLean(selected.value)[0]
  return top ? tally.value.filter((t) => t.count === top.count) : []
})
const isLeader = (key: DispositionKey) => leaders.value.some((t) => t.disposition === key)

/** "Take and Hold" · "Take and Hold and Disruption" · "A, B and C". */
const leaderNames = computed(() => {
  const names = leaders.value.map((t) => dispositionName(t.disposition))
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
})

/**
 * Heat weight for a matrix cell, 0–1. Shares run from roughly 0.07 to 0.4, so
 * the raw value is rescaled to spend the ramp on the range that actually occurs.
 * Capped well below 1 so the cell text keeps its contrast in both themes — the
 * count is drawn in the accent colour, which carries the rest of the signal.
 */
const heat = (share: number) => Math.min(0.34, Math.max(0.04, ((share - 0.05) / 0.3) * 0.34))

// The whole grid, resolved once per faction rather than per cell in the template.
const matrix = computed(() =>
  factions.value.map((faction) => ({
    key: faction.key,
    name: faction.name,
    total: detachmentsFor(faction.key).length,
    cells: dispositionTally(faction.key).map((t) => ({
      ...t,
      style: {
        ...dispAccent(t.disposition),
        '--w': heat(t.share).toFixed(3),
      },
    })),
  })),
)

const totalDetachments = computed(() => matrix.value.reduce((sum, row) => sum + row.total, 0))
</script>

<template>
  <main class="detachments">
    <section class="hero">
      <p class="badge-pill">Warhammer 40,000 · Teams Event</p>
      <h1>Detachments &amp; Dispositions</h1>
      <p class="lede">
        You don't pick a Force Disposition at the table — you inherit it. Every Detachment grants
        one, so the list you wrote weeks ago decides which Primary Missions you can end up playing.
        These are the
        <strong>{{ totalDetachments }} Detachments</strong> across all {{ factions.length }} Codex
        factions, with their Detachment Points cost and the stance each one carries, from the
        <a :href="mfmSource.url" target="_blank" rel="noopener">
          {{ mfmSource.name }} {{ mfmSource.version }}</a
        >.
      </p>
      <p class="lede-note">
        Every faction can reach all five stances, so no army is locked out of a mission. What
        differs is <strong>how much of its pool sits where</strong> — that's the read you get for
        free in a blind pairing.
      </p>
    </section>

    <!-- Faction picker -->
    <section class="picker-section">
      <h2>Pick a faction</h2>
      <ul class="faction-grid">
        <li v-for="faction in factions" :key="faction.key">
          <button
            type="button"
            class="faction-card"
            :class="{ active: selected === faction.key }"
            :aria-pressed="selected === faction.key"
            @click="selectFaction(faction.key)"
          >
            <img
              :src="`/images/factions/${faction.key}.webp`"
              :alt="`${faction.name} logo`"
              width="36"
              height="36"
              loading="lazy"
            />
            <span class="faction-name">{{ faction.name }}</span>
          </button>
        </li>
      </ul>
    </section>

    <!-- Selected faction breakdown -->
    <section id="by-faction" class="detail-section">
      <header class="detail-head">
        <img
          :src="`/images/factions/${selected}.webp`"
          :alt="`${factionName(selected)} logo`"
          width="48"
          height="48"
          class="detail-logo"
        />
        <div>
          <h2>{{ factionName(selected) }}</h2>
          <p class="detail-sub">
            {{ detachmentCount }} Detachments<template v-if="leaders.length === 1">
              · leans <strong>{{ leaderNames }}</strong></template
            ><template v-else-if="leaders.length && leaders.length < tally.length">
              · widest pools in <strong>{{ leaderNames }}</strong></template
            ><template v-else-if="leaders.length"> · an even spread across all five</template>
          </p>
        </div>
      </header>

      <!-- Stacked share bar: how the pool splits across the five stances. -->
      <div
        class="lean-bar"
        role="img"
        :aria-label="`Detachment split for ${factionName(selected)}`"
      >
        <span
          v-for="t in tally"
          :key="t.disposition"
          class="lean-seg"
          :style="{ ...dispAccent(t.disposition), flexGrow: t.count }"
          :title="`${dispositionName(t.disposition)}: ${t.count}`"
        ></span>
      </div>

      <div class="stance-grid">
        <article
          v-for="t in tally"
          :key="t.disposition"
          class="stance"
          :style="dispAccent(t.disposition)"
          :class="{ lead: isLeader(t.disposition) }"
        >
          <header class="stance-head">
            <span class="chip filled">
              <DispositionIcon :symbol="symbolOf(t.disposition)" />
            </span>
            <span class="stance-name">{{ dispositionName(t.disposition) }}</span>
            <span class="stance-count">{{ t.count }}</span>
          </header>
          <p class="stance-meta">
            {{ Math.round(t.share * 100) }}% of the pool
            <template v-if="t.minDp !== null">· from {{ t.minDp }} DP</template>
          </p>
          <ul class="det-list">
            <li v-for="d in t.detachments" :key="d.name" class="det">
              <span class="det-name">{{ d.name }}</span>
              <span class="dp-pill">{{ d.dp }} DP</span>
            </li>
          </ul>
        </article>
      </div>
    </section>

    <!-- Every faction at a glance -->
    <section class="matrix-section">
      <div class="matrix-head">
        <h2>Every faction at a glance</h2>
        <p class="matrix-hint">
          Each cell counts the Detachments granting that stance; the darker it is, the more of the
          faction's pool sits there. Tap a row to open it above.
        </p>
      </div>

      <div class="matrix-scroll">
        <table class="matrix">
          <thead>
            <tr>
              <th class="corner" scope="col"><span class="corner-label">Faction</span></th>
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
              <th class="total-head" scope="col">All</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in matrix" :key="row.key" :class="{ selected: selected === row.key }">
              <th scope="row" class="row-head">
                <button type="button" class="row-btn" @click="selectFaction(row.key)">
                  <img
                    :src="`/images/factions/${row.key}.webp`"
                    alt=""
                    width="20"
                    height="20"
                    loading="lazy"
                  />
                  <span>{{ row.name }}</span>
                </button>
              </th>
              <td v-for="c in row.cells" :key="c.disposition" class="cell" :style="c.style">
                <span class="cell-inner">{{ c.count }}</span>
              </td>
              <td class="total-cell">{{ row.total }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="source-note">
        Detachment names, DP and Dispositions are transcribed from the
        <a :href="mfmSource.url" target="_blank" rel="noopener">
          {{ mfmSource.name }} {{ mfmSource.version }}</a
        >. Points values change with each balance update — check the source before an event.
      </p>
    </section>
  </main>
</template>

<style scoped>
.detachments {
  padding: var(--spacing-xl) var(--spacing-lg) var(--spacing-section);
  max-width: 1080px;
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
  max-width: 680px;
}

.lede-note {
  margin-top: var(--spacing-sm);
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-muted);
  max-width: 680px;
}

h2 {
  font-size: 28px;
  letter-spacing: -0.5px;
  margin: 0;
}

/* --- Faction picker --- */
.picker-section {
  margin-bottom: var(--spacing-xl);
}

.faction-grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: var(--spacing-xs);
  margin-top: var(--spacing-md);
  padding: 0;
}

.faction-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-md);
  background: var(--color-surface-card);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  color: var(--color-body);
  cursor: pointer;
  transition:
    border-color 0.12s ease,
    background 0.12s ease;
}

.faction-card:hover {
  border-color: var(--color-primary);
}

.faction-card.active {
  border-color: var(--color-primary);
  background: var(--color-primary-tint);
  color: var(--color-ink);
  font-weight: 600;
}

.faction-card img {
  flex: none;
  object-fit: contain;
}

.faction-name {
  line-height: 1.2;
}

/* --- Selected faction detail --- */
.detail-section {
  border-top: 1px solid var(--color-hairline);
  padding-top: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  scroll-margin-top: var(--spacing-md);
}

.detail-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.detail-logo {
  flex: none;
  object-fit: contain;
}

.detail-sub {
  margin: var(--spacing-xxs) 0 0;
  font-size: 14px;
  color: var(--color-muted);
}

.detail-sub strong {
  color: var(--color-ink);
}

.lean-bar {
  display: flex;
  gap: 2px;
  height: 10px;
  margin: var(--spacing-md) 0 var(--spacing-lg);
}

.lean-seg {
  background: var(--disp);
  border-radius: var(--radius-xs);
}

.stance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(196px, 1fr));
  gap: var(--spacing-sm);
}

.stance {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  background: var(--color-surface-card);
}

.stance.lead {
  border-color: var(--disp);
  background: var(--disp-tint);
}

.stance-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 24px;
  height: 24px;
  padding: 4px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--disp);
  color: var(--disp);
}

.chip.filled {
  background: var(--disp);
  border-color: var(--disp);
  color: var(--color-on-primary);
}

.stance-name {
  flex: 1;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--color-ink);
}

.stance-count {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  color: var(--disp);
}

.stance-meta {
  margin: var(--spacing-xs) 0 var(--spacing-sm);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: var(--color-muted);
}

.det-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs);
  margin: 0;
  padding: 0;
}

.det {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-xs);
  padding: var(--spacing-xxs) 0;
  border-top: 1px solid var(--color-hairline-soft);
}

.det:first-child {
  border-top: none;
}

.det-name {
  font-size: 13px;
  line-height: 1.35;
  color: var(--color-body-strong);
}

.dp-pill {
  flex: none;
  padding: 1px var(--spacing-xs);
  border-radius: var(--radius-pill);
  background: var(--color-surface-strong);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  color: var(--color-body);
}

/* --- Matrix --- */
.matrix-section {
  border-top: 1px solid var(--color-hairline);
  padding-top: var(--spacing-lg);
}

.matrix-hint {
  margin: var(--spacing-xs) 0 var(--spacing-md);
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-muted);
  max-width: 640px;
}

.matrix-scroll {
  overflow-x: auto;
}

.matrix {
  border-collapse: separate;
  border-spacing: 3px;
  width: 100%;
  min-width: 620px;
}

.corner {
  text-align: left;
  vertical-align: bottom;
}

.corner-label,
.total-head {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--color-muted);
}

.col-head,
.total-head {
  vertical-align: bottom;
  padding-bottom: var(--spacing-xs);
}

.col-head {
  min-width: 84px;
}

.col-head .chip {
  margin: 0 auto;
}

.col-name {
  display: block;
  margin-top: 4px;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.15;
  color: var(--color-body-strong);
}

.row-head {
  text-align: left;
  padding-right: var(--spacing-xs);
}

.row-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  width: 100%;
  padding: var(--spacing-xxs) var(--spacing-xs);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: none;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  color: var(--color-ink);
  cursor: pointer;
}

.row-btn:hover {
  background: var(--color-surface-card);
}

.row-btn img {
  flex: none;
  object-fit: contain;
}

tr.selected .row-btn {
  border-color: var(--color-primary);
  background: var(--color-primary-tint);
}

.cell {
  /* Density ramp: the stance accent, faded by the cell's share weight. */
  background: color-mix(in srgb, var(--disp) calc(var(--w) * 100%), var(--color-surface-soft));
  border-radius: var(--radius-sm);
  text-align: center;
}

.cell-inner {
  display: block;
  padding: var(--spacing-xs) 0;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--disp);
}

.total-cell {
  text-align: center;
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  color: var(--color-muted);
}

.source-note {
  margin-top: var(--spacing-lg);
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-muted);
}

@media (max-width: 720px) {
  .detachments {
    padding: var(--spacing-lg) var(--spacing-md) var(--spacing-xxl);
  }

  .hero h1 {
    font-size: 34px;
  }

  .lede {
    font-size: 16px;
  }

  h2 {
    font-size: 24px;
  }

  .faction-grid {
    grid-template-columns: repeat(auto-fill, minmax(136px, 1fr));
  }
}
</style>
