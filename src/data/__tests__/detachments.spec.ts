import { describe, it, expect } from 'vitest'
import { allegiances } from '../factions'
import { dispositions } from '../dispositions'
import {
  detachmentsByFaction,
  detachmentsFor,
  dispositionLean,
  dispositionTally,
} from '../detachments'

const factionKeys = allegiances.flatMap((a) => a.factions).map((f) => f.key)
const dispositionKeys = dispositions.map((d) => d.key)

describe('detachment data', () => {
  it('covers every faction in the roster, and nothing else', () => {
    expect(Object.keys(detachmentsByFaction).sort()).toEqual([...factionKeys].sort())
  })

  it('gives every Detachment a 1–3 DP cost and a known Disposition', () => {
    const offenders = Object.entries(detachmentsByFaction).flatMap(([faction, detachments]) =>
      detachments
        .filter((d) => !d.name || d.dp < 1 || d.dp > 3 || !dispositionKeys.includes(d.disposition))
        .map((d) => `${faction} / ${d.name}`),
    )
    expect(offenders).toEqual([])
  })

  it('gives every faction at least one Detachment', () => {
    const empty = factionKeys.filter((key) => detachmentsFor(key).length === 0)
    expect(empty).toEqual([])
  })

  it('has no duplicate Detachment names within a faction', () => {
    const dupes = Object.entries(detachmentsByFaction).filter(
      ([, detachments]) => new Set(detachments.map((d) => d.name)).size !== detachments.length,
    )
    expect(dupes.map(([faction]) => faction)).toEqual([])
  })

  it('returns an empty list for an unknown faction', () => {
    expect(detachmentsFor('not_a_faction')).toEqual([])
    expect(dispositionLean('not_a_faction')).toEqual([])
  })
})

describe('dispositionTally', () => {
  it('reports all five stances in canonical order for every faction', () => {
    const wrong = factionKeys.filter(
      (key) =>
        dispositionTally(key)
          .map((t) => t.disposition)
          .join() !== dispositionKeys.join(),
    )
    expect(wrong).toEqual([])
  })

  it('has counts that sum to the faction pool, and shares that sum to 1', () => {
    for (const key of factionKeys) {
      const tally = dispositionTally(key)
      const total = tally.reduce((sum, t) => sum + t.count, 0)
      expect(total).toBe(detachmentsFor(key).length)
      expect(tally.reduce((sum, t) => sum + t.share, 0)).toBeCloseTo(1)
    }
  })

  it('sets minDp to the cheapest Detachment of that stance, and sorts by DP', () => {
    for (const t of dispositionTally('adepta_sororitas')) {
      const costs = t.detachments.map((d) => d.dp)
      expect(t.minDp).toBe(Math.min(...costs))
      expect(costs).toEqual([...costs].sort((a, b) => a - b))
    }
  })

  it('matches the published Adepta Sororitas entry', () => {
    expect(detachmentsFor('adepta_sororitas')).toContainEqual({
      name: 'Hallowed Martyrs',
      dp: 3,
      disposition: 'priority-assets',
    })
    expect(detachmentsFor('adepta_sororitas')).toContainEqual({
      name: 'Chorus of Condemnation',
      dp: 1,
      disposition: 'reconnaissance',
    })
  })
})

describe('dispositionLean', () => {
  it('orders stances richest first and drops empty ones', () => {
    for (const key of factionKeys) {
      const counts = dispositionLean(key).map((t) => t.count)
      expect(counts).toEqual([...counts].sort((a, b) => b - a))
      expect(counts.filter((c) => c <= 0)).toEqual([])
    }
  })

  it('reads Tyranids as a Take and Hold army', () => {
    expect(dispositionLean('tyranids')[0]?.disposition).toBe('take-and-hold')
  })
})
