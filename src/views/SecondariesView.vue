<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { secondaryMissions } from '../data/secondaries'
import SecondaryMissionCard from '../components/SecondaryMissionCard.vue'

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

// Both views are sized to fit the viewport so the page never needs to scroll.
// `availableHeight` is the space from the top of the card stage down to a small
// bottom margin; the image is scaled to it, and the text card is capped by it.
const stage = ref<HTMLElement | null>(null)
const measurer = ref<HTMLElement | null>(null)
const tallestText = ref<number | null>(null)
const availableHeight = ref<number | null>(null)

// The text card is pinned to the tallest secondary (so switching never resizes
// it) but never taller than the viewport; if a card can't fit it scrolls in
// place rather than pushing the page.
const textCardStyle = computed(() => {
  const avail = availableHeight.value
  if (!avail) return {}
  const h = tallestText.value ? Math.min(tallestText.value, avail) : avail
  return { height: `${h}px`, overflowY: 'auto' }
})

// The image fills the available height (minus the card's frame padding/border).
const imageStyle = computed(() =>
  availableHeight.value ? { height: `${availableHeight.value - 34}px` } : {},
)

function measureAvailable() {
  const el = stage.value
  if (!el) return
  const top = el.getBoundingClientRect().top
  availableHeight.value = Math.max(260, Math.round(window.innerHeight - top - 32))
}

function measureText() {
  const el = measurer.value
  if (!el) return
  let max = 0
  for (const child of Array.from(el.children)) {
    max = Math.max(max, (child as HTMLElement).offsetHeight)
  }
  tallestText.value = max > 0 ? max : null
}

function remeasure() {
  measureAvailable()
  if (view.value === 'text') measureText()
}

// Re-measure whenever the layout that drives the fit changes: view toggled, a
// card selected (the hero shrinks), or the window resized. Fonts can shift the
// tallest card, so re-run once they're ready too.
watch([view, current], async () => {
  await nextTick()
  remeasure()
  document.fonts?.ready.then(remeasure)
})

onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', remeasure)
  nextTick(remeasure)
  document.fonts?.ready.then(remeasure)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', remeasure)
})
</script>

<template>
  <main class="secondaries" :class="{ 'is-detail': current }">
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

    <Transition name="list" mode="out-in" @after-enter="remeasure">
      <ul v-if="!current" key="list" class="mosaic" aria-label="Select a secondary mission">
        <li v-for="(m, i) in secondaryMissions" :key="m.key">
          <button type="button" class="mosaic-chip" @click="select(i)">
            {{ m.name }}
          </button>
        </li>
      </ul>

      <section
        v-else
        key="detail"
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

          <div ref="stage" class="stage">
            <Transition name="swap" mode="out-in">
              <figure v-if="view === 'image'" key="image" class="card-image">
                <img
                  :src="`/images/secondaries/${current.key}.webp`"
                  :alt="`${current.name} secondary mission card`"
                  :style="imageStyle"
                  loading="lazy"
                />
              </figure>

              <SecondaryMissionCard v-else key="text" :mission="current" :style="textCardStyle" />
            </Transition>
          </div>

          <!-- Off-screen stack used only to measure the tallest secondary so the
             text card can be pinned to a constant height. -->
          <div v-if="view === 'text'" ref="measurer" class="rules-measurer" aria-hidden="true">
            <SecondaryMissionCard v-for="m in secondaryMissions" :key="m.key" :mission="m" />
          </div>
        </div>
      </section>
    </Transition>
  </main>
</template>

<style scoped>
.secondaries {
  padding: var(--spacing-xl) var(--spacing-lg) var(--spacing-section);
  max-width: 1080px;
  margin: 0 auto;
}

/* When a card is open the view is sized to the viewport, so drop the tall
   bottom padding that would otherwise push the card off-screen. */
.secondaries.is-detail {
  padding-bottom: var(--spacing-md);
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
  width: min(520px, 100%);
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

/* Swap between the mission list and the detail carousel (in both directions:
   selecting a card and returning to the list). */
.list-enter-active,
.list-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (prefers-reduced-motion: reduce) {
  .list-enter-active,
  .list-leave-active {
    transition: none;
  }

  .list-enter-from,
  .list-leave-to {
    transform: none;
  }
}

/* --- Detail stage: one content pane at a time (image OR text) --- */
.stage {
  display: flex;
  justify-content: center;
}

/* Crossfade + gentle lift when swapping between the card image and its text.
   `out-in` fades the outgoing pane out before the incoming one lifts in. */
.swap-enter-active,
.swap-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.swap-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.swap-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .swap-enter-active,
  .swap-leave-active {
    transition: none;
  }

  .swap-enter-from,
  .swap-leave-to {
    transform: none;
  }
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

/* Off-screen measurement stack: laid out at the real card width but clipped to
   zero height so it never shows or affects layout, while each child still
   reports its natural rendered height for the tallest-card calculation. */
.rules-measurer {
  width: 100%;
  height: 0;
  overflow: hidden;
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
}
</style>
