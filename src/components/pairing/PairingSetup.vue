<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Allegiance } from '../../data/factions'
import { allegiances, factionName, isSpaceMarine } from '../../data/factions'
import { dispositions, type DispositionKey } from '../../data/dispositions'
import DispositionIcon from '../DispositionIcon.vue'
import {
  MAX_TEAM_SIZE,
  MIN_TEAM_SIZE,
  dispositionCap,
  modulesForTeamSize,
  moduleLabel,
  type PairingConfig,
} from '../../data/pairing'

const emit = defineEmits<{ start: [config: PairingConfig] }>()

// The 5-step wizard: 1 Round · 2 Team A armies · 3 Team A dispositions ·
// 4 Team B armies · 5 Team B dispositions. Exposed so the page can react to the
// step (e.g. hide the intro copy once the user is deep in setup).
export type SetupStep = 1 | 2 | 3 | 4 | 5
const step = defineModel<SetupStep>('step', { default: 1 })

const round = ref(1)
const teamSize = ref(4)
const teamAName = ref('')
const teamBName = ref('')
const factionsA = ref<string[]>([])
const factionsB = ref<string[]>([])
// Optional Force Disposition per faction (keyed by faction key, unique per team).
const dispositionsA = ref<Record<string, DispositionKey>>({})
const dispositionsB = ref<Record<string, DispositionKey>>({})

const sizes = Array.from({ length: MAX_TEAM_SIZE - MIN_TEAM_SIZE + 1 }, (_, i) => MIN_TEAM_SIZE + i)

// The allegiance roster is static, so sort it once at module load rather than
// per component instance.
const sortedAllegiances: Allegiance[] = allegiances.map((a) => ({
  ...a,
  factions: [...a.factions].sort((x, y) => x.name.localeCompare(y.name)),
}))

const moduleSummary = computed(() =>
  modulesForTeamSize(teamSize.value).map(moduleLabel).join(' → '),
)

const canAdvanceStep1 = computed(() => Boolean(teamAName.value.trim() && teamBName.value.trim()))
const canAdvanceStep2 = computed(() => factionsA.value.length === teamSize.value)
const canAdvanceStep4 = computed(() => factionsB.value.length === teamSize.value)
const canStart = canAdvanceStep4

// GAME.MD § 1: at most `cap` players per team may share a Force Disposition.
const cap = computed(() => dispositionCap(teamSize.value))

watch(round, (v) => {
  if (v < 1) round.value = 1
})

watch(teamSize, (size) => {
  factionsA.value = factionsA.value.slice(0, size)
  factionsB.value = factionsB.value.slice(0, size)
  pruneDispositions()
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
  return list.length >= teamSize.value || marineLocked(list, key)
}

function toggleFaction(side: 'A' | 'B', key: string) {
  const list = side === 'A' ? factionsA : factionsB
  if (list.value.includes(key)) {
    list.value = list.value.filter((k) => k !== key)
    pruneDispositions()
  } else if (list.value.length < teamSize.value && !marineLocked(list.value, key)) {
    list.value = [...list.value, key]
  }
}

function submit() {
  if (!canStart.value) return
  const players = (side: 'A' | 'B') =>
    factionsFor(side).map((key, i) => ({
      id: `${side.toLowerCase()}-${i}`,
      faction: key,
      disposition: dispsRef(side).value[key] ?? null,
    }))
  emit('start', {
    round: round.value,
    teamA: { name: teamAName.value.trim(), players: players('A') },
    teamB: { name: teamBName.value.trim(), players: players('B') },
  })
}
</script>

<template>
  <form class="setup" @submit.prevent="submit">
    <ol class="stepper">
      <li :class="{ active: step === 1, done: step > 1 }">1 · Round</li>
      <li :class="{ active: step === 2, done: step > 2 }">
        2 · {{ teamAName || 'Team A' }} armies
      </li>
      <li :class="{ active: step === 3, done: step > 3 }">
        3 · {{ teamAName || 'Team A' }} dispositions
      </li>
      <li :class="{ active: step === 4, done: step > 4 }">
        4 · {{ teamBName || 'Team B' }} armies
      </li>
      <li :class="{ active: step === 5 }">5 · {{ teamBName || 'Team B' }} dispositions</li>
    </ol>

    <Transition name="step" mode="out-in">
      <section v-if="step === 1" key="step-1" class="step">
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

        <p class="module-summary">
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
          <button
            type="button"
            class="btn-primary nav-next"
            :disabled="!canAdvanceStep1"
            @click="step = 2"
          >
            Next →
          </button>
        </div>
      </section>

      <section v-else-if="step === 2" key="step-2" class="step">
        <div class="picker-head">
          <h2 class="picker-title">Pick {{ teamAName }}'s armies</h2>
          <span class="picker-count">{{ factionsA.length }} / {{ teamSize }} selected</span>
        </div>
        <p class="picker-rule">
          One army per faction keyword, and only one Space Marine Chapter per team.
        </p>

        <div class="allegiance-groups">
          <div v-for="a in sortedAllegiances" :key="a.id" class="allegiance-group">
            <h3 class="allegiance-title">{{ a.title }}</h3>
            <div class="chip-grid">
              <button
                v-for="f in a.factions"
                :key="f.key"
                type="button"
                class="faction-chip side-a"
                :class="{ selected: factionsA.includes(f.key) }"
                :disabled="chipDisabled('A', f.key)"
                @click="toggleFaction('A', f.key)"
              >
                <span class="chip-tile">
                  <img
                    :src="`/images/factions/${f.key}.png`"
                    :alt="f.name"
                    width="40"
                    height="40"
                    loading="lazy"
                  />
                </span>
                <span class="chip-name">{{ f.name }}</span>
                <span v-if="factionsA.includes(f.key)" class="chip-check">✓</span>
              </button>
            </div>
          </div>
        </div>

        <div class="nav-row">
          <button type="button" class="btn-secondary nav-back" @click="step = 1">← Back</button>
          <button
            type="button"
            class="btn-primary nav-next"
            :disabled="!canAdvanceStep2"
            @click="step = 3"
          >
            Next →
          </button>
        </div>
      </section>

      <section v-else-if="step === 3" key="step-3" class="step">
        <div class="picker-head">
          <h2 class="picker-title">{{ teamAName }}'s Force Dispositions</h2>
          <span class="picker-count">optional · max {{ cap }} of each</span>
        </div>
        <p class="picker-rule">
          Assign each player a Force Disposition, or leave any blank — it's optional. Dispositions
          set the terrain layouts you'll see once each table is paired.
        </p>

        <ul class="disp-roster">
          <li v-for="key in factionsA" :key="key" class="disp-row">
            <span class="disp-faction">
              <span class="chip-tile">
                <img
                  :src="`/images/factions/${key}.png`"
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
                :class="{ chosen: dispositionsA[key] === d.key }"
                :style="dispAccent(d.key)"
                :disabled="dispDisabled('A', key, d.key)"
                :title="d.name"
                :aria-label="d.name"
                :aria-pressed="dispositionsA[key] === d.key"
                @click="toggleDisposition('A', key, d.key)"
              >
                <DispositionIcon :symbol="d.symbol" />
              </button>
            </span>
          </li>
        </ul>

        <div class="nav-row">
          <button type="button" class="btn-secondary nav-back" @click="step = 2">← Back</button>
          <button type="button" class="btn-primary nav-next" @click="step = 4">Next →</button>
        </div>
      </section>

      <section v-else-if="step === 4" key="step-4" class="step">
        <div class="picker-head">
          <h2 class="picker-title">Pick {{ teamBName }}'s armies</h2>
          <span class="picker-count">{{ factionsB.length }} / {{ teamSize }} selected</span>
        </div>
        <p class="picker-rule">
          One army per faction keyword, and only one Space Marine Chapter per team.
        </p>

        <div class="allegiance-groups">
          <div v-for="a in sortedAllegiances" :key="a.id" class="allegiance-group">
            <h3 class="allegiance-title">{{ a.title }}</h3>
            <div class="chip-grid">
              <button
                v-for="f in a.factions"
                :key="f.key"
                type="button"
                class="faction-chip side-b"
                :class="{ selected: factionsB.includes(f.key) }"
                :disabled="chipDisabled('B', f.key)"
                @click="toggleFaction('B', f.key)"
              >
                <span class="chip-tile">
                  <img
                    :src="`/images/factions/${f.key}.png`"
                    :alt="f.name"
                    width="40"
                    height="40"
                    loading="lazy"
                  />
                </span>
                <span class="chip-name">{{ f.name }}</span>
                <span v-if="factionsB.includes(f.key)" class="chip-check">✓</span>
              </button>
            </div>
          </div>
        </div>

        <div class="nav-row">
          <button type="button" class="btn-secondary nav-back" @click="step = 3">← Back</button>
          <button
            type="button"
            class="btn-primary nav-next"
            :disabled="!canAdvanceStep4"
            @click="step = 5"
          >
            Next →
          </button>
        </div>
      </section>

      <section v-else key="step-5" class="step">
        <div class="picker-head">
          <h2 class="picker-title">{{ teamBName }}'s Force Dispositions</h2>
          <span class="picker-count">optional · max {{ cap }} of each</span>
        </div>
        <p class="picker-rule">
          Assign each player a Force Disposition, or leave any blank — it's optional. Dispositions
          set the terrain layouts you'll see once each table is paired.
        </p>

        <ul class="disp-roster">
          <li v-for="key in factionsB" :key="key" class="disp-row">
            <span class="disp-faction">
              <span class="chip-tile">
                <img
                  :src="`/images/factions/${key}.png`"
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
                :class="{ chosen: dispositionsB[key] === d.key }"
                :style="dispAccent(d.key)"
                :disabled="dispDisabled('B', key, d.key)"
                :title="d.name"
                :aria-label="d.name"
                :aria-pressed="dispositionsB[key] === d.key"
                @click="toggleDisposition('B', key, d.key)"
              >
                <DispositionIcon :symbol="d.symbol" />
              </button>
            </span>
          </li>
        </ul>

        <div class="nav-row">
          <button type="button" class="btn-secondary nav-back" @click="step = 4">← Back</button>
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

  .chip-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>
