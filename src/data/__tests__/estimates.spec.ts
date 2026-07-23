import { describe, it, expect } from 'vitest'
import {
  bpWinThreshold,
  columnBp,
  columnGrade,
  cycleLayoutStance,
  estimateCount,
  estimateGrades,
  gradeForBp,
  gradeSlug,
  impliedQuality,
  layoutStanceCount,
  projectRound,
  readEstimate,
  writeEstimate,
  writeLayoutStance,
  type EstimateTable,
} from '../estimates'
import type { LayoutLetter, Matchup, Player } from '../pairing'

describe('estimate grades', () => {
  it('covers the 0–20 BP range once, with no gaps or overlaps', () => {
    // Bands run best → worst, so walking them backwards should tile 0…20.
    const ascending = [...estimateGrades].reverse()
    expect(ascending[0]!.band[0]).toBe(0)
    expect(ascending[ascending.length - 1]!.band[1]).toBe(20)
    for (let i = 1; i < ascending.length; i++) {
      expect(ascending[i]!.band[0]).toBe(ascending[i - 1]!.band[1] + 1)
    }
  })

  it('keeps every band inside its own range', () => {
    for (const g of estimateGrades) {
      expect(g.bp).toBeGreaterThanOrEqual(g.band[0])
      expect(g.bp).toBeLessThanOrEqual(g.band[1])
    }
  })

  it('is symmetric: a grade and its opposite always sum to the shared 20 BP', () => {
    // The scale mirrors around the middle grade, so pairing the list against
    // itself reversed must land on complementary bands every time.
    const n = estimateGrades.length
    for (let i = 0; i < n; i++) {
      const g = estimateGrades[i]!
      const mirror = estimateGrades[n - 1 - i]!
      expect(g.bp + mirror.bp).toBe(20)
      expect(g.band[0] + mirror.band[1]).toBe(20)
      expect(g.band[1] + mirror.band[0]).toBe(20)
    }
  })

  it('gives every grade a CSS-safe, unique token slug', () => {
    const slugs = estimateGrades.map((g) => gradeSlug(g.key))
    expect(new Set(slugs).size).toBe(estimateGrades.length)
    for (const slug of slugs) expect(slug).toMatch(/^[a-z]+$/)
  })
})

describe('the estimate table', () => {
  it('reads a blank cell for an unrecorded pairing', () => {
    expect(readEstimate({}, 'a-orks', 'b-necrons')).toEqual({ good: null, bad: null })
  })

  it('writes each column independently and drops the cell once both are cleared', () => {
    let table: EstimateTable = {}
    table = writeEstimate(table, 'a-orks', 'b-necrons', 'good', 'GW')
    table = writeEstimate(table, 'a-orks', 'b-necrons', 'bad', 'L')
    expect(readEstimate(table, 'a-orks', 'b-necrons')).toEqual({ good: 'GW', bad: 'L' })

    table = writeEstimate(table, 'a-orks', 'b-necrons', 'good', null)
    expect(readEstimate(table, 'a-orks', 'b-necrons')).toEqual({ good: null, bad: 'L' })

    table = writeEstimate(table, 'a-orks', 'b-necrons', 'bad', null)
    expect(Object.keys(table)).toEqual([])
  })

  it('does not mutate the table it is given', () => {
    const table: EstimateTable = {}
    writeEstimate(table, 'a-orks', 'b-necrons', 'good', 'W')
    expect(table).toEqual({})
  })
})

describe('bpWinThreshold', () => {
  it('matches the GAME.MD table', () => {
    expect([3, 4, 5, 6, 7, 8].map(bpWinThreshold)).toEqual([4, 6, 6, 8, 10, 12])
  })

  it('rejects sizes outside the supported range', () => {
    expect(() => bpWinThreshold(9)).toThrow('No BP win threshold for team size 9')
  })
})

// --- Projection ---------------------------------------------------------------

function player(id: string): Player {
  return { id, faction: null, disposition: null }
}

function matchup(
  id: string,
  a: string,
  b: string,
  defenderSide: 'A' | 'B' | null,
  letter: LayoutLetter | null = null,
): Matchup {
  return {
    id,
    module: defenderSide ? 'main' : 'champion',
    matchType: defenderSide ? 'defender' : 'champion',
    playerA: player(a),
    playerB: player(b),
    defenderSide,
    layout: { kind: defenderSide ? 'defender-choice' : 'fixed', value: letter },
  }
}

describe('layout stances', () => {
  it('cycles neutral → favour → avoid → neutral', () => {
    expect(cycleLayoutStance(undefined)).toBe('favour')
    expect(cycleLayoutStance('favour')).toBe('avoid')
    expect(cycleLayoutStance('avoid')).toBeNull()
  })

  it('records one stance per letter and clears back to neutral', () => {
    let t: EstimateTable = {}
    t = writeLayoutStance(t, 'a-1', 'b-1', 'A', 'favour')
    t = writeLayoutStance(t, 'a-1', 'b-1', 'C', 'avoid')
    expect(readEstimate(t, 'a-1', 'b-1').layouts).toEqual({ A: 'favour', C: 'avoid' })
    expect(layoutStanceCount(t)).toBe(2)

    // Re-rating a letter replaces rather than appends.
    t = writeLayoutStance(t, 'a-1', 'b-1', 'A', 'avoid')
    expect(readEstimate(t, 'a-1', 'b-1').layouts).toEqual({ A: 'avoid', C: 'avoid' })

    t = writeLayoutStance(t, 'a-1', 'b-1', 'A', null)
    t = writeLayoutStance(t, 'a-1', 'b-1', 'C', null)
    expect(Object.keys(t)).toEqual([])
  })

  it('keeps grades and stances on the same cell without disturbing each other', () => {
    let t: EstimateTable = writeEstimate({}, 'a-1', 'b-1', 'good', 'GW')
    t = writeLayoutStance(t, 'a-1', 'b-1', 'B', 'favour')
    expect(readEstimate(t, 'a-1', 'b-1')).toEqual({
      good: 'GW',
      bad: null,
      layouts: { B: 'favour' },
    })

    // Clearing only the grade leaves the stance, so the cell survives.
    t = writeEstimate(t, 'a-1', 'b-1', 'good', null)
    expect(readEstimate(t, 'a-1', 'b-1').layouts).toEqual({ B: 'favour' })
    expect(estimateCount(t)).toBe(0)
  })
})

describe('column BP and grade', () => {
  it('maps a BP back to the grade band that holds it', () => {
    expect(gradeForBp(18)).toBe('GW')
    expect(gradeForBp(14)).toBe('W')
    expect(gradeForBp(12)).toBe('D+')
    expect(gradeForBp(10)).toBe('D')
    expect(gradeForBp(6)).toBe('L')
    expect(gradeForBp(0)).toBe('GL')
  })

  it('reads the good and bad columns straight off the cell', () => {
    const cell = { good: 'GW' as const, bad: 'D' as const }
    expect(columnBp(cell, 'good')).toBe(18)
    expect(columnBp(cell, 'bad')).toBe(10)
    expect(columnGrade(cell, 'good')).toBe('GW')
    expect(columnGrade(cell, 'bad')).toBe('D')
  })

  it('takes the rounded midpoint of the two for a neutral column', () => {
    expect(columnBp({ good: 'GW', bad: 'D' }, 'neutral')).toBe(14) // (18+10)/2
    expect(columnBp({ good: 'GW', bad: 'GL' }, 'neutral')).toBe(10) // (18+2)/2
    expect(columnBp({ good: 'W', bad: 'D-' }, 'neutral')).toBe(12) // (14+9)/2 → 11.5→12
    expect(columnGrade({ good: 'GW', bad: 'D' }, 'neutral')).toBe('W')
  })

  it('has no neutral value unless both estimates are present', () => {
    expect(columnBp({ good: 'GW', bad: null }, 'neutral')).toBe(18)
    expect(columnBp({ good: null, bad: null }, 'neutral')).toBeNull()
  })
})

describe('impliedQuality', () => {
  it('falls back to the Defender role when no layout is known', () => {
    expect(impliedQuality(matchup('m0', 'a-1', 'b-1', 'A'), 'A')).toEqual({
      quality: 'good',
      source: 'defender',
    })
    expect(impliedQuality(matchup('m0', 'a-1', 'b-1', 'B'), 'A')).toEqual({
      quality: 'bad',
      source: 'defender',
    })
    expect(impliedQuality(matchup('m0', 'a-1', 'b-1', 'A'), 'B')).toEqual({
      quality: 'bad',
      source: 'defender',
    })
  })

  it('implies neither column on a roll-off table with an unrated layout', () => {
    expect(impliedQuality(matchup('m0', 'a-1', 'b-1', null, 'C'), 'A')).toEqual({
      quality: null,
      source: null,
    })
  })

  it('reads a rated layout even on a roll-off table', () => {
    const t = writeLayoutStance({}, 'a-1', 'b-1', 'C', 'favour')
    expect(impliedQuality(matchup('m0', 'a-1', 'b-1', null, 'C'), 'A', t)).toEqual({
      quality: 'good',
      source: 'layout',
    })
  })

  it('lets a rated layout overrule the Defender role', () => {
    // They defend, so the role alone would say "bad" — but they declared a
    // layout we happen to want, which makes it a good table for us anyway.
    const t = writeLayoutStance({}, 'a-1', 'b-1', 'B', 'favour')
    expect(impliedQuality(matchup('m0', 'a-1', 'b-1', 'B', 'B'), 'A', t)).toEqual({
      quality: 'good',
      source: 'layout',
    })

    // And the reverse: our own Defender on a layout we rated badly.
    const u = writeLayoutStance({}, 'a-1', 'b-1', 'B', 'avoid')
    expect(impliedQuality(matchup('m0', 'a-1', 'b-1', 'A', 'B'), 'A', u)).toEqual({
      quality: 'bad',
      source: 'layout',
    })
  })

  it('reads the stance from the estimating team’s own row', () => {
    const t = writeLayoutStance({}, 'b-1', 'a-1', 'A', 'avoid')
    expect(impliedQuality(matchup('m0', 'a-1', 'b-1', 'B', 'A'), 'B', t)).toEqual({
      quality: 'bad',
      source: 'layout',
    })
  })

  it('reads a neutral column once any preference is declared', () => {
    // We flagged A to avoid, but the layout in play is B, which we never marked:
    // a neutral table → the `neutral` column, whoever defends.
    const t = writeLayoutStance({}, 'a-1', 'b-1', 'A', 'avoid')
    expect(impliedQuality(matchup('m0', 'a-1', 'b-1', 'B', 'B'), 'A', t)).toEqual({
      quality: 'neutral',
      source: 'layout',
    })
    // Even when the opponent defends (role alone would say "bad"), a neutral
    // layout still reads neutral because we didn't flag it.
    expect(impliedQuality(matchup('m0', 'a-1', 'b-1', 'B', 'C'), 'A', t)).toEqual({
      quality: 'neutral',
      source: 'layout',
    })
  })

  it('still falls back to the Defender role when no preference is declared', () => {
    // No layouts recorded at all → the letter can't imply anything, so the
    // Defender role decides as before.
    expect(impliedQuality(matchup('m0', 'a-1', 'b-1', 'B', 'A'), 'A')).toEqual({
      quality: 'bad',
      source: 'defender',
    })
  })
})

describe('projectRound', () => {
  const matchups = [
    matchup('m0', 'a-1', 'b-1', 'A'), // we defend → good column
    matchup('m1', 'a-2', 'b-2', 'B'), // they defend → bad column
    matchup('m2', 'a-3', 'b-3', null), // roll-off
  ]

  // a-1 crushes b-1 on its own table; a-2 struggles on theirs; a-3 is even.
  let table: EstimateTable = {}
  table = writeEstimate(table, 'a-1', 'b-1', 'good', 'GW') // 18
  table = writeEstimate(table, 'a-1', 'b-1', 'bad', 'D')
  table = writeEstimate(table, 'a-2', 'b-2', 'good', 'W')
  table = writeEstimate(table, 'a-2', 'b-2', 'bad', 'L') // 6
  table = writeEstimate(table, 'a-3', 'b-3', 'good', 'D') // 10
  table = writeEstimate(table, 'a-3', 'b-3', 'bad', 'GL')

  it('picks each table’s column from who declares the layout', () => {
    // The roll-off (m2) has no rated layout and no Defender, so it defaults to
    // the neutral column: the midpoint of good (D = 10) and bad (GL = 2) = 6.
    const p = projectRound(matchups, 'A', table)
    expect(p.tables.map((t) => t.quality)).toEqual(['good', 'bad', 'neutral'])
    expect(p.tables.map((t) => t.source)).toEqual(['defender', 'defender', 'default'])
    expect(p.tables.map((t) => t.bp)).toEqual([18, 6, 6])
    expect(p.ourBp).toBe(30)
    expect(p.oppBp).toBe(30)
    expect(p.margin).toBe(0)
  })

  it('prefers a rated layout over the Defender role once the letter is declared', () => {
    // Team A defends m0 but declares layout C, which we rated as one to avoid:
    // the table drops from GW (18) to the bad column's D (10).
    const rated = writeLayoutStance(table, 'a-1', 'b-1', 'C', 'avoid')
    const declared = [matchup('m0', 'a-1', 'b-1', 'A', 'C'), ...matchups.slice(1)]
    const p = projectRound(declared, 'A', rated)
    expect(p.tables[0]!.source).toBe('layout')
    expect(p.tables[0]!.letter).toBe('C')
    expect(p.tables[0]!.quality).toBe('bad')
    expect(p.tables[0]!.bp).toBe(10)
    // m0 bad (10) + m1 bad (6) + m2 neutral default (6).
    expect(p.ourBp).toBe(22)
  })

  it('scores a neutral declared layout as the midpoint of the two estimates', () => {
    // We marked C to avoid on m0, but layout A is declared — one we never
    // flagged. Its BP is the midpoint of the good (GW = 18) and bad (D = 10)
    // columns: (18 + 10) / 2 = 14, shown as the grade that band holds (W).
    const rated = writeLayoutStance(table, 'a-1', 'b-1', 'C', 'avoid')
    const declared = [matchup('m0', 'a-1', 'b-1', 'B', 'A'), ...matchups.slice(1)]
    const p = projectRound(declared, 'A', rated)
    expect(p.tables[0]!.source).toBe('layout')
    expect(p.tables[0]!.quality).toBe('neutral')
    expect(p.tables[0]!.bp).toBe(14)
    expect(p.tables[0]!.grade).toBe('W')
  })

  it('resolves a roll-off table outright once its fixed layout is rated', () => {
    const rated = writeLayoutStance(table, 'a-3', 'b-3', 'A', 'avoid')
    const fixed = [...matchups.slice(0, 2), matchup('m2', 'a-3', 'b-3', null, 'A')]
    const p = projectRound(fixed, 'A', rated)
    expect(p.tables[2]!.source).toBe('layout')
    expect(p.tables[2]!.quality).toBe('bad')
    expect(p.tables[2]!.bp).toBe(2)
  })

  it('lets an override flip a roll-off table to the other column', () => {
    const p = projectRound(matchups, 'A', table, { m2: 'bad' })
    expect(p.tables[2]!.bp).toBe(2)
    expect(p.tables[2]!.source).toBe('override')
    expect(p.ourBp).toBe(26)
    expect(p.margin).toBe(-8)
  })

  it('lets an override beat even a rated layout', () => {
    const rated = writeLayoutStance(table, 'a-1', 'b-1', 'C', 'avoid')
    const declared = [matchup('m0', 'a-1', 'b-1', 'A', 'C'), ...matchups.slice(1)]
    const p = projectRound(declared, 'A', rated, { m0: 'good' })
    expect(p.tables[0]!.source).toBe('override')
    expect(p.tables[0]!.bp).toBe(18)
  })

  it('calls the round against the team-size threshold', () => {
    // Force m2 to its good column (D = 10) for a +8 margin; the neutral default
    // alone lands the round on nil.
    expect(projectRound(matchups, 'A', table, { m2: 'good' }, 3).verdict).toBe('win') // +8 ≥ 4
    expect(projectRound(matchups, 'A', table, { m2: 'good' }, 7).verdict).toBe('draw') // +8 < 10
    expect(projectRound(matchups, 'A', table, {}, 3).verdict).toBe('draw') // 0 < 4
    expect(projectRound(matchups, 'A', table, { m2: 'bad' }, 3).verdict).toBe('loss')
  })

  it('awards Team Points for the verdict', () => {
    expect(projectRound(matchups, 'A', table, { m2: 'good' }, 3).teamPoints).toBe(3)
    expect(projectRound(matchups, 'A', table, { m2: 'good' }, 7).teamPoints).toBe(2)
    expect(projectRound(matchups, 'A', table, { m2: 'bad' }, 3).teamPoints).toBe(1)
  })

  it('reports the BP still needed for a better verdict', () => {
    // Margin +8 against a size-7 threshold of 10: two BP of margin short, which
    // is one BP of ours (every BP we take is one they don't).
    const p = projectRound(matchups, 'A', table, { m2: 'good' }, 7)
    expect(p.bpToWin).toBe(1)
    expect(p.bpToDraw).toBeNull()
    expect(projectRound(matchups, 'A', table, { m2: 'good' }, 3).bpToWin).toBeNull()
  })

  it('leaves ungraded tables out of the totals', () => {
    const partial = writeEstimate({}, 'a-1', 'b-1', 'good', 'GW')
    const p = projectRound(matchups, 'A', partial)
    expect(p.scored).toBe(1)
    expect(p.ourBp).toBe(18)
    expect(p.oppBp).toBe(2)
    expect(p.tables.map((t) => t.grade)).toEqual(['GW', null, null])
  })

  it('reads the table from the estimating team’s own side', () => {
    // The same match-ups scored by Team B: b-1 is the row, and Team A defending
    // m0 means m0 is on B's bad column.
    let bTable: EstimateTable = {}
    bTable = writeEstimate(bTable, 'b-1', 'a-1', 'bad', 'GL')
    const p = projectRound(matchups, 'B', bTable, {}, 3)
    expect(p.tables[0]!.ourPlayerId).toBe('b-1')
    expect(p.tables[0]!.bp).toBe(2)
  })
})
