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
                :src="`/images/factions/${faction.key}.png`"
                :alt="`${faction.name} logo`"
                width="56"
                height="56"
              />
            </div>
            <div>
              <p class="modal-allegiance">{{ faction.allegiance }}</p>
              <h2>{{ faction.name }}</h2>
            </div>
          </div>

          <section class="modal-section">
            <h3>Lore</h3>
            <p>{{ faction.lore }}</p>
          </section>

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
            <h3>Competitive play</h3>
            <p>{{ faction.playstyle }}</p>
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
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding-right: var(--spacing-xl);
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
</style>
