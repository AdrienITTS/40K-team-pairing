// Primary Mission data, sourced from https://gdmissions.app/11th/primary-missions/
// <you>/<slug>. As with the Force Disposition cards, each mission is rendered by
// the source app as a single full-bleed card PNG (downloaded to
// /images/primaries/<slug>.png from /assets/11th/primary-missions/<you>/<slug>.png).
// The card's scoring rules live on the image; here we model only what's needed to
// organise and label them.
//
// Which mission you play is fixed by the pairing of Force Dispositions (GAME.MD § 2):
// the mission you play is the one listed under your OPPONENT's Disposition symbol on
// your own card. So every mission is identified by two dispositions — the one YOU
// play (the card's full-colour header symbol) and the one you FACE (its bordered
// footer symbol). Both, and the mission names, come straight from `dispositions.ts`;
// this module only attaches the verified image slug to each pairing.

import { dispositions, type DispositionKey } from './dispositions'
import { primaryContent } from './primaries.content'

/** Card-image basename for each mission, keyed by "<you>/<faced>". */
const SLUG: Record<string, string> = {
  'take-and-hold/take-and-hold': 'battlefield-dominance',
  'take-and-hold/purge-the-foe': 'immovable-object',
  'take-and-hold/disruption': 'determined-acquisition',
  'take-and-hold/reconnaissance': 'purge-and-secure',
  'take-and-hold/priority-assets': 'inescapable-dominion',
  'purge-the-foe/take-and-hold': 'unstoppable-force',
  'purge-the-foe/purge-the-foe': 'meatgrinder',
  'purge-the-foe/disruption': 'punishment',
  'purge-the-foe/reconnaissance': 'consecrate',
  'purge-the-foe/priority-assets': 'destroyers-wrath',
  'disruption/take-and-hold': 'death-trap',
  'disruption/purge-the-foe': 'delaying-action',
  'disruption/disruption': 'outmanoeuvre',
  'disruption/reconnaissance': 'smoke-and-mirrors',
  'disruption/priority-assets': 'locate-and-deny',
  'reconnaissance/take-and-hold': 'reconnaissance-sweep',
  'reconnaissance/purge-the-foe': 'triangulation',
  'reconnaissance/disruption': 'surveil-the-foe',
  'reconnaissance/reconnaissance': 'gather-intel',
  'reconnaissance/priority-assets': 'search-and-scour',
  'priority-assets/take-and-hold': 'secure-asset',
  'priority-assets/purge-the-foe': 'vital-link',
  'priority-assets/disruption': 'extract-relic',
  'priority-assets/reconnaissance': 'vanguard-operation',
  'priority-assets/priority-assets': 'sabotage',
}

/** One scoring line within a section (from the card's #mission-card-text-panel). */
export interface PrimaryTier {
  /** Condition text as trusted, build-time HTML (bold terms already wrapped). */
  text: string
  vp: number
  /** Renders a "+ CUMULATIVE" divider and a "+N" VP value. */
  cumulative?: boolean
  /** Alternative to the previous tier — renders an "OR" divider. */
  or?: boolean
}

/** A scoring block: a phase (`when`), an optional trigger, and its scoring tiers. */
export interface PrimarySection {
  when: string
  /** The "WHEN" clause; absent on some sections (e.g. END OF BATTLE). */
  trigger?: string
  tiers: PrimaryTier[]
}

/** One labelled row of an action's rules panel (from the card's reverse). */
export interface PrimaryActionRow {
  /** Label, e.g. "Starts", "Units", "Use limit", "Completes", "Effect". */
  k: string
  /** Value text as trusted, build-time HTML (bold terms already wrapped). */
  v: string
}

/** The action printed on the reverse of some Primary cards. */
export interface PrimaryAction {
  /** The action's name (card header on the reverse). */
  title: string
  rows: PrimaryActionRow[]
}

/** The card's textual content (scoring, plus an optional standalone rule box). */
export interface PrimaryContent {
  /** A rule/effect box shown on some cards (HTML). */
  rule?: string
  sections: PrimarySection[]
  /** The action on the card's reverse, shown when it has a back face. */
  action?: PrimaryAction
}

export interface PrimaryMission extends PrimaryContent {
  /** Slug = card-image basename, e.g. "meatgrinder". */
  slug: string
  name: string
  /** The Force Disposition you play (card header, full colour). */
  you: DispositionKey
  /** The Force Disposition you face (card footer, bordered colour). */
  faced: DispositionKey
  /** True when you and your opponent brought the same Disposition (a "mirror"). */
  mirror: boolean
  /** True when the card has a reverse face (an action). */
  hasBack: boolean
}

// Canonical order: by the Disposition you play, then by the one you face — the
// exact ordering the page groups on. Scoring content is merged in from the
// generated `primaries.content` map, keyed by slug.
export const primaryMissions: PrimaryMission[] = dispositions.flatMap((d) =>
  d.matchups.map((m) => {
    const slug = SLUG[`${d.key}/${m.opponent}`]!
    const content = primaryContent[slug]!
    return {
      slug,
      name: m.mission,
      you: d.key,
      faced: m.opponent,
      mirror: d.key === m.opponent,
      rule: content.rule,
      sections: content.sections,
      action: content.action,
      hasBack: content.action !== undefined,
    }
  }),
)

/** The missions grouped by the Disposition you play, in canonical order. */
export function primariesByDisposition() {
  return dispositions.map((disposition) => ({
    disposition,
    missions: primaryMissions.filter((p) => p.you === disposition.key),
  }))
}
