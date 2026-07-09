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
})
