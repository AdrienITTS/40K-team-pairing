/**
 * Pairing system for Warhammer 40,000 Teams Events.
 *
 * Implements the three pairing modules from GAME.MD — Initial Skirmish, Main
 * Engagement and Champion System — as a pure, immutable state machine. Two team
 * captains drive it turn by turn on a shared device: each secret selection is
 * entered privately, then revealed simultaneously.
 *
 * Player accounting per module (per team), which must sum to the team size:
 *   - Skirmish : nominates 1 Defender + 2 Attackers, but only the Defender and
 *                the *chosen* Attacker are matched (2 match-ups). The refused
 *                Attacker returns to the pool → 2 players consumed.
 *   - Main     : same nomination, but the two refused Attackers also play each
 *                other → all 3 nominated players consumed, 3 match-ups.
 *   - Champion : the single remaining player on each team plays → 1 consumed.
 */

import type { DispositionKey } from './dispositions'
import type { EstimateTable } from './estimates'

export type TeamSide = 'A' | 'B'

export type ModuleKind = 'skirmish' | 'main' | 'champion'

export type LayoutLetter = 'A' | 'B' | 'C'

export interface Player {
  id: string
  /** Faction key (matches `public/images/factions/<key>.webp`), or null. */
  faction: string | null
  /**
   * The player's chosen Force Disposition (see GAME.MD § 1), or null if not
   * assigned. Both players' Dispositions determine the terrain layouts in play.
   */
  disposition?: DispositionKey | null
}

export interface TeamSetup {
  name: string
  players: Player[]
}

export interface PairingConfig {
  /** Tournament round number, 1-based. Drives refused/Champion layouts. */
  round: number
  teamA: TeamSetup
  teamB: TeamSetup
  /**
   * Which side filled in the matchup estimates — estimates are one team's prep
   * work, so they are always read from that team's point of view. The setup
   * wizard only offers Team A (the team running the tool); readers default to
   * 'A' when it is absent.
   */
  estimateSide?: TeamSide
  /** Optional pre-round matchup estimates, keyed `<our id>|<their id>`. */
  estimates?: EstimateTable
}

export interface MatchupLayout {
  /**
   * `defender-choice` — the Defender declares one of A/B/C at the table.
   * `fixed` — dictated by the round number (refused Attackers, Champions).
   */
  kind: 'defender-choice' | 'fixed'
  /** The layout letter: the round letter when fixed, or the recorded choice. */
  value: LayoutLetter | null
}

export interface Matchup {
  id: string
  module: ModuleKind
  matchType: 'defender' | 'refused' | 'champion'
  playerA: Player
  playerB: Player
  /**
   * Which side is the Defender (chooses layout, holds the Defender edge). Null
   * for refused/Champion match-ups, where players roll off for the roles.
   */
  defenderSide: TeamSide | null
  layout: MatchupLayout
}

export type Phase =
  | { kind: 'defender-select'; team: TeamSide }
  | { kind: 'defender-reveal' }
  | { kind: 'attackers-select'; team: TeamSide }
  | { kind: 'attackers-reveal' }
  | { kind: 'counter-select'; team: TeamSide }
  | { kind: 'counter-reveal' }
  | { kind: 'champion-reveal' }
  | { kind: 'complete' }

interface ModuleDraft {
  defenderA?: string
  defenderB?: string
  attackersA?: [string, string]
  attackersB?: [string, string]
  /** Chosen Team B Attacker to face Defender A. */
  counterA?: string
  /** Chosen Team A Attacker to face Defender B. */
  counterB?: string
}

export interface PairingState {
  config: PairingConfig
  moduleQueue: ModuleKind[]
  moduleIndex: number
  /** Ids of players on each team not yet matched. */
  remainingA: string[]
  remainingB: string[]
  phase: Phase
  draft: ModuleDraft
  matchups: Matchup[]
}

export const MIN_TEAM_SIZE = 3
export const MAX_TEAM_SIZE = 8

/**
 * The ordered module sequence for a given team size. Skirmishes run first, then
 * the Main Engagement, then the Champion System (which mops up the last player).
 */
export function modulesForTeamSize(size: number): ModuleKind[] {
  switch (size) {
    case 3:
      return ['main']
    case 4:
      return ['main', 'champion']
    case 5:
      return ['skirmish', 'main']
    case 6:
      return ['skirmish', 'main', 'champion']
    case 7:
      return ['skirmish', 'skirmish', 'main']
    case 8:
      return ['skirmish', 'skirmish', 'main', 'champion']
    default:
      throw new Error(`Unsupported team size: ${size} (must be ${MIN_TEAM_SIZE}–${MAX_TEAM_SIZE})`)
  }
}

/** Round 1 → A, round 2 → B, round 3 → C, then the cycle repeats. */
export function layoutForRound(round: number): LayoutLetter {
  return (['A', 'B', 'C'] as const)[(round - 1) % 3]!
}

/**
 * How many players on a team may each select the same Force Disposition
 * (GAME.MD § 1: "for every 5 players, rounding up, only one player can select
 * each Force Disposition"). So 3–5 players → 1 each, 6–10 → 2 each, etc.
 */
export function dispositionCap(teamSize: number): number {
  return Math.max(1, Math.ceil(teamSize / 5))
}

export function moduleLabel(kind: ModuleKind): string {
  switch (kind) {
    case 'skirmish':
      return 'Initial Skirmish'
    case 'main':
      return 'Main Engagement'
    case 'champion':
      return 'Champion System'
  }
}

function firstPhaseOf(kind: ModuleKind): Phase {
  return kind === 'champion' ? { kind: 'champion-reveal' } : { kind: 'defender-select', team: 'A' }
}

function playerMap(config: PairingConfig): Map<string, Player> {
  const map = new Map<string, Player>()
  for (const p of [...config.teamA.players, ...config.teamB.players]) map.set(p.id, p)
  return map
}

export function createPairingState(config: PairingConfig): PairingState {
  const sizeA = config.teamA.players.length
  const sizeB = config.teamB.players.length
  if (sizeA !== sizeB) {
    throw new Error(`Both teams must be the same size (got ${sizeA} and ${sizeB})`)
  }
  if (sizeA < MIN_TEAM_SIZE || sizeA > MAX_TEAM_SIZE) {
    throw new Error(`Team size must be ${MIN_TEAM_SIZE}–${MAX_TEAM_SIZE} (got ${sizeA})`)
  }
  if (!Number.isInteger(config.round) || config.round < 1) {
    throw new Error(`Round must be a positive integer (got ${config.round})`)
  }
  const ids = [...config.teamA.players, ...config.teamB.players].map((p) => p.id)
  if (new Set(ids).size !== ids.length) {
    throw new Error('Player ids must be unique across both teams')
  }

  const moduleQueue = modulesForTeamSize(sizeA)
  return {
    config,
    moduleQueue,
    moduleIndex: 0,
    remainingA: config.teamA.players.map((p) => p.id),
    remainingB: config.teamB.players.map((p) => p.id),
    phase: firstPhaseOf(moduleQueue[0]!),
    draft: {},
    matchups: [],
  }
}

/** The team expected to act now, or null on a reveal/complete phase. */
export function currentActor(phase: Phase): TeamSide | null {
  switch (phase.kind) {
    case 'defender-select':
    case 'attackers-select':
    case 'counter-select':
      return phase.team
    default:
      return null
  }
}

function remainingFor(state: PairingState, team: TeamSide): string[] {
  return team === 'A' ? state.remainingA : state.remainingB
}

export function remainingPlayers(state: PairingState, team: TeamSide): Player[] {
  const map = playerMap(state.config)
  return remainingFor(state, team)
    .map((id) => map.get(id)!)
    .filter(Boolean)
}

export function getPlayer(state: PairingState, id: string): Player {
  const p = playerMap(state.config).get(id)
  if (!p) throw new Error(`Unknown player id: ${id}`)
  return p
}

export type PlayerRole = 'defender' | 'attacker' | 'refused' | 'champion'

/**
 * God-view: a player's current role, derived from committed match-ups plus the
 * live (uncommitted) draft. Returns null for players with no current role
 * (still in the pool).
 *
 * Committed match-ups take priority over the draft: a player consumed into a
 * match-up in a prior module can't be re-nominated in the current one anyway
 * (they're removed from `remaining`), but resolving matchups first is the
 * defensive choice.
 */
export function playerRole(state: PairingState, id: string): PlayerRole | null {
  for (const m of state.matchups) {
    if (m.playerA.id !== id && m.playerB.id !== id) continue
    if (m.matchType === 'champion') return 'champion'
    if (m.matchType === 'refused') return 'refused'
    // matchType === 'defender': defenderSide names which side holds the Defender.
    const isPlayerA = m.playerA.id === id
    const isDefender = m.defenderSide === (isPlayerA ? 'A' : 'B')
    return isDefender ? 'defender' : 'attacker'
  }

  const { draft } = state
  if (id === draft.defenderA || id === draft.defenderB) return 'defender'
  if (draft.attackersA?.includes(id)) {
    return draft.counterB && id !== draft.counterB ? 'refused' : 'attacker'
  }
  if (draft.attackersB?.includes(id)) {
    return draft.counterA && id !== draft.counterA ? 'refused' : 'attacker'
  }
  return null
}

export interface BoardSlot {
  player: Player
  role: PlayerRole | null
}

export interface BoardRow {
  a: BoardSlot | null
  b: BoardSlot | null
  committed: boolean
  /** The committed match-up this row came from (absent on forming draft rows). */
  matchup?: Matchup
}

export interface BoardLayout {
  rows: BoardRow[]
  poolA: BoardSlot[]
  poolB: BoardSlot[]
}

/**
 * God-view board layout: committed match-ups + the progressively-forming current
 * module arranged into match-up rows (a = Team A / left, b = Team B / right), plus
 * the pool of players not yet placed. Every slot's role comes from playerRole().
 */
export function boardLayout(state: PairingState): BoardLayout {
  const slot = (id: string): BoardSlot => ({
    player: getPlayer(state, id),
    role: playerRole(state, id),
  })
  const placed = new Set<string>()
  const rows: BoardRow[] = []

  for (const m of state.matchups) {
    rows.push({ a: slot(m.playerA.id), b: slot(m.playerB.id), committed: true, matchup: m })
    placed.add(m.playerA.id)
    placed.add(m.playerB.id)
  }

  const { draft } = state
  if (draft.defenderA || draft.defenderB) {
    if (draft.defenderA && !placed.has(draft.defenderA)) {
      rows.push({
        a: slot(draft.defenderA),
        b: draft.counterA ? slot(draft.counterA) : null,
        committed: false,
      })
      placed.add(draft.defenderA)
      if (draft.counterA) placed.add(draft.counterA)
    }
    if (draft.defenderB && !placed.has(draft.defenderB)) {
      rows.push({
        a: draft.counterB ? slot(draft.counterB) : null,
        b: slot(draft.defenderB),
        committed: false,
      })
      placed.add(draft.defenderB)
      if (draft.counterB) placed.add(draft.counterB)
    }
    if (
      currentModule(state) === 'main' &&
      draft.counterA &&
      draft.counterB &&
      draft.attackersA &&
      draft.attackersB
    ) {
      const refusedA = draft.attackersA.find((id) => id !== draft.counterB)
      const refusedB = draft.attackersB.find((id) => id !== draft.counterA)
      if (refusedA && refusedB) {
        rows.push({ a: slot(refusedA), b: slot(refusedB), committed: false })
        placed.add(refusedA)
        placed.add(refusedB)
      }
    }
  }

  const poolA = state.config.teamA.players.filter((p) => !placed.has(p.id)).map((p) => slot(p.id))
  const poolB = state.config.teamB.players.filter((p) => !placed.has(p.id)).map((p) => slot(p.id))

  return { rows, poolA, poolB }
}

function currentModule(state: PairingState): ModuleKind {
  return state.moduleQueue[state.moduleIndex]!
}

/** Advance to the next module (or completion), resetting the draft. */
function startNextModule(state: PairingState): PairingState {
  const nextIndex = state.moduleIndex + 1
  const complete = nextIndex >= state.moduleQueue.length
  return {
    ...state,
    moduleIndex: nextIndex,
    draft: {},
    phase: complete ? { kind: 'complete' } : firstPhaseOf(state.moduleQueue[nextIndex]!),
  }
}

// --- Actions -----------------------------------------------------------------

/** Submit the acting team's Defender for a Skirmish/Main module. */
export function submitDefender(state: PairingState, playerId: string): PairingState {
  if (state.phase.kind !== 'defender-select') {
    throw new Error(`submitDefender called during ${state.phase.kind}`)
  }
  const team = state.phase.team
  if (!remainingFor(state, team).includes(playerId)) {
    throw new Error(`Player ${playerId} is not available for team ${team}`)
  }
  const draft: ModuleDraft = { ...state.draft }
  if (team === 'A') draft.defenderA = playerId
  else draft.defenderB = playerId
  const phase: Phase =
    team === 'A' ? { kind: 'defender-select', team: 'B' } : { kind: 'defender-reveal' }
  return { ...state, draft, phase }
}

/** Submit the acting team's two Attackers (against the opposing Defender). */
export function submitAttackers(state: PairingState, ids: string[]): PairingState {
  if (state.phase.kind !== 'attackers-select') {
    throw new Error(`submitAttackers called during ${state.phase.kind}`)
  }
  const team = state.phase.team
  if (ids.length !== 2 || ids[0] === ids[1]) {
    throw new Error('Exactly two distinct Attackers are required')
  }
  const defenderId = team === 'A' ? state.draft.defenderA : state.draft.defenderB
  for (const id of ids) {
    if (!remainingFor(state, team).includes(id)) {
      throw new Error(`Player ${id} is not available for team ${team}`)
    }
    if (id === defenderId) {
      throw new Error('The Defender cannot also be an Attacker')
    }
  }
  const pair: [string, string] = [ids[0]!, ids[1]!]
  const draft: ModuleDraft = { ...state.draft }
  if (team === 'A') draft.attackersA = pair
  else draft.attackersB = pair
  const phase: Phase =
    team === 'A' ? { kind: 'attackers-select', team: 'B' } : { kind: 'attackers-reveal' }
  return { ...state, draft, phase }
}

/**
 * Submit which of the *opposing* team's two Attackers the acting team wants
 * their own Defender to face.
 */
export function submitCounter(state: PairingState, playerId: string): PairingState {
  if (state.phase.kind !== 'counter-select') {
    throw new Error(`submitCounter called during ${state.phase.kind}`)
  }
  const team = state.phase.team
  const opposingAttackers = team === 'A' ? state.draft.attackersB : state.draft.attackersA
  if (!opposingAttackers || !opposingAttackers.includes(playerId)) {
    throw new Error(`Player ${playerId} is not one of the opposing Attackers`)
  }
  const draft: ModuleDraft = { ...state.draft }
  if (team === 'A') draft.counterA = playerId
  else draft.counterB = playerId
  const phase: Phase =
    team === 'A' ? { kind: 'counter-select', team: 'B' } : { kind: 'counter-reveal' }
  return { ...state, draft, phase }
}

function makeLayout(
  kind: ModuleKind,
  matchType: Matchup['matchType'],
  round: number,
): MatchupLayout {
  if (matchType === 'defender') return { kind: 'defender-choice', value: null }
  return { kind: 'fixed', value: layoutForRound(round) }
}

function commitEngagement(state: PairingState): PairingState {
  const mod = currentModule(state)
  const { defenderA, defenderB, attackersA, attackersB, counterA, counterB } = state.draft
  if (!defenderA || !defenderB || !attackersA || !attackersB || !counterA || !counterB) {
    throw new Error('Cannot resolve match-ups before every selection is made')
  }
  const map = playerMap(state.config)
  const refusedA = attackersA.find((id) => id !== counterB)!
  const refusedB = attackersB.find((id) => id !== counterA)!
  const base = state.matchups.length

  const matchups: Matchup[] = [
    {
      id: `m${base}`,
      module: mod,
      matchType: 'defender',
      playerA: map.get(defenderA)!,
      playerB: map.get(counterA)!,
      defenderSide: 'A',
      layout: makeLayout(mod, 'defender', state.config.round),
    },
    {
      id: `m${base + 1}`,
      module: mod,
      matchType: 'defender',
      playerA: map.get(counterB)!,
      playerB: map.get(defenderB)!,
      defenderSide: 'B',
      layout: makeLayout(mod, 'defender', state.config.round),
    },
  ]

  const consumedA = [defenderA, counterB]
  const consumedB = [defenderB, counterA]

  if (mod === 'main') {
    matchups.push({
      id: `m${base + 2}`,
      module: mod,
      matchType: 'refused',
      playerA: map.get(refusedA)!,
      playerB: map.get(refusedB)!,
      defenderSide: null,
      layout: makeLayout(mod, 'refused', state.config.round),
    })
    consumedA.push(refusedA)
    consumedB.push(refusedB)
  }

  return startNextModule({
    ...state,
    remainingA: state.remainingA.filter((id) => !consumedA.includes(id)),
    remainingB: state.remainingB.filter((id) => !consumedB.includes(id)),
    matchups: [...state.matchups, ...matchups],
  })
}

function commitChampion(state: PairingState): PairingState {
  if (state.remainingA.length !== 1 || state.remainingB.length !== 1) {
    throw new Error('Champion System requires exactly one remaining player per team')
  }
  const map = playerMap(state.config)
  const playerA = map.get(state.remainingA[0]!)!
  const playerB = map.get(state.remainingB[0]!)!
  const matchup: Matchup = {
    id: `m${state.matchups.length}`,
    module: 'champion',
    matchType: 'champion',
    playerA,
    playerB,
    defenderSide: null,
    layout: makeLayout('champion', 'champion', state.config.round),
  }
  return startNextModule({
    ...state,
    remainingA: [],
    remainingB: [],
    matchups: [...state.matchups, matchup],
  })
}

/** Advance past a reveal phase, committing match-ups where the phase resolves them. */
export function proceed(state: PairingState): PairingState {
  switch (state.phase.kind) {
    case 'defender-reveal':
      return { ...state, phase: { kind: 'attackers-select', team: 'A' } }
    case 'attackers-reveal':
      return { ...state, phase: { kind: 'counter-select', team: 'A' } }
    case 'counter-reveal':
      return commitEngagement(state)
    case 'champion-reveal':
      return commitChampion(state)
    default:
      throw new Error(`proceed called during non-reveal phase ${state.phase.kind}`)
  }
}

/** Record a Defender's declared layout letter on a match-up. */
export function recordLayout(
  state: PairingState,
  matchupId: string,
  value: LayoutLetter,
): PairingState {
  return {
    ...state,
    matchups: state.matchups.map((m) =>
      m.id === matchupId && m.layout.kind === 'defender-choice'
        ? { ...m, layout: { ...m.layout, value } }
        : m,
    ),
  }
}
