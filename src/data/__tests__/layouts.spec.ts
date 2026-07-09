import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { dispositions, type DispositionKey } from '../dispositions'
import {
  layoutSets,
  layoutSlug,
  layoutImages,
  LAYOUT_LETTERS,
  type LayoutVariant,
} from '../layouts'

const KEYS = dispositions.map((d) => d.key)
const VARIANTS: LayoutVariant[] = ['no-measurements', 'with-measurements']
const PUBLIC = join(process.cwd(), 'public')

/** Every unordered pair of dispositions (5 same + 10 distinct = 15). */
function allUnorderedPairs(): [DispositionKey, DispositionKey][] {
  const pairs: [DispositionKey, DispositionKey][] = []
  for (let i = 0; i < KEYS.length; i++) {
    for (let j = i; j < KEYS.length; j++) pairs.push([KEYS[i]!, KEYS[j]!])
  }
  return pairs
}

describe('layout data', () => {
  it('has one set with a unique slug for each of the 15 unordered pairs', () => {
    expect(layoutSets).toHaveLength(15)
    expect(new Set(layoutSets.map((s) => s.slug)).size).toBe(15)
    // Every unordered pair resolves to a slug, in both orders, identically.
    for (const [a, b] of allUnorderedPairs()) {
      const slug = layoutSlug(a, b)
      expect(slug, `${a}/${b}`).toBeTruthy()
      expect(layoutSlug(b, a)).toBe(slug)
    }
  })

  it('builds A/B/C image paths for a variant', () => {
    const imgs = layoutImages('take-and-hold', 'purge-the-foe', 'no-measurements')
    expect(imgs.map((m) => m.letter)).toEqual([...LAYOUT_LETTERS])
    expect(imgs[0]!.src).toBe(
      '/images/layouts/no-measurements/take-and-hold-vs-purge-the-foe-1.png',
    )
  })

  it('references only images that exist on disk (all 90 files)', () => {
    const missing: string[] = []
    for (const [a, b] of allUnorderedPairs()) {
      for (const variant of VARIANTS) {
        for (const { src } of layoutImages(a, b, variant)) {
          if (!existsSync(join(PUBLIC, src))) missing.push(src)
        }
      }
    }
    expect(missing).toEqual([])
  })
})
