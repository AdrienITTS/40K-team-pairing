import { computed, shallowRef } from 'vue'

import {
  createPairingState,
  submitDefender,
  submitAttackers,
  submitCounter,
  proceed,
  recordLayout,
  type LayoutLetter,
  type PairingConfig,
  type PairingState,
} from '../data/pairing'

/**
 * Reactive driver around the pure pairing state machine in `data/pairing.ts`.
 * Each action reassigns the whole immutable state, so a `shallowRef` is all the
 * reactivity we need.
 */
export function usePairingSession() {
  const state = shallowRef<PairingState | null>(null)
  // Snapshots of the state before each choice, so "Previous choice" can undo
  // one step at a time. The state machine is immutable — every action returns a
  // fresh state — so these are cheap references, not clones.
  const past = shallowRef<PairingState[]>([])

  // The reveal phases are pure interstitials — the live board already shows
  // every selection and committed match-up — so we auto-advance past them and
  // never surface them in the UI. (The state machine keeps them so the module
  // resolution/commit still happens; we just don't stop on them.)
  function settle(s: PairingState): PairingState {
    let next = s
    while (next.phase.kind.endsWith('-reveal')) {
      next = proceed(next)
    }
    return next
  }

  // Record the current (pre-action) state on the undo stack, then advance.
  function commit(next: PairingState) {
    if (state.value) past.value = [...past.value, state.value]
    state.value = settle(next)
  }

  function start(config: PairingConfig) {
    past.value = []
    state.value = settle(createPairingState(config))
  }

  function reset() {
    state.value = null
    past.value = []
  }

  // Re-run the live pairing from scratch while keeping the same rosters and
  // round config. The config on the state is never mutated during a run, so
  // feeding it back to `start` yields an identical fresh state.
  function restart() {
    if (state.value) start(state.value.config)
  }

  function defender(id: string) {
    if (state.value) commit(submitDefender(state.value, id))
  }

  function attackers(ids: string[]) {
    if (state.value) commit(submitAttackers(state.value, ids))
  }

  function counter(id: string) {
    if (state.value) commit(submitCounter(state.value, id))
  }

  function next() {
    if (state.value) commit(proceed(state.value))
  }

  // Declaring a table's layout is an incidental edit on an already-committed
  // match-up, not a pairing "choice" — so it does NOT go on the undo stack.
  // "Previous choice" then always steps back over the last faction selection,
  // never over a layout click. (A layout is trivially re-editable in place by
  // clicking a different letter, so it needs no undo of its own.)
  function layout(matchupId: string, value: LayoutLetter) {
    if (state.value) state.value = recordLayout(state.value, matchupId, value)
  }

  /** Whether there is an earlier choice to step back to. */
  const canUndo = computed(() => past.value.length > 0)

  // Step back to the state before the last choice.
  function back() {
    const stack = past.value
    if (stack.length === 0) return
    state.value = stack[stack.length - 1]!
    past.value = stack.slice(0, -1)
  }

  return {
    state,
    canUndo,
    start,
    reset,
    restart,
    back,
    defender,
    attackers,
    counter,
    next,
    layout,
  }
}
