<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import type { FactionInfo } from '../data/factions'

// Kept mounted with a nullable faction so the close animation can play — a
// parent `v-if` would destroy the component before it could animate out.
const props = defineProps<{
  faction: FactionInfo | null
}>()

const emit = defineEmits<{
  close: []
}>()

function onKeydown(event: KeyboardEvent) {
  if (props.faction && event.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="faction" class="modal-backdrop" @click.self="emit('close')">
        <div
          class="modal-panel"
          role="dialog"
          aria-modal="true"
          :aria-label="`${faction.name} details`"
        >
          <button class="modal-close" type="button" aria-label="Close" @click="emit('close')">
            ✕
          </button>

          <div class="modal-head">
            <div class="modal-logo">
              <img
                :src="`/images/factions/${faction.key}.webp`"
                :alt="`${faction.name} logo`"
                width="56"
                height="56"
              />
            </div>
            <div class="modal-head-text">
              <p class="modal-allegiance">{{ faction.allegiance }}</p>
              <h2>{{ faction.name }}</h2>
              <ul class="chips" aria-label="Competitive profile">
                <li class="chip">{{ faction.archetype }}</li>
                <li class="chip">{{ faction.range }}</li>
                <li class="chip" :class="`consistency-${faction.consistency.toLowerCase()}`">
                  {{ faction.consistency }}
                </li>
              </ul>
            </div>
          </div>

          <section class="modal-section">
            <h3>Difficulty</h3>
            <p class="stars" :aria-label="`${faction.difficulty} out of 5 difficulty`">
              <span
                v-for="n in 5"
                :key="n"
                class="star"
                :class="{ filled: n <= faction.difficulty }"
                aria-hidden="true"
                >★</span
              >
            </p>
          </section>

          <section class="modal-section">
            <h3>Lore</h3>
            <p>{{ faction.lore }}</p>
          </section>

          <section class="modal-section">
            <h3>How it plays</h3>
            <p>{{ faction.playstyle }}</p>
          </section>

          <div class="sw-grid">
            <section class="modal-section">
              <h3>Strengths</h3>
              <ul class="trait-list strengths">
                <li v-for="(item, i) in faction.strengths" :key="i">{{ item }}</li>
              </ul>
            </section>

            <section class="modal-section">
              <h3>Weaknesses</h3>
              <ul class="trait-list weaknesses">
                <li v-for="(item, i) in faction.weaknesses" :key="i">{{ item }}</li>
              </ul>
            </section>
          </div>

          <section class="modal-section">
            <h3>In a team</h3>
            <p>{{ faction.teamRole }}</p>
          </section>

          <section class="modal-section pairing-tip">
            <h3>Blind-pairing tip</h3>
            <p>{{ faction.pairingTip }}</p>
          </section>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: var(--color-scrim);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  z-index: 100;
}

/* Open/close: the scrim fades while the panel scales and lifts into place. */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.22s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel {
  transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-enter-from .modal-panel,
.modal-leave-to .modal-panel {
  transform: scale(0.95) translateY(12px);
}

@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active .modal-panel,
  .modal-leave-active .modal-panel {
    transition: none;
  }

  .modal-enter-from .modal-panel,
  .modal-leave-to .modal-panel {
    transform: none;
  }
}

.modal-panel {
  position: relative;
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  width: 100%;
  max-width: 480px;
  max-height: calc(100vh - var(--spacing-xxl));
  overflow-y: auto;
}

.modal-close {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-pill);
  background: var(--color-surface-card);
  color: var(--color-muted);
  font-size: 14px;
}

.modal-close:hover {
  color: var(--color-ink);
}

.modal-head {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding-right: var(--spacing-xl);
}

.modal-head-text {
  min-width: 0;
}

.modal-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  background: var(--color-surface-card);
  flex-shrink: 0;
}

.modal-logo img {
  width: 56px;
  height: 56px;
  object-fit: contain;
}

.modal-allegiance {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-muted);
  margin-bottom: 2px;
}

.modal-head h2 {
  font-size: 24px;
  letter-spacing: -0.3px;
}

.modal-section {
  margin-bottom: var(--spacing-lg);
}

.modal-section:last-child {
  margin-bottom: 0;
}

.modal-section h3 {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--color-muted);
  margin-bottom: var(--spacing-xs);
}

.modal-section p {
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-body);
}

.stars {
  display: flex;
  gap: 2px;
  font-size: 20px;
  line-height: 1;
}

.star {
  color: var(--color-muted-soft);
}

.star.filled {
  color: var(--color-primary);
}

/* Competitive profile chips under the faction name. */
.chips {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xxs);
  margin-top: var(--spacing-xs);
}

.chip {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--color-body-strong);
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-pill);
  padding: 2px var(--spacing-xs);
}

/* Consistency chip is colour-coded to the blind-pairing axis: teal = safe to
   drop blind, amber = feast-or-famine, best counter-picked. */
.chip.consistency-consistent {
  color: var(--color-accent-teal);
  background: var(--color-accent-teal-tint);
  border-color: var(--color-accent-teal);
}

.chip.consistency-polarising {
  color: var(--color-accent-amber);
  background: var(--color-accent-amber-tint);
  border-color: var(--color-accent-amber);
}

/* Strengths / weaknesses sit side by side, collapsing to one column when narrow. */
.sw-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.sw-grid .modal-section {
  margin-bottom: 0;
}

.trait-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.trait-list li {
  position: relative;
  padding-left: var(--spacing-md);
  font-size: 14px;
  line-height: 1.45;
  color: var(--color-body);
}

.trait-list li::before {
  position: absolute;
  left: 0;
  top: 0;
  font-weight: 700;
}

.trait-list.strengths li::before {
  content: '+';
  color: var(--color-accent-teal);
}

.trait-list.weaknesses li::before {
  content: '−';
  color: var(--color-accent-amber);
}

/* The blind-pairing tip is the app's raison d'être — give it a coral accent. */
.pairing-tip {
  border-left: 3px solid var(--color-primary);
  padding-left: var(--spacing-md);
}

@media (max-width: 480px) {
  .sw-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
}
</style>
