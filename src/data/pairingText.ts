/**
 * The plain-text setup format behind Quick pairing.
 *
 * A whole round's prep — rosters, Force Dispositions, and Team A's matchup
 * estimates — as something a captain can keep in a note, mail to a teammate, or
 * generate out of a spreadsheet, then paste in to land straight on the live
 * pairing board. `serializePairingConfig` and `parsePairingConfig` are inverses,
 * so a round set up once through the wizard can be copied back out and replayed.
 *
 * The grammar is one `key: value` directive per line; `#` starts a comment line
 * and blank lines are ignored. Keys are case-insensitive and matched with
 * punctuation stripped, so `Team A:` and `teama:` are the same directive.
 *
 *   round: 2                         the tournament round (fixes Refused/Champion layouts)
 *   team a: Les Bastonneurs          team names, optional
 *   team b: Ordo Malleus
 *   a: Aeldari · Take and Hold       one line per player, in roster order
 *   b: Grey Knights                  the Disposition after the separator is optional
 *   est: Aeldari vs Grey Knights = GW D +A -C
 *
 * An `est:` line is always read from Team A's side (estimates are one team's own
 * prep, and this tool is run by Team A): the two grades are the good-table and
 * bad-table columns in that order, `?` for a blank one, and the trailing `+`/`-`
 * flags mark the A/B/C layouts that team wants and would rather avoid.
 *
 * Army and Disposition names are matched leniently — case, spacing and
 * punctuation are ignored, and either the display name or the internal key
 * works — so `T'au Empire`, `tau` and `TAU` all resolve to the same faction.
 */

import { allegiances, factionName, isSpaceMarine } from './factions'
import { dispositions, getDisposition, type DispositionKey } from './dispositions'
import {
  MAX_TEAM_SIZE,
  MIN_TEAM_SIZE,
  dispositionCap,
  type LayoutLetter,
  type PairingConfig,
  type Player,
  type TeamSide,
} from './pairing'
import {
  estimateGrades,
  estimateKey,
  type EstimateCell,
  type EstimateGrade,
  type EstimateTable,
  type LayoutStance,
} from './estimates'

/** Estimates in this format are always Team A's — see the module comment. */
const ESTIMATE_SIDE: TeamSide = 'A'

/** Accepted between an army and its Force Disposition on a player line. */
const PLAYER_SEPARATORS = /\s*[·|/,]\s*/

const LAYOUT_LETTERS: readonly LayoutLetter[] = ['A', 'B', 'C']

/** Case/punctuation-insensitive form used to match names against keys. */
function norm(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

const FACTION_BY_TOKEN = new Map<string, string>()
for (const allegiance of allegiances) {
  for (const faction of allegiance.factions) {
    FACTION_BY_TOKEN.set(norm(faction.key), faction.key)
    FACTION_BY_TOKEN.set(norm(faction.name), faction.key)
  }
}

const DISPOSITION_BY_TOKEN = new Map<string, DispositionKey>()
for (const disposition of dispositions) {
  DISPOSITION_BY_TOKEN.set(norm(disposition.key), disposition.key)
  DISPOSITION_BY_TOKEN.set(norm(disposition.name), disposition.key)
}

// Grades keep their punctuation — `norm` would collapse D, D+ and D- onto each
// other — so they match on case alone.
const GRADE_BY_TOKEN = new Map<string, EstimateGrade>(
  estimateGrades.map((g) => [g.key.toUpperCase(), g.key]),
)

/** Player ids must match `PairingSetup`'s, so estimates key the same either way. */
function playerId(side: TeamSide, faction: string): string {
  return `${side.toLowerCase()}-${faction}`
}

// --- Parsing -----------------------------------------------------------------

export interface ParsedSetup {
  /** The config, or null when the text can't be turned into a legal round. */
  config: PairingConfig | null
  /** Why it can't, one message per problem, each naming its line. */
  errors: string[]
  /** Things that parsed but are worth knowing about before starting. */
  warnings: string[]
}

interface RosterEntry {
  faction: string
  disposition: DispositionKey | null
  line: number
}

interface EstEntry {
  ourFaction: string
  oppFaction: string
  cell: EstimateCell
  line: number
}

export function parsePairingConfig(text: string): ParsedSetup {
  const errors: string[] = []
  const warnings: string[] = []
  const roster: Record<TeamSide, RosterEntry[]> = { A: [], B: [] }
  const estimateEntries: EstEntry[] = []
  const names: Record<TeamSide, string> = { A: '', B: '' }
  let round = 1

  text.split(/\r?\n/).forEach((raw, index) => {
    const line = index + 1
    const trimmed = raw.trim()
    if (!trimmed || trimmed.startsWith('#')) return

    const colon = trimmed.indexOf(':')
    if (colon < 0) {
      errors.push(`Line ${line}: expected a "key: value" directive.`)
      return
    }
    const key = norm(trimmed.slice(0, colon))
    const value = trimmed.slice(colon + 1).trim()

    switch (key) {
      case 'round': {
        const n = Number(value)
        if (!Number.isInteger(n) || n < 1) {
          errors.push(`Line ${line}: round must be a whole number of 1 or more (got "${value}").`)
        } else {
          round = n
        }
        return
      }
      case 'teama':
      case 'teamb':
        names[key === 'teama' ? 'A' : 'B'] = value
        return
      case 'a':
      case 'b': {
        const entry = parsePlayer(value, line, errors)
        if (entry) roster[key === 'a' ? 'A' : 'B'].push(entry)
        return
      }
      case 'est':
      case 'estimate': {
        const entry = parseEstimate(value, line, errors)
        if (entry) estimateEntries.push(entry)
        return
      }
      default:
        errors.push(`Line ${line}: unknown directive "${trimmed.slice(0, colon)}".`)
    }
  })

  const size = roster.A.length
  if (size === 0 && roster.B.length === 0) {
    // A blank box isn't a mistake worth shouting about — it's the starting state.
    if (errors.length === 0) errors.push('Nothing to read yet — paste a setup above.')
    return { config: null, errors, warnings }
  }
  if (size !== roster.B.length) {
    errors.push(
      `Both teams must be the same size (Team A has ${size}, Team B has ${roster.B.length}).`,
    )
  }
  if (size < MIN_TEAM_SIZE || size > MAX_TEAM_SIZE) {
    errors.push(`Team size must be ${MIN_TEAM_SIZE}–${MAX_TEAM_SIZE} (Team A has ${size}).`)
  }

  for (const side of ['A', 'B'] as const) {
    checkRoster(side, roster[side], size, errors)
    if (roster[side].every((p) => !p.disposition)) {
      warnings.push(
        `Team ${side} has no Force Dispositions, so its tables won't offer terrain layouts.`,
      )
    }
  }

  const estimates = buildEstimates(estimateEntries, roster, errors)
  if (Object.keys(estimates).length === 0) {
    warnings.push('No estimates, so the estimates rail and the projected result stay off.')
  }

  if (errors.length > 0) return { config: null, errors, warnings }

  const players = (side: TeamSide): Player[] =>
    roster[side].map((entry) => ({
      id: playerId(side, entry.faction),
      faction: entry.faction,
      disposition: entry.disposition,
    }))

  return {
    config: {
      round,
      teamA: { name: names.A || 'Team A', players: players('A') },
      teamB: { name: names.B || 'Team B', players: players('B') },
      estimateSide: ESTIMATE_SIDE,
      estimates,
    },
    errors,
    warnings,
  }
}

function parsePlayer(value: string, line: number, errors: string[]): RosterEntry | null {
  const parts = value.split(PLAYER_SEPARATORS).filter((p) => p.length > 0)
  if (parts.length === 0) {
    errors.push(`Line ${line}: no army named.`)
    return null
  }
  if (parts.length > 2) {
    errors.push(`Line ${line}: expected "<army>" or "<army> · <Force Disposition>".`)
    return null
  }
  const faction = FACTION_BY_TOKEN.get(norm(parts[0]!))
  if (!faction) {
    errors.push(`Line ${line}: "${parts[0]}" isn't an army in the roster.`)
    return null
  }
  if (parts.length === 1) return { faction, disposition: null, line }

  const disposition = DISPOSITION_BY_TOKEN.get(norm(parts[1]!))
  if (!disposition) {
    errors.push(`Line ${line}: "${parts[1]}" isn't a Force Disposition.`)
    return null
  }
  return { faction, disposition, line }
}

function parseEstimate(value: string, line: number, errors: string[]): EstEntry | null {
  const [matchup, result = ''] = value.split('=')
  const sides = matchup!.split(/\s+vs\.?\s+/i)
  if (sides.length !== 2) {
    errors.push(`Line ${line}: expected "<our army> vs <their army> = <good> <bad>".`)
    return null
  }
  const ourFaction = FACTION_BY_TOKEN.get(norm(sides[0]!))
  const oppFaction = FACTION_BY_TOKEN.get(norm(sides[1]!))
  if (!ourFaction || !oppFaction) {
    errors.push(`Line ${line}: "${(ourFaction ? sides[1] : sides[0])!.trim()}" isn't an army.`)
    return null
  }

  const cell: EstimateCell = { good: null, bad: null }
  const layouts: Partial<Record<LayoutLetter, LayoutStance>> = {}
  let gradesSeen = 0

  for (const token of result.trim().split(/\s+/).filter(Boolean)) {
    const flag = /^([+-])([abc]+)$/i.exec(token)
    if (flag) {
      const stance: LayoutStance = flag[1] === '+' ? 'favour' : 'avoid'
      for (const letter of flag[2]!.toUpperCase()) layouts[letter as LayoutLetter] = stance
      continue
    }
    if (gradesSeen >= 2) {
      errors.push(`Line ${line}: unexpected "${token}" after the two grades.`)
      return null
    }
    if (token !== '?') {
      const grade = GRADE_BY_TOKEN.get(token.toUpperCase())
      if (!grade) {
        errors.push(
          `Line ${line}: "${token}" isn't a grade (${estimateGrades.map((g) => g.key).join(' ')}, or ? for none).`,
        )
        return null
      }
      cell[gradesSeen === 0 ? 'good' : 'bad'] = grade
    }
    gradesSeen++
  }

  if (Object.keys(layouts).length > 0) cell.layouts = layouts
  return { ourFaction, oppFaction, cell, line }
}

/** GAME.MD § 1 roster rules, which the wizard enforces by disabling chips. */
function checkRoster(side: TeamSide, entries: RosterEntry[], size: number, errors: string[]) {
  const seen = new Set<string>()
  const marines: string[] = []
  const dispositionCounts = new Map<DispositionKey, number>()
  const cap = dispositionCap(Math.max(size, MIN_TEAM_SIZE))

  for (const entry of entries) {
    if (seen.has(entry.faction)) {
      errors.push(
        `Line ${entry.line}: Team ${side} already fields ${factionName(entry.faction)} — one player per faction.`,
      )
    }
    seen.add(entry.faction)
    if (isSpaceMarine(entry.faction)) marines.push(factionName(entry.faction))
    if (entry.disposition) {
      const n = (dispositionCounts.get(entry.disposition) ?? 0) + 1
      dispositionCounts.set(entry.disposition, n)
      if (n > cap) {
        errors.push(
          `Line ${entry.line}: Team ${side} has more than ${cap} × ${getDisposition(entry.disposition).name} — the cap is one per 5 players.`,
        )
      }
    }
  }

  if (marines.length > 1) {
    errors.push(
      `Team ${side} fields ${marines.join(' and ')} — only one Space Marine Chapter per team.`,
    )
  }
}

function buildEstimates(
  entries: EstEntry[],
  roster: Record<TeamSide, RosterEntry[]>,
  errors: string[],
): EstimateTable {
  const onA = new Set(roster.A.map((p) => p.faction))
  const onB = new Set(roster.B.map((p) => p.faction))
  const table: EstimateTable = {}

  for (const entry of entries) {
    if (!onA.has(entry.ourFaction)) {
      errors.push(
        `Line ${entry.line}: ${factionName(entry.ourFaction)} isn't on Team A — estimates read "<our army> vs <their army>".`,
      )
      continue
    }
    if (!onB.has(entry.oppFaction)) {
      errors.push(`Line ${entry.line}: ${factionName(entry.oppFaction)} isn't on Team B.`)
      continue
    }
    const key = estimateKey(playerId('A', entry.ourFaction), playerId('B', entry.oppFaction))
    if (table[key]) {
      errors.push(
        `Line ${entry.line}: a second estimate for ${factionName(entry.ourFaction)} vs ${factionName(entry.oppFaction)}.`,
      )
      continue
    }
    // An estimate carrying nothing at all is the same as not writing the line.
    if (entry.cell.good || entry.cell.bad || entry.cell.layouts) table[key] = entry.cell
  }

  return table
}

// --- Serialising -------------------------------------------------------------

/** The inverse of `parsePairingConfig` — a setup as pasteable text. */
export function serializePairingConfig(config: PairingConfig): string {
  const lines: string[] = [
    '# Warhammer 40,000 Teams Event — pairing setup',
    `round: ${config.round}`,
    `team a: ${config.teamA.name}`,
    `team b: ${config.teamB.name}`,
    '',
  ]

  for (const [side, team] of [
    ['a', config.teamA],
    ['b', config.teamB],
  ] as const) {
    for (const player of team.players) {
      const army = factionName(player.faction)
      const disposition = player.disposition ? ` · ${getDisposition(player.disposition).name}` : ''
      lines.push(`${side}: ${army}${disposition}`)
    }
    lines.push('')
  }

  // Estimates are Team A's, keyed `<our id>|<their id>`; walk both rosters so the
  // lines come out in roster order rather than whatever order they were entered.
  const estimates = config.estimates ?? {}
  const estimateLines: string[] = []
  for (const ours of config.teamA.players) {
    for (const theirs of config.teamB.players) {
      const cell = estimates[estimateKey(ours.id, theirs.id)]
      if (!cell) continue
      const flags = LAYOUT_LETTERS.reduce<Record<LayoutStance, string>>(
        (acc, letter) => {
          const stance = cell.layouts?.[letter]
          if (stance) acc[stance] += letter
          return acc
        },
        { favour: '', avoid: '' },
      )
      const trailing = [
        flags.favour && `+${flags.favour}`,
        flags.avoid && `-${flags.avoid}`,
      ].filter(Boolean)
      if (!cell.good && !cell.bad && trailing.length === 0) continue
      const result = [cell.good ?? '?', cell.bad ?? '?', ...trailing].join(' ')
      estimateLines.push(
        `est: ${factionName(ours.faction)} vs ${factionName(theirs.faction)} = ${result}`,
      )
    }
  }

  if (estimateLines.length > 0) {
    lines.push("# Team A's estimates: <good table> <bad table>, then +want / -avoid layouts")
    lines.push(...estimateLines)
  }

  return `${lines.join('\n').trimEnd()}\n`
}

/** A worked four-player setup, offered as a starting point in the paste step. */
export const EXAMPLE_SETUP = `# Warhammer 40,000 Teams Event — pairing setup
round: 2
team a: Les Bastonneurs
team b: Ordo Malleus

a: Aeldari · Take and Hold
a: Necrons · Purge the Foe
a: Orks · Disruption
a: Adepta Sororitas

b: Grey Knights · Reconnaissance
b: Space Marines · Priority Assets
b: Tyranids
b: Death Guard

# Team A's estimates: <good table> <bad table>, then +want / -avoid layouts
est: Aeldari vs Grey Knights = GW D +A -C
est: Aeldari vs Tyranids = W D-
est: Necrons vs Space Marines = D+ L -B
est: Orks vs Death Guard = ? GL +AB
`
