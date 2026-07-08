<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import HandoffGate from './HandoffGate.vue'
import RoleIcon from './RoleIcon.vue'
import {
  currentActor,
  getPlayer,
  moduleLabel,
  remainingPlayers,
  type PairingState,
  type Player,
  type PlayerRole,
  type TeamSide,
} from '../../data/pairing'
import { factionName } from '../../data/factions'

const props = defineProps<{ state: PairingState }>()

const emit = defineEmits<{
  defender: [id: string]
  attackers: [ids: string[]]
  counter: [id: string]
  next: []
}>()

const phase = computed(() => props.state.phase)
const actor = computed(() => currentActor(phase.value))
const moduleKind = computed(() => props.state.moduleQueue[props.state.moduleIndex]!)

// Which instance of this module we're on, e.g. "Initial Skirmish · 2 of 2".
const moduleProgress = computed(() => {
  const kinds = props.state.moduleQueue
  const idx = props.state.moduleIndex
  const total = kinds.filter((k) => k === kinds[idx]).length
  if (total < 2) return moduleLabel(moduleKind.value)
  const instance = kinds.slice(0, idx + 1).filter((k) => k === kinds[idx]).length
  return `${moduleLabel(moduleKind.value)} · ${instance} of ${total}`
})

const phaseKey = computed(
  () => `${props.state.moduleIndex}-${phase.value.kind}-${actor.value ?? ''}`,
)

function teamName(side: TeamSide): string {
  return side === 'A' ? props.state.config.teamA.name : props.state.config.teamB.name
}

function opposing(side: TeamSide): TeamSide {
  return side === 'A' ? 'B' : 'A'
}

// --- Selection state (reset whenever the phase changes) -----------------------

const selected = ref<string[]>([])

const selectRole = computed<'defender' | 'attacker' | null>(() => {
  switch (phase.value.kind) {
    case 'defender-select':
      return 'defender'
    case 'attackers-select':
    case 'counter-select':
      return 'attacker'
    default:
      return null
  }
})

const selectMode = computed<'single' | 'double' | 'none'>(() => {
  switch (phase.value.kind) {
    case 'defender-select':
    case 'counter-select':
      return 'single'
    case 'attackers-select':
      return 'double'
    default:
      return 'none'
  }
})

function isSelected(id: string): boolean {
  return selected.value.includes(id)
}

function toggle(id: string) {
  if (selectMode.value === 'single') {
    selected.value = [id]
  } else if (selectMode.value === 'double') {
    if (isSelected(id)) selected.value = selected.value.filter((x) => x !== id)
    else if (selected.value.length < 2) selected.value = [...selected.value, id]
  }
}

const confirmDisabled = computed(() => {
  if (selectMode.value === 'single') return selected.value.length !== 1
  if (selectMode.value === 'double') return selected.value.length !== 2
  return true
})

function confirm() {
  if (confirmDisabled.value) return
  switch (phase.value.kind) {
    case 'defender-select':
      emit('defender', selected.value[0]!)
      break
    case 'attackers-select':
      emit('attackers', [...selected.value])
      break
    case 'counter-select':
      emit('counter', selected.value[0]!)
      break
  }
}

// --- Options for the current selection ---------------------------------------

const ownDefenderId = computed(() => {
  if (actor.value === 'A') return props.state.draft.defenderA
  if (actor.value === 'B') return props.state.draft.defenderB
  return undefined
})

/** Candidate players offered to the acting team in the current select phase. */
const options = computed<Player[]>(() => {
  if (!actor.value) return []
  if (phase.value.kind === 'counter-select') {
    // Choose from the *opposing* team's two revealed Attackers.
    const ids = actor.value === 'A' ? props.state.draft.attackersB : props.state.draft.attackersA
    return (ids ?? []).map((id) => getPlayer(props.state, id))
  }
  let pool = remainingPlayers(props.state, actor.value)
  if (phase.value.kind === 'attackers-select') {
    pool = pool.filter((p) => p.id !== ownDefenderId.value)
  }
  return pool
})

// Reset the selection each phase; pre-select automatically when the choice is
// forced — as many candidates as picks required (e.g. only two Attackers left).
watch(
  phaseKey,
  () => {
    const need = selectMode.value === 'single' ? 1 : selectMode.value === 'double' ? 2 : 0
    const opts = options.value
    selected.value = need > 0 && opts.length === need ? opts.map((o) => o.id) : []
  },
  { immediate: true },
)

// --- Reveal helpers -----------------------------------------------------------

function player(id: string | undefined): Player | null {
  return id ? getPlayer(props.state, id) : null
}

const draft = computed(() => props.state.draft)

const counterReveal = computed(() => {
  const d = draft.value
  if (
    !d.defenderA ||
    !d.defenderB ||
    !d.attackersA ||
    !d.attackersB ||
    !d.counterA ||
    !d.counterB
  ) {
    return []
  }
  const rows: { label: string; a: Player; b: Player; aRole: PlayerRole; bRole: PlayerRole }[] = [
    {
      label: `${teamName('A')} Defender faces`,
      a: player(d.defenderA)!,
      b: player(d.counterA)!,
      aRole: 'defender',
      bRole: 'attacker',
    },
    {
      label: `${teamName('B')} Defender faces`,
      a: player(d.counterB)!,
      b: player(d.defenderB)!,
      aRole: 'attacker',
      bRole: 'defender',
    },
  ]
  if (moduleKind.value === 'main') {
    const refusedA = d.attackersA.find((id) => id !== d.counterB)!
    const refusedB = d.attackersB.find((id) => id !== d.counterA)!
    rows.push({
      label: 'Refused Attackers meet',
      a: player(refusedA)!,
      b: player(refusedB)!,
      aRole: 'refused',
      bRole: 'refused',
    })
  }
  return rows
})

const stepLabel = computed(() => {
  switch (phase.value.kind) {
    case 'defender-select':
      return 'Secretly select your Defender'
    case 'defender-reveal':
      return 'Defenders revealed'
    case 'attackers-select':
      return 'Secretly select two Attackers'
    case 'attackers-reveal':
      return 'Attackers revealed'
    case 'counter-select':
      return "Secretly choose your Defender's opponent"
    case 'counter-reveal':
      return 'Match-ups revealed'
    case 'champion-reveal':
      return 'The Champions'
    default:
      return ''
  }
})
</script>

<template>
  <div class="runner">
    <header class="runner-head">
      <span class="module-progress">{{ moduleProgress }}</span>
      <h2>{{ stepLabel }}</h2>
    </header>

    <!-- Secret selection phases, gated behind the device handoff -->
    <HandoffGate v-if="actor" :key="phaseKey" :team-side="actor" :team-name="teamName(actor)">
      <div class="select-panel">
        <p class="instruction">
          <template v-if="phase.kind === 'defender-select'">
            {{ teamName(actor) }} — pick the player to hold your table as Defender.
          </template>
          <template v-else-if="phase.kind === 'attackers-select'">
            Pick <strong>two</strong> Attackers to send against {{ teamName(opposing(actor)) }}'s
            Defender.
          </template>
          <template v-else-if="phase.kind === 'counter-select'">
            Choose which of {{ teamName(opposing(actor)) }}'s two Attackers your Defender
            <strong>{{ factionName(player(ownDefenderId)?.faction ?? null) }}</strong> will face.
          </template>
        </p>

        <ul class="option-grid" :class="selectRole ? `sel-${selectRole}` : ''">
          <li v-for="opt in options" :key="opt.id">
            <button
              type="button"
              class="option"
              :class="{ selected: isSelected(opt.id) }"
              @click="toggle(opt.id)"
            >
              <span class="option-logo">
                <img
                  v-if="opt.faction"
                  :src="`/images/factions/${opt.faction}.png`"
                  :alt="opt.faction"
                  width="28"
                  height="28"
                  loading="lazy"
                />
                <span v-else>·</span>
              </span>
              <span class="option-name">{{ factionName(opt.faction) }}</span>
              <span v-if="isSelected(opt.id)" class="check">✓</span>
            </button>
          </li>
        </ul>

        <div class="actions">
          <span v-if="selectMode === 'double'" class="hint">
            {{ selected.length }} / 2 selected
          </span>
          <button type="button" class="btn-primary" :disabled="confirmDisabled" @click="confirm">
            Lock in →
          </button>
        </div>
      </div>
    </HandoffGate>

    <!-- Defenders reveal -->
    <div v-else-if="phase.kind === 'defender-reveal'" class="reveal">
      <div class="reveal-pair">
        <div class="reveal-side side-a">
          <span class="reveal-team">{{ teamName('A') }}</span>
          <span class="reveal-name">{{
            factionName(player(draft.defenderA)?.faction ?? null)
          }}</span>
          <span class="reveal-role">Defender</span>
        </div>
        <span class="reveal-vs">vs</span>
        <div class="reveal-side side-b">
          <span class="reveal-team">{{ teamName('B') }}</span>
          <span class="reveal-name">{{
            factionName(player(draft.defenderB)?.faction ?? null)
          }}</span>
          <span class="reveal-role">Defender</span>
        </div>
      </div>
      <button type="button" class="btn-primary" @click="emit('next')">
        Continue — choose Attackers →
      </button>
    </div>

    <!-- Attackers reveal -->
    <div v-else-if="phase.kind === 'attackers-reveal'" class="reveal">
      <div class="reveal-pair">
        <div class="reveal-side side-a">
          <span class="reveal-team">{{ teamName('A') }} Attackers</span>
          <span class="reveal-name">
            {{
              draft.attackersA?.map((id) => factionName(player(id)?.faction ?? null)).join(' · ')
            }}
          </span>
        </div>
        <span class="reveal-vs">vs</span>
        <div class="reveal-side side-b">
          <span class="reveal-team">{{ teamName('B') }} Attackers</span>
          <span class="reveal-name">
            {{
              draft.attackersB?.map((id) => factionName(player(id)?.faction ?? null)).join(' · ')
            }}
          </span>
        </div>
      </div>
      <button type="button" class="btn-primary" @click="emit('next')">
        Continue — assign Defenders →
      </button>
    </div>

    <!-- Counter-select reveal → resolved match-ups -->
    <div v-else-if="phase.kind === 'counter-reveal'" class="reveal">
      <ul class="matchup-rows">
        <li v-for="(row, i) in counterReveal" :key="i" class="matchup-row">
          <span class="matchup-label">{{ row.label }}</span>
          <div class="matchup-pair">
            <div class="cell" :class="`role-${row.aRole}`">
              <div class="logo-tile">
                <img
                  v-if="row.a.faction"
                  :src="`/images/factions/${row.a.faction}.png`"
                  :alt="row.a.faction"
                  width="28"
                  height="28"
                  loading="lazy"
                />
                <span v-else class="logo-fallback">·</span>
              </div>
              <span class="cell-name">{{ factionName(row.a.faction) }}</span>
              <RoleIcon :role="row.aRole" />
            </div>
            <span class="matchup-vs">vs</span>
            <div class="cell" :class="`role-${row.bRole}`">
              <div class="logo-tile">
                <img
                  v-if="row.b.faction"
                  :src="`/images/factions/${row.b.faction}.png`"
                  :alt="row.b.faction"
                  width="28"
                  height="28"
                  loading="lazy"
                />
                <span v-else class="logo-fallback">·</span>
              </div>
              <span class="cell-name">{{ factionName(row.b.faction) }}</span>
              <RoleIcon :role="row.bRole" />
            </div>
          </div>
        </li>
      </ul>
      <button type="button" class="btn-primary" @click="emit('next')">Confirm match-ups →</button>
    </div>

    <!-- Champion reveal -->
    <div v-else-if="phase.kind === 'champion-reveal'" class="reveal">
      <div class="reveal-pair">
        <div class="reveal-side side-a">
          <span class="reveal-team">{{ teamName('A') }}</span>
          <span class="reveal-name">{{
            factionName(player(state.remainingA[0])?.faction ?? null)
          }}</span>
          <span class="reveal-role">Champion</span>
        </div>
        <span class="reveal-vs">vs</span>
        <div class="reveal-side side-b">
          <span class="reveal-team">{{ teamName('B') }}</span>
          <span class="reveal-name">{{
            factionName(player(state.remainingB[0])?.faction ?? null)
          }}</span>
          <span class="reveal-role">Champion</span>
        </div>
      </div>
      <button type="button" class="btn-primary" @click="emit('next')">Confirm match-up →</button>
    </div>
  </div>
</template>

<style scoped>
.runner {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.runner-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.module-progress {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-primary);
}

.runner-head h2 {
  font-size: 26px;
  letter-spacing: -0.3px;
}

.select-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.instruction {
  font-size: 15px;
  color: var(--color-body);
}

.option-grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--spacing-xs);
}

.option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;
}

.option:hover {
  background: var(--color-surface-soft);
}

.option-grid.sel-defender .option.selected {
  border-color: var(--color-role-defender);
  background: var(--color-role-defender-tint);
}

.option-grid.sel-attacker .option.selected {
  border-color: var(--color-role-attacker);
  background: var(--color-role-attacker-tint);
}

.option-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-card);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-muted);
  flex-shrink: 0;
}

.option-logo img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.option-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-ink);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.check {
  font-weight: 700;
}

.option-grid.sel-defender .check {
  color: var(--color-role-defender);
}

.option-grid.sel-attacker .check {
  color: var(--color-role-attacker);
}

.actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.hint {
  font-size: 13px;
  color: var(--color-muted);
}

.reveal {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  align-items: flex-start;
}

.reveal-pair {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
}

.reveal-side {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  background: var(--color-canvas);
}

.reveal-side.side-a {
  border-left: 3px solid var(--color-accent-teal);
}

.reveal-side.side-b {
  border-left: 3px solid var(--color-accent-amber);
}

.reveal-team {
  font-size: 12px;
  color: var(--color-muted);
}

.reveal-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-ink);
}

.reveal-role {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-primary);
}

.reveal-vs {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 16px;
  color: var(--color-muted-soft);
}

.matchup-rows {
  list-style: none;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.matchup-row {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
}

.matchup-label {
  font-size: 13px;
  color: var(--color-muted);
}

.matchup-pair {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--spacing-sm);
}

.matchup-vs {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-muted);
  text-transform: uppercase;
}

.cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-md);
  min-height: 40px;
}

.logo-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-soft);
  flex-shrink: 0;
}

.logo-tile img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.logo-fallback {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-muted);
}

.cell-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell :deep(svg) {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.role-defender {
  background: var(--color-role-defender-tint);
  border-color: var(--color-role-defender);
  color: var(--color-role-defender);
}

.role-attacker {
  background: var(--color-role-attacker-tint);
  border-color: var(--color-role-attacker);
  color: var(--color-role-attacker);
}

.role-refused {
  background: var(--color-role-refused-tint);
  border-color: var(--color-role-refused);
  color: var(--color-role-refused);
}

.btn-primary:disabled {
  background: var(--color-primary-disabled);
  color: var(--color-muted-soft);
  cursor: not-allowed;
}

@media (max-width: 560px) {
  .reveal-pair {
    grid-template-columns: 1fr;
  }

  .reveal-vs {
    text-align: center;
  }

  .matchup-pair {
    grid-template-columns: 1fr;
  }

  .matchup-vs {
    text-align: center;
  }
}
</style>
