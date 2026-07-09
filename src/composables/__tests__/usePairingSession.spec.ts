import { describe, it, expect } from 'vitest'
import { usePairingSession } from '../usePairingSession'
import { currentActor, type PairingConfig } from '../../data/pairing'

function makeConfig(): PairingConfig {
  return {
    round: 2,
    teamA: {
      name: 'Alpha',
      players: [
        { id: 'a-0', faction: 'space_marines' },
        { id: 'a-1', faction: 'necrons' },
        { id: 'a-2', faction: 'orks' },
      ],
    },
    teamB: {
      name: 'Bravo',
      players: [
        { id: 'b-0', faction: 'tau' },
        { id: 'b-1', faction: 'aeldari' },
        { id: 'b-2', faction: 'drukhari' },
      ],
    },
  }
}

describe('usePairingSession', () => {
  it('restart keeps the rosters/config but resets to the start of the live pairing', () => {
    const session = usePairingSession()
    const config = makeConfig()
    session.start(config)

    // Make progress: the first phase is the team-A Defender pick.
    const first = session.state.value!
    expect(currentActor(first.phase)).toBe('A')
    session.defender('a-0')
    expect(session.state.value!.draft).not.toEqual({})

    session.restart()
    const after = session.state.value!
    // Progress cleared, back to a fresh live pairing...
    expect(after.draft).toEqual({})
    expect(after.matchups).toEqual([])
    expect(after.moduleIndex).toBe(0)
    expect(after.phase).toEqual(first.phase)
    // ...but the same rosters and round are preserved.
    expect(after.config).toBe(config)
    expect(after.config.round).toBe(2)
    expect(after.config.teamA.name).toBe('Alpha')
  })

  it('reset clears the whole session back to setup', () => {
    const session = usePairingSession()
    session.start(makeConfig())
    expect(session.state.value).not.toBeNull()
    session.reset()
    expect(session.state.value).toBeNull()
    // Nothing to restart from once reset.
    session.restart()
    expect(session.state.value).toBeNull()
  })

  it('back steps to the previous choice, one snapshot at a time', () => {
    const session = usePairingSession()
    session.start(makeConfig())

    // No history at the very first choice.
    expect(session.canUndo.value).toBe(false)
    const s0 = session.state.value!

    // Team A picks a Defender, then team B picks theirs.
    session.defender('a-0')
    const s1 = session.state.value!
    expect(s1).not.toBe(s0)
    expect(session.canUndo.value).toBe(true)

    expect(currentActor(s1.phase)).toBe('B')
    session.defender('b-0')
    expect(session.state.value).not.toBe(s1)

    // Step back to team B's choice, then to team A's — exact snapshots restored.
    session.back()
    expect(session.state.value).toBe(s1)
    session.back()
    expect(session.state.value).toBe(s0)
    expect(session.canUndo.value).toBe(false)

    // Nothing left to undo.
    session.back()
    expect(session.state.value).toBe(s0)
  })

  it('start and restart clear the undo history', () => {
    const session = usePairingSession()
    session.start(makeConfig())
    session.defender('a-0')
    expect(session.canUndo.value).toBe(true)
    session.restart()
    expect(session.canUndo.value).toBe(false)
  })
})
