import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { dispositions, type DispositionKey } from '../dispositions'
import { layoutSlug, layoutImages, LAYOUT_LETTERS } from '../layouts'

const KEYS = dispositions.map((d) => d.key)
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
  it('resolves a unique slug for each of the 15 unordered pairs', () => {
    const slugs = new Set<string>()
    for (const [a, b] of allUnorderedPairs()) {
      const slug = layoutSlug(a, b)
      expect(slug, `${a}/${b}`).toBeTruthy()
      // The pair is unordered: both orders name the same terrain.
      expect(layoutSlug(b, a)).toBe(slug)
      slugs.add(slug)
    }
    expect(slugs.size).toBe(15)
  })

  it('orders the two halves of a slug canonically', () => {
    expect(layoutSlug('purge-the-foe', 'take-and-hold')).toBe('take-and-hold-vs-purge-the-foe')
    expect(layoutSlug('take-and-hold', 'take-and-hold')).toBe('take-and-hold-vs-take-and-hold')
  })

  it('builds A/B/C image paths', () => {
    const imgs = layoutImages('take-and-hold', 'purge-the-foe')
    expect(imgs.map((m) => m.letter)).toEqual([...LAYOUT_LETTERS])
    expect(imgs[0]!.src).toBe('/images/layouts/take-and-hold-vs-purge-the-foe-1.webp')
  })

  it('references only images that exist on disk (all 45 files)', () => {
    const missing: string[] = []
    for (const [a, b] of allUnorderedPairs()) {
      for (const { src } of layoutImages(a, b)) {
        if (!existsSync(join(PUBLIC, src))) missing.push(src)
      }
    }
    expect(missing).toEqual([])
  })
})
