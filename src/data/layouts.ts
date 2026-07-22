// Deployment-map layouts, extracted from the official Warhammer 40,000 Event
// Companion PDF (version 1.1, 22 July 2026), pages 9-53 — one page per layout.
// Each unordered pair of Force Dispositions has three terrain layouts (the PDF
// labels them A / B / C, matching how we surface them). Each page was cropped to
// the battlefield plus its attacker/defender edge markers and saved as
// /images/layouts/<slug>-<n>.webp. The PDF's maps carry their measurements baked
// in, so there is a single set of art — no clean variant.
//
// The layout depends only on the *pair* of dispositions in play (the terrain is
// shared by both players), so it is stored once per unordered pair, keyed by a
// "<a>-vs-<b>" slug whose two halves are in canonical disposition order — hence
// `layoutSlug` derives the stem rather than looking it up, and resolves either
// disposition order to the same one.

import { dispositions, type DispositionKey } from './dispositions'

/** Display letters for the three layouts of a pairing (the PDF labels them A-C). */
export const LAYOUT_LETTERS = ['A', 'B', 'C'] as const
export type LayoutLetter = (typeof LAYOUT_LETTERS)[number]

/** Canonical disposition order, which fixes the two halves of every slug. */
const ORDER: DispositionKey[] = dispositions.map((d) => d.key)

/**
 * Canonical image stem for the layouts shared by two dispositions, in either
 * order, e.g. "take-and-hold-vs-purge-the-foe".
 */
export function layoutSlug(a: DispositionKey, b: DispositionKey): string {
  const [first, second] = [a, b].sort((x, y) => ORDER.indexOf(x) - ORDER.indexOf(y))
  return `${first}-vs-${second}`
}

/** Runtime paths to the three A/B/C layout images for a pairing. */
export function layoutImages(
  a: DispositionKey,
  b: DispositionKey,
): { letter: LayoutLetter; src: string }[] {
  const slug = layoutSlug(a, b)
  return LAYOUT_LETTERS.map((letter, i) => ({
    letter,
    src: `/images/layouts/${slug}-${i + 1}.webp`,
  }))
}
