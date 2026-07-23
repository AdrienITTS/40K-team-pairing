/**
 * The plain-text setup format behind Quick pairing.
 *
 * A whole round's prep — rosters, Force Dispositions, and Team A's matchup
 * estimates — as something a captain can keep in a note, mail to a teammate, or
 * generate out of a spreadsheet, then paste in to land straight on the live
 * pairing board via `parsePairingConfig`.
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
 *
 * `parsePairingConfig` also accepts a second shape: the tab-separated block a
 * captain copies straight out of the team's "W40k - Estimation" Google Sheet
 * (the `Template V11` tab, range A1:O22). Any pasted text containing a tab is
 * routed to `parseSpreadsheetConfig`, which reads the same rosters, grades and
 * layout preferences off that grid — see its own doc comment for the geometry.
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
  // A tab means the text was copied out of a spreadsheet rather than typed as
  // directives — read it as the team's Google Sheet export instead.
  if (text.includes('\t')) return parseSpreadsheetConfig(text)

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

// --- Spreadsheet paste (the team's own Google Sheet) -------------------------

/**
 * The other accepted paste shape: the block a captain copies straight out of the
 * team's "W40k - Estimation" Google Sheet (the `Template V11` tab, range
 * A1:O22). Copying spreadsheet cells yields tab-separated rows, so any text
 * carrying a tab lands here instead of the directive parser above.
 *
 * The sheet stacks two tables sharing one column geometry: a Player / Faction /
 * Disposition key in columns A–C, then one opponent every two columns from D
 * onward. The upper table's two sub-columns per opponent are the good- and
 * bad-table grades; the lower table's are the layouts to favour and to avoid.
 * Opponent armies and Dispositions sit two and one rows above the upper header.
 * Rows and columns are found by their labels, not fixed indices, so an extra
 * blank column or a shifted copy still reads.
 */
export function parseSpreadsheetConfig(text: string): ParsedSetup {
  const errors: string[] = []
  const warnings: string[] = []

  const grid = text.split(/\r?\n/).map((row) => row.split('\t'))
  const width = grid.reduce((w, row) => Math.max(w, row.length), 0)
  const at = (r: number, c: number): string => (grid[r]?.[c] ?? '').trim()
  const rowLen = (r: number): number => grid[r]?.length ?? 0

  // Spreadsheet column letter for an error message (A, B, … from a 0-based idx).
  const colLetter = (c: number): string => (c < 26 ? String.fromCharCode(65 + c) : `col ${c + 1}`)

  // The two "Player | Faction | Disposition" table headers anchor everything.
  const headers: number[] = []
  grid.forEach((_, r) => {
    if (norm(at(r, 0)) === 'player' && norm(at(r, 1)) === 'faction') headers.push(r)
  })
  if (headers.length === 0) {
    errors.push(
      'Couldn’t find the “Player / Faction / Disposition” header — copy the whole Template V11 range (A1:O22) from your sheet.',
    )
    return { config: null, errors, warnings }
  }
  const gradesHeader = headers[0]!
  const layoutsHeader = headers[1]
  const factionsRow = gradesHeader - 2
  const dispRow = gradesHeader - 1
  if (factionsRow < 0) {
    errors.push(
      'The opponents’ armies should sit two rows above the “Player” header — start the copy at row 1.',
    )
    return { config: null, errors, warnings }
  }

  // Team names and round live in the header block above the grades table. The
  // first value to the right of each label is what we want.
  const firstRight = (r: number, from: number): string => {
    for (let k = from; k < rowLen(r); k++) if (at(r, k)) return at(r, k)
    return ''
  }
  let teamName = ''
  let oppName = ''
  let round = 1
  for (let r = 0; r < gradesHeader; r++) {
    for (let c = 0; c < rowLen(r); c++) {
      const label = norm(at(r, c))
      if (!teamName && label === 'team') teamName = firstRight(r, c + 1)
      if (!oppName && (label === 'opponents' || label === 'opponent')) {
        oppName = firstRight(r, c + 1)
      }
      if (label === 'round') {
        for (let k = c + 1; k < rowLen(r); k++) {
          const v = at(r, k)
          if (!v) continue
          const n = Number(v)
          if (Number.isFinite(n) && n >= 1) round = Math.trunc(n)
          break
        }
      }
    }
  }

  // Opponents run two columns apart from D (index 3) for as long as the armies
  // row keeps naming one.
  const oppCols: number[] = []
  for (let c = 3; c < width; c += 2) {
    if (at(factionsRow, c)) oppCols.push(c)
    else break
  }

  const needFaction = (raw: string, row: number): string | null => {
    const f = resolveToken(raw, FACTION_BY_TOKEN)
    if (!f) errors.push(`Row ${row + 1}: “${raw}” isn’t an army we recognise.`)
    return f
  }
  const optDisposition = (raw: string, row: number): DispositionKey | null => {
    if (!norm(raw)) return null
    const d = resolveToken(raw, DISPOSITION_BY_TOKEN)
    if (!d) errors.push(`Row ${row + 1}: “${raw}” isn’t a Force Disposition.`)
    return d
  }

  // Team B (opponents), read across the header columns.
  const rosterB: RosterEntry[] = []
  const oppFactionByCol = new Map<number, string>()
  for (const c of oppCols) {
    const faction = needFaction(at(factionsRow, c), factionsRow)
    const disposition = optDisposition(at(dispRow, c), dispRow)
    if (faction) {
      rosterB.push({ faction, disposition, line: factionsRow + 1 })
      oppFactionByCol.set(c, faction)
    }
  }

  // Team A (us), read down the grades table until the faction column runs out.
  const rosterA: RosterEntry[] = []
  const ourFactionByRow = new Map<number, string>()
  for (let r = gradesHeader + 1; r < grid.length && at(r, 1); r++) {
    const faction = needFaction(at(r, 1), r)
    const disposition = optDisposition(at(r, 2), r)
    if (faction) {
      rosterA.push({ faction, disposition, line: r + 1 })
      ourFactionByRow.set(r, faction)
    }
  }

  if (rosterA.length === 0 && rosterB.length === 0) {
    if (errors.length === 0)
      errors.push('Nothing to read yet — paste your Template V11 range above.')
    return { config: null, errors, warnings }
  }

  const size = rosterA.length
  if (size !== rosterB.length) {
    errors.push(`Both teams must be the same size (you have ${size}, opponents ${rosterB.length}).`)
  }
  if (size < MIN_TEAM_SIZE || size > MAX_TEAM_SIZE) {
    errors.push(`Team size must be ${MIN_TEAM_SIZE}–${MAX_TEAM_SIZE} (you have ${size}).`)
  }
  checkRoster('A', rosterA, size, errors)
  checkRoster('B', rosterB, size, errors)
  for (const [side, roster] of [
    ['A', rosterA],
    ['B', rosterB],
  ] as const) {
    if (roster.length && roster.every((p) => !p.disposition)) {
      warnings.push(
        `Team ${side} has no Force Dispositions, so its tables won't offer terrain layouts.`,
      )
    }
  }

  // One accumulating cell per (our army, their army); grades fill first, then the
  // layout stances from the lower table land on the same cells.
  const cells = new Map<string, EstimateCell>()
  const cellFor = (ourFaction: string, oppFaction: string): EstimateCell => {
    const key = estimateKey(playerId('A', ourFaction), playerId('B', oppFaction))
    let cell = cells.get(key)
    if (!cell) {
      cell = { good: null, bad: null }
      cells.set(key, cell)
    }
    return cell
  }

  const readGrade = (raw: string, row: number, col: number): EstimateGrade | null => {
    const token = raw.trim().toUpperCase()
    if (!token || token === '?') return null
    const grade = GRADE_BY_TOKEN.get(token)
    if (!grade) errors.push(`Row ${row + 1}, ${colLetter(col)}: “${raw}” isn’t a grade.`)
    return grade ?? null
  }

  const readLetters = (raw: string): LayoutLetter[] => {
    const out: LayoutLetter[] = []
    for (const ch of raw.toUpperCase()) {
      if ((ch === 'A' || ch === 'B' || ch === 'C') && !out.includes(ch)) out.push(ch)
    }
    return out
  }

  for (const [row, ourFaction] of ourFactionByRow) {
    for (const c of oppCols) {
      const oppFaction = oppFactionByCol.get(c)
      if (!oppFaction) continue
      const good = readGrade(at(row, c), row, c)
      const bad = readGrade(at(row, c + 1), row, c + 1)
      if (good || bad) {
        const cell = cellFor(ourFaction, oppFaction)
        if (good) cell.good = good
        if (bad) cell.bad = bad
      }
    }
  }

  // The layout table repeats our roster; match its rows back by army so a
  // reordered copy still lines each row up with the right grades.
  const onA = new Set(rosterA.map((p) => p.faction))
  if (layoutsHeader !== undefined) {
    for (let r = layoutsHeader + 1; r < grid.length && at(r, 1); r++) {
      const ourFaction = resolveToken(at(r, 1), FACTION_BY_TOKEN)
      if (!ourFaction || !onA.has(ourFaction)) {
        errors.push(
          `Row ${r + 1}: “${at(r, 1)}” in the layouts table isn’t one of your armies above.`,
        )
        continue
      }
      for (const c of oppCols) {
        const oppFaction = oppFactionByCol.get(c)
        if (!oppFaction) continue
        const favour = readLetters(at(r, c))
        const avoid = readLetters(at(r, c + 1))
        if (favour.length || avoid.length) {
          const cell = cellFor(ourFaction, oppFaction)
          const layouts = cell.layouts ?? {}
          for (const letter of favour) layouts[letter] = 'favour'
          for (const letter of avoid) layouts[letter] = 'avoid'
          cell.layouts = layouts
        }
      }
    }
  }

  const estimates: EstimateTable = {}
  for (const [key, cell] of cells) {
    if (cell.good || cell.bad || (cell.layouts && Object.keys(cell.layouts).length > 0)) {
      estimates[key] = cell
    }
  }
  if (Object.keys(estimates).length === 0) {
    warnings.push('No estimates read, so the estimates rail and the projected result stay off.')
  }

  if (errors.length > 0) return { config: null, errors, warnings }

  const players = (side: TeamSide, roster: RosterEntry[]): Player[] =>
    roster.map((entry) => ({
      id: playerId(side, entry.faction),
      faction: entry.faction,
      disposition: entry.disposition,
    }))

  return {
    config: {
      round,
      teamA: { name: teamName || 'Team A', players: players('A', rosterA) },
      teamB: { name: oppName || 'Team B', players: players('B', rosterB) },
      estimateSide: ESTIMATE_SIDE,
      estimates,
    },
    errors,
    warnings,
  }
}

/**
 * Resolve a free-typed army/Disposition name to its key: an exact normalised
 * match first, then the closest token within a couple of edits so the sheet's
 * plurals and typos ("World Eater", "Imperial Knigths") still land. The fuzzy
 * pass insists on a shared first letter to keep short names from colliding.
 */
function resolveToken<T extends string>(raw: string, byToken: Map<string, T>): T | null {
  const key = norm(raw)
  if (!key) return null
  const exact = byToken.get(key)
  if (exact) return exact

  let best: T | null = null
  let bestDist = 3
  for (const [token, value] of byToken) {
    if (token[0] !== key[0]) continue
    const dist = editDistance(key, token)
    if (dist < bestDist) {
      bestDist = dist
      best = value
    }
  }
  return bestDist <= 2 ? best : null
}

/** Levenshtein distance, short-circuited past the 2 edits we tolerate. */
function editDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (Math.abs(m - n) > 2) return 3
  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    const curr = [i]
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(prev[j]! + 1, curr[j - 1]! + 1, prev[j - 1]! + cost)
    }
    prev = curr
  }
  return prev[n]!
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
