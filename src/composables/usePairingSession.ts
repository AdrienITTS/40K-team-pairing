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

  function start(config: PairingConfig) {
    state.value = createPairingState(config)
  }

  function reset() {
    state.value = null
  }

  function defender(id: string) {
    if (state.value) state.value = submitDefender(state.value, id)
  }

  function attackers(ids: string[]) {
    if (state.value) state.value = submitAttackers(state.value, ids)
  }

  function counter(id: string) {
    if (state.value) state.value = submitCounter(state.value, id)
  }

  function next() {
    if (state.value) state.value = proceed(state.value)
  }

  function layout(matchupId: string, value: LayoutLetter) {
    if (state.value) state.value = recordLayout(state.value, matchupId, value)
  }

  return { state, start, reset, defender, attackers, counter, next, layout }
}
