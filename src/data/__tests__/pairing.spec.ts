import { describe, it, expect } from 'vitest'

import {
  createPairingState,
  modulesForTeamSize,
  layoutForRound,
  submitDefender,
  submitAttackers,
  submitCounter,
  proceed,
  recordLayout,
  remainingPlayers,
  currentActor,
  playerRole,
  boardLayout,
  type PairingConfig,
  type PairingState,
  type Player,
  type ModuleKind,
} from '../pairing'

function team(prefix: 'A' | 'B', size: number): Player[] {
  return Array.from({ length: size }, (_, i) => ({
    id: `${prefix.toLowerCase()}-${i}`,
    faction: null,
  }))
}

function config(size: number, round = 1): PairingConfig {
  return {
    round,
    teamA: { name: 'Alpha', players: team('A', size) },
    teamB: { name: 'Bravo', players: team('B', size) },
  }
}

/**
 * Play a full session deterministically: always nominate the first available
 * players and always counter-select the opponent's first Attacker.
 */
function runToCompletion(size: number, round = 1): PairingState {
  let state = createPairingState(config(size, round))
  let guard = 0
  while (state.phase.kind !== 'complete') {
    if (guard++ > 200) throw new Error('session did not terminate')
    switch (state.phase.kind) {
      case 'defender-select': {
        const [first] = remainingPlayers(state, state.phase.team)
        state = submitDefender(state, first!.id)
        break
      }
      case 'attackers-select': {
        const team = state.phase.team
        const defenderId = team === 'A' ? state.draft.defenderA : state.draft.defenderB
        const attackers = remainingPlayers(state, team).filter((p) => p.id !== defenderId)
        state = submitAttackers(state, [attackers[0]!.id, attackers[1]!.id])
        break
      }
      case 'counter-select': {
        const team = state.phase.team
        const opposing = team === 'A' ? state.draft.attackersB! : state.draft.attackersA!
        state = submitCounter(state, opposing[0])
        break
      }
      default:
        state = proceed(state)
    }
  }
  return state
}

describe('modulesForTeamSize', () => {
  const expected: Record<number, ModuleKind[]> = {
    3: ['main'],
    4: ['main', 'champion'],
    5: ['skirmish', 'main'],
    6: ['skirmish', 'main', 'champion'],
    7: ['skirmish', 'skirmish', 'main'],
    8: ['skirmish', 'skirmish', 'main', 'champion'],
  }

  for (const [size, modules] of Object.entries(expected)) {
    it(`returns ${modules.join(' + ')} for ${size} players`, () => {
      expect(modulesForTeamSize(Number(size))).toEqual(modules)
    })
  }

  it('throws for out-of-range sizes', () => {
    expect(() => modulesForTeamSize(2)).toThrow(/Unsupported team size/)
    expect(() => modulesForTeamSize(9)).toThrow(/Unsupported team size/)
  })
})

describe('layoutForRound', () => {
  it('cycles A / B / C by round', () => {
    expect([1, 2, 3, 4, 5, 6].map(layoutForRound)).toEqual(['A', 'B', 'C', 'A', 'B', 'C'])
  })
})

describe('full sessions', () => {
  for (const size of [3, 4, 5, 6, 7, 8]) {
    describe(`${size}-player teams`, () => {
      const state = runToCompletion(size)

      it('produces exactly one match-up per player', () => {
        expect(state.matchups).toHaveLength(size)
      })

      it('matches every player from each team exactly once', () => {
        const aIds = state.matchups.map((m) => m.playerA.id).sort()
        const bIds = state.matchups.map((m) => m.playerB.id).sort()
        const expectedA = team('A', size)
          .map((p) => p.id)
          .sort()
        const expectedB = team('B', size)
          .map((p) => p.id)
          .sort()
        expect(aIds).toEqual(expectedA)
        expect(bIds).toEqual(expectedB)
      })

      it('never pairs two players from the same team', () => {
        for (const m of state.matchups) {
          expect(m.playerA.id.startsWith('a-')).toBe(true)
          expect(m.playerB.id.startsWith('b-')).toBe(true)
        }
      })

      it('drains both remaining pools', () => {
        expect(state.remainingA).toHaveLength(0)
        expect(state.remainingB).toHaveLength(0)
      })

      it('assigns match-up counts matching the module sequence', () => {
        const counts: Record<ModuleKind, number> = { skirmish: 2, main: 3, champion: 1 }
        const expectedTotal = modulesForTeamSize(size).reduce((sum, m) => sum + counts[m], 0)
        expect(state.matchups).toHaveLength(expectedTotal)
      })

      it('uses defender-choice layouts for defender match-ups and fixed for the rest', () => {
        const defenders = state.matchups.filter((m) => m.matchType === 'defender')
        const others = state.matchups.filter((m) => m.matchType !== 'defender')
        for (const m of defenders) {
          expect(m.layout.kind).toBe('defender-choice')
          expect(m.defenderSide).not.toBeNull()
        }
        for (const m of others) {
          expect(m.layout).toEqual({ kind: 'fixed', value: 'A' })
          expect(m.defenderSide).toBeNull()
        }
      })
    })
  }

  it('applies the round letter to fixed layouts', () => {
    const state = runToCompletion(6, 2)
    const fixed = state.matchups.filter((m) => m.layout.kind === 'fixed')
    expect(fixed.length).toBeGreaterThan(0)
    for (const m of fixed) expect(m.layout.value).toBe('B')
  })
})

describe('skirmish player accounting', () => {
  it('returns the refused Attacker to the pool after a Skirmish', () => {
    // 5 players → [skirmish, main]. After the skirmish, 3 players remain per team.
    let state = createPairingState(config(5))
    // Defender A = a-0, Defender B = b-0
    state = submitDefender(state, 'a-0')
    state = submitDefender(state, 'b-0')
    state = proceed(state) // defender-reveal
    // Attackers A = a-1, a-2 ; Attackers B = b-1, b-2
    state = submitAttackers(state, ['a-1', 'a-2'])
    state = submitAttackers(state, ['b-1', 'b-2'])
    state = proceed(state) // attackers-reveal
    // Team A's Defender (a-0) will face opposing Attacker b-1.
    state = submitCounter(state, 'b-1')
    // Team B's Defender (b-0) will face opposing Attacker a-1.
    state = submitCounter(state, 'a-1')
    state = proceed(state) // counter-reveal → commit

    // Two match-ups formed: a-0 vs b-1, a-1 vs b-0.
    const skirmishMatchups = state.matchups
    expect(skirmishMatchups).toHaveLength(2)
    const pairs = skirmishMatchups.map((m) => `${m.playerA.id}/${m.playerB.id}`).sort()
    expect(pairs).toEqual(['a-0/b-1', 'a-1/b-0'])

    // Refused Attackers a-2 and b-2 return to their pools.
    expect(state.remainingA.sort()).toEqual(['a-2', 'a-3', 'a-4'])
    expect(state.remainingB.sort()).toEqual(['b-2', 'b-3', 'b-4'])

    // The next module (Main Engagement) begins.
    expect(state.moduleIndex).toBe(1)
    expect(state.phase).toEqual({ kind: 'defender-select', team: 'A' })
  })
})

describe('playerRole', () => {
  it('reports null for every player before any selection', () => {
    const state = createPairingState(config(5))
    for (const p of [...team('A', 5), ...team('B', 5)]) {
      expect(playerRole(state, p.id)).toBeNull()
    }
  })

  it('marks a nominated Defender as defender as soon as it is submitted', () => {
    let state = createPairingState(config(5))
    state = submitDefender(state, 'a-0')
    expect(playerRole(state, 'a-0')).toBe('defender')
  })

  it('marks nominated Attackers as attacker, keeps Defenders as defender, and leaves the rest of the pool null', () => {
    let state = createPairingState(config(5))
    state = submitDefender(state, 'a-0')
    state = submitDefender(state, 'b-0')
    state = proceed(state) // defender-reveal
    state = submitAttackers(state, ['a-1', 'a-2'])
    state = submitAttackers(state, ['b-1', 'b-2'])

    expect(playerRole(state, 'a-0')).toBe('defender')
    expect(playerRole(state, 'b-0')).toBe('defender')
    expect(playerRole(state, 'a-1')).toBe('attacker')
    expect(playerRole(state, 'a-2')).toBe('attacker')
    expect(playerRole(state, 'b-1')).toBe('attacker')
    expect(playerRole(state, 'b-2')).toBe('attacker')
    expect(playerRole(state, 'a-3')).toBeNull()
    expect(playerRole(state, 'a-4')).toBeNull()
    expect(playerRole(state, 'b-3')).toBeNull()
    expect(playerRole(state, 'b-4')).toBeNull()
  })

  it('flips the non-countered Attacker to refused once both counters are in, before commit', () => {
    let state = createPairingState(config(5))
    state = submitDefender(state, 'a-0')
    state = submitDefender(state, 'b-0')
    state = proceed(state) // defender-reveal
    state = submitAttackers(state, ['a-1', 'a-2'])
    state = submitAttackers(state, ['b-1', 'b-2'])
    state = proceed(state) // attackers-reveal
    // Team A's Defender will face opposing Attacker b-1.
    state = submitCounter(state, 'b-1')
    // Team B's Defender will face opposing Attacker a-1.
    state = submitCounter(state, 'a-1')

    // Countered Attackers stay attacker; the other side's un-countered Attacker
    // is now refused, even though nothing has been committed yet.
    expect(playerRole(state, 'a-1')).toBe('attacker')
    expect(playerRole(state, 'a-2')).toBe('refused')
    expect(playerRole(state, 'b-1')).toBe('attacker')
    expect(playerRole(state, 'b-2')).toBe('refused')
    expect(playerRole(state, 'a-0')).toBe('defender')
    expect(playerRole(state, 'b-0')).toBe('defender')
  })

  it('returns the refused Skirmish Attacker to null once committed, and classifies the matched pair from the committed match-up', () => {
    let state = createPairingState(config(5))
    state = submitDefender(state, 'a-0')
    state = submitDefender(state, 'b-0')
    state = proceed(state)
    state = submitAttackers(state, ['a-1', 'a-2'])
    state = submitAttackers(state, ['b-1', 'b-2'])
    state = proceed(state)
    state = submitCounter(state, 'b-1')
    state = submitCounter(state, 'a-1')
    state = proceed(state) // counter-reveal → commits the Skirmish

    // a-2/b-2 were refused but the Skirmish (unlike Main) doesn't play them off
    // against each other — they're returned to the pool, so they're roleless again.
    expect(playerRole(state, 'a-2')).toBeNull()
    expect(playerRole(state, 'b-2')).toBeNull()
    // The committed defender/attacker pairing still classifies from the match-up.
    expect(playerRole(state, 'a-0')).toBe('defender')
    expect(playerRole(state, 'b-1')).toBe('attacker')
    expect(playerRole(state, 'a-1')).toBe('attacker')
    expect(playerRole(state, 'b-0')).toBe('defender')
  })

  it('classifies a completed session: Champions are null, refused-type match-up players are refused', () => {
    // 4 players → [main, champion]: the Main module produces a refused match-up,
    // and the single leftover player per team becomes the Champion.
    const state = runToCompletion(4)
    const champion = state.matchups.find((m) => m.matchType === 'champion')!
    expect(playerRole(state, champion.playerA.id)).toBeNull()
    expect(playerRole(state, champion.playerB.id)).toBeNull()

    const refused = state.matchups.find((m) => m.matchType === 'refused')!
    expect(playerRole(state, refused.playerA.id)).toBe('refused')
    expect(playerRole(state, refused.playerB.id)).toBe('refused')
  })
})

describe('boardLayout', () => {
  it('starts with no rows and every player in the pool, roleless', () => {
    const state = createPairingState(config(5))
    const board = boardLayout(state)
    expect(board.rows).toHaveLength(0)
    expect(board.poolA).toHaveLength(5)
    expect(board.poolB).toHaveLength(5)
    for (const slot of [...board.poolA, ...board.poolB]) {
      expect(slot.role).toBeNull()
    }
  })

  it('forms two single-sided rows once both Defenders are declared', () => {
    let state = createPairingState(config(5))
    state = submitDefender(state, 'a-0')
    state = submitDefender(state, 'b-0') // → defender-reveal
    const board = boardLayout(state)

    expect(board.rows).toHaveLength(2)
    expect(board.rows[0]!.a).toEqual({ player: { id: 'a-0', faction: null }, role: 'defender' })
    expect(board.rows[0]!.b).toBeNull()
    expect(board.rows[1]!.b).toEqual({ player: { id: 'b-0', faction: null }, role: 'defender' })
    expect(board.rows[1]!.a).toBeNull()

    const poolIds = [...board.poolA, ...board.poolB].map((s) => s.player.id)
    expect(poolIds).not.toContain('a-0')
    expect(poolIds).not.toContain('b-0')
  })

  it('keeps the Defender rows one-sided once Attackers are nominated, listing Attackers in the pool', () => {
    let state = createPairingState(config(5))
    state = submitDefender(state, 'a-0')
    state = submitDefender(state, 'b-0')
    state = proceed(state) // attackers-select
    state = submitAttackers(state, ['a-1', 'a-2'])
    state = submitAttackers(state, ['b-1', 'b-2']) // → attackers-reveal
    const board = boardLayout(state)

    expect(board.rows).toHaveLength(2)
    expect(board.rows[0]!.b).toBeNull()
    expect(board.rows[1]!.a).toBeNull()

    const pool = [...board.poolA, ...board.poolB]
    for (const id of ['a-1', 'a-2', 'b-1', 'b-2']) {
      expect(pool.find((s) => s.player.id === id)?.role).toBe('attacker')
    }
  })

  it('fills the Defender rows once counters are chosen, leaving the refused Attackers in the pool as refused', () => {
    let state = createPairingState(config(5))
    state = submitDefender(state, 'a-0')
    state = submitDefender(state, 'b-0')
    state = proceed(state)
    state = submitAttackers(state, ['a-1', 'a-2'])
    state = submitAttackers(state, ['b-1', 'b-2'])
    state = proceed(state) // counter-select
    // Team A's Defender (a-0) will face opposing Attacker b-1.
    state = submitCounter(state, 'b-1')
    // Team B's Defender (b-0) will face opposing Attacker a-1.
    state = submitCounter(state, 'a-1') // still counter-reveal, not yet committed
    const board = boardLayout(state)

    expect(board.rows).toHaveLength(2)
    expect(board.rows[0]!.a).toEqual({ player: { id: 'a-0', faction: null }, role: 'defender' })
    expect(board.rows[0]!.b).toEqual({ player: { id: 'b-1', faction: null }, role: 'attacker' })
    expect(board.rows[1]!.a).toEqual({ player: { id: 'a-1', faction: null }, role: 'attacker' })
    expect(board.rows[1]!.b).toEqual({ player: { id: 'b-0', faction: null }, role: 'defender' })

    const pool = [...board.poolA, ...board.poolB]
    expect(pool.find((s) => s.player.id === 'a-2')?.role).toBe('refused')
    expect(pool.find((s) => s.player.id === 'b-2')?.role).toBe('refused')
  })

  it('commits the Skirmish rows and returns the refused Attackers to the pool with no role', () => {
    let state = createPairingState(config(5))
    state = submitDefender(state, 'a-0')
    state = submitDefender(state, 'b-0')
    state = proceed(state)
    state = submitAttackers(state, ['a-1', 'a-2'])
    state = submitAttackers(state, ['b-1', 'b-2'])
    state = proceed(state)
    state = submitCounter(state, 'b-1')
    state = submitCounter(state, 'a-1')
    state = proceed(state) // counter-reveal → commits the Skirmish
    const board = boardLayout(state)

    expect(board.rows).toHaveLength(2)
    for (const row of board.rows) expect(row.committed).toBe(true)

    const pool = [...board.poolA, ...board.poolB]
    expect(pool.find((s) => s.player.id === 'a-2')?.role).toBeNull()
    expect(pool.find((s) => s.player.id === 'b-2')?.role).toBeNull()
  })

  it('classifies a completed 4-player session: a committed refused pair and a roleless committed Champion row, empty pools', () => {
    // 4 players → [main, champion]. runToCompletion always nominates the first
    // available players and counters with the opponent's first Attacker, which
    // (hand-traced) yields defenders a-0/b-0, refused pair a-2/b-2, and
    // Champions a-3/b-3.
    const state = runToCompletion(4)
    const board = boardLayout(state)

    const refusedRow = board.rows.find((r) => r.a?.role === 'refused' && r.b?.role === 'refused')
    expect(refusedRow).toBeDefined()
    expect(refusedRow!.committed).toBe(true)

    const championMatchup = state.matchups.find((m) => m.matchType === 'champion')!
    const championRow = board.rows.find(
      (r) =>
        r.a?.player.id === championMatchup.playerA.id &&
        r.b?.player.id === championMatchup.playerB.id,
    )
    expect(championRow).toBeDefined()
    expect(championRow!.committed).toBe(true)
    expect(championRow!.a!.role).toBeNull()
    expect(championRow!.b!.role).toBeNull()

    expect(board.poolA).toHaveLength(0)
    expect(board.poolB).toHaveLength(0)
  })
})

describe('validation', () => {
  it('rejects mismatched team sizes', () => {
    expect(() =>
      createPairingState({
        round: 1,
        teamA: { name: 'A', players: team('A', 5) },
        teamB: { name: 'B', players: team('B', 4) },
      }),
    ).toThrow(/same size/)
  })

  it('rejects team sizes outside 3–8', () => {
    expect(() => createPairingState(config(2))).toThrow(/Team size/)
    expect(() => createPairingState(config(9))).toThrow(/Team size/)
  })

  it('rejects a non-positive round', () => {
    expect(() => createPairingState(config(5, 0))).toThrow(/[Rr]ound/)
  })

  it('rejects duplicate player ids across teams', () => {
    const dup = team('A', 3)
    expect(() =>
      createPairingState({
        round: 1,
        teamA: { name: 'A', players: dup },
        teamB: { name: 'B', players: dup },
      }),
    ).toThrow(/unique/)
  })

  it('rejects a Defender not on the acting team', () => {
    const state = createPairingState(config(3))
    expect(() => submitDefender(state, 'b-0')).toThrow(/not available/)
  })

  it('rejects the Defender being nominated as an Attacker', () => {
    let state = createPairingState(config(3))
    state = submitDefender(state, 'a-0')
    state = submitDefender(state, 'b-0')
    state = proceed(state)
    expect(() => submitAttackers(state, ['a-0', 'a-1'])).toThrow(/Defender cannot/)
  })

  it('requires exactly two distinct Attackers', () => {
    let state = createPairingState(config(3))
    state = submitDefender(state, 'a-0')
    state = submitDefender(state, 'b-0')
    state = proceed(state)
    expect(() => submitAttackers(state, ['a-1'])).toThrow(/two distinct/)
    expect(() => submitAttackers(state, ['a-1', 'a-1'])).toThrow(/two distinct/)
  })

  it('rejects a counter-select that is not an opposing Attacker', () => {
    let state = createPairingState(config(3))
    state = submitDefender(state, 'a-0')
    state = submitDefender(state, 'b-0')
    state = proceed(state)
    state = submitAttackers(state, ['a-1', 'a-2'])
    state = submitAttackers(state, ['b-1', 'b-2'])
    state = proceed(state)
    // Team A must pick from B's attackers (b-1/b-2), not its own.
    expect(() => submitCounter(state, 'a-1')).toThrow(/opposing Attackers/)
  })

  it('rejects actions taken in the wrong phase', () => {
    const state = createPairingState(config(3))
    expect(() => submitAttackers(state, ['a-1', 'a-2'])).toThrow(/submitAttackers/)
    expect(() => submitCounter(state, 'b-1')).toThrow(/submitCounter/)
    expect(() => proceed(state)).toThrow(/proceed/)
  })
})

describe('helpers', () => {
  it('reports the acting team, and null on reveal phases', () => {
    let state = createPairingState(config(3))
    expect(currentActor(state.phase)).toBe('A')
    state = submitDefender(state, 'a-0')
    expect(currentActor(state.phase)).toBe('B')
    state = submitDefender(state, 'b-0')
    expect(currentActor(state.phase)).toBeNull() // defender-reveal
  })

  it('records a Defender layout choice', () => {
    const state = runToCompletion(3)
    const defenderMatchup = state.matchups.find((m) => m.matchType === 'defender')!
    const updated = recordLayout(state, defenderMatchup.id, 'C')
    expect(updated.matchups.find((m) => m.id === defenderMatchup.id)!.layout.value).toBe('C')
  })

  it('ignores layout choices on fixed match-ups', () => {
    const state = runToCompletion(4) // has a champion (fixed) match-up
    const champion = state.matchups.find((m) => m.matchType === 'champion')!
    const updated = recordLayout(state, champion.id, 'B')
    expect(updated.matchups.find((m) => m.id === champion.id)!.layout.value).toBe('A')
  })
})
