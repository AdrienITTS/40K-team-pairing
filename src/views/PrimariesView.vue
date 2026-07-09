<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { primariesByDisposition, type PrimaryMission } from '../data/primaries'
import { getDisposition, dispositionName, type DispositionKey } from '../data/dispositions'
import DispositionIcon from '../components/DispositionIcon.vue'
import PrimaryMissionCard from '../components/PrimaryMissionCard.vue'

const groups = primariesByDisposition()

// Inline custom-property bindings keep the disposition accent a base.css token
// reference rather than a hardcoded literal in the SFC.
const youAccent = (key: DispositionKey) => ({
  '--you': `var(--color-disposition-${key})`,
  '--you-tint': `var(--color-disposition-${key}-tint)`,
})
const facedAccent = (key: DispositionKey) => ({
  '--faced': `var(--color-disposition-${key})`,
  '--faced-tint': `var(--color-disposition-${key}-tint)`,
})
const facedSymbol = (key: DispositionKey) => getDisposition(key).symbol

// Modal showing the source card image, or its text scoring (toggleable).
const active = ref<PrimaryMission | null>(null)
const view = ref<'image' | 'text'>('image')
function open(p: PrimaryMission) {
  active.value = p
  view.value = 'image'
}
const close = () => (active.value = null)
const toggleView = () => (view.value = view.value === 'image' ? 'text' : 'image')
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <main class="primaries">
    <section class="hero">
      <p class="badge-pill">Warhammer 40,000 · Teams Event</p>
      <h1>Primary Missions</h1>
      <p class="lede">
        Your Primary Mission — how you score VP — is set by the pairing of Force Dispositions: it's
        the mission listed under your opponent's Disposition symbol on your card. They're grouped
        below by the Disposition <strong>you play</strong> (full colour), then by the Disposition
        <strong>you face</strong> (bordered colour). Tap any card for its full scoring.
      </p>
    </section>

    <section
      v-for="g in groups"
      :key="g.disposition.key"
      class="group"
      :style="youAccent(g.disposition.key)"
    >
      <header class="group-head">
        <span class="group-symbol"><DispositionIcon :symbol="g.disposition.symbol" /></span>
        <div class="group-titles">
          <h2>When you play {{ g.disposition.name }}</h2>
          <p class="group-sub">{{ g.disposition.tagline }}</p>
        </div>
      </header>

      <ul class="mission-grid" :aria-label="`${g.disposition.name} primary missions`">
        <li
          v-for="p in g.missions"
          :key="p.slug"
          class="mission"
          :style="facedAccent(p.faced)"
        >
          <button
            type="button"
            class="thumb"
            :aria-label="`${p.name} — view full card`"
            @click="open(p)"
          >
            <img
              :src="`/images/primaries/${p.slug}.png`"
              :alt="`${p.name} primary mission card`"
              loading="lazy"
            />
          </button>
          <div class="mission-meta">
            <span class="mission-name">{{ p.name }}</span>
            <span class="faced">
              <span class="faced-chip"><DispositionIcon :symbol="facedSymbol(p.faced)" /></span>
              <span>{{ p.mirror ? 'Mirror' : `vs ${dispositionName(p.faced)}` }}</span>
            </span>
          </div>
        </li>
      </ul>
    </section>

    <Transition name="fade">
      <div
        v-if="active"
        class="lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="`${active.name} primary mission card`"
        @click="close"
      >
        <div class="lightbox-panel" @click.stop>
          <div class="lightbox-bar">
            <button
              type="button"
              class="switch"
              :aria-pressed="view === 'text'"
              @click="toggleView"
            >
              {{ view === 'image' ? 'Show text' : 'Show card' }}
            </button>
          </div>
          <Transition name="fade" mode="out-in">
            <img
              v-if="view === 'image'"
              key="image"
              class="lightbox-img"
              :src="`/images/primaries/${active.slug}.png`"
              :alt="`${active.name} primary mission card`"
            />
            <PrimaryMissionCard v-else key="text" :mission="active" class="lightbox-text" />
          </Transition>
        </div>
        <button type="button" class="lightbox-close" aria-label="Close" @click="close">✕</button>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.primaries {
  padding: var(--spacing-xl) var(--spacing-lg) var(--spacing-section);
  max-width: 1200px;
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
  max-width: 720px;
}

.lede strong {
  color: var(--color-ink);
  font-weight: 600;
}

.group {
  margin-bottom: var(--spacing-xl);
}

/* The Disposition you PLAY heads each group in full colour. */
.group-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--you);
}

.group-symbol {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  padding: 8px;
  border-radius: var(--radius-md);
  background: var(--you);
  color: var(--color-on-primary);
  flex-shrink: 0;
}

.group-titles h2 {
  font-size: 22px;
  letter-spacing: -0.3px;
  line-height: 1.1;
}

.group-sub {
  font-size: 13px;
  font-weight: 600;
  color: var(--you);
}

.mission-grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--spacing-md);
}

.mission {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

/* The Disposition you FACE frames each card as a coloured border. */
.thumb {
  display: block;
  padding: 0;
  border: 2px solid var(--faced);
  border-radius: var(--radius-md);
  background: var(--faced-tint);
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;
}

.thumb img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: calc(var(--radius-md) - 2px);
}

.thumb:hover,
.thumb:focus-visible {
  transform: translateY(-2px);
}

.mission-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mission-name {
  font-family: var(--font-display);
  font-size: 17px;
  line-height: 1.15;
  color: var(--color-ink);
}

.faced {
  display: flex;
  align-items: center;
  gap: var(--spacing-xxs);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-muted);
}

/* Bordered chip — the faced Disposition's outline, not a fill. */
.faced-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 3px;
  border: 1.5px solid var(--faced);
  border-radius: var(--radius-sm);
  color: var(--faced);
  flex-shrink: 0;
}

/* --- Lightbox --- */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  background: var(--color-scrim);
  cursor: pointer;
}

/* The panel holds the toggle + the image/text; clicks inside it don't close. */
.lightbox-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  max-height: 100%;
  cursor: default;
}

.lightbox-bar {
  display: flex;
  justify-content: center;
}

.switch {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-on-primary);
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-pill);
  padding: var(--spacing-xs) var(--spacing-md);
  cursor: pointer;
}

.switch:hover,
.switch:focus-visible {
  background: var(--color-primary-active);
  border-color: var(--color-primary-active);
}

.lightbox-img {
  display: block;
  max-width: min(440px, 100%);
  max-height: 84vh;
  width: auto;
  object-fit: contain;
  border-radius: var(--radius-lg);
}

.lightbox-text {
  max-height: 84vh;
  overflow-y: auto;
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

@media (max-width: 900px) {
  .mission-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 560px) {
  .primaries {
    padding: var(--spacing-lg) var(--spacing-md) var(--spacing-xxl);
  }

  .hero h1 {
    font-size: 32px;
  }

  .mission-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
