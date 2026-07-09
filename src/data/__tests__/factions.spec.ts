import { describe, it, expect } from 'vitest'
import { allegiances, factionName, type FactionInfo } from '../factions'

const factions: FactionInfo[] = allegiances.flatMap((a) => a.factions)

const RANGES = ['Melee', 'Shooting', 'Hybrid']
const CONSISTENCIES = ['Consistent', 'Balanced', 'Polarising']

describe('faction data', () => {
  it('covers all 27 Teams Event codices with unique keys', () => {
    expect(factions).toHaveLength(27)
    const keys = factions.map((f) => f.key)
    expect(new Set(keys).size).toBe(27)
  })

  it('gives every faction a complete competitive profile', () => {
    // Collect the key of any faction with an invalid/missing field so a failure
    // names the offender (oxlint forbids expect()'s message argument).
    const problems = factions
      .filter(
        (f) =>
          f.difficulty < 1 ||
          f.difficulty > 5 ||
          !RANGES.includes(f.range) ||
          !CONSISTENCIES.includes(f.consistency) ||
          [f.archetype, f.playstyle, f.teamRole, f.pairingTip].some((t) => !t.trim()) ||
          f.strengths.length === 0 ||
          f.weaknesses.length === 0 ||
          [...f.strengths, ...f.weaknesses].some((t) => !t.trim()),
      )
      .map((f) => f.key)
    expect(problems).toEqual([])
  })

  it('resolves faction keys to names, with a placeholder for an unset key', () => {
    expect(factionName('world_eaters')).toBe('World Eaters')
    expect(factionName('not-a-key')).toBe('not-a-key')
    expect(factionName(null)).toBe('—')
  })
})
