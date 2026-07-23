<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import HandoffGate from './HandoffGate.vue'
import {
  currentActor,
  getPlayer,
  remainingPlayers,
  type PairingState,
  type Player,
  type TeamSide,
} from '../../data/pairing'
import { factionAbbr, factionName } from '../../data/factions'

const props = defineProps<{ state: PairingState }>()

const emit = defineEmits<{
  defender: [id: string]
  attackers: [ids: string[]]
  counter: [id: string]
  next: []
}>()

const phase = computed(() => props.state.phase)
const actor = computed(() => currentActor(phase.value))

const phaseKey = computed(
  () => `${props.state.moduleIndex}-${phase.value.kind}-${actor.value ?? ''}`,
)

function teamName(side: TeamSide): string {
  return side === 'A' ? props.state.config.teamA.name : props.state.config.teamB.name
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
    <Transition name="phase" mode="out-in">
      <!-- The whole selection is a single bar: who is selecting, what to do, the
           faction choices, and the confirm — all on one row. -->
      <HandoffGate v-if="actor" :key="phaseKey" :team-side="actor" :team-name="teamName(actor)">
        <span class="step-label">{{ stepLabel }}</span>

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
                  :src="`/images/factions/${opt.faction}.webp`"
                  :alt="factionName(opt.faction)"
                  width="44"
                  height="44"
                  loading="lazy"
                />
                <span v-else>·</span>
              </span>
              <span class="option-abbr">{{ factionAbbr(opt.faction) }}</span>
              <span v-if="isSelected(opt.id)" class="check" aria-hidden="true">✓</span>
            </button>
          </li>
        </ul>

        <div class="actions">
          <span v-if="selectMode === 'double'" class="hint">{{ selected.length }} / 2</span>
          <button type="button" class="btn-primary" :disabled="confirmDisabled" @click="confirm">
            Lock in →
          </button>
        </div>
      </HandoffGate>
    </Transition>
  </div>
</template>

<style scoped>
.runner {
  display: flex;
  flex-direction: column;
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

/* The short action label ("Select two Attackers") that sits in the bar between
   the "is selecting" banner and the faction tiles. */
.step-label {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-ink);
  white-space: nowrap;
}

/* Logo-only selection tiles on a single row — the faction names are listed on
   the board below, so the tiles just show a compact, recognisable logo. They
   take the row's width beside the confirm button, capped so a small field
   doesn't blow each tile up, and scroll sideways in the rare over-full case. */
.option-grid {
  flex: 1;
  min-width: 0;
  list-style: none;
  display: flex;
  flex-wrap: nowrap;
  gap: var(--spacing-xs);
  overflow-x: auto;
}

.option-grid > li {
  flex: 1 1 0;
  min-width: 44px;
  max-width: 96px;
}

.option {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  padding: 4px;
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-sm);
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
  width: 34px;
  height: 34px;
  border-radius: var(--radius-xs);
  background: var(--color-surface-card);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-muted);
  flex-shrink: 0;
}

.option-logo img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

/* The faction's short tag under its logo — the icons are small on this bar, so
   the letters are what actually tell two armies apart at a glance. */
.option-abbr {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;
  color: var(--color-muted);
}

.option.selected .option-abbr {
  color: var(--color-ink);
}

.check {
  position: absolute;
  top: 2px;
  right: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: var(--radius-pill);
  background: var(--color-surface-card);
  font-size: 9px;
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
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.hint {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.btn-primary:disabled {
  background: var(--color-primary-disabled);
  color: var(--color-muted-soft);
  cursor: not-allowed;
}

@media (max-width: 720px) {
  /* The bar wraps (see HandoffGate); give the confirm button the full width on
     its own line and let the tiles pack a touch tighter. */
  .option-grid {
    flex-basis: 100%;
  }

  .option-grid > li {
    min-width: 52px;
  }

  .actions {
    flex: 1;
  }

  .actions .btn-primary {
    flex: 1;
    padding-block: 12px;
  }
}
</style>
