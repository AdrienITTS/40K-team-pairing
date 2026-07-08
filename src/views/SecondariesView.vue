<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { secondaryMissions } from '../data/secondaries'

const total = secondaryMissions.length
const selected = ref<number | null>(null)
const view = ref<'image' | 'text'>('image')
const current = computed(() =>
  selected.value === null ? null : secondaryMissions[selected.value]!,
)

function select(i: number) {
  selected.value = i
}

function reset() {
  selected.value = null
}

function toggleView() {
  view.value = view.value === 'image' ? 'text' : 'image'
}

function go(delta: number) {
  if (selected.value === null) return
  selected.value = (selected.value + delta + total) % total
}

function onKey(e: KeyboardEvent) {
  if (selected.value === null) return
  if (e.key === 'ArrowLeft') go(-1)
  else if (e.key === 'ArrowRight') go(1)
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <main class="secondaries">
    <section class="hero">
      <p class="badge-pill">Warhammer 40,000 · Teams Event</p>
      <div class="hero-head">
        <h1>Secondary Missions</h1>
        <div v-if="current" class="hero-actions">
          <button type="button" class="toggle" :aria-pressed="view === 'text'" @click="toggleView">
            {{ view === 'image' ? 'Show text' : 'Show card' }}
          </button>
          <button type="button" class="see-all" @click="reset">See all secondaries</button>
        </div>
      </div>
      <p v-if="!current" class="lede">
        The full deck of Secondary Mission cards. Each is worth Victory Points toward the 45 VP
        Secondary cap. Pick a mission below to read its card, WHEN DRAWN clause, and FIXED or
        TACTICAL scoring conditions.
      </p>
    </section>

    <ul v-if="!current" class="mosaic" aria-label="Select a secondary mission">
      <li v-for="(m, i) in secondaryMissions" :key="m.key">
        <button type="button" class="mosaic-chip" @click="select(i)">
          {{ m.name }}
        </button>
      </li>
    </ul>

    <section
      v-else
      class="carousel"
      aria-roledescription="carousel"
      aria-label="Secondary missions"
    >
      <div class="carousel-frame" :class="{ 'carousel-frame--text': view === 'text' }">
        <nav class="detail-bar" aria-label="Carousel controls">
          <button type="button" class="arrow" aria-label="Previous mission" @click="go(-1)">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <p class="counter" aria-live="polite">
            <span class="counter-name">{{ current.name }}</span>
            <span class="counter-index">{{ selected! + 1 }} / {{ total }}</span>
          </p>
          <button type="button" class="arrow" aria-label="Next mission" @click="go(1)">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </nav>

        <div class="stage">
          <figure v-if="view === 'image'" class="card-image">
            <img
              :src="`/images/secondaries/${current.key}.png`"
              :alt="`${current.name} secondary mission card`"
              loading="lazy"
            />
          </figure>

          <div v-else class="rules" role="group" :aria-label="`${current.name}, mission details`">
            <p v-if="current.kindLabel" class="eyebrow">{{ current.kindLabel }}</p>
            <h2 class="mission-name">{{ current.name }}</h2>

            <!-- Text fields are trusted, build-time HTML from the source card data. -->
            <p v-if="current.whenDrawn" class="when-drawn" v-html="current.whenDrawn"></p>

            <div v-for="(section, si) in current.sections" :key="si" class="section">
              <header class="section-head">
                <span class="section-when">{{ section.when }}</span>
                <span
                  v-if="section.chip"
                  class="chip"
                  :class="`chip-${section.chip.toLowerCase()}`"
                >
                  {{ section.chip }}
                </span>
              </header>
              <p class="trigger">
                <span class="trigger-label">WHEN</span>
                <span>{{ section.trigger }}</span>
              </p>
              <ul class="rows">
                <template v-for="(row, ri) in section.rows" :key="ri">
                  <li v-if="row.or" class="or-divider" aria-hidden="true">or</li>
                  <li class="row">
                    <span class="row-text" v-html="row.text"></span>
                    <span class="vp" :class="{ 'vp-plus': row.plus }">
                      <span class="vp-value">{{ row.vp }}</span>
                      <span class="vp-unit">VP</span>
                    </span>
                  </li>
                </template>
              </ul>
              <p v-if="section.cap" class="cap">{{ section.cap }}</p>
            </div>

            <div v-if="current.action" class="action">
              <p class="action-title">Action · {{ current.action.title }}</p>
              <dl class="action-rows">
                <template v-for="(r, ai) in current.action.rows" :key="ai">
                  <dt>{{ r.k }}</dt>
                  <dd v-html="r.v"></dd>
                </template>
              </dl>
            </div>

            <p v-if="current.designerNote" class="designer-note" v-html="current.designerNote"></p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.secondaries {
  padding: var(--spacing-xl) var(--spacing-lg) var(--spacing-section);
  max-width: 1080px;
  margin: 0 auto;
}

.hero {
  margin-bottom: var(--spacing-lg);
}

.hero-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin: var(--spacing-md) 0;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.hero h1 {
  font-size: 48px;
  letter-spacing: -1px;
  margin: 0;
}

.lede {
  font-size: 18px;
  line-height: 1.6;
  color: var(--color-body);
  max-width: 640px;
}

/* --- Mosaic selector --- */
.mosaic {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.mosaic-chip {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-body-strong);
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-pill);
  padding: var(--spacing-xs) var(--spacing-md);
  cursor: pointer;
  transition: border-color 0.12s ease;
}

.mosaic-chip:hover,
.mosaic-chip:focus-visible {
  border-color: var(--color-primary);
  color: var(--color-ink);
}

/* --- Carousel frame: the nav bar and the card share one centred column, so the
   bar sits directly on top of the card, matching its width edge-to-edge. In the
   default (image) view the frame hugs the height-constrained card; in text view
   it takes the wider reading width. --- */
.carousel-frame {
  width: fit-content;
  max-width: 100%;
  margin: 0 auto;
}

.carousel-frame--text {
  width: min(620px, 100%);
}

/* Prev / mission-counter / next, stretched to sit flush above the card. */
.detail-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  width: 100%;
  margin-bottom: var(--spacing-sm);
}

.toggle,
.see-all {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  border-radius: var(--radius-pill);
  padding: var(--spacing-xs) var(--spacing-md);
  cursor: pointer;
}

.see-all {
  color: var(--color-body-strong);
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
}

.see-all:hover,
.see-all:focus-visible {
  border-color: var(--color-primary);
  color: var(--color-ink);
}

/* The image/text switch is the primary in-card control. */
.toggle {
  color: var(--color-on-primary);
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.toggle:hover,
.toggle:focus-visible {
  background: var(--color-primary-active);
  border-color: var(--color-primary-active);
}

/* --- Detail stage: one content pane at a time (image OR text) --- */
.stage {
  display: flex;
  justify-content: center;
}

/* The card is sized by height so the whole card fits the viewport without
   scrolling; the box hugs the resulting (narrower) image so the nav bar above
   lines up exactly with the card edges. */
.card-image {
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xl);
  background: var(--color-surface-card);
  padding: var(--spacing-md);
  width: fit-content;
  max-width: 100%;
}

.card-image img {
  display: block;
  width: auto;
  height: clamp(280px, calc(100vh - 370px), 720px);
  max-width: 100%;
  border-radius: var(--radius-lg);
}

.rules {
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xl);
  background: var(--color-surface-card);
  padding: var(--spacing-lg);
  width: 100%;
  max-width: 620px;
}

.eyebrow {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--color-muted);
}

.mission-name {
  font-family: var(--font-display);
  font-size: 28px;
  letter-spacing: -0.5px;
  margin: 2px 0 var(--spacing-sm);
  color: var(--color-ink);
}

.when-drawn {
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-body);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-left: 3px solid var(--color-primary);
  background: var(--color-surface-soft);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin-bottom: var(--spacing-md);
}

.section {
  border-top: 1px solid var(--color-hairline);
  padding-top: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.section-when {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-muted);
}

.chip {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 2px var(--spacing-xs);
  border-radius: var(--radius-xs);
  border: 1px solid var(--color-hairline);
  color: var(--color-body-strong);
}

.chip-fixed {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: var(--color-primary-tint);
}

.chip-tactical {
  color: var(--color-accent-teal);
  border-color: var(--color-accent-teal);
  background: var(--color-accent-teal-tint);
}

.trigger {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
  font-size: 13px;
  color: var(--color-body);
  margin-bottom: var(--spacing-xs);
}

.trigger-label {
  flex-shrink: 0;
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  background: var(--color-ink);
  color: var(--color-canvas);
}

.rows {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.row-text {
  font-size: 14px;
  line-height: 1.45;
  color: var(--color-body-strong);
}

.or-divider {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-muted);
  text-align: center;
}

.vp {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  padding: 4px var(--spacing-xs);
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: var(--color-on-primary);
  line-height: 1;
}

.vp-value {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
}

.vp-unit {
  font-family: var(--font-body);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
  margin-top: 2px;
}

.cap {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--color-muted);
  text-align: right;
  margin-top: var(--spacing-sm);
}

.action {
  border-top: 1px solid var(--color-hairline);
  padding-top: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.action-title {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
}

.action-rows {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--spacing-xs) var(--spacing-md);
  font-size: 14px;
  line-height: 1.5;
}

.action-rows dt {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--color-muted);
  padding-top: 2px;
}

.action-rows dd {
  color: var(--color-body-strong);
}

.designer-note {
  font-size: 13px;
  font-style: italic;
  line-height: 1.5;
  color: var(--color-muted);
  margin-top: var(--spacing-md);
}

/* --- Rich inline styling of the source card HTML (bold terms, underlines,
   and amber-highlighted mission keywords), mirroring the printed card. --- */
.rules :deep(b) {
  font-weight: 700;
  color: var(--color-ink);
}

.rules :deep(u) {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}

.rules :deep(.cB__mark) {
  font-weight: 600;
  padding: 0 4px;
  border-radius: var(--radius-xs);
  background: var(--color-accent-amber-tint);
  color: var(--color-accent-amber);
}

.rules :deep(.cB__wmWord) {
  font-weight: 700;
  color: var(--color-ink);
}

.arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-hairline);
  background: var(--color-surface-card);
  color: var(--color-ink);
  cursor: pointer;
}

.arrow:hover,
.arrow:focus-visible {
  background: var(--color-surface-strong);
  border-color: var(--color-primary);
}

.arrow svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.counter {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
}

.counter-name {
  font-family: var(--font-display);
  font-size: 20px;
  color: var(--color-ink);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.counter-index {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 1px;
  color: var(--color-muted);
}

@media (max-width: 640px) {
  .secondaries {
    padding: var(--spacing-lg) var(--spacing-md) var(--spacing-xxl);
  }

  .hero h1 {
    font-size: 32px;
  }

  .rules {
    padding: var(--spacing-lg);
  }
}
</style>
