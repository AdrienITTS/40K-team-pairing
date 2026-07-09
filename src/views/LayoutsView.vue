<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  dispositions,
  getDisposition,
  dispositionName,
  type DispositionKey,
} from '../data/dispositions'
import { layoutImages, LAYOUT_LETTERS, type LayoutVariant } from '../data/layouts'
import DispositionIcon from '../components/DispositionIcon.vue'

// Inline custom-property bindings keep the disposition accent a token reference
// (defined in base.css) rather than a hardcoded literal in the SFC.
function accent(key: DispositionKey) {
  return {
    '--accent': `var(--color-disposition-${key})`,
    '--accent-tint': `var(--color-disposition-${key}-tint)`,
  }
}

const step = ref<1 | 2 | 3>(1)
const mine = ref<DispositionKey | null>(null)
const theirs = ref<DispositionKey | null>(null)
const variant = ref<LayoutVariant>('no-measurements')
const lightbox = ref<number | null>(null)

const showMeasurements = computed({
  get: () => variant.value === 'with-measurements',
  set: (on: boolean) => {
    variant.value = on ? 'with-measurements' : 'no-measurements'
  },
})

const maps = computed(() =>
  mine.value && theirs.value ? layoutImages(mine.value, theirs.value, variant.value) : [],
)

// The Primary Mission each side plays is set by the disposition matchup: you
// read your opponent's symbol on your own card (see dispositions.ts).
const myMission = computed(() =>
  mine.value && theirs.value
    ? getDisposition(mine.value).matchups.find((m) => m.opponent === theirs.value)!.mission
    : '',
)
const theirMission = computed(() =>
  mine.value && theirs.value
    ? getDisposition(theirs.value).matchups.find((m) => m.opponent === mine.value)!.mission
    : '',
)

function pickMine(key: DispositionKey) {
  mine.value = key
  step.value = 2
}

function pickTheirs(key: DispositionKey) {
  theirs.value = key
  step.value = 3
}

function goToStep(n: 1 | 2 | 3) {
  if (n <= 1) mine.value = null
  if (n <= 2) theirs.value = null
  step.value = n
}

function restart() {
  goToStep(1)
}

function openLightbox(i: number) {
  lightbox.value = i
}
function closeLightbox() {
  lightbox.value = null
}
function lightboxGo(delta: number) {
  if (lightbox.value === null) return
  lightbox.value = (lightbox.value + delta + LAYOUT_LETTERS.length) % LAYOUT_LETTERS.length
}

function onKey(e: KeyboardEvent) {
  if (lightbox.value === null) return
  if (e.key === 'Escape') closeLightbox()
  else if (e.key === 'ArrowLeft') lightboxGo(-1)
  else if (e.key === 'ArrowRight') lightboxGo(1)
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <main class="layouts">
    <section class="hero">
      <p class="badge-pill">Warhammer 40,000 · Teams Event</p>
      <h1>Deployment Layouts</h1>
      <p class="lede">
        Every terrain layout, by Force Disposition matchup. Pick your Disposition and your
        opponent's, and the three boards (A, B, C) for that pairing are shown — the players roll off
        to choose which one they play on.
      </p>
    </section>

    <ol class="stepper">
      <li :class="{ active: step === 1, done: step > 1 }">
        <button type="button" @click="goToStep(1)">
          1 · {{ mine ? dispositionName(mine) : 'Your Disposition' }}
        </button>
      </li>
      <li :class="{ active: step === 2, done: step > 2 }">
        <button type="button" :disabled="!mine" @click="mine && goToStep(2)">
          2 · {{ theirs ? dispositionName(theirs) : 'Opponent' }}
        </button>
      </li>
      <li :class="{ active: step === 3 }">
        <button type="button" :disabled="!theirs" @click="theirs && (step = 3)">3 · Maps</button>
      </li>
    </ol>

    <Transition name="step" mode="out-in">
      <!-- Steps 1 & 2: pick a disposition -->
      <section v-if="step === 1 || step === 2" :key="step" class="pick">
        <h2 class="pick-title">
          {{ step === 1 ? 'Pick your Force Disposition' : "Pick your opponent's Disposition" }}
        </h2>
        <ul class="disp-grid" aria-label="Force Dispositions">
          <li v-for="d in dispositions" :key="d.key">
            <button
              type="button"
              class="disp-chip"
              :class="{ chosen: step === 2 && mine === d.key }"
              :style="accent(d.key)"
              @click="step === 1 ? pickMine(d.key) : pickTheirs(d.key)"
            >
              <span class="disp-symbol"><DispositionIcon :symbol="d.symbol" /></span>
              <span class="disp-text">
                <span class="disp-name">{{ d.name }}</span>
                <span class="disp-tag">{{ d.tagline }}</span>
              </span>
            </button>
          </li>
        </ul>
        <p v-if="step === 2 && mine" class="pick-hint">
          You chose <strong>{{ dispositionName(mine) }}</strong> — now pick who you're facing (it may
          be the same Disposition).
        </p>
      </section>

      <!-- Step 3: the three maps -->
      <section v-else key="maps" class="result">
        <div class="matchup-bar">
          <div class="matchup-sides">
            <span class="side" :style="accent(mine!)">
              <span class="side-symbol"><DispositionIcon :symbol="getDisposition(mine!).symbol" /></span>
              <span class="side-meta">
                <span class="side-label">You · {{ dispositionName(mine!) }}</span>
                <span class="side-mission">{{ myMission }}</span>
              </span>
            </span>
            <span class="vs">vs</span>
            <span class="side side-right" :style="accent(theirs!)">
              <span class="side-meta">
                <span class="side-label">Opponent · {{ dispositionName(theirs!) }}</span>
                <span class="side-mission">{{ theirMission }}</span>
              </span>
              <span class="side-symbol"><DispositionIcon :symbol="getDisposition(theirs!).symbol" /></span>
            </span>
          </div>

          <div class="result-actions">
            <label class="measure-toggle">
              <input v-model="showMeasurements" type="checkbox" />
              <span>Measurements</span>
            </label>
            <button type="button" class="restart" @click="restart">New matchup</button>
          </div>
        </div>

        <ul class="map-grid" aria-label="Deployment layouts">
          <li v-for="(m, i) in maps" :key="m.letter" class="map-card">
            <button type="button" class="map-btn" @click="openLightbox(i)">
              <span class="map-letter">Layout {{ m.letter }}</span>
              <img
                :src="m.src"
                :alt="`Layout ${m.letter} — ${dispositionName(mine!)} vs ${dispositionName(theirs!)}`"
                loading="lazy"
              />
            </button>
          </li>
        </ul>
      </section>
    </Transition>

    <Transition name="fade">
      <div
        v-if="lightbox !== null"
        class="lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="`Layout ${maps[lightbox]?.letter}`"
        @click="closeLightbox"
      >
        <button
          type="button"
          class="lb-arrow lb-prev"
          aria-label="Previous layout"
          @click.stop="lightboxGo(-1)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <figure class="lb-figure" @click.stop>
          <img :src="maps[lightbox]?.src" :alt="`Layout ${maps[lightbox]?.letter}`" />
          <figcaption>
            <span class="lb-caption-text">Layout {{ maps[lightbox]?.letter }} · {{ lightbox + 1 }} / 3</span>
            <button
              type="button"
              class="lb-measure"
              :aria-pressed="showMeasurements"
              @click="showMeasurements = !showMeasurements"
            >
              {{ showMeasurements ? 'Hide measurements' : 'Show measurements' }}
            </button>
          </figcaption>
        </figure>
        <button
          type="button"
          class="lb-arrow lb-next"
          aria-label="Next layout"
          @click.stop="lightboxGo(1)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </button>
        <button type="button" class="lightbox-close" aria-label="Close" @click="closeLightbox">
          ✕
        </button>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.layouts {
  padding: var(--spacing-xl) var(--spacing-lg) var(--spacing-section);
  max-width: 1080px;
  margin: 0 auto;
}

.hero {
  margin-bottom: var(--spacing-lg);
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

/* --- Stepper (mirrors the pairing setup breadcrumb) --- */
.stepper {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-muted-soft);
}

.stepper button {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: inherit;
  background: none;
  border: none;
  padding-bottom: var(--spacing-xxs);
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

.stepper button:disabled {
  cursor: default;
}

.stepper li.active button {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
}

.stepper li.done button {
  color: var(--color-muted);
}

/* --- Step transition --- */
.step-enter-active,
.step-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.step-enter-from {
  opacity: 0;
  transform: translateX(16px);
}

.step-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

@media (prefers-reduced-motion: reduce) {
  .step-enter-active,
  .step-leave-active {
    transition: none;
  }

  .step-enter-from,
  .step-leave-to {
    transform: none;
  }
}

/* --- Disposition picker --- */
.pick-title {
  font-size: 20px;
  letter-spacing: -0.3px;
  margin-bottom: var(--spacing-md);
}

.disp-grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--spacing-sm);
}

.disp-chip {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-align: left;
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    transform 0.15s ease;
}

.disp-chip:hover,
.disp-chip:focus-visible {
  background: var(--color-surface-strong);
  transform: translateY(-2px);
}

.disp-chip.chosen {
  border-color: var(--accent);
  background: var(--accent-tint);
}

@media (prefers-reduced-motion: reduce) {
  .disp-chip {
    transition: none;
  }

  .disp-chip:hover,
  .disp-chip:focus-visible {
    transform: none;
  }
}

.disp-symbol {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 9px;
  border-radius: var(--radius-md);
  background: var(--accent-tint);
  color: var(--accent);
  flex-shrink: 0;
}

.disp-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.disp-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-ink);
}

.disp-tag {
  font-size: 13px;
  color: var(--accent);
  font-weight: 500;
}

.pick-hint {
  margin-top: var(--spacing-md);
  font-size: 14px;
  color: var(--color-body);
}

/* --- Result (step 3) --- */
.matchup-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-hairline);
}

.matchup-sides {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  min-width: 0;
}

.side {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
}

.side-right {
  text-align: right;
}

.side-symbol {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 8px;
  border-radius: var(--radius-md);
  background: var(--accent-tint);
  color: var(--accent);
  flex-shrink: 0;
}

.side-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.side-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
}

.side-mission {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vs {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 16px;
  color: var(--color-muted-soft);
  flex-shrink: 0;
}

.result-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.measure-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-body-strong);
  cursor: pointer;
}

.measure-toggle input {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.restart {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-body-strong);
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-pill);
  padding: var(--spacing-xs) var(--spacing-md);
  cursor: pointer;
}

.restart:hover,
.restart:focus-visible {
  border-color: var(--color-primary);
  color: var(--color-ink);
}

/* --- Map grid --- */
.map-grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.map-card {
  min-width: 0;
}

.map-btn {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  cursor: zoom-in;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}

.map-btn:hover,
.map-btn:focus-visible {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

@media (prefers-reduced-motion: reduce) {
  .map-btn {
    transition: none;
  }

  .map-btn:hover,
  .map-btn:focus-visible {
    transform: none;
  }
}

.map-letter {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-muted);
}

.map-btn img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--radius-md);
}

/* --- Lightbox --- */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: var(--color-scrim);
  cursor: zoom-out;
}

.lb-figure {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: default;
}

.lb-figure img {
  max-width: min(560px, 100%);
  max-height: 86vh;
  width: auto;
  object-fit: contain;
  border-radius: var(--radius-lg);
}

.lb-figure figcaption {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.lb-caption-text {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-ink);
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-pill);
  padding: var(--spacing-xxs) var(--spacing-md);
}

/* Switch the enlarged map between the clean and measurement-annotated art. */
.lb-measure {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-on-primary);
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-pill);
  padding: var(--spacing-xxs) var(--spacing-md);
  cursor: pointer;
}

.lb-measure:hover,
.lb-measure:focus-visible {
  background: var(--color-primary-active);
  border-color: var(--color-primary-active);
}

.lb-arrow {
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
  flex-shrink: 0;
}

.lb-arrow:hover,
.lb-arrow:focus-visible {
  background: var(--color-surface-strong);
  border-color: var(--color-primary);
}

.lb-arrow svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.lightbox-close {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-hairline);
  background: var(--color-surface-card);
  color: var(--color-ink);
  font-size: 16px;
  cursor: pointer;
}

.lightbox-close:hover,
.lightbox-close:focus-visible {
  background: var(--color-surface-strong);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 720px) {
  .map-grid {
    grid-template-columns: 1fr;
    max-width: 420px;
  }

  .lb-arrow {
    display: none;
  }
}

@media (max-width: 640px) {
  .layouts {
    padding: var(--spacing-lg) var(--spacing-md) var(--spacing-xxl);
  }

  .hero h1 {
    font-size: 32px;
  }

  .disp-grid {
    grid-template-columns: 1fr;
  }
}
</style>
