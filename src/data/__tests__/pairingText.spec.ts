import { describe, it, expect } from 'vitest'

import { EXAMPLE_SETUP, parsePairingConfig, serializePairingConfig } from '../pairingText'
import { estimateKey } from '../estimates'
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

describe('serializePairingConfig', () => {
  it('round-trips a parsed setup unchanged', () => {
    const { config } = parse(EXAMPLE_SETUP)
    const text = serializePairingConfig(config!)
    const { config: again, errors } = parse(text)
    expect(errors).toEqual([])
    expect(again).toEqual(config)
  })

  it('round-trips a setup with no dispositions or estimates', () => {
    const { config } = parse(MINIMAL)
    const { config: again } = parse(serializePairingConfig(config!))
    expect(again).toEqual(config)
  })

  it('is stable — serialising twice gives the same text', () => {
    const { config } = parse(EXAMPLE_SETUP)
    const once = serializePairingConfig(config!)
    expect(serializePairingConfig(parse(once).config!)).toBe(once)
  })

  it('writes ? for a missing grade so the columns stay positional', () => {
    const { config } = parse(`${MINIMAL}\nest: Orks vs Tyranids = ? GL`)
    expect(serializePairingConfig(config!)).toContain('est: Orks vs Tyranids = ? GL')
  })

  it('groups the layout flags by stance in A/B/C order', () => {
    const { config } = parse(`${MINIMAL}\nest: Orks vs Tyranids = W D -C +A -B`)
    expect(serializePairingConfig(config!)).toContain('= W D +A -BC')
  })

  it('emits estimates in roster order, not entry order', () => {
    const { config } = parse(`${MINIMAL}
est: Orks vs Tyranids = W D
est: Aeldari vs Grey Knights = L L
`)
    const text = serializePairingConfig(config!)
    expect(text.indexOf('est: Aeldari')).toBeLessThan(text.indexOf('est: Orks'))
  })
})
