import { describe, it, expect } from 'vitest'
import { secondaryMissions } from '../secondaries'

const EXPECTED_KEYS = [
  'a-grievous-blow',
  'a-tempting-target',
  'assassination',
  'beacon',
  'behind-enemy-lines',
  'bring-it-down',
  'burden-of-trust',
  'centre-ground',
  'cleanse',
  'defend-stronghold',
  'display-of-might',
  'engage-on-all-fronts',
  'forward-position',
  'no-prisoners',
  'outflank',
  'overwhelming-force',
  'plunder',
  'secure-no-man-s-land',
]

describe('secondaryMissions data', () => {
  it('contains all 18 expected missions', () => {
    const keys = secondaryMissions.map((m) => m.key).sort()
    expect(keys).toEqual([...EXPECTED_KEYS].sort())
  })

  it('every mission has a name, at least one section, and each section a scored row', () => {
    for (const m of secondaryMissions) {
      expect(m.name.length).toBeGreaterThan(0)
      expect(m.sections.length).toBeGreaterThan(0)
      for (const section of m.sections) {
        expect(section.rows.length).toBeGreaterThan(0)
        for (const row of section.rows) {
          expect(row.text.length).toBeGreaterThan(0)
          expect(row.vp.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('keys are unique so image paths resolve one-to-one', () => {
    const keys = secondaryMissions.map((m) => m.key)
    expect(new Set(keys).size).toBe(keys.length)
  })
})
