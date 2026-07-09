// Deployment-map layouts, sourced from https://gdmissions.app/11th/layouts/
// <disposition>/<disposition>. Each unordered pair of Force Dispositions has
// three terrain layouts (the source numbers them 1–3; we surface them as
// A / B / C). The source renders each as a full-bleed PNG, in two variants —
// clean and measurement-annotated — downloaded to
// /images/layouts/<variant>/<slug>-<n>.png.
//
// The layout depends only on the *pair* of dispositions in play (the terrain is
// shared by both players), so it is stored once per unordered pair. The source's
// canonical filename ordering is irregular — most pairs read as "<a>-vs-<b>" but
// some are stored reversed (e.g. `disruption-vs-purge-the-foe`), and the
// take-and-hold mirror is the special `take-and-hold-mirror` — so the exact
// stems are recorded verbatim below rather than derived, and resolved by
// unordered pair via `layoutSlug`.

import type { DispositionKey } from './dispositions'

/** Whether the map is the clean board or the measurement-annotated version. */
export type LayoutVariant = 'no-measurements' | 'with-measurements'

/** Display letters for the three layouts of a pairing (source numbers them 1–3). */
export const LAYOUT_LETTERS = ['A', 'B', 'C'] as const
export type LayoutLetter = (typeof LAYOUT_LETTERS)[number]

/** The three terrain layouts shared by an unordered pair of Force Dispositions. */
export interface LayoutSet {
  /** The unordered disposition pair these maps belong to. */
  pair: [DispositionKey, DispositionKey]
  /** Canonical image-basename stem, e.g. "take-and-hold-vs-purge-the-foe". */
  slug: string
}

export const layoutSets: LayoutSet[] = [
  { pair: ['take-and-hold', 'take-and-hold'], slug: 'take-and-hold-mirror' },
  { pair: ['take-and-hold', 'purge-the-foe'], slug: 'take-and-hold-vs-purge-the-foe' },
  { pair: ['take-and-hold', 'disruption'], slug: 'take-and-hold-vs-disruption' },
  { pair: ['take-and-hold', 'reconnaissance'], slug: 'take-and-hold-vs-reconnaissance' },
  { pair: ['take-and-hold', 'priority-assets'], slug: 'take-and-hold-vs-priority-assets' },
  { pair: ['purge-the-foe', 'purge-the-foe'], slug: 'purge-the-foe-vs-purge-the-foe' },
  { pair: ['purge-the-foe', 'disruption'], slug: 'disruption-vs-purge-the-foe' },
  { pair: ['purge-the-foe', 'reconnaissance'], slug: 'purge-the-foe-vs-reconnaissance' },
  { pair: ['purge-the-foe', 'priority-assets'], slug: 'purge-the-foe-vs-priority-assets' },
  { pair: ['disruption', 'disruption'], slug: 'disruption-vs-disruption' },
  { pair: ['disruption', 'reconnaissance'], slug: 'disruption-vs-reconnaissance' },
  { pair: ['disruption', 'priority-assets'], slug: 'disruption-vs-priority-assets' },
  { pair: ['reconnaissance', 'reconnaissance'], slug: 'reconnaissance-vs-reconnaissance' },
  { pair: ['reconnaissance', 'priority-assets'], slug: 'priority-assets-vs-reconnaissance' },
  { pair: ['priority-assets', 'priority-assets'], slug: 'priority-assets-vs-priority-assets' },
]

/** Order-independent key for an unordered disposition pair. */
function pairKey(a: DispositionKey, b: DispositionKey): string {
  return [a, b].sort().join('|')
}

const setsByPair = new Map(layoutSets.map((s) => [pairKey(...s.pair), s]))

/**
 * Canonical image stem for the layouts shared by two dispositions, in either
 * order. Every unordered pair is present, so this always resolves.
 */
export function layoutSlug(a: DispositionKey, b: DispositionKey): string {
  return setsByPair.get(pairKey(a, b))!.slug
}

/** Runtime paths to the three A/B/C layout images for a pairing and variant. */
export function layoutImages(
  a: DispositionKey,
  b: DispositionKey,
  variant: LayoutVariant,
): { letter: LayoutLetter; src: string }[] {
  const slug = layoutSlug(a, b)
  return LAYOUT_LETTERS.map((letter, i) => ({
    letter,
    src: `/images/layouts/${variant}/${slug}-${i + 1}.png`,
  }))
}
