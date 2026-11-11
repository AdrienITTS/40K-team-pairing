<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { toBlob } from 'html-to-image'
import GradeChip from './GradeChip.vue'
import RoleIcon from './RoleIcon.vue'
import { factionName } from '../../data/factions'
import {
  layoutForRound,
  moduleLabel,
  type Matchup,
  type PairingState,
  type PlayerRole,
  type TeamSide,
} from '../../data/pairing'
import { estimateCount, projectRound, readEstimate } from '../../data/estimates'

/**
 * The whole round on one card, in pick order — roles, layout, armies and
 * estimates — laid out to be shared as an image (Discord, the team chat), the
 * way the team's spreadsheet summary is.
 */
const props = defineProps<{ state: PairingState }>()

const config = computed(() => props.state.config)
const ourSide = computed<TeamSide>(() => config.value.estimateSide ?? 'A')
const hasEstimates = computed(() => estimateCount(config.value.estimates) > 0)

const projection = computed(() =>
  projectRound(
    props.state.matchups,
    ourSide.value,
    config.value.estimates,
    {},
    config.value.teamA.players.length,
  ),
)

const rows = computed(() =>
  props.state.matchups.map((m, i) => {
    const table = projection.value.tables[i]!
    return {
      matchup: m,
      cell: readEstimate(config.value.estimates, table.ourPlayerId, table.oppPlayerId),
      projected: table,
    }
  }),
)

function roleOf(m: Matchup, side: TeamSide): PlayerRole {
  if (m.matchType === 'refused') return 'refused'
  if (m.matchType === 'champion') return 'champion'
  return m.defenderSide === side ? 'defender' : 'attacker'
}

const ROLE_LABELS: Record<PlayerRole, string> = {
  defender: 'Defender',
  attacker: 'Attacker',
  refused: 'Refused',
  champion: 'Champion',
}

function roleStyle(role: PlayerRole) {
  return {
    '--role': `var(--color-role-${role})`,
    '--role-tint': `var(--color-role-${role}-tint)`,
  }
}

const VERDICT_LABELS = { win: 'Projected win', draw: 'Projected draw', loss: 'Projected loss' }

// --- Image export -------------------------------------------------------------

const card = useTemplateRef<HTMLElement>('card')
const busy = ref(false)
const status = ref<string | null>(null)

const fileName = computed(() => {
  const slug = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  return `round-${config.value.round}-${slug(config.value.teamA.name)}-vs-${slug(config.value.teamB.name)}.png`
})

// The share sheet is how a phone saves an image to its gallery or posts it to
// Discord; desktops mostly lack file sharing, so they download it instead.
const canCopy = typeof ClipboardItem !== 'undefined' && Boolean(navigator.clipboard?.write)

async function render(): Promise<Blob> {
  if (!card.value) throw new Error('The summary card is not mounted')
  const blob = await toBlob(card.value, { pixelRatio: 2 })
  if (!blob) throw new Error('The browser could not render the summary')
  return blob
}

async function run(action: () => Promise<string | null>) {
  busy.value = true
  status.value = null
  try {
    status.value = await action()
  } catch (error) {
    // Closing the share sheet is a choice, not a failure.
    if (error instanceof DOMException && error.name === 'AbortError') return
    status.value = `Export failed: ${error instanceof Error ? error.message : String(error)}`
  } finally {
    busy.value = false
  }
}

function download(blob: Blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName.value
  link.click()
  URL.revokeObjectURL(url)
}

const shareImage = () =>
  run(async () => {
    const file = new File([await render()], fileName.value, { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: `Round ${config.value.round} pairings` })
      return null
    }
    download(file)
    return 'Image downloaded.'
  })

const copyImage = () =>
  run(async () => {
    // Safari needs the ClipboardItem built synchronously from a pending blob.
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': render() })])
    return 'Image copied — paste it into Discord.'
  })
</script>

<template>
  <section class="summary-wrap">
    <div ref="card" class="summary">
      <header class="summary-head">
        <p class="eyebrow">Round {{ config.round }} pairings</p>
        <h2 class="teams">
          <span class="team-a">{{ config.teamA.name }}</span>
          <span class="vs">vs</span>
          <span class="team-b">{{ config.teamB.name }}</span>
        </h2>
      </header>

      <ol class="rows">
        <li v-for="(row, i) in rows" :key="row.matchup.id" class="row">
          <span class="row-no">{{ i + 1 }}</span>

          <span class="row-meta">
            <span class="module">{{ moduleLabel(row.matchup.module) }}</span>
            <span class="layout">
              Layout
              <strong>{{ row.matchup.layout.value ?? '?' }}</strong>
            </span>
          </span>

          <span class="player player-a">
            <img
              v-if="row.matchup.playerA.faction"
              :src="`/images/factions/${row.matchup.playerA.faction}.webp`"
              alt=""
              width="28"
              height="28"
            />
            <span class="player-name">{{ factionName(row.matchup.playerA.faction) }}</span>
            <span class="role" :style="roleStyle(roleOf(row.matchup, 'A'))">
              <RoleIcon :role="roleOf(row.matchup, 'A')" />
              {{ ROLE_LABELS[roleOf(row.matchup, 'A')] }}
            </span>
          </span>

          <span class="row-vs">vs</span>

          <span class="player player-b">
            <img
              v-if="row.matchup.playerB.faction"
              :src="`/images/factions/${row.matchup.playerB.faction}.webp`"
              alt=""
              width="28"
              height="28"
            />
            <span class="player-name">{{ factionName(row.matchup.playerB.faction) }}</span>
            <span class="role" :style="roleStyle(roleOf(row.matchup, 'B'))">
              <RoleIcon :role="roleOf(row.matchup, 'B')" />
              {{ ROLE_LABELS[roleOf(row.matchup, 'B')] }}
            </span>
          </span>

          <span v-if="hasEstimates" class="estimate">
            <span class="grades" title="Estimate on a table that suits us / one that doesn't">
              <GradeChip :grade="row.cell.good" />
              <GradeChip :grade="row.cell.bad" />
            </span>
            <span class="projected">
              <template v-if="row.projected.bp !== null">→ {{ row.projected.bp }} BP</template>
              <template v-else>→ –</template>
            </span>
          </span>
        </li>
      </ol>

      <footer class="summary-foot">
        <span> Refused and Champion tables play Layout {{ layoutForRound(config.round) }}. </span>
        <span v-if="hasEstimates" class="total">
          {{ VERDICT_LABELS[projection.verdict] }} ·
          <strong>{{ projection.ourBp }}–{{ projection.oppBp }} BP</strong>
          · {{ projection.teamPoints }} TP
        </span>
      </footer>
    </div>

    <div class="export">
      <button type="button" class="btn-primary" :disabled="busy" @click="shareImage">
        {{ busy ? 'Rendering…' : 'Share image' }}
      </button>
      <button
        v-if="canCopy"
        type="button"
        class="btn-secondary"
        :disabled="busy"
        @click="copyImage"
      >
        Copy image
      </button>
      <p v-if="status" class="export-status" role="status">{{ status }}</p>
    </div>
  </section>
</template>

<style scoped>
.summary-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

/* The card is the exported image, so it carries its own background and padding
   and lays itself out off its own width (container queries) rather than the
   viewport's. */
.summary {
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  background: var(--color-surface-card);
  color: var(--color-body);
}

.eyebrow {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-primary);
}

.teams {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 var(--spacing-xs);
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 500;
  letter-spacing: -0.3px;
  line-height: 1.15;
  color: var(--color-ink);
}

.vs,
.row-vs {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-muted-soft);
}

.team-a {
  color: var(--color-accent-teal);
}

.team-b {
  color: var(--color-accent-amber);
}

.rows {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
}

/* One line per table on a wide card: number, module + layout, both players,
   then the estimates. */
.row {
  display: grid;
  grid-template-columns: 28px 132px minmax(0, 1fr) auto minmax(0, 1fr) auto;
  grid-template-areas: 'no meta a vs b est';
  align-items: center;
  gap: var(--spacing-xs) var(--spacing-sm);
  padding: var(--spacing-xs) 0;
  border-top: 1px solid var(--color-hairline-soft);
}

.row-no {
  grid-area: no;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-pill);
  background: var(--color-surface-strong);
  font-size: 13px;
  font-weight: 700;
  color: var(--color-ink);
}

.row-meta {
  grid-area: meta;
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: var(--color-muted);
}

.module {
  font-weight: 600;
  color: var(--color-body);
}

.layout strong {
  color: var(--color-ink);
}

.player {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 0;
}

.player-a {
  grid-area: a;
}

.player-b {
  grid-area: b;
}

.row-vs {
  grid-area: vs;
}

.player img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  flex-shrink: 0;
}

.player-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
}

.role {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
  padding: 2px 7px 2px 5px;
  border-radius: var(--radius-pill);
  background: var(--role-tint);
  color: var(--role);
  font-size: 11px;
  font-weight: 600;
}

.role :deep(svg) {
  width: 12px;
  height: 12px;
}

.estimate {
  grid-area: est;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  justify-self: end;
}

.grades {
  display: flex;
  gap: 2px;
}

.projected {
  min-width: 52px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.summary-foot {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--spacing-xxs) var(--spacing-md);
  padding-top: var(--spacing-xs);
  border-top: 1px solid var(--color-hairline);
  font-size: 12px;
  color: var(--color-muted);
}

.total {
  color: var(--color-body);
}

.total strong {
  color: var(--color-ink);
}

.export {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-xs) var(--spacing-sm);
}

.export button:disabled {
  opacity: 0.6;
  cursor: progress;
}

.export-status {
  font-size: 13px;
  color: var(--color-muted);
}

/* Narrow card (a phone): each table becomes two lines — number, module, layout
   and estimates on top, the two players underneath, stacked. */
@container (max-width: 640px) {
  .row {
    grid-template-columns: 28px minmax(0, 1fr) auto;
    grid-template-areas:
      'no meta est'
      '. a a'
      '. b b';
    gap: 2px var(--spacing-xs);
  }

  .row-meta {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0 var(--spacing-xs);
  }

  /* Stacked, the two players read as a pair without the separator. */
  .row-vs {
    display: none;
  }

  .teams {
    font-size: 22px;
  }
}
</style>
