<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Allegiance } from '../../data/factions'
import { allegiances, factionName, isSpaceMarine } from '../../data/factions'
import { dispositions, type DispositionKey } from '../../data/dispositions'
import DispositionIcon from '../DispositionIcon.vue'
import EstimateGrid from './EstimateGrid.vue'
import {
  MAX_TEAM_SIZE,
  MIN_TEAM_SIZE,
  dispositionCap,
  modulesForTeamSize,
  moduleLabel,
  type PairingConfig,
  type Player,
  type TeamSide,
} from '../../data/pairing'
import { estimateCount, layoutStanceCount, type EstimateTable } from '../../data/estimates'
import { EXAMPLE_SETUP, parsePairingConfig } from '../../data/pairingText'

const emit = defineEmits<{ start: [config: PairingConfig] }>()

/**
 * How much of the round the captain wants to set up before the picking starts.
 * Everything downstream — the pairing modules, the board, the scoring — is the
 * same either way; the modes differ only in how much they ask for up front.
 */
export type SetupMode = 'full' | 'minimal' | 'quick'

/**
 * Wizard steps, named rather than numbered because the sequence now depends on
 * the mode. Exposed so the page can react to the step (e.g. hide the intro copy
 * once the user is past the mode chooser).
 */
export type SetupStep =
  | 'mode'
  | 'round'
  | 'armies-a'
  | 'disp-a'
  | 'armies-b'
  | 'disp-b'
  | 'estimates'
  | 'paste'

const MODE_STEPS: Readonly<Record<SetupMode, readonly SetupStep[]>> = {
  full: ['round', 'armies-a', 'disp-a', 'armies-b', 'disp-b', 'estimates'],
  minimal: ['armies-a', 'armies-b'],
  quick: ['paste'],
}

const STEP_LABELS: Readonly<Record<SetupStep, string>> = {
  mode: 'Setup',
  round: 'Round',
  'armies-a': 'Team A armies',
  'disp-a': 'Team A dispositions',
  'armies-b': 'Team B armies',
  'disp-b': 'Team B dispositions',
  estimates: 'Estimates',
  paste: 'Paste setup',
}

const MODE_CARDS: ReadonlyArray<{ key: SetupMode; title: string; meta: string; desc: string }> = [
  {
    key: 'full',
    title: 'Full configuration',
    meta: '6 steps',
    desc: 'Round, team names, both rosters, every Force Disposition and your matchup estimates — everything the terrain maps, the estimates rail and the projected result need.',
  },
  {
    key: 'minimal',
    title: 'Minimal configuration',
    meta: '2 steps',
    desc: 'Just the two rosters. Names, Dispositions and estimates are skipped, so you get the pairing modules and the board — but no layout maps and no projection.',
  },
  {
    key: 'quick',
    title: 'Quick pairing',
    meta: 'paste & go',
    desc: 'Paste a setup you already have — armies, Dispositions, estimates and the round — and go straight to the live pairing.',
  },
]

const step = defineModel<SetupStep>('step', { default: 'mode' })

const mode = ref<SetupMode | null>(null)

/**
 * A step can arrive on the model before any mode has been chosen here — the page
 * owns the step, so it can restore one. Every step bar `paste` belongs to the
 * full flow, so that is the safe reading of a step with no mode behind it.
 */
const activeMode = computed<SetupMode | null>(() => {
  if (mode.value) return mode.value
  if (step.value === 'mode') return null
  return step.value === 'paste' ? 'quick' : 'full'
})

/** The mode chooser, then whatever that mode asks for. */
const steps = computed<SetupStep[]>(() => [
  'mode',
  ...(activeMode.value ? MODE_STEPS[activeMode.value] : []),
])
const stepIndex = computed(() => steps.value.indexOf(step.value))
const isLastStep = computed(() => stepIndex.value === steps.value.length - 1)

function goTo(index: number) {
  const next = steps.value[index]
  if (next) step.value = next
}
const nextStep = () => goTo(stepIndex.value + 1)
const prevStep = () => goTo(stepIndex.value - 1)

// Picking a mode is itself the answer to the first step, so it advances rather
// than waiting for a Next the user has no reason to think about.
function chooseMode(next: SetupMode) {
  mode.value = next
  step.value = MODE_STEPS[next][0]!
}

const isMinimal = computed(() => activeMode.value === 'minimal')

const round = ref(1)
const teamSize = ref(4)
const teamAName = ref('')
const teamBName = ref('')
const factionsA = ref<string[]>([])
const factionsB = ref<string[]>([])
// Optional Force Disposition per faction (keyed by faction key, unique per team).
const dispositionsA = ref<Record<string, DispositionKey>>({})
const dispositionsB = ref<Record<string, DispositionKey>>({})
// Step 6's matchup grid. Estimates are one team's own prep work, and the tool is
// run by that team, so they are always Team A's — Team A is "us" throughout.
const ESTIMATE_SIDE: TeamSide = 'A'
const estimates = ref<EstimateTable>({})

const sizes = Array.from({ length: MAX_TEAM_SIZE - MIN_TEAM_SIZE + 1 }, (_, i) => MIN_TEAM_SIZE + i)

// The allegiance roster is static, so sort it once at module load rather than
// per component instance.
const sortedAllegiances: Allegiance[] = allegiances.map((a) => ({
  ...a,
  factions: [...a.factions].sort((x, y) => x.name.localeCompare(y.name)),
}))

// In minimal mode the team size is however many armies Team A ends up with, so
// the summary only exists once that lands inside the supported range.
const summarySize = computed(() => (isMinimal.value ? factionsA.value.length : teamSize.value))
const moduleSummary = computed(() =>
  summarySize.value >= MIN_TEAM_SIZE && summarySize.value <= MAX_TEAM_SIZE
    ? modulesForTeamSize(summarySize.value).map(moduleLabel).join(' → ')
    : null,
)

// Team names are only asked for in full mode; everywhere else they fall back to
// the generic labels the breadcrumb already uses.
const nameA = computed(() => teamAName.value.trim() || 'Team A')
const nameB = computed(() => teamBName.value.trim() || 'Team B')

/**
 * How many armies a side may hold. Full mode fixes it up front; minimal mode
 * lets Team A pick any legal roster and then holds Team B to that count.
 */
function sizeLimit(side: TeamSide): number {
  if (!isMinimal.value) return teamSize.value
  return side === 'A' ? MAX_TEAM_SIZE : factionsA.value.length
}

const rostersReady = computed(
  () =>
    factionsA.value.length >= MIN_TEAM_SIZE &&
    factionsA.value.length <= MAX_TEAM_SIZE &&
    factionsB.value.length === factionsA.value.length,
)

/** Whether the current step is answered well enough to move on. */
const canAdvance = computed(() => {
  switch (step.value) {
    case 'mode':
      return mode.value !== null
    case 'round':
      return Boolean(teamAName.value.trim() && teamBName.value.trim())
    case 'armies-a':
      return isMinimal.value
        ? factionsA.value.length >= MIN_TEAM_SIZE
        : factionsA.value.length === teamSize.value
    case 'armies-b':
      return rostersReady.value
    case 'paste':
      return parsed.value.config !== null
    default:
      return true
  }
})

const canStart = computed(() =>
  activeMode.value === 'quick' ? parsed.value.config !== null : rostersReady.value,
)

// GAME.MD § 1: at most `cap` players per team may share a Force Disposition.
const cap = computed(() => dispositionCap(teamSize.value))

watch(round, (v) => {
  if (v < 1) round.value = 1
})

// Only ever trims, and only when it has to: in minimal mode the size follows
// Team A's roster, so an unconditional reassignment here would bounce back and
// forth with the `factionsA` watcher below.
watch(teamSize, (size) => {
  if (factionsA.value.length > size) factionsA.value = factionsA.value.slice(0, size)
  if (factionsB.value.length > size) factionsB.value = factionsB.value.slice(0, size)
  pruneDispositions()
  pruneEstimates()
})

// Drop any recorded Disposition whose faction is no longer on its team, and any
// that now exceed the per-team cap (e.g. after the team shrinks and the cap
// drops) — keeping the first `cap` of each in faction order.
function pruneDispositions() {
  const trim = (map: Record<string, DispositionKey>, keys: string[]) => {
    const counts: Partial<Record<DispositionKey, number>> = {}
    const out: Record<string, DispositionKey> = {}
    for (const k of keys) {
      const d = map[k]
      if (!d) continue
      const n = (counts[d] ?? 0) + 1
      counts[d] = n
      if (n <= cap.value) out[k] = d
    }
    return out
  }
  dispositionsA.value = trim(dispositionsA.value, factionsA.value)
  dispositionsB.value = trim(dispositionsB.value, factionsB.value)
}

// Drop any estimate whose row or column army has left a roster — ids are derived
// from the faction, so a dropped faction orphans exactly its own cells.
function pruneEstimates() {
  const live = new Set([...rosterA.value, ...rosterB.value].map((p) => p.id))
  const kept = Object.entries(estimates.value).filter(([key]) =>
    key.split('|').every((id) => live.has(id)),
  )
  if (kept.length !== Object.keys(estimates.value).length) {
    estimates.value = Object.fromEntries(kept)
  }
}

function dispsRef(side: 'A' | 'B') {
  return side === 'A' ? dispositionsA : dispositionsB
}

function factionsFor(side: 'A' | 'B') {
  return side === 'A' ? factionsA.value : factionsB.value
}

// How many of a team's players have already picked a given Disposition.
function dispCount(side: 'A' | 'B', disp: DispositionKey): number {
  const map = dispsRef(side).value
  return factionsFor(side).filter((k) => map[k] === disp).length
}

// A Disposition is locked for a faction once the team has hit its cap for it
// (unless this faction is the one already holding it, so it can be toggled off).
function dispDisabled(side: 'A' | 'B', key: string, disp: DispositionKey): boolean {
  if (dispsRef(side).value[key] === disp) return false
  return dispCount(side, disp) >= cap.value
}

function toggleDisposition(side: 'A' | 'B', key: string, disp: DispositionKey) {
  const mapRef = dispsRef(side)
  if (mapRef.value[key] === disp) {
    const next = { ...mapRef.value }
    delete next[key]
    mapRef.value = next
  } else if (!dispDisabled(side, key, disp)) {
    mapRef.value = { ...mapRef.value, [key]: disp }
  }
}

// Inline custom-property binding keeps the Disposition accent a token reference
// (base.css) rather than a hardcoded literal (mirrors LayoutsView).
function dispAccent(key: DispositionKey) {
  return {
    '--accent': `var(--color-disposition-${key})`,
    '--accent-tint': `var(--color-disposition-${key}-tint)`,
  }
}

// A roster may hold at most one Space Marine Chapter (GAME.MD § 1), so once one
// is picked the other Chapters are locked out for that team.
function marineLocked(list: string[], key: string): boolean {
  return isSpaceMarine(key) && list.some(isSpaceMarine)
}

function chipDisabled(side: 'A' | 'B', key: string): boolean {
  const list = side === 'A' ? factionsA.value : factionsB.value
  if (list.includes(key)) return false
  return list.length >= sizeLimit(side) || marineLocked(list, key)
}

function toggleFaction(side: 'A' | 'B', key: string) {
  const list = side === 'A' ? factionsA : factionsB
  if (list.value.includes(key)) {
    list.value = list.value.filter((k) => k !== key)
    pruneDispositions()
    pruneEstimates()
  } else if (list.value.length < sizeLimit(side) && !marineLocked(list.value, key)) {
    list.value = [...list.value, key]
  }
}

// In minimal mode Team A's roster *is* the team size, so it follows along —
// which also lets the `teamSize` watcher trim Team B back when A shrinks.
watch(factionsA, () => {
  if (isMinimal.value) teamSize.value = factionsA.value.length
})

// Player ids are derived from the faction rather than the roster position, so
// they stay stable when the user steps back and reorders a team — which keeps
// the estimates recorded in step 6 attached to the list they were written for.
// A faction is unique within a team, and the side prefix keeps ids unique across
// the two teams, so the ids satisfy `createPairingState`'s uniqueness check.
function roster(side: TeamSide): Player[] {
  return factionsFor(side).map((key) => ({
    id: `${side.toLowerCase()}-${key}`,
    faction: key,
    disposition: dispsRef(side).value[key] ?? null,
  }))
}

const rosterA = computed(() => roster('A'))
const rosterB = computed(() => roster('B'))

const estimatesSet = computed(() => estimateCount(estimates.value))
const layoutsSet = computed(() => layoutStanceCount(estimates.value))

function clearEstimates() {
  estimates.value = {}
}

// --- Quick pairing (the paste step) ------------------------------------------

const pasteText = ref('')

// Re-read on every keystroke: the report below the box is the only feedback the
// user gets on a format they are typing blind, so it has to track what they type.
const parsed = computed(() => parsePairingConfig(pasteText.value))

/** One line describing what the pasted text turned out to be. */
const pasteSummary = computed(() => {
  const config = parsed.value.config
  if (!config) return null
  const dispositions = [...config.teamA.players, ...config.teamB.players].filter(
    (p) => p.disposition,
  ).length
  const parts = [
    `${config.teamA.players.length} tables`,
    `${config.teamA.name} vs ${config.teamB.name}`,
    `round ${config.round}`,
  ]
  if (dispositions) parts.push(`${dispositions} Dispositions`)
  const grades = estimateCount(config.estimates)
  const layouts = layoutStanceCount(config.estimates)
  if (grades || layouts) parts.push(`${grades} grades, ${layouts} layouts`)
  return parts.join(' · ')
})

// --- Which side the current step is about ------------------------------------

// The army and Disposition steps are the same screen twice, once per team, so
// they render once and read their side off the step.
const armySide = computed<TeamSide | null>(() =>
  step.value === 'armies-a' ? 'A' : step.value === 'armies-b' ? 'B' : null,
)
const dispSide = computed<TeamSide | null>(() =>
  step.value === 'disp-a' ? 'A' : step.value === 'disp-b' ? 'B' : null,
)

function teamName(side: TeamSide): string {
  return side === 'A' ? nameA.value : nameB.value
}

function chosenDisposition(side: TeamSide, key: string): DispositionKey | undefined {
  return dispsRef(side).value[key]
}

function submit() {
  if (!canStart.value) return
  if (activeMode.value === 'quick') {
    if (parsed.value.config) emit('start', parsed.value.config)
    return
  }
  emit('start', {
    round: round.value,
    teamA: { name: nameA.value, players: rosterA.value },
    teamB: { name: nameB.value, players: rosterB.value },
    estimateSide: ESTIMATE_SIDE,
    // Minimal mode never opens the estimate grid, so this is simply empty there.
    estimates: estimates.value,
  })
}
</script>

<template>
  <form class="setup" @submit.prevent="submit">
    <!-- The breadcrumb stays on the generic Team A / Team B labels: it has to
         read the same width at every step, and the entered names are already on
         the step headings below. -->
    <ol class="stepper">
      <li
        v-for="(key, i) in steps"
        :key="key"
        :class="{ active: step === key, done: i < stepIndex }"
      >
        {{ i + 1 }} · {{ STEP_LABELS[key] }}
      </li>
    </ol>

    <Transition name="step" mode="out-in">
      <!-- 1 · How much to set up. Picking a card is the answer, so it advances. -->
      <section v-if="step === 'mode'" key="step-mode" class="step">
        <p class="picker-rule">
          Every mode runs the same pairing modules and the same board — they differ only in how much
          you tell the tool before the captains start picking.
        </p>

        <div class="mode-grid">
          <button
            v-for="card in MODE_CARDS"
            :key="card.key"
            type="button"
            class="mode-card"
            :class="{ selected: mode === card.key }"
            @click="chooseMode(card.key)"
          >
            <span class="mode-head">
              <span class="mode-name">{{ card.title }}</span>
              <span class="mode-meta">{{ card.meta }}</span>
            </span>
            <span class="mode-desc">{{ card.desc }}</span>
          </button>
        </div>
      </section>

      <!-- Round, size and team names (full configuration only) -->
      <section v-else-if="step === 'round'" key="step-round" class="step">
        <div class="event-row">
          <label class="field size-field">
            <span class="field-label">Players per team</span>
            <div class="size-picker">
              <button
                v-for="s in sizes"
                :key="s"
                type="button"
                class="size-btn"
                :class="{ active: teamSize === s }"
                @click="teamSize = s"
              >
                {{ s }}
              </button>
            </div>
          </label>

          <label class="field round-field">
            <span class="field-label">Round</span>
            <input v-model.number="round" type="number" min="1" class="text-input round-input" />
          </label>
        </div>

        <p v-if="moduleSummary" class="module-summary">
          <span class="summary-label">Pairing modules</span>
          {{ moduleSummary }}
        </p>

        <div class="teams">
          <input
            v-model="teamAName"
            type="text"
            class="text-input team-name side-a"
            placeholder="Team A name"
            aria-label="Team A name"
          />
          <input
            v-model="teamBName"
            type="text"
            class="text-input team-name side-b"
            placeholder="Team B name"
            aria-label="Team B name"
          />
        </div>

        <div class="nav-row">
          <button type="button" class="btn-secondary nav-back" @click="prevStep">← Back</button>
          <button
            type="button"
            class="btn-primary nav-next"
            :disabled="!canAdvance"
            @click="nextStep"
          >
            Next →
          </button>
        </div>
      </section>

      <!-- Army picker, rendered once and pointed at whichever team the step is for -->
      <section v-else-if="armySide" :key="`armies-${armySide}`" class="step">
        <div class="picker-head">
          <h2 class="picker-title">Pick {{ teamName(armySide) }}'s armies</h2>
          <span class="picker-count">
            {{ factionsFor(armySide).length }} /
            <template v-if="isMinimal && armySide === 'A'">
              {{ MIN_TEAM_SIZE }}–{{ MAX_TEAM_SIZE }}
            </template>
            <template v-else>{{ sizeLimit(armySide) }}</template>
            selected
          </span>
        </div>
        <p class="picker-rule">
          One army per faction keyword, and only one Space Marine Chapter per team.
          <template v-if="isMinimal && armySide === 'A'">
            However many you pick is the team size — {{ MIN_TEAM_SIZE }} to {{ MAX_TEAM_SIZE }}
            players.
          </template>
        </p>

        <!-- Minimal mode skips the round step, but the round still fixes which
             layout the Refused-Attacker and Champion tables play, so it is asked
             for here rather than silently assumed. -->
        <div v-if="isMinimal && armySide === 'A'" class="minimal-round">
          <label class="field round-field">
            <span class="field-label">Round</span>
            <input v-model.number="round" type="number" min="1" class="text-input round-input" />
          </label>
          <p v-if="moduleSummary" class="module-summary">
            <span class="summary-label">Pairing modules</span>
            {{ moduleSummary }}
          </p>
        </div>

        <div class="allegiance-groups">
          <div v-for="a in sortedAllegiances" :key="a.id" class="allegiance-group">
            <h3 class="allegiance-title">{{ a.title }}</h3>
            <div class="chip-grid">
              <button
                v-for="f in a.factions"
                :key="f.key"
                type="button"
                class="faction-chip"
                :class="[
                  `side-${armySide.toLowerCase()}`,
                  { selected: factionsFor(armySide).includes(f.key) },
                ]"
                :disabled="chipDisabled(armySide, f.key)"
                @click="toggleFaction(armySide, f.key)"
              >
                <span class="chip-tile">
                  <img
                    :src="`/images/factions/${f.key}.webp`"
                    :alt="f.name"
                    width="40"
                    height="40"
                    loading="lazy"
                  />
                </span>
                <span class="chip-name">{{ f.name }}</span>
                <span v-if="factionsFor(armySide).includes(f.key)" class="chip-check">✓</span>
              </button>
            </div>
          </div>
        </div>

        <div class="nav-row">
          <button type="button" class="btn-secondary nav-back" @click="prevStep">← Back</button>
          <button
            v-if="isLastStep"
            type="submit"
            class="btn-primary nav-next"
            :disabled="!canStart"
          >
            Start pairing →
          </button>
          <button
            v-else
            type="button"
            class="btn-primary nav-next"
            :disabled="!canAdvance"
            @click="nextStep"
          >
            Next →
          </button>
        </div>
      </section>

      <!-- Force Disposition assignment, likewise once per team -->
      <section v-else-if="dispSide" :key="`disp-${dispSide}`" class="step">
        <div class="picker-head">
          <h2 class="picker-title">{{ teamName(dispSide) }}'s Force Dispositions</h2>
          <span class="picker-count">optional · max {{ cap }} of each</span>
        </div>
        <p class="picker-rule">
          Assign each player a Force Disposition, or leave any blank — it's optional. Dispositions
          set the terrain layouts you'll see once each table is paired.
        </p>

        <ul class="disp-roster">
          <li v-for="key in factionsFor(dispSide)" :key="key" class="disp-row">
            <span class="disp-faction">
              <span class="chip-tile">
                <img
                  :src="`/images/factions/${key}.webp`"
                  :alt="factionName(key)"
                  width="40"
                  height="40"
                  loading="lazy"
                />
              </span>
              <span class="chip-name">{{ factionName(key) }}</span>
            </span>
            <span class="disp-choices" role="group" :aria-label="`${factionName(key)} disposition`">
              <button
                v-for="d in dispositions"
                :key="d.key"
                type="button"
                class="disp-pick"
                :class="{ chosen: chosenDisposition(dispSide, key) === d.key }"
                :style="dispAccent(d.key)"
                :disabled="dispDisabled(dispSide, key, d.key)"
                :title="d.name"
                :aria-label="d.name"
                :aria-pressed="chosenDisposition(dispSide, key) === d.key"
                @click="toggleDisposition(dispSide, key, d.key)"
              >
                <DispositionIcon :symbol="d.symbol" />
              </button>
            </span>
          </li>
        </ul>

        <div class="nav-row">
          <button type="button" class="btn-secondary nav-back" @click="prevStep">← Back</button>
          <button
            type="button"
            class="btn-primary nav-next"
            :disabled="!canAdvance"
            @click="nextStep"
          >
            Next →
          </button>
        </div>
      </section>

      <!-- Quick pairing: one textarea, read live -->
      <section v-else-if="step === 'paste'" key="step-paste" class="step">
        <div class="picker-head">
          <h2 class="picker-title">Paste a setup</h2>
          <span class="picker-count">
            <button type="button" class="text-link" @click="pasteText = EXAMPLE_SETUP">
              Load an example
            </button>
          </span>
        </div>
        <p class="picker-rule">
          One directive per line. Everything is optional except the two rosters — and you can copy
          this text straight back out of a finished round to replay it later.
        </p>

        <textarea
          v-model="pasteText"
          class="paste-input"
          rows="14"
          spellcheck="false"
          aria-label="Pasted setup"
          :placeholder="EXAMPLE_SETUP"
        ></textarea>

        <ul v-if="pasteText.trim() && parsed.errors.length" class="paste-errors">
          <li v-for="(problem, i) in parsed.errors" :key="i">{{ problem }}</li>
        </ul>

        <template v-else-if="parsed.config">
          <p class="paste-summary">{{ pasteSummary }}</p>
          <ul v-if="parsed.warnings.length" class="paste-warnings">
            <li v-for="(note, i) in parsed.warnings" :key="i">{{ note }}</li>
          </ul>
        </template>

        <details class="paste-format">
          <summary>Format</summary>
          <dl class="format-list">
            <dt>round: 2</dt>
            <dd>The tournament round. Fixes the layout the Refused and Champion tables play.</dd>
            <dt>team a: Les Bastonneurs</dt>
            <dd>Team names. Default to “Team A” and “Team B”.</dd>
            <dt>a: Aeldari · Take and Hold</dt>
            <dd>
              One line per player, in roster order, with <code>a:</code> for your team and
              <code>b:</code> for theirs. The Force Disposition after the separator is optional, and
              <code>·</code> <code>|</code> <code>/</code> <code>,</code> all work.
            </dd>
            <dt>est: Aeldari vs Grey Knights = GW D +A -C</dt>
            <dd>
              Team A's estimate for one matchup: the grade on a table that suits you, then on one
              that doesn't (<code>?</code> for a blank), then the layouts you want (<code>+</code>)
              and would avoid (<code>-</code>).
            </dd>
          </dl>
          <p class="format-note">
            Army and Disposition names ignore case, spacing and punctuation. Lines starting with
            <code>#</code> are comments.
          </p>
        </details>

        <div class="nav-row">
          <button type="button" class="btn-secondary nav-back" @click="prevStep">← Back</button>
          <button type="submit" class="btn-primary nav-next" :disabled="!canStart">
            Start pairing →
          </button>
        </div>
      </section>

      <!-- Matchup estimates (full configuration only) -->
      <section v-else key="step-estimates" class="step">
        <div class="picker-head">
          <h2 class="picker-title">{{ nameA }}'s matchup estimates</h2>
          <span class="picker-count">
            optional · {{ estimatesSet }} grades, {{ layoutsSet }} layouts
            <button
              type="button"
              class="text-link clear-estimates"
              :disabled="estimatesSet === 0 && layoutsSet === 0"
              @click="clearEstimates"
            >
              Clear all
            </button>
          </span>
        </div>
        <p class="picker-rule">
          Grade each of {{ nameA }}'s lists against every {{ nameB }} list — the left half of a cell
          is the result you'd expect on a table that suits you, the right half on one that doesn't.
          Underneath, tap the matchup's A/B/C layouts to mark the ones you want to play on and the
          ones you'd rather avoid: that's what decides which of the two grades a table scores once
          its layout is declared. Both feed the estimates panel and the projected round result.
        </p>

        <EstimateGrid v-model="estimates" :our-players="rosterA" :opp-players="rosterB" />

        <div class="nav-row">
          <button type="button" class="btn-secondary nav-back" @click="prevStep">← Back</button>
          <button type="submit" class="btn-primary nav-next" :disabled="!canStart">
            Start pairing →
          </button>
        </div>
      </section>
    </Transition>
  </form>
</template>

<style scoped>
.setup {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.stepper {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-muted-soft);
}

.stepper li {
  padding-bottom: var(--spacing-xxs);
  border-bottom: 2px solid transparent;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
}

/* Tie the active step to the app's coral accent so the breadcrumb reads as
   part of the theme rather than plain grey text. */
.stepper li.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
}

.stepper li.done {
  color: var(--color-muted);
}

/* Wizard step swap: slide + fade between the round / team-A / team-B panes. */
.step-enter-active,
.step-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.step-enter-from {
  opacity: 0;
  transform: translateX(16px);
}

.step-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

@media (prefers-reduced-motion: reduce) {
  .step-enter-active,
  .step-leave-active {
    transition: none;
  }

  .step-enter-from,
  .step-leave-to {
    transform: none;
  }
}

.step {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.event-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  align-items: flex-end;
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-muted);
}

.size-picker {
  display: flex;
  gap: var(--spacing-xxs);
}

.size-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-hairline);
  background: var(--color-canvas);
  font-size: 15px;
  font-weight: 500;
  color: var(--color-body);
  cursor: pointer;
}

.size-btn:hover {
  background: var(--color-surface-soft);
}

.size-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary);
}

.text-input {
  height: 40px;
  padding: 0 var(--spacing-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-hairline);
  background: var(--color-canvas);
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-ink);
  min-width: 0;
}

.text-input:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -1px;
}

.round-input {
  width: 88px;
}

.module-summary {
  font-size: 14px;
  color: var(--color-body);
}

.summary-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-muted);
  margin-right: var(--spacing-xs);
}

.teams {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.team-name {
  height: 40px;
  font-size: 15px;
  font-weight: 500;
  border-width: 1px;
  border-left-width: 3px;
}

.team-name.side-a {
  border-left-color: var(--color-accent-teal);
}

.team-name.side-b {
  border-left-color: var(--color-accent-amber);
}

.picker-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.picker-title {
  font-size: 17px;
}

.picker-count {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-muted);
}

.picker-rule {
  margin-top: var(--spacing-xs);
  font-size: 13px;
  color: var(--color-muted);
}

.allegiance-groups {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.allegiance-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.allegiance-title {
  font-size: 14px;
  color: var(--color-body-strong);
}

.chip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: var(--spacing-xs);
}

.faction-chip {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-hairline);
  background: var(--color-canvas);
  cursor: pointer;
  text-align: left;
}

.faction-chip:hover:not(:disabled) {
  background: var(--color-surface-soft);
}

.faction-chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.faction-chip.side-a.selected {
  border-color: var(--color-accent-teal);
  background: var(--color-accent-teal-tint);
}

.faction-chip.side-b.selected {
  border-color: var(--color-accent-amber);
  background: var(--color-accent-amber-tint);
}

.chip-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-soft);
  flex-shrink: 0;
}

.chip-tile img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

/* Wrap to two lines instead of truncating, so no faction name is cropped. */
.chip-name {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
  color: var(--color-ink);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.chip-check {
  margin-left: auto;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-primary);
}

/* --- Force Disposition assignment (steps 3 & 5) --- */
.disp-roster {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.disp-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-md);
  background: var(--color-canvas);
}

.disp-faction {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 0;
}

.disp-choices {
  display: flex;
  gap: var(--spacing-xxs);
}

.disp-pick {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  padding: 7px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-hairline);
  background: var(--color-surface-card);
  color: var(--color-muted);
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.disp-pick:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.disp-pick.chosen {
  border-color: var(--accent);
  background: var(--accent-tint);
  color: var(--accent);
}

.disp-pick:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.disp-pick :deep(svg) {
  width: 22px;
  height: 22px;
}

/* --- Mode chooser (step 1) --- */
.mode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--spacing-sm);
}

.mode-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  text-align: left;
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  background: var(--color-canvas);
  cursor: pointer;
}

.mode-card:hover,
.mode-card:focus-visible {
  border-color: var(--color-primary);
  background: var(--color-surface-soft);
}

/* Only ever seen on the way back: choosing a card advances the wizard. */
.mode-card.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-tint);
}

.mode-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-xs);
}

.mode-name {
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 500;
  letter-spacing: -0.3px;
  color: var(--color-ink);
}

.mode-meta {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-primary);
  white-space: nowrap;
}

.mode-desc {
  font-size: 13px;
  line-height: 1.55;
  color: var(--color-muted);
}

/* Minimal mode has no round step, so the round rides along with the roster. */
.minimal-round {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--spacing-md);
}

/* --- Quick pairing (the paste step) --- */
.paste-input {
  width: 100%;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-hairline);
  background: var(--color-canvas);
  color: var(--color-ink);
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  tab-size: 2;
}

.paste-input:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -1px;
}

.paste-input::placeholder {
  color: var(--color-muted-soft);
}

.paste-errors,
.paste-warnings {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs);
  font-size: 13px;
  line-height: 1.5;
}

.paste-errors {
  padding: var(--spacing-sm);
  border: 1px solid var(--color-error-tint-border);
  border-radius: var(--radius-md);
  background: var(--color-error-tint);
  color: var(--color-error);
}

.paste-warnings {
  color: var(--color-warning);
}

.paste-summary {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
}

.paste-format {
  font-size: 13px;
  color: var(--color-muted);
}

.paste-format summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--color-body-strong);
}

.format-list {
  margin-top: var(--spacing-sm);
  display: grid;
  gap: var(--spacing-xs);
}

.format-list dt {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-ink);
}

.format-list dd {
  margin-bottom: var(--spacing-xs);
  line-height: 1.55;
}

.format-note {
  line-height: 1.55;
}

.paste-format code {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-body-strong);
}

/* --- Matchup estimates (the last full-configuration step) --- */
.clear-estimates {
  margin-left: var(--spacing-xs);
  font-size: 13px;
  background: none;
  border: none;
  cursor: pointer;
}

.clear-estimates:disabled {
  opacity: 0.45;
  cursor: default;
}

.nav-row {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.nav-next {
  margin-left: auto;
}

.nav-next:disabled {
  background: var(--color-primary-disabled);
  color: var(--color-muted-soft);
  cursor: not-allowed;
}

@media (max-width: 720px) {
  .teams {
    grid-template-columns: 1fr;
  }

  /* Two army chips per row at any phone width — `auto-fill` with a fixed
     minimum would drop to one column below ~260px and waste the whole line. */
  .chip-grid {
    grid-template-columns: repeat(auto-fill, minmax(min(140px, 48%), 1fr));
    gap: var(--spacing-xxs);
  }

  .faction-chip {
    padding: var(--spacing-xxs) var(--spacing-xs);
  }

  /* The breadcrumb is six items; on a phone it reads as a scrolling rail rather
     than four wrapped lines pushing the actual step off screen. */
  .stepper {
    flex-wrap: nowrap;
    gap: var(--spacing-sm);
    overflow-x: auto;
    scrollbar-width: none;
    margin: 0 calc(-1 * var(--spacing-sm));
    padding: 0 var(--spacing-sm) var(--spacing-xxs);
  }

  .stepper::-webkit-scrollbar {
    display: none;
  }

  .stepper li {
    white-space: nowrap;
  }

  /* Comfortable touch targets: the disposition glyphs and the wizard buttons
     are the two things every step needs a finger on. */
  .disp-row {
    gap: var(--spacing-xs);
    padding: var(--spacing-xs);
  }

  .disp-pick {
    width: 44px;
    height: 44px;
  }

  .size-btn {
    width: 44px;
    height: 44px;
  }

  .nav-row {
    gap: var(--spacing-xs);
  }

  .nav-row > * {
    flex: 1;
  }

  .picker-head {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xxs);
  }
}
</style>
