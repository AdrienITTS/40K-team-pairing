import { shallowRef } from 'vue'

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

  function start(config: PairingConfig) {
    state.value = settle(createPairingState(config))
  }

  function reset() {
    state.value = null
  }

  // Re-run the live pairing from scratch while keeping the same rosters and
  // round config. The config on the state is never mutated during a run, so
  // feeding it back to `start` yields an identical fresh state.
  function restart() {
    if (state.value) start(state.value.config)
  }

  function defender(id: string) {
    if (state.value) state.value = settle(submitDefender(state.value, id))
  }

  function attackers(ids: string[]) {
    if (state.value) state.value = settle(submitAttackers(state.value, ids))
  }

  function counter(id: string) {
    if (state.value) state.value = settle(submitCounter(state.value, id))
  }

  function next() {
    if (state.value) state.value = settle(proceed(state.value))
  }

  function layout(matchupId: string, value: LayoutLetter) {
    if (state.value) state.value = recordLayout(state.value, matchupId, value)
  }

  return { state, start, reset, restart, defender, attackers, counter, next, layout }
}
