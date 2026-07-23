/**
 * Matchup estimates — the pre-pairing prep work a team does on its own lists.
 *
 * Before a round, a team grades every one of its lists (army + Force
 * Disposition) against every opposing list, twice: once assuming the table
 * suits them and once assuming it doesn't. Each grade is a Battle Point band
 * out of the 20 BP the two players share (GAME.MD § 14), so an estimate is
 * really "how many of the 20 BP do we expect to take home from this table".
 *
 * Which of the two columns applies is decided by the terrain. Alongside the two
 * grades, each matchup records where its three A/B/C layouts sit — the ones we
 * want to play on and the ones we don't — so once a table's layout is known
 * (declared by its Defender, or fixed by the round on a roll-off table) the
 * stance for that letter picks the column. Where the letter is unknown or was
 * never rated we fall back to who declares the layout, on the assumption they
 * declare one they like. See `impliedQuality`.
 *
 * The estimating side is carried as a `TeamSide` here, but the setup wizard only
 * ever fills in Team A's: the tool is run by one team, and Team A is "us".
 *
 * The type-only imports from `./pairing` are erased at build time; there is no
 * runtime cycle between the two modules.
 */

import type { LayoutLetter, Matchup, TeamSide } from './pairing'

/** The seven grades, ordered best → worst — the order of the grade picker. */
export type EstimateGrade = 'GW' | 'W' | 'D+' | 'D' | 'D-' | 'L' | 'GL'

/** Which of a matchup's two estimates applies — a table that suits us, or not. */
export type TableQuality = 'good' | 'bad'

export interface EstimateGradeInfo {
  key: EstimateGrade
  /** Full name for tooltips and the legend. */
  name: string
  /**
   * The BP band this grade covers, inclusive, out of the 20 shared BP. Bands
   * are symmetric: a grade's mirror covers `20 - max` … `20 - min`.
   */
  band: [number, number]
  /** The single working value used when totalling a round. */
  bp: number
}

export const estimateGrades: readonly EstimateGradeInfo[] = [
  { key: 'GW', name: 'Great victory', band: [17, 20], bp: 18 },
  { key: 'W', name: 'Victory', band: [13, 16], bp: 14 },
  { key: 'D+', name: 'Draw, ahead', band: [11, 12], bp: 11 },
  { key: 'D', name: 'Draw', band: [10, 10], bp: 10 },
  { key: 'D-', name: 'Draw, behind', band: [8, 9], bp: 9 },
  { key: 'L', name: 'Loss', band: [4, 7], bp: 6 },
  { key: 'GL', name: 'Great loss', band: [0, 3], bp: 2 },
] as const

const gradeByKey = new Map(estimateGrades.map((g) => [g.key, g]))

export function gradeInfo(grade: EstimateGrade): EstimateGradeInfo {
  const info = gradeByKey.get(grade)
  if (!info) throw new Error(`Unknown estimate grade: ${grade}`)
  return info
}

/** BP the grade is worth for us; the opponent takes the remaining `20 - bp`. */
export function gradeBp(grade: EstimateGrade): number {
  return gradeInfo(grade).bp
}

const GRADE_SLUGS: Readonly<Record<EstimateGrade, string>> = {
  GW: 'gw',
  W: 'w',
  'D+': 'dplus',
  D: 'd',
  'D-': 'dminus',
  L: 'l',
  GL: 'gl',
}

/** CSS-safe form of a grade key, matching the `--color-grade-*` tokens. */
export function gradeSlug(grade: EstimateGrade): string {
  return GRADE_SLUGS[grade]
}

// --- The estimate table ------------------------------------------------------

/**
 * Where a matchup's three terrain layouts sit for us. A letter we never rate is
 * neutral — it simply isn't listed.
 */
export type LayoutStance = 'favour' | 'avoid'

export interface EstimateCell {
  /** Expected result on a table that suits us. */
  good: EstimateGrade | null
  /** Expected result on a table that doesn't. */
  bad: EstimateGrade | null
  /**
   * Which of this matchup's A/B/C layouts we want and which we don't. Once the
   * table's layout is known this is what decides which grade above applies —
   * see `impliedQuality`.
   */
  layouts?: Partial<Record<LayoutLetter, LayoutStance>>
}

/** Keyed `<our player id>|<opposing player id>`. */
export type EstimateTable = Record<string, EstimateCell>

const EMPTY_CELL: EstimateCell = { good: null, bad: null }

export function estimateKey(ourId: string, oppId: string): string {
  return `${ourId}|${oppId}`
}

export function readEstimate(
  table: EstimateTable | undefined,
  ourId: string,
  oppId: string,
): EstimateCell {
  return table?.[estimateKey(ourId, oppId)] ?? EMPTY_CELL
}

/** True once a cell holds nothing at all, so it can be dropped from the table. */
function cellIsEmpty(cell: EstimateCell): boolean {
  return !cell.good && !cell.bad && Object.keys(cell.layouts ?? {}).length === 0
}

function putCell(table: EstimateTable, key: string, cell: EstimateCell): EstimateTable {
  if (cellIsEmpty(cell)) {
    const { [key]: _dropped, ...rest } = table
    return rest
  }
  return { ...table, [key]: cell }
}

/** Immutable write of one grade — returns a fresh table. */
export function writeEstimate(
  table: EstimateTable,
  ourId: string,
  oppId: string,
  quality: TableQuality,
  grade: EstimateGrade | null,
): EstimateTable {
  const key = estimateKey(ourId, oppId)
  return putCell(table, key, { ...(table[key] ?? EMPTY_CELL), [quality]: grade })
}

/** Immutable write of one layout letter's stance; `null` clears it to neutral. */
export function writeLayoutStance(
  table: EstimateTable,
  ourId: string,
  oppId: string,
  letter: LayoutLetter,
  stance: LayoutStance | null,
): EstimateTable {
  const key = estimateKey(ourId, oppId)
  const current = table[key] ?? EMPTY_CELL
  const layouts = { ...current.layouts }
  if (stance) layouts[letter] = stance
  else delete layouts[letter]
  const next: EstimateCell = { ...current, layouts }
  if (Object.keys(layouts).length === 0) delete next.layouts
  return putCell(table, key, next)
}

/** Neutral → favour → avoid → neutral, the order the grid's letter buttons cycle. */
export function cycleLayoutStance(current: LayoutStance | undefined): LayoutStance | null {
  return current === undefined ? 'favour' : current === 'favour' ? 'avoid' : null
}

/** How many individual grades (not cells) the table holds. */
export function estimateCount(table: EstimateTable | undefined): number {
  if (!table) return 0
  return Object.values(table).reduce((n, c) => n + (c.good ? 1 : 0) + (c.bad ? 1 : 0), 0)
}

/** How many layout letters across the table carry a stance. */
export function layoutStanceCount(table: EstimateTable | undefined): number {
  if (!table) return 0
  return Object.values(table).reduce((n, c) => n + Object.keys(c.layouts ?? {}).length, 0)
}

// --- Projecting a round ------------------------------------------------------

/**
 * BP a team's total must exceed the opponent's by to win the round rather than
 * draw it (GAME.MD § 14). Keyed by team size.
 */
const WIN_THRESHOLD: Readonly<Record<number, number>> = { 3: 4, 4: 6, 5: 6, 6: 8, 7: 10, 8: 12 }

export function bpWinThreshold(teamSize: number): number {
  const t = WIN_THRESHOLD[teamSize]
  if (t === undefined) throw new Error(`No BP win threshold for team size ${teamSize}`)
  return t
}

export type RoundVerdict = 'win' | 'draw' | 'loss'

/** Team Points awarded for each verdict (GAME.MD § 14). */
export function verdictTeamPoints(verdict: RoundVerdict): number {
  return verdict === 'win' ? 3 : verdict === 'draw' ? 2 : 1
}

/**
 * Where a table's quality came from, best evidence first:
 *  - `override`  the user picked the column by hand;
 *  - `layout`    the table's layout letter is known and we rated it in setup;
 *  - `defender`  nobody rated the letter, but one side declares it, and that
 *                side gets the table it wants;
 *  - `default`   neither applies (a roll-off on an unrated letter) — assumed good.
 */
export type QualitySource = 'override' | 'layout' | 'defender' | 'default'

export interface ProjectedTable {
  matchup: Matchup
  ourPlayerId: string
  oppPlayerId: string
  /** The quality the match-up implies on its own, before any override. */
  implied: TableQuality | null
  /** The quality actually used. */
  quality: TableQuality
  source: QualitySource
  /** The layout letter in play, once it is known. */
  letter: LayoutLetter | null
  grade: EstimateGrade | null
  /** Our BP from this table, or null if the estimate is blank. */
  bp: number | null
}

export interface RoundProjection {
  tables: ProjectedTable[]
  /** Tables that carry a grade; the totals below only count these. */
  scored: number
  ourBp: number
  oppBp: number
  margin: number
  threshold: number
  verdict: RoundVerdict
  teamPoints: number
  /** BP still to find for the next-better verdict, or null if already at best. */
  bpToWin: number | null
  bpToDraw: number | null
}

/**
 * Which estimate column a match-up reads from, and why.
 *
 * The layout stances recorded in setup are the real answer, so they win: once
 * the table's letter is known (declared by its Defender, or fixed by the round
 * on a roll-off table) a letter we marked `favour` makes it a good table and one
 * we marked `avoid` a bad one — regardless of who picked it. Only when the
 * letter is unknown or unrated do we fall back to the Defender role, on the
 * assumption that whoever declares the layout declares one they like.
 */
export function impliedQuality(
  matchup: Matchup,
  ourSide: TeamSide,
  table?: EstimateTable,
): { quality: TableQuality | null; source: Exclude<QualitySource, 'override' | 'default'> | null } {
  const letter = matchup.layout.value
  if (letter) {
    const ourPlayerId = ourSide === 'A' ? matchup.playerA.id : matchup.playerB.id
    const oppPlayerId = ourSide === 'A' ? matchup.playerB.id : matchup.playerA.id
    const stance = readEstimate(table, ourPlayerId, oppPlayerId).layouts?.[letter]
    if (stance) return { quality: stance === 'favour' ? 'good' : 'bad', source: 'layout' }
  }
  if (matchup.defenderSide) {
    return { quality: matchup.defenderSide === ourSide ? 'good' : 'bad', source: 'defender' }
  }
  return { quality: null, source: null }
}

/**
 * Project the round's Battle Points from the estimates recorded for the
 * match-ups decided so far. `overrides` flips individual tables to the other
 * column (keyed by match-up id) — needed for the roll-off tables, where the
 * pairing implies nothing.
 */
export function projectRound(
  matchups: readonly Matchup[],
  ourSide: TeamSide,
  table: EstimateTable | undefined,
  overrides: Readonly<Record<string, TableQuality>> = {},
  teamSize: number = matchups.length,
): RoundProjection {
  const tables: ProjectedTable[] = matchups.map((m) => {
    const ourPlayerId = ourSide === 'A' ? m.playerA.id : m.playerB.id
    const oppPlayerId = ourSide === 'A' ? m.playerB.id : m.playerA.id
    const implied = impliedQuality(m, ourSide, table)
    const override = overrides[m.id]
    const quality = override ?? implied.quality ?? 'good'
    const source: QualitySource = override ? 'override' : (implied.source ?? 'default')
    const grade = readEstimate(table, ourPlayerId, oppPlayerId)[quality]
    return {
      matchup: m,
      ourPlayerId,
      oppPlayerId,
      implied: implied.quality,
      quality,
      source,
      letter: m.layout.value,
      grade,
      bp: grade ? gradeBp(grade) : null,
    }
  })

  const graded = tables.filter((t) => t.bp !== null)
  const ourBp = graded.reduce((sum, t) => sum + t.bp!, 0)
  const oppBp = graded.length * 20 - ourBp
  const margin = ourBp - oppBp
  const threshold = bpWinThreshold(teamSize)
  const verdict: RoundVerdict = margin >= threshold ? 'win' : margin <= -threshold ? 'loss' : 'draw'

  // Each BP moved from them to us swings the margin by two, so the shortfall in
  // our own BP is half the shortfall in the margin (rounded up to whole BP).
  const shortfall = (target: number) => (margin >= target ? null : Math.ceil((target - margin) / 2))

  return {
    tables,
    scored: graded.length,
    ourBp,
    oppBp,
    margin,
    threshold,
    verdict,
    teamPoints: verdictTeamPoints(verdict),
    bpToWin: shortfall(threshold),
    bpToDraw: shortfall(-threshold + 1),
  }
}
