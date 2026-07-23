import { describe, it, expect } from 'vitest'

import { EXAMPLE_SETUP, parsePairingConfig } from '../pairingText'
import { estimateKey, readEstimate } from '../estimates'
import { createPairingState } from '../pairing'

/** A minimal legal four-player setup, built up per test. */
const MINIMAL = `
a: Aeldari
a: Necrons
a: Orks
a: Adepta Sororitas
b: Grey Knights
b: Space Marines
b: Tyranids
b: Death Guard
`

function parse(text: string) {
  return parsePairingConfig(text)
}

describe('parsePairingConfig', () => {
  it('reads rosters, names, round and estimates from the example', () => {
    const { config, errors } = parse(EXAMPLE_SETUP)
    expect(errors).toEqual([])
    expect(config).not.toBeNull()
    expect(config!.round).toBe(2)
    expect(config!.teamA.name).toBe('Les Bastonneurs')
    expect(config!.teamB.name).toBe('Ordo Malleus')
    expect(config!.teamA.players.map((p) => p.faction)).toEqual([
      'aeldari',
      'necrons',
      'orks',
      'adepta_sororitas',
    ])
    expect(config!.teamA.players[0]!.disposition).toBe('take-and-hold')
    expect(config!.teamA.players[3]!.disposition).toBeNull()
    expect(config!.estimateSide).toBe('A')
  })

  it('produces a config the state machine accepts', () => {
    const { config } = parse(EXAMPLE_SETUP)
    expect(() => createPairingState(config!)).not.toThrow()
  })

  it('derives player ids the same way the setup wizard does', () => {
    const { config } = parse(MINIMAL)
    expect(config!.teamA.players[0]!.id).toBe('a-aeldari')
    expect(config!.teamB.players[0]!.id).toBe('b-grey_knights')
  })

  it('defaults the round to 1 and the team names', () => {
    const { config } = parse(MINIMAL)
    expect(config!.round).toBe(1)
    expect(config!.teamA.name).toBe('Team A')
    expect(config!.teamB.name).toBe('Team B')
  })

  it('matches armies and dispositions regardless of case and punctuation', () => {
    const { config, errors } = parse(`
a: T'au Empire · take and hold
a: NECRONS·Purge The Foe
a: leagues_of_votann
b: tau
b: orks
b: Genestealer Cults
`)
    expect(errors).toEqual([])
    expect(config!.teamA.players.map((p) => p.faction)).toEqual([
      'tau',
      'necrons',
      'leagues_of_votann',
    ])
    expect(config!.teamA.players[0]!.disposition).toBe('take-and-hold')
    expect(config!.teamA.players[1]!.disposition).toBe('purge-the-foe')
    expect(config!.teamB.players[0]!.faction).toBe('tau')
  })

  it('accepts every documented player separator', () => {
    const { config, errors } = parse(`
a: Aeldari · Take and Hold
a: Necrons | Purge the Foe
a: Orks / Disruption
b: Tyranids, Reconnaissance
b: Orks
b: Necrons
`)
    expect(errors).toEqual([])
    expect(config!.teamA.players.map((p) => p.disposition)).toEqual([
      'take-and-hold',
      'purge-the-foe',
      'disruption',
    ])
    expect(config!.teamB.players[0]!.disposition).toBe('reconnaissance')
  })

  it('ignores comments and blank lines', () => {
    const { errors } = parse(`# a comment\n\n${MINIMAL}\n   \n# trailing note`)
    expect(errors).toEqual([])
  })

  it('reads both grades and the layout flags off an estimate line', () => {
    const { config, errors } = parse(`${MINIMAL}
est: Aeldari vs Grey Knights = GW D- +AC -B
`)
    expect(errors).toEqual([])
    expect(config!.estimates![estimateKey('a-aeldari', 'b-grey_knights')]).toEqual({
      good: 'GW',
      bad: 'D-',
      layouts: { A: 'favour', C: 'favour', B: 'avoid' },
    })
  })

  it('takes ? as a blank grade', () => {
    const { config } = parse(`${MINIMAL}\nest: Orks vs Tyranids = ? GL`)
    expect(config!.estimates![estimateKey('a-orks', 'b-tyranids')]).toEqual({
      good: null,
      bad: 'GL',
    })
  })

  it('drops an estimate line that carries nothing', () => {
    const { config, errors } = parse(`${MINIMAL}\nest: Orks vs Tyranids = ? ?`)
    expect(errors).toEqual([])
    expect(config!.estimates).toEqual({})
  })

  it('warns rather than fails when there are no dispositions or estimates', () => {
    const { config, warnings } = parse(MINIMAL)
    expect(config).not.toBeNull()
    expect(warnings).toHaveLength(3)
    expect(warnings.join(' ')).toContain('No estimates')
  })
})

describe('parsePairingConfig — rejections', () => {
  const cases: Array<[string, string, string]> = [
    ['an unknown army', 'a: Squats', "isn't an army"],
    ['an unknown disposition', 'a: Orks · Turtling', "isn't a Force Disposition"],
    ['an unknown directive', 'c: Orks', 'unknown directive'],
    ['a line with no colon', 'Orks', 'expected a "key: value" directive'],
    ['a non-numeric round', 'round: soon', 'whole number'],
    ['a round of zero', 'round: 0', 'whole number'],
    ['a duplicate faction', 'a: Aeldari', 'one player per faction'],
    ['an unknown grade', 'est: Aeldari vs Tyranids = WIN', "isn't a grade"],
    ['a third grade', 'est: Aeldari vs Tyranids = W D GW', 'after the two grades'],
    ['an estimate against our own team', 'est: Aeldari vs Orks', "isn't on Team B"],
    ['an estimate for their army', 'est: Tyranids vs Orks', "isn't on Team A"],
    [
      'a repeated estimate',
      'est: Aeldari vs Tyranids = W D\nest: Aeldari vs Tyranids = L L',
      'a second estimate',
    ],
    ['three parts on a player line', 'a: Orks · Disruption · extra', 'expected "<army>"'],
  ]

  for (const [label, extra, message] of cases) {
    it(`rejects ${label}`, () => {
      const { config, errors } = parse(`${MINIMAL}${extra}\n`)
      expect(config).toBeNull()
      expect(errors.join(' ')).toContain(message)
    })
  }

  it('rejects a second Space Marine Chapter on one team', () => {
    const { config, errors } = parse(`
a: Blood Angels
a: Dark Angels
a: Orks
b: Tyranids
b: Necrons
b: Aeldari
`)
    expect(config).toBeNull()
    expect(errors.join(' ')).toContain('only one Space Marine Chapter per team')
  })

  it('allows Grey Knights alongside a Chapter — they are a separate army', () => {
    const { errors } = parse(`
a: Blood Angels
a: Grey Knights
a: Orks
b: Tyranids
b: Necrons
b: Aeldari
`)
    expect(errors).toEqual([])
  })

  it('rejects teams of different sizes', () => {
    const { config, errors } = parse('a: Orks\na: Necrons\na: Aeldari\nb: Tyranids')
    expect(config).toBeNull()
    expect(errors.join(' ')).toContain('same size')
  })

  it('rejects a team below the minimum size', () => {
    const { config, errors } = parse('a: Orks\na: Necrons\nb: Tyranids\nb: Aeldari')
    expect(config).toBeNull()
    expect(errors.join(' ')).toContain('Team size must be 3–8')
  })

  it('rejects more Dispositions of one kind than the cap allows', () => {
    const { config, errors } = parse(`
a: Aeldari · Disruption
a: Necrons · Disruption
a: Orks
b: Tyranids
b: Death Guard
b: Grey Knights
`)
    expect(config).toBeNull()
    expect(errors.join(' ')).toContain('one per 5 players')
  })

  it('allows the cap to rise with the team size', () => {
    const { errors } = parse(`
a: Aeldari · Disruption
a: Necrons · Disruption
a: Orks
a: Drukhari
a: Tyranids
a: Death Guard
b: Grey Knights
b: Space Marines
b: Chaos Daemons
b: Chaos Knights
b: World Eaters
b: Thousand Sons
`)
    expect(errors).toEqual([])
  })

  it('reports the line a problem is on', () => {
    const { errors } = parse('a: Orks\na: Squats\na: Necrons')
    expect(errors[0]).toContain('Line 2')
  })

  it('says so plainly when there is nothing to read', () => {
    const { config, errors } = parse('   \n# just a comment\n')
    expect(config).toBeNull()
    expect(errors).toEqual(['Nothing to read yet — paste a setup above.'])
  })

  it('collects every problem rather than stopping at the first', () => {
    const { errors } = parse('a: Squats\na: Ewoks\nb: Hobbits')
    expect(errors.length).toBeGreaterThan(2)
  })
})

// The exact A1:O22 block copied out of the team's "W40k - Estimation" sheet
// (Template V11 tab), as tab-separated rows — the shape a Google Sheets copy
// produces. Kept as arrays so the tabs are unambiguous.
const SHEET_ROWS: string[][] = [
  ['Preparation', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  [
    'Team : ',
    'Bastonneurs',
    'Opponents : ',
    'Méchants',
    '',
    'Round : ',
    '',
    '2',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  [
    '',
    '',
    '',
    'Chaos Space Marine',
    '',
    'World Eater',
    '',
    'Space Wolves',
    '',
    'Adepta Sororitas',
    '',
    'Imperial Knigths',
    '',
    'Death Guard',
    '',
  ],
  [
    '',
    '',
    '',
    'Priority Assets',
    '',
    'Take and Hold',
    '',
    'Disruption',
    '',
    'Purge the Foe',
    '',
    'Disruption',
    '',
    'Reconnaissance',
    '',
  ],
  ['Player', 'Faction', 'Disposition', 'C', '', 'D', '', 'E', '', 'F', '', 'G', '', 'H', ''],
  [
    'Barberousse',
    'Leagues of Votann',
    'Disruption',
    'D',
    'D-',
    'GW',
    'L',
    'W',
    'L',
    'W',
    'D+',
    'W',
    'W',
    'D-',
    'D-',
  ],
  [
    'Hoxstun',
    'Genestealers Cult',
    'Reconnaissance',
    'D',
    'L',
    'W',
    'L',
    'D+',
    'W',
    'W',
    'D-',
    'GW',
    'D-',
    'GW',
    'L',
  ],
  [
    'Kuroy',
    'Necrons',
    'Purge the Foe',
    'GW',
    'L',
    'W',
    'L',
    'W',
    'D+',
    'W',
    'D',
    'W',
    'L',
    'W',
    'GL',
  ],
  [
    'MonkeyDidi',
    'Thousand Sons',
    'Reconnaissance',
    'D',
    'D',
    'D+',
    'GL',
    'W',
    'W',
    'D-',
    'D-',
    'GW',
    'L',
    'GW',
    'GL',
  ],
  [
    'RocketOwlet',
    'Drukhari',
    'Priority Assets',
    'W',
    'L',
    'D',
    'D',
    'D',
    'L',
    'L',
    'L',
    'W',
    'W',
    'L',
    'D',
  ],
  [
    'Zerk',
    "T'au Empire",
    'Take and Hold',
    'W',
    'GL',
    'W',
    'D-',
    'D-',
    'GL',
    'D',
    'L',
    'D',
    'GL',
    'GW',
    'L',
  ],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['Estimés : Colonne de Gauche', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['Player', 'Faction', 'Disposition', 'C', '', 'D', '', 'E', '', 'F', '', 'G', '', 'H', ''],
  [
    'Barberousse',
    'Leagues of Votann',
    'Disruption',
    'A',
    'C',
    '',
    'C',
    'C',
    'B',
    'B',
    '',
    '',
    'B',
    '',
    'C',
  ],
  [
    'Hoxstun',
    'Genestealers Cult',
    'Reconnaissance',
    'B',
    '',
    '',
    'C',
    '',
    'A,C',
    '',
    'B',
    'C',
    'A',
    'A',
    '',
  ],
  ['Kuroy', 'Necrons', 'Purge the Foe', 'A', '', 'B', '', 'B', '', 'A,C', '', 'C', 'B', '', 'B'],
  [
    'MonkeyDidi',
    'Thousand Sons',
    'Reconnaissance',
    'C',
    'B',
    '',
    'A',
    'A,B',
    '',
    '',
    'C',
    'B,C',
    '',
    'B',
    '',
  ],
  [
    'RocketOwlet',
    'Drukhari',
    'Priority Assets',
    'C',
    'A',
    '',
    'C',
    '',
    'B',
    'C',
    '',
    'A',
    '',
    '',
    'A',
  ],
  ['Zerk', "T'au Empire", 'Take and Hold', 'B', '', 'B,C', '', 'C', 'B', '', 'A', '', 'B', 'C', ''],
]

const SHEET = SHEET_ROWS.map((r) => r.join('\t')).join('\n')

describe('parsePairingConfig — spreadsheet paste', () => {
  it('reads the team name, round and both rosters from a Template V11 copy', () => {
    const { config, errors } = parse(SHEET)
    expect(errors).toEqual([])
    expect(config).not.toBeNull()
    expect(config!.round).toBe(2)
    expect(config!.teamA.name).toBe('Bastonneurs')
    expect(config!.teamB.name).toBe('Méchants')
    expect(config!.estimateSide).toBe('A')
    expect(config!.teamA.players.map((p) => p.faction)).toEqual([
      'leagues_of_votann',
      'genestealer_cults',
      'necrons',
      'thousand_sons',
      'drukhari',
      'tau',
    ])
    // Opponent order follows the header columns C…H.
    expect(config!.teamB.players.map((p) => p.faction)).toEqual([
      'chaos_space_marines',
      'world_eaters',
      'space_wolves',
      'adepta_sororitas',
      'imperial_knights',
      'death_guard',
    ])
  })

  it('carries each player’s Force Disposition through', () => {
    const { config } = parse(SHEET)
    expect(config!.teamA.players[0]!.disposition).toBe('disruption')
    expect(config!.teamB.players[0]!.disposition).toBe('priority-assets')
    expect(config!.teamB.players[1]!.disposition).toBe('take-and-hold')
  })

  it('tolerates the sheet’s plurals and typos when matching armies', () => {
    // "World Eater", "Imperial Knigths", "Genestealers Cult" all resolve.
    const { errors } = parse(SHEET)
    expect(errors).toEqual([])
  })

  it('reads the good/bad grades from the upper table', () => {
    const { config } = parse(SHEET)
    // Barberousse (Votann) vs opponent C (Chaos Space Marines): good D, bad D-.
    const cell = readEstimate(config!.estimates, 'a-leagues_of_votann', 'b-chaos_space_marines')
    expect(cell.good).toBe('D')
    expect(cell.bad).toBe('D-')
  })

  it('reads the favour/avoid layouts from the lower table', () => {
    const { config } = parse(SHEET)
    // Barberousse (Votann) vs opponent C: favour A, avoid C.
    const c = readEstimate(config!.estimates, 'a-leagues_of_votann', 'b-chaos_space_marines')
    expect(c.layouts).toEqual({ A: 'favour', C: 'avoid' })
    // Kuroy (Necrons) vs opponent F (Adepta Sororitas): favour A and C (from "A,C").
    const f = readEstimate(config!.estimates, 'a-necrons', 'b-adepta_sororitas')
    expect(f.layouts).toEqual({ A: 'favour', C: 'favour' })
    // Hoxstun (GSC) vs opponent E (Space Wolves): avoid A and C (right column).
    const e = readEstimate(config!.estimates, 'a-genestealer_cults', 'b-space_wolves')
    expect(e.layouts).toEqual({ A: 'avoid', C: 'avoid' })
  })

  it('produces a config the state machine accepts', () => {
    const { config } = parse(SHEET)
    expect(() => createPairingState(config!)).not.toThrow()
  })

  it('flags an unreadable grade with its cell', () => {
    const broken = SHEET_ROWS.map((r) => [...r])
    broken[6]![3] = 'ZZ' // Barberousse vs C, good column (D7)
    const { config, errors } = parse(broken.map((r) => r.join('\t')).join('\n'))
    expect(config).toBeNull()
    expect(errors.join(' ')).toContain('isn’t a grade')
  })

  it('falls back to the directive parser when there are no tabs', () => {
    const { config } = parse(MINIMAL)
    expect(config!.teamA.players).toHaveLength(4)
  })
})
