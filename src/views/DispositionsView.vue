<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import {
  dispositions,
  getDisposition,
  dispositionName,
  type Disposition,
  type DispositionKey,
} from '../data/dispositions'
import DispositionIcon from '../components/DispositionIcon.vue'

// Inline custom-property bindings so the disposition accent stays a token
// reference (defined in base.css) rather than a hardcoded literal in the SFC.
function accent(key: DispositionKey) {
  return {
    '--accent': `var(--color-disposition-${key})`,
    '--accent-tint': `var(--color-disposition-${key}-tint)`,
  }
}

const symbolOf = (key: DispositionKey) => getDisposition(key).symbol

// Lightbox showing the full source card image.
const active = ref<Disposition | null>(null)
function open(d: Disposition) {
  active.value = d
}
function close() {
  active.value = null
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <main class="dispositions">
    <section class="hero">
      <p class="badge-pill">Warhammer 40,000 · Teams Event</p>
      <h1>Force Dispositions</h1>
      <p class="lede">
        After mustering their army, each player selects one Force Disposition — and within a team,
        only one player may take each Disposition for every 5 players. At the table, find your
        opponent's Disposition symbol on your own card: the Primary Mission listed beside it is the
        one you play.
      </p>
    </section>

    <ul class="grid" aria-label="Force Dispositions">
      <li v-for="d in dispositions" :key="d.key" class="card" :style="accent(d.key)">
        <header class="card-head">
          <span class="symbol"><DispositionIcon :symbol="d.symbol" /></span>
          <div class="titles">
            <h2>{{ d.name }}</h2>
            <p class="tagline">{{ d.tagline }}</p>
          </div>
        </header>

        <p class="desc">{{ d.description }}</p>

        <table class="matrix">
          <thead>
            <tr>
              <th scope="col">Opponent</th>
              <th scope="col">Your Primary Mission</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in d.matchups" :key="m.opponent">
              <th
                scope="row"
                class="opp"
                :style="{
                  '--opp': `var(--color-disposition-${m.opponent})`,
                  '--opp-tint': `var(--color-disposition-${m.opponent}-tint)`,
                }"
              >
                <span class="opp-symbol"><DispositionIcon :symbol="symbolOf(m.opponent)" /></span>
                <span class="opp-name">{{ dispositionName(m.opponent) }}</span>
              </th>
              <td>{{ m.mission }}</td>
            </tr>
          </tbody>
        </table>

        <button type="button" class="view-card" @click="open(d)">View card →</button>
      </li>
    </ul>

    <Transition name="fade">
      <div
        v-if="active"
        class="lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="`${active.name} Force Disposition card`"
        @click="close"
      >
        <img
          :src="`/images/dispositions/${active.key}.png`"
          :alt="`${active.name} Force Disposition card`"
          @click.stop
        />
        <button type="button" class="lightbox-close" aria-label="Close" @click="close">✕</button>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.dispositions {
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

.grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-md);
}

/* Each card carries a hairline border plus a 3px accent stripe on the left,
   matching the accent-edge treatment used elsewhere (no drop shadows). */
.card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
}

.card-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.symbol {
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

.titles h2 {
  font-size: 22px;
  letter-spacing: -0.3px;
  line-height: 1.1;
}

.tagline {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
}

.desc {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-body);
}

.matrix {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.matrix thead th {
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-muted);
  padding: 0 0 var(--spacing-xxs);
  border-bottom: 1px solid var(--color-hairline);
}

.matrix tbody tr {
  border-bottom: 1px solid var(--color-hairline-soft);
}

.matrix tbody tr:last-child {
  border-bottom: none;
}

.opp {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm) var(--spacing-xs) 0;
  font-weight: 500;
  color: var(--color-body-strong);
  text-align: left;
}

.opp-symbol {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 4px;
  border-radius: var(--radius-sm);
  background: var(--opp-tint);
  color: var(--opp);
  flex-shrink: 0;
}

.opp-name {
  white-space: nowrap;
}

.matrix td {
  padding: var(--spacing-xs) 0;
  color: var(--color-ink);
  font-weight: 500;
  text-align: right;
  vertical-align: middle;
}

.view-card {
  align-self: flex-start;
  margin-top: auto;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-tint);
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  padding: var(--spacing-xs) var(--spacing-md);
  cursor: pointer;
}

.view-card:hover,
.view-card:focus-visible {
  border-color: var(--accent);
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
  cursor: zoom-out;
}

.lightbox img {
  max-width: min(440px, 100%);
  max-height: 92vh;
  width: auto;
  object-fit: contain;
  border-radius: var(--radius-lg);
  cursor: default;
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

@media (max-width: 640px) {
  .dispositions {
    padding: var(--spacing-lg) var(--spacing-md) var(--spacing-xxl);
  }

  .hero h1 {
    font-size: 32px;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
