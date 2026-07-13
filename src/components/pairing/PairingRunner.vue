<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import HandoffGate from './HandoffGate.vue'
import {
  currentActor,
  getPlayer,
  moduleLabel,
  remainingPlayers,
  type PairingState,
  type Player,
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

// The current Defender for the counter-select instruction copy.
function player(id: string | undefined): Player | null {
  return id ? getPlayer(props.state, id) : null
}

const stepLabel = computed(() => {
  switch (phase.value.kind) {
    case 'defender-select':
      return 'Select your Defender'
    case 'attackers-select':
      return 'Select two Attackers'
    case 'counter-select':
      return "Choose your Defender's opponent"
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

    <Transition name="phase" mode="out-in">
      <!-- Selection phases, gated behind the device handoff -->
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
                :aria-label="factionName(opt.faction)"
                :title="factionName(opt.faction)"
                @click="toggle(opt.id)"
              >
                <span class="option-logo">
                  <img
                    v-if="opt.faction"
                    :src="`/images/factions/${opt.faction}.png`"
                    :alt="factionName(opt.faction)"
                    width="44"
                    height="44"
                    loading="lazy"
                  />
                  <span v-else>·</span>
                </span>
                <span v-if="isSelected(opt.id)" class="check" aria-hidden="true">✓</span>
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
    </Transition>
  </div>
</template>

<style scoped>
.runner {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* Smooth the hand-off between selection and reveal phases: the outgoing phase
   fades out, then the next one fades and lifts in. */
.phase-enter-active,
.phase-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.phase-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.phase-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (prefers-reduced-motion: reduce) {
  .phase-enter-active,
  .phase-leave-active {
    transition: none;
  }

  .phase-enter-from,
  .phase-leave-to {
    transform: none;
  }
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
  font-size: 20px;
  letter-spacing: -0.3px;
}

.select-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.instruction {
  font-size: 14px;
  color: var(--color-body);
}

/* Logo-only selection tiles — the faction names are listed on the board to the
   left, so the tiles just show a large, recognisable logo. */
.option-grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: var(--spacing-xs);
}

.option {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs);
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-md);
  cursor: pointer;
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
  width: 52px;
  height: 52px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-card);
  font-size: 16px;
  font-weight: 600;
  color: var(--color-muted);
  flex-shrink: 0;
}

.option-logo img {
  width: 44px;
  height: 44px;
  object-fit: contain;
}

.check {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: var(--radius-pill);
  background: var(--color-surface-card);
  font-size: 10px;
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

.btn-primary:disabled {
  background: var(--color-primary-disabled);
  color: var(--color-muted-soft);
  cursor: not-allowed;
}
</style>
