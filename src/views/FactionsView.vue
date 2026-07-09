<script setup lang="ts">
import { ref } from 'vue'
import { allegiances, type FactionInfo } from '../data/factions'
import FactionModal from '../components/FactionModal.vue'

const selectedFaction = ref<FactionInfo | null>(null)

function openFaction(faction: FactionInfo) {
  selectedFaction.value = faction
}

function closeFaction() {
  selectedFaction.value = null
}
</script>

<template>
  <main class="factions">
    <section class="hero">
      <p class="badge-pill">Warhammer 40,000 · Teams Event</p>
      <h1>Factions</h1>
      <p class="lede">
        Every Codex available for a Teams Event, grouped by allegiance. Within a team, only one
        player may field units carrying a given faction keyword — normally one player per Codex.
        Select a faction for its lore, difficulty, and how it plays competitively.
      </p>
    </section>

    <section v-for="allegiance in allegiances" :key="allegiance.id" class="allegiance">
      <header class="allegiance-head">
        <h2>{{ allegiance.title }}</h2>
        <span class="count">{{ allegiance.factions.length }} factions</span>
      </header>
      <p class="allegiance-blurb">{{ allegiance.blurb }}</p>

      <ul class="faction-grid">
        <li v-for="faction in allegiance.factions" :key="faction.key">
          <button type="button" class="faction-card" @click="openFaction(faction)">
            <div class="logo-tile">
              <img
                :src="`/images/factions/${faction.key}.png`"
                :alt="`${faction.name} logo`"
                width="48"
                height="48"
                loading="lazy"
              />
            </div>
            <span class="faction-name">{{ faction.name }}</span>
          </button>
        </li>
      </ul>
    </section>

    <FactionModal :faction="selectedFaction" @close="closeFaction" />
  </main>
</template>

<style scoped>
.factions {
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
  max-width: 640px;
}

.allegiance {
  margin-bottom: var(--spacing-xxl);
}

.allegiance-head {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
}

.allegiance-head h2 {
  font-size: 28px;
  letter-spacing: -0.3px;
}

.count {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-muted);
}

.allegiance-blurb {
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-body);
  max-width: 640px;
  margin: var(--spacing-xs) 0 var(--spacing-lg);
}

.faction-grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.faction-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    transform 0.15s ease;
}

.faction-card:hover,
.faction-card:focus-visible {
  background: var(--color-surface-strong);
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

@media (prefers-reduced-motion: reduce) {
  .faction-card {
    transition: none;
  }

  .faction-card:hover,
  .faction-card:focus-visible {
    transform: none;
  }
}

.logo-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  background: var(--color-canvas);
  flex-shrink: 0;
}

.logo-tile img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.faction-name {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 500;
  color: var(--color-ink);
  line-height: 1.3;
}

@media (max-width: 640px) {
  .factions {
    padding: var(--spacing-lg) var(--spacing-md) var(--spacing-xxl);
  }

  .hero h1 {
    font-size: 32px;
  }

  .faction-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
