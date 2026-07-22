<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { dispositionName, getDisposition, type DispositionKey } from '../../data/dispositions'
import { layoutImages, LAYOUT_LETTERS, type LayoutLetter } from '../../data/layouts'
import DispositionIcon from '../DispositionIcon.vue'

/**
 * A full-screen viewer for the three A/B/C terrain layouts a Force-Disposition
 * pairing shares (see LayoutsView for the same data on its own page). Opened
 * from a live board row or a result card once both players have Dispositions;
 * `request` carries the pairing and which letter to open on. Emits `close` when
 * dismissed. Flips between A/B/C in place — unless `fixed`, in which case only
 * the single layout the table will play is shown (Refused Attacker / Champion
 * tables, whose layout is set by the round).
 */
const props = defineProps<{
  request: { a: DispositionKey; b: DispositionKey; letter: LayoutLetter; fixed?: boolean } | null
}>()

const emit = defineEmits<{ close: [] }>()

const index = ref(0)

const isFixed = computed(() => props.request?.fixed ?? false)

// Reset to the requested letter each time a new pairing is opened.
watch(
  () => props.request,
  (req) => {
    if (req) index.value = Math.max(0, LAYOUT_LETTERS.indexOf(req.letter))
  },
  { immediate: true },
)

const maps = computed(() => (props.request ? layoutImages(props.request.a, props.request.b) : []))
const current = computed(() => maps.value[index.value] ?? null)

function go(delta: number) {
  if (isFixed.value) return
  index.value = (index.value + delta + LAYOUT_LETTERS.length) % LAYOUT_LETTERS.length
}

function onKey(e: KeyboardEvent) {
  if (!props.request) return
  if (e.key === 'Escape') emit('close')
  else if (e.key === 'ArrowLeft') go(-1)
  else if (e.key === 'ArrowRight') go(1)
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Transition name="fade">
    <div
      v-if="request"
      class="lightbox"
      role="dialog"
      aria-modal="true"
      :aria-label="`Layout ${current?.letter}`"
      @click="emit('close')"
    >
      <button
        v-if="!isFixed"
        type="button"
        class="lb-arrow lb-prev"
        aria-label="Previous layout"
        @click.stop="go(-1)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
      </button>

      <figure class="lb-figure" @click.stop>
        <div class="lb-matchup">
          <span class="lb-side" :style="{ '--accent': `var(--color-disposition-${request.a})` }">
            <DispositionIcon :symbol="getDisposition(request.a).symbol" />
            {{ dispositionName(request.a) }}
          </span>
          <span class="lb-vs">vs</span>
          <span class="lb-side" :style="{ '--accent': `var(--color-disposition-${request.b})` }">
            <DispositionIcon :symbol="getDisposition(request.b).symbol" />
            {{ dispositionName(request.b) }}
          </span>
        </div>

        <img :src="current?.src" :alt="`Layout ${current?.letter}`" />

        <figcaption>
          <span class="lb-caption-text">
            Layout {{ current?.letter }}<template v-if="!isFixed"> · {{ index + 1 }} / 3</template>
          </span>
        </figcaption>
      </figure>

      <button
        v-if="!isFixed"
        type="button"
        class="lb-arrow lb-next"
        aria-label="Next layout"
        @click.stop="go(1)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
      </button>
      <button type="button" class="lightbox-close" aria-label="Close" @click="emit('close')">
        ✕
      </button>
    </div>
  </Transition>
</template>

<style scoped>
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

.lb-matchup {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  justify-content: center;
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-pill);
  padding: var(--spacing-xxs) var(--spacing-md);
}

.lb-side {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
}

.lb-side :deep(svg) {
  width: 18px;
  height: 18px;
  color: var(--accent);
}

.lb-vs {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 15px;
  color: var(--color-muted-soft);
}

.lb-figure img {
  max-width: min(560px, 100%);
  max-height: 78vh;
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
  .lb-arrow {
    display: none;
  }
}
</style>
