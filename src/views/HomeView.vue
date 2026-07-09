<script setup lang="ts">
import { RouterLink } from 'vue-router'
import CodeWindowCard from '../components/CodeWindowCard.vue'
import DispositionIcon from '../components/DispositionIcon.vue'
import { dispositions } from '../data/dispositions'
import IconDocumentation from '../components/icons/IconDocumentation.vue'
import IconTooling from '../components/icons/IconTooling.vue'
import IconEcosystem from '../components/icons/IconEcosystem.vue'
import IconCommunity from '../components/icons/IconCommunity.vue'

const features = [
  {
    icon: IconEcosystem,
    title: 'Pairing system',
    text: 'Initial Skirmish, Main Engagement, and Champion System modules pair players fairly for teams of 3 to 8, round after round.',
    to: '/pairing',
    linkText: 'Open the pairing tool →',
  },
  {
    icon: IconTooling,
    title: 'Full mission sequence',
    text: 'From battlefield setup and deployment through five battle rounds, walked through step by step.',
    to: '/how-it-works#play-the-battle',
    linkText: 'Learn more →',
  },
  {
    icon: IconDocumentation,
    title: 'VP, BP & TP scoring',
    text: 'VP caps, the Battle Points conversion table, and team win margins — straight from the official rules.',
    to: '/how-it-works#score-the-game',
    linkText: 'Learn more →',
  },
  {
    icon: IconCommunity,
    title: 'Tournament rankings',
    text: 'Round pairing and final rankings by Team Points, individual wins, and total Battle Points.',
    to: '/how-it-works#tournament-rankings',
    linkText: 'Learn more →',
  },
]

// The reference library — the card decks and codex roster the app has grown to
// cover. Each card renders a distinct thumbnail treatment (`kind`): a full-bleed
// image, the ring of Disposition symbols, a rotated (landscape) deployment map,
// or a lettered initials tile.
interface RefCard {
  title: string
  count: string
  text: string
  to: string
  kind: 'image' | 'layout' | 'dispositions' | 'initials'
  /** For `image` / `layout` kinds. */
  image?: string
  /** `image` kind only: the faction logo is a padded transparent PNG — contain, don't crop. */
  contain?: boolean
  /** `initials` kind only. */
  initials?: string
  accent?: 'teal' | 'amber'
}

const references: RefCard[] = [
  {
    title: 'Factions',
    count: '27 codices',
    text: 'Every codex profiled on the blind-pairing axis: archetype, damage range, and how hard the army swings across the field.',
    to: '/factions',
    kind: 'image',
    image: '/images/factions/space_marines.png',
    contain: true,
  },
  {
    title: 'Force Dispositions',
    count: '5 stances',
    text: 'The post-muster stance that decides which Primary Mission you play against each opponent.',
    to: '/dispositions',
    kind: 'dispositions',
  },
  {
    title: 'Deployment layouts',
    count: '45 maps',
    text: 'Three terrain layouts for every Disposition pairing, clean or measurement-annotated.',
    to: '/layouts',
    kind: 'layout',
    // Pre-cropped to just the board (title band, labels and legend removed) — see
    // public/images/home/deployment-map.png.
    image: '/images/home/deployment-map.png',
  },
  {
    title: 'Primary Missions',
    count: '25 missions',
    text: 'The mission the Disposition matchup hands you — one card for every pairing of stances.',
    to: '/primaries',
    kind: 'initials',
    initials: 'PM',
    accent: 'teal',
  },
  {
    title: 'Secondary Missions',
    count: '18 cards',
    text: 'The full Secondary deck, every card’s scoring rules rendered in full.',
    to: '/secondaries',
    kind: 'initials',
    initials: 'SM',
    accent: 'amber',
  },
]

// Position each Disposition symbol evenly around a ring, kept upright, and tint
// it with its accent token.
function dispNodeStyle(index: number, key: string) {
  const angle = index * (360 / dispositions.length)
  return {
    transform: `rotate(${angle}deg) translateY(-40px) rotate(${-angle}deg)`,
    color: `var(--color-disposition-${key})`,
  }
}

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
        <RouterLink :to="feature.to" class="text-link">{{ feature.linkText }}</RouterLink>
      </article>
    </section>

    <section class="library container">
      <p class="badge-pill">Reference library</p>
      <h2>The whole rulebook, on hand.</h2>
      <p class="lede">
        Every card and codex you'll reach for at the table — the faction roster, the Force
        Dispositions, the deployment maps, and the Primary and Secondary decks.
      </p>

      <div class="library-grid">
        <RouterLink v-for="ref in references" :key="ref.title" :to="ref.to" class="library-card">
          <div
            class="library-thumb"
            :class="{
              contain: ref.contain,
              landscape: ref.kind === 'layout',
              center: ref.kind === 'dispositions' || ref.kind === 'initials',
              'initials-teal': ref.accent === 'teal',
              'initials-amber': ref.accent === 'amber',
            }"
          >
            <img
              v-if="ref.kind === 'image' || ref.kind === 'layout'"
              :src="ref.image"
              :alt="ref.title"
              width="320"
              height="200"
              loading="lazy"
            />
            <div v-else-if="ref.kind === 'dispositions'" class="disp-ring" aria-hidden="true">
              <span
                v-for="(d, i) in dispositions"
                :key="d.key"
                class="disp-node"
                :style="dispNodeStyle(i, d.key)"
              >
                <DispositionIcon :symbol="d.symbol" />
              </span>
            </div>
            <span v-else class="initials" aria-hidden="true">{{ ref.initials }}</span>
          </div>
          <div class="library-body">
            <span class="library-count">{{ ref.count }}</span>
            <h3>{{ ref.title }}</h3>
            <p>{{ ref.text }}</p>
            <span class="text-link">Browse {{ ref.title.toLowerCase() }} →</span>
          </div>
        </RouterLink>
      </div>
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

/* Reference library */

.library h2 {
  font-size: 36px;
  letter-spacing: -0.5px;
  margin-top: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.library .lede {
  max-width: 560px;
  margin-bottom: var(--spacing-xl);
}

.library-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--spacing-lg);
}

.library-card {
  display: flex;
  flex-direction: column;
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition:
    border-color 0.18s ease,
    transform 0.18s ease,
    background 0.18s ease;
}

.library-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.library-thumb {
  position: relative;
  aspect-ratio: 16 / 10;
  background: var(--color-surface-strong);
  border-bottom: 1px solid var(--color-hairline);
  overflow: hidden;
}

.library-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.library-thumb.center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.library-thumb.contain {
  background: var(--color-surface-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
}

.library-thumb.contain img {
  object-fit: contain;
}

/* The cropped board is portrait; rotate it to landscape so it fills the tile.
   162% height makes the rotated image cover the 16/10 tile width edge-to-edge. */
.library-thumb.landscape img {
  position: absolute;
  top: 50%;
  left: 50%;
  width: auto;
  height: 162%;
  max-width: none;
  object-fit: contain;
  transform: translate(-50%, -50%) rotate(90deg);
}

/* Force Dispositions — the five symbols evenly around a ring. */
.disp-ring {
  position: relative;
  width: 110px;
  height: 110px;
}

.disp-node {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30px;
  height: 30px;
  margin: -15px 0 0 -15px;
}

/* Primary / Secondary — a lettered initials tile. */
.library-thumb.initials-teal {
  background: var(--color-accent-teal-tint);
}

.library-thumb.initials-amber {
  background: var(--color-accent-amber-tint);
}

.initials {
  font-family: var(--font-display);
  font-size: 60px;
  font-weight: 500;
  letter-spacing: -1.5px;
}

.initials-teal .initials {
  color: var(--color-accent-teal);
}

.initials-amber .initials {
  color: var(--color-accent-amber);
}

.library-body {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs);
  flex: 1;
}

.library-count {
  font-family: var(--font-mono);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-muted);
}

.library-body h3 {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 500;
  color: var(--color-ink);
}

.library-body p {
  font-size: 14px;
  line-height: 1.55;
  color: var(--color-body);
  flex: 1;
  margin-bottom: var(--spacing-xs);
}

.library-card .text-link {
  color: var(--color-primary);
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

  .signature h2,
  .library h2 {
    font-size: 28px;
  }
}
</style>
