#!/usr/bin/env node
// Re-sync src/data/detachments.ts with the Munitorum Field Manual.
//
//   node scripts/sync-mfm.mjs           # report the diff only
//   node scripts/sync-mfm.mjs --write   # also rewrite detachments.ts
//
// Fetches https://mfm.warhammer-community.com/en/<faction-slug> for every faction
// already in detachments.ts and parses the server-rendered markup (everything
// before the first `self.__next_f` script; the Next.js flight payload lazily
// references half the fields). The MFM flags DP changes with ▲/▼ but Disposition
// changes are silent, so every row is compared.
//
// Existing names keep their hand-written casing (e.g. "Mont’ka"); new
// Detachments get an automatic title case — review those before committing.

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const MFM_BASE = 'https://mfm.warhammer-community.com/en/'
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'
const FILE = fileURLToPath(new URL('../src/data/detachments.ts', import.meta.url))
const SLUG_OVERRIDES = { tau: 'tau-empire' }
const DISPOSITIONS = [
  'take-and-hold',
  'purge-the-foe',
  'disruption',
  'reconnaissance',
  'priority-assets',
]
const SMALL_WORDS = new Set(['of', 'the', 'and', 'in', 'a', 'an', 'to', 'for', 'on', 'by'])

const slugFor = (key) => SLUG_OVERRIDES[key] ?? key.replaceAll('_', '-')
const norm = (s) => s.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim()

function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/\u2011/g, '-')
    .replace(/&#x27;|&#39;/g, '’')
    .replace(/&quot;/g, '"')
    .replace(/<!-- -->/g, '')
    .replace(/<[^>]+>/g, '')
    .trim()
}

function titleCase(s) {
  return s
    .toLowerCase()
    .split(' ')
    .map((w, i) =>
      i > 0 && SMALL_WORDS.has(w) ? w : w.replace(/(^|-)(\p{L})/gu, (m) => m.toUpperCase()),
    )
    .join(' ')
}

function parseFaction(html) {
  const ssr = html.split('self.__next_f')[0]
  const version = ssr.match(/\bv(\d+\.\d+)\b/)?.[1] ?? null
  const cards = ssr.split('print:break-inside-avoid-page').slice(1)
  const rows = []
  for (const card of cards) {
    const name = card.match(/<span class="text-xl (?:break-all|keep-all)[^"]*">([\s\S]*?)<\/span>/)
    const dp = card.match(/<span class="text-sm[^"]*">([\s\S]*?)DP/)
    const disp = card.match(/style="background-color:#[0-9A-Fa-f]{6}">([^<]+)<\/div>/)
    if (!name || !dp || !disp) continue
    const disposition = decode(disp[1]).toLowerCase().replace(/\s+/g, '-')
    if (!DISPOSITIONS.includes(disposition)) throw new Error(`Unknown disposition "${disp[1]}"`)
    rows.push({
      name: decode(name[1]),
      dp: Number(decode(dp[1]).replace(/[^\d]/g, '')),
      disposition,
    })
  }
  return { version, rows }
}

function parseCurrent(src) {
  const block = src.match(/export const detachmentsByFaction[^{]*\{([\s\S]*?)\n\}\n/)[1]
  const out = {}
  let key
  for (const line of block.split('\n')) {
    const k = line.match(/^ {2}(\w+): \[/)
    if (k) out[(key = k[1])] = []
    const r = line.match(/name: '((?:[^'\\]|\\.)*)', dp: (\d+), disposition: '([\w-]+)'/)
    if (r) out[key].push({ name: r[1].replace(/\\'/g, "'"), dp: Number(r[2]), disposition: r[3] })
  }
  return out
}

function render(data) {
  const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  const body = Object.entries(data)
    .map(
      ([key, rows]) =>
        `  ${key}: [\n` +
        rows
          .map(
            (r) =>
              `    { name: '${esc(r.name)}', dp: ${r.dp}, disposition: '${r.disposition}' },\n`,
          )
          .join('') +
        '  ],\n',
    )
    .join('')
  return `{\n${body}}\n`
}

const src = await readFile(FILE, 'utf8')
const current = parseCurrent(src)
const next = {}
const versions = new Set()
const changes = []

for (const key of Object.keys(current)) {
  const url = MFM_BASE + slugFor(key)
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`)
  const { version, rows } = parseFaction(await res.text())
  if (rows.length === 0) throw new Error(`${url}: no Detachment cards found — markup changed?`)
  if (version) versions.add(version)

  const old = new Map(current[key].map((r) => [norm(r.name), r]))
  const seen = new Set()
  next[key] = rows
    .map((r) => {
      const prev = old.get(norm(r.name))
      seen.add(norm(r.name))
      const name = prev?.name ?? titleCase(r.name)
      if (!prev) changes.push(`${key}: + ${name} (${r.dp}DP, ${r.disposition})  ← check casing`)
      else {
        if (prev.dp !== r.dp) changes.push(`${key}: ${name} DP ${prev.dp} → ${r.dp}`)
        if (prev.disposition !== r.disposition)
          changes.push(`${key}: ${name} ${prev.disposition} → ${r.disposition}`)
      }
      return { ...r, name }
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'en'))
  for (const r of current[key]) if (!seen.has(norm(r.name))) changes.push(`${key}: - ${r.name}`)
}

console.log(`MFM version(s): ${[...versions].join(', ') || 'unknown'}`)
console.log(changes.length ? changes.join('\n') : 'No changes.')

if (process.argv.includes('--write')) {
  let out = src.replace(
    /(export const detachmentsByFaction[^{]*)\{[\s\S]*?\n\}\n/,
    (_, head) => head + render(next),
  )
  if (versions.size === 1) out = out.replace(/(version: ')v[\d.]+(')/, `$1v${[...versions][0]}$2`)
  await writeFile(FILE, out)
  console.log(`Wrote ${FILE}`)
}
