// Force Disposition data, transcribed from the cards at
// https://gdmissions.app/11th/force-disposition/<key>. The source app renders
// each disposition as a single full-bleed card image (downloaded to
// /images/dispositions/<key>.png); the only structured content on a card is the
// opponent → Primary-Mission table captured in `matchups` below, read off the
// card art. Accent colours were sampled from that art and live as
// `--color-disposition-<key>` tokens in base.css. Taglines/descriptions are
// editorial summaries of each stance (the cards carry no flavour text).
//
// A Force Disposition is chosen by each player after mustering (see GAME.MD § 1).
// At the table you find your opponent's Disposition symbol on your own card; the
// Primary Mission listed beside it is the mission you play.

export type DispositionKey =
  | 'take-and-hold'
  | 'purge-the-foe'
  | 'disruption'
  | 'reconnaissance'
  | 'priority-assets'

/** The five symbols, one per disposition (see DispositionIcon.vue). */
export type DispositionSymbol = 'keep' | 'sword' | 'bomb' | 'eye' | 'arrow'

/** One row of a card: the Primary Mission you play against a given opponent. */
export interface DispositionMatchup {
  /** The opponent's Force Disposition. */
  opponent: DispositionKey
  /** The Primary Mission you play when facing that opponent. */
  mission: string
}

export interface Disposition {
  /** Slug = card-image basename, e.g. "take-and-hold". */
  key: DispositionKey
  name: string
  symbol: DispositionSymbol
  /** One-line summary of the stance. */
  tagline: string
  /** What this disposition's Primary Missions reward. */
  description: string
  /** Opponent → your Primary Mission, in canonical disposition order. */
  matchups: DispositionMatchup[]
}

export const dispositions: Disposition[] = [
  {
    key: 'take-and-hold',
    name: 'Take and Hold',
    symbol: 'keep',
    tagline: 'Hold the ground.',
    description:
      "An objective-control stance: your Primary Missions reward seizing the battlefield's key positions and refusing to yield them.",
    matchups: [
      { opponent: 'take-and-hold', mission: 'Battlefield Dominance' },
      { opponent: 'purge-the-foe', mission: 'Immovable Object' },
      { opponent: 'disruption', mission: 'Determined Acquisition' },
      { opponent: 'reconnaissance', mission: 'Purge and Secure' },
      { opponent: 'priority-assets', mission: 'Inescapable Dominion' },
    ],
  },
  {
    key: 'purge-the-foe',
    name: 'Purge the Foe',
    symbol: 'sword',
    tagline: 'Destroy the enemy.',
    description:
      'An attrition stance: your Primary Missions reward hunting down and annihilating the opposing army.',
    matchups: [
      { opponent: 'take-and-hold', mission: 'Unstoppable Force' },
      { opponent: 'purge-the-foe', mission: 'Meatgrinder' },
      { opponent: 'disruption', mission: 'Punishment' },
      { opponent: 'reconnaissance', mission: 'Consecrate' },
      { opponent: 'priority-assets', mission: "Destroyer's Wrath" },
    ],
  },
  {
    key: 'disruption',
    name: 'Disruption',
    symbol: 'bomb',
    tagline: 'Deny and delay.',
    description:
      'A disruptive stance: your Primary Missions reward sabotage, denial and outmanoeuvring the foe rather than a straight fight.',
    matchups: [
      { opponent: 'take-and-hold', mission: 'Death Trap' },
      { opponent: 'purge-the-foe', mission: 'Delaying Action' },
      { opponent: 'disruption', mission: 'Outmanoeuvre' },
      { opponent: 'reconnaissance', mission: 'Smoke and Mirrors' },
      { opponent: 'priority-assets', mission: 'Locate and Deny' },
    ],
  },
  {
    key: 'reconnaissance',
    name: 'Reconnaissance',
    symbol: 'eye',
    tagline: 'Scout and survey.',
    description:
      'A recon stance: your Primary Missions reward gathering intel and dominating sightlines across the battlefield.',
    matchups: [
      { opponent: 'take-and-hold', mission: 'Reconnaissance Sweep' },
      { opponent: 'purge-the-foe', mission: 'Triangulation' },
      { opponent: 'disruption', mission: 'Surveil the Foe' },
      { opponent: 'reconnaissance', mission: 'Gather Intel' },
      { opponent: 'priority-assets', mission: 'Search and Scour' },
    ],
  },
  {
    key: 'priority-assets',
    name: 'Priority Assets',
    symbol: 'arrow',
    tagline: 'Secure the assets.',
    description:
      "An extraction stance: your Primary Missions reward capturing and holding the battlefield's most valuable assets.",
    matchups: [
      { opponent: 'take-and-hold', mission: 'Secure Asset' },
      { opponent: 'purge-the-foe', mission: 'Vital Link' },
      { opponent: 'disruption', mission: 'Extract Relic' },
      { opponent: 'reconnaissance', mission: 'Vanguard Operation' },
      { opponent: 'priority-assets', mission: 'Sabotage' },
    ],
  },
]

/** Look up a disposition by key (all keys are guaranteed present). */
export function getDisposition(key: DispositionKey): Disposition {
  return dispositions.find((d) => d.key === key)!
}

/** Display name for a disposition key. */
export function dispositionName(key: DispositionKey): string {
  return getDisposition(key).name
}
