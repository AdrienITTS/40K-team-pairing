<script setup lang="ts">
import { RouterLink } from 'vue-router'
import CodeWindowCard from '../components/CodeWindowCard.vue'
import IconDocumentation from '../components/icons/IconDocumentation.vue'
import IconTooling from '../components/icons/IconTooling.vue'
import IconEcosystem from '../components/icons/IconEcosystem.vue'
import IconCommunity from '../components/icons/IconCommunity.vue'

const features = [
  {
    icon: IconEcosystem,
    title: 'Pairing system',
    text: 'Initial Skirmish, Main Engagement, and Champion System modules pair players fairly for teams of 3 to 8, round after round.',
  },
  {
    icon: IconTooling,
    title: 'Full mission sequence',
    text: 'From battlefield setup and deployment through five battle rounds, walked through step by step.',
  },
  {
    icon: IconDocumentation,
    title: 'VP, BP & TP scoring',
    text: 'VP caps, the Battle Points conversion table, and team win margins — straight from the official rules.',
  },
  {
    icon: IconCommunity,
    title: 'Tournament rankings',
    text: 'Round pairing and final rankings by Team Points, individual wins, and total Battle Points.',
  },
]

const bpExample = `<span class="muted"># round 2, table 4</span>
Player A            86 VP
Player B            54 VP
──────────────────────────
VP differential     32

Player A Battle Points   <span class="highlight">16</span>
Player B Battle Points    <span class="highlight">4</span>`
</script>

<template>
  <main class="home">
    <section class="hero container">
      <div class="hero-copy">
        <p class="badge-pill">Warhammer 40,000 · Teams Event</p>
        <h1>Fair pairings for every Team Event.</h1>
        <p class="lede">
          A companion for Warhammer 40,000 Teams Events — pairing rounds, the full mission sequence,
          and VP/BP/TP scoring, straight from the official rules.
        </p>
        <div class="cta-row">
          <RouterLink to="/pairing" class="btn-primary">Start pairing</RouterLink>
          <RouterLink to="/how-it-works" class="btn-secondary">See how it works</RouterLink>
        </div>
      </div>

      <div class="hero-art">
        <img alt="Les Bastonneurs" src="/images/logo.png" width="220" height="210" />
      </div>
    </section>

    <section class="features container">
      <article v-for="feature in features" :key="feature.title" class="feature-card">
        <div class="icon-tile">
          <component :is="feature.icon" />
        </div>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.text }}</p>
        <RouterLink to="/how-it-works" class="text-link">Learn more →</RouterLink>
      </article>
    </section>

    <section class="signature container">
      <p class="badge-pill">Worked example</p>
      <h2>The scoring, spelled out.</h2>
      <p class="lede">
        Every game's VP difference converts to Battle Points for your team — here's the table in
        action.
      </p>

      <CodeWindowCard class="signature-code" :code="bpExample" />
    </section>

    <section class="callout container">
      <div class="callout-card-primary">
        <h2>Run your next Teams Event with confidence.</h2>
        <p>
          Every pairing module, mission step, and scoring table — worked out from the official
          rules.
        </p>
        <RouterLink to="/how-it-works" class="btn-secondary">Read the full rules</RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-section);
  padding-bottom: var(--spacing-section);
}

/* Hero */

.hero {
  padding-top: var(--spacing-xl);
  display: grid;
  grid-template-columns: minmax(0, 6fr) minmax(0, 6fr);
  align-items: center;
  gap: var(--spacing-xxl);
}

.hero-copy {
  max-width: 520px;
}

.hero .badge-pill {
  margin-bottom: var(--spacing-md);
}

.hero h1 {
  font-size: 56px;
  line-height: 1.08;
  letter-spacing: -1.2px;
  margin-bottom: var(--spacing-md);
}

.lede {
  font-size: 18px;
  line-height: 1.6;
  color: var(--color-body);
  margin-bottom: var(--spacing-lg);
}

.cta-row {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.hero-art {
  background: var(--color-surface-dark);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xxl);
}

.hero-art img {
  width: 100%;
  max-width: 220px;
  height: auto;
}

/* Feature grid */

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-lg);
}

.feature-card {
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.icon-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-canvas);
  color: var(--color-ink);
  margin-bottom: var(--spacing-xs);
}

.feature-card h3 {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 500;
  color: var(--color-ink);
}

.feature-card p {
  font-size: 14px;
  line-height: 1.55;
  color: var(--color-body);
  flex: 1;
}

/* Signature worked-example band */

.signature h2 {
  font-size: 36px;
  letter-spacing: -0.5px;
  margin-bottom: var(--spacing-sm);
}

.signature .lede {
  max-width: 560px;
}

.signature-code {
  display: block;
  margin-top: var(--spacing-lg);
}

/* Primary callout */

.callout-card-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xxl);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.callout-card-primary h2 {
  color: var(--color-on-primary);
  font-size: 28px;
  letter-spacing: -0.3px;
}

.callout-card-primary p {
  max-width: 480px;
  color: var(--color-on-primary);
  opacity: 0.92;
  margin-bottom: var(--spacing-xs);
}

@media (max-width: 860px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .hero-art {
    order: -1;
  }
}

@media (max-width: 640px) {
  .hero h1 {
    font-size: 36px;
  }

  .signature h2 {
    font-size: 28px;
  }
}
</style>
