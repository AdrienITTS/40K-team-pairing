// Detachment reference data, transcribed from the official Munitorum Field
// Manual's per-faction pages (https://mfm.warhammer-community.com/en/<faction>).
// Each faction page lists its Detachments with a Detachment Points cost and the
// Force Disposition that Detachment grants — the MFM's own wording is
// "Each detachment grants your army a Force Disposition, which can affect the
// missions you will play."
//
// That link is what makes this list load-bearing for pairing: a player's
// Disposition is not a free choice at the table, it falls out of the Detachment
// they brought (see GAME.MD § 1). A faction whose Detachments only ever grant
// two of the five Dispositions is far more predictable in a blind pairing than
// one that can reach all five.
//
// Names are title-cased from the MFM's all-caps display; DP and Disposition are
// verbatim. Only the 27 Codex factions in `factions.ts` are covered — the MFM
// additionally publishes Imperial Agents and the two Titan Legions lists, which
// this app's roster does not include.

import { dispositions, type DispositionKey } from './dispositions'

export interface Detachment {
  /** Detachment name, e.g. "Hallowed Martyrs". */
  name: string
  /** Detachment Points cost (1–3). Battle size caps how many DP you may spend. */
  dp: number
  /** The Force Disposition this Detachment grants its army. */
  disposition: DispositionKey
}

/** Provenance for the on-page attribution. */
export const mfmSource = {
  name: 'Munitorum Field Manual',
  version: 'v1.6',
  url: 'https://mfm.warhammer-community.com/en/',
} as const

/** MFM page slugs that are not simply the faction key hyphenated. */
const mfmSlugOverrides: Record<string, string> = { tau: 'tau-empire' }

/**
 * A faction's own MFM page, e.g. `adepta_sororitas` →
 * https://mfm.warhammer-community.com/en/adepta-sororitas. `scripts/sync-mfm.mjs`
 * re-syncs this file from those pages; keep its slug overrides in step.
 */
export function mfmFactionUrl(factionKey: string): string {
  return mfmSource.url + (mfmSlugOverrides[factionKey] ?? factionKey.replace(/_/g, '-'))
}

/** Faction key (as in `factions.ts`) → its Detachments, alphabetical by name. */
export const detachmentsByFaction: Record<string, Detachment[]> = {
  adepta_sororitas: [
    { name: 'Army of Faith', dp: 2, disposition: 'take-and-hold' },
    { name: 'Bringers of Flame', dp: 2, disposition: 'priority-assets' },
    { name: 'Champions of Faith', dp: 2, disposition: 'disruption' },
    { name: 'Chorus of Condemnation', dp: 1, disposition: 'reconnaissance' },
    { name: 'Hallowed Martyrs', dp: 3, disposition: 'take-and-hold' },
    { name: 'Penitent Host', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Sacred Champions', dp: 1, disposition: 'take-and-hold' },
    { name: 'Sanctified Orators', dp: 1, disposition: 'disruption' },
  ],
  adeptus_custodes: [
    { name: 'Aquilan Shield', dp: 1, disposition: 'take-and-hold' },
    { name: 'Auric Champions', dp: 1, disposition: 'purge-the-foe' },
    { name: 'Dread Host', dp: 1, disposition: 'purge-the-foe' },
    { name: 'Emissaries Imperatus', dp: 1, disposition: 'priority-assets' },
    { name: 'Emperor’s Chosen', dp: 1, disposition: 'priority-assets' },
    { name: 'Grav-Assault Force', dp: 1, disposition: 'reconnaissance' },
    { name: 'Guardians of the Throne', dp: 3, disposition: 'priority-assets' },
    { name: 'Honoured Companions', dp: 1, disposition: 'take-and-hold' },
    { name: 'Lions of the Emperor', dp: 1, disposition: 'disruption' },
    { name: 'Might of the Moritoi', dp: 1, disposition: 'take-and-hold' },
    { name: 'Null Maiden Vigil', dp: 1, disposition: 'disruption' },
    { name: 'Shadowkeepers', dp: 1, disposition: 'purge-the-foe' },
    { name: 'Solar Watch', dp: 1, disposition: 'reconnaissance' },
  ],
  adeptus_mechanicus: [
    { name: 'Cohort Acquisitus', dp: 1, disposition: 'reconnaissance' },
    { name: 'Cohort Cybernetica', dp: 1, disposition: 'take-and-hold' },
    { name: 'Data-Psalm Conclave', dp: 2, disposition: 'disruption' },
    { name: 'Eradication Cohort', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Explorator Maniple', dp: 2, disposition: 'priority-assets' },
    { name: 'Haloscreed Battle Clade', dp: 3, disposition: 'priority-assets' },
    { name: 'Lords of the Forge', dp: 2, disposition: 'priority-assets' },
    { name: 'Luminen Auto-Choir', dp: 1, disposition: 'disruption' },
    { name: 'Rad-Zone Corps', dp: 2, disposition: 'take-and-hold' },
    { name: 'Skitarii Hunter Cohort', dp: 2, disposition: 'reconnaissance' },
  ],
  aeldari: [
    { name: 'Armoured Warhost', dp: 1, disposition: 'reconnaissance' },
    { name: 'Aspect Host', dp: 3, disposition: 'priority-assets' },
    { name: 'Corsair Coterie', dp: 2, disposition: 'priority-assets' },
    { name: 'Devoted of Ynnead', dp: 2, disposition: 'priority-assets' },
    { name: 'Eldritch Raiders', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Fateful Performance', dp: 1, disposition: 'disruption' },
    { name: 'Ghosts of the Webway', dp: 2, disposition: 'disruption' },
    { name: 'Guardian Battlehost', dp: 2, disposition: 'take-and-hold' },
    { name: 'Path of the Outcast', dp: 1, disposition: 'reconnaissance' },
    { name: 'Seer Council', dp: 2, disposition: 'priority-assets' },
    { name: 'Serpent’s Brood', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Spirit Conclave', dp: 2, disposition: 'take-and-hold' },
    { name: 'Twilight Flickers', dp: 1, disposition: 'take-and-hold' },
    { name: 'Warhost', dp: 2, disposition: 'reconnaissance' },
    { name: 'Windrider Host', dp: 2, disposition: 'disruption' },
  ],
  astra_militarum: [
    { name: 'Abhuman Auxiliaries', dp: 1, disposition: 'take-and-hold' },
    { name: 'Armoured Infantry', dp: 2, disposition: 'take-and-hold' },
    { name: 'Bridgehead Strike', dp: 1, disposition: 'priority-assets' },
    { name: 'Combined Arms', dp: 2, disposition: 'take-and-hold' },
    { name: 'Designation Force', dp: 1, disposition: 'reconnaissance' },
    { name: 'Grizzled Company', dp: 3, disposition: 'priority-assets' },
    { name: 'Hammer of the Emperor', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Mechanised Assault', dp: 2, disposition: 'reconnaissance' },
    { name: 'Recon Element', dp: 2, disposition: 'reconnaissance' },
    { name: 'Siege Regiment', dp: 2, disposition: 'disruption' },
    { name: 'Steel Hammer', dp: 2, disposition: 'purge-the-foe' },
  ],
  black_templars: [
    { name: 'Assault Brethren', dp: 1, disposition: 'take-and-hold' },
    { name: 'Deathwatch Support', dp: 1, disposition: 'disruption' },
    { name: 'Devastator Brethren', dp: 1, disposition: 'purge-the-foe' },
    { name: 'Fist of the God-Emperor', dp: 1, disposition: 'take-and-hold' },
    { name: 'Gauntlet Task Force', dp: 1, disposition: 'reconnaissance' },
    { name: 'Gravis Linebreaker Force', dp: 1, disposition: 'take-and-hold' },
    { name: 'Gravis Siege Force', dp: 1, disposition: 'take-and-hold' },
    { name: 'Ironclad Champions', dp: 1, disposition: 'priority-assets' },
    { name: 'Ironstorm Spearhead', dp: 1, disposition: 'purge-the-foe' },
    { name: 'Marshal’s Household', dp: 1, disposition: 'priority-assets' },
    { name: 'Phobos Shadow Force', dp: 1, disposition: 'disruption' },
    { name: 'Phobos Shock Force', dp: 1, disposition: 'disruption' },
    { name: 'Stormlance Task Force', dp: 1, disposition: 'reconnaissance' },
    { name: 'Tactical Brethren', dp: 1, disposition: 'priority-assets' },
    { name: 'Tacticus Attack Force', dp: 1, disposition: 'take-and-hold' },
    { name: 'Tacticus Firestorm Force', dp: 1, disposition: 'priority-assets' },
    { name: 'Terminator Storm Force', dp: 1, disposition: 'priority-assets' },
    { name: 'Vow-Sworn Crusaders', dp: 2, disposition: 'purge-the-foe' },
  ],
  blood_angels: [
    { name: 'Angelic Inheritors', dp: 3, disposition: 'priority-assets' },
    { name: 'Assault Brethren', dp: 1, disposition: 'take-and-hold' },
    { name: 'Deathwatch Support', dp: 1, disposition: 'disruption' },
    { name: 'Devastator Brethren', dp: 1, disposition: 'purge-the-foe' },
    { name: 'Encarmine Speartip', dp: 1, disposition: 'disruption' },
    { name: 'Gauntlet Task Force', dp: 1, disposition: 'reconnaissance' },
    { name: 'Gladius Task Force', dp: 3, disposition: 'take-and-hold' },
    { name: 'Gravis Linebreaker Force', dp: 1, disposition: 'take-and-hold' },
    { name: 'Gravis Siege Force', dp: 1, disposition: 'take-and-hold' },
    { name: 'Ironclad Champions', dp: 1, disposition: 'priority-assets' },
    { name: 'Ironstorm Spearhead', dp: 1, disposition: 'purge-the-foe' },
    { name: 'Phobos Shadow Force', dp: 1, disposition: 'disruption' },
    { name: 'Phobos Shock Force', dp: 1, disposition: 'disruption' },
    { name: 'Stormlance Task Force', dp: 1, disposition: 'reconnaissance' },
    { name: 'Tactical Brethren', dp: 1, disposition: 'priority-assets' },
    { name: 'Tacticus Attack Force', dp: 1, disposition: 'take-and-hold' },
    { name: 'Tacticus Firestorm Force', dp: 1, disposition: 'priority-assets' },
    { name: 'Terminator Storm Force', dp: 1, disposition: 'priority-assets' },
    { name: 'Wrath of the Doomed', dp: 1, disposition: 'purge-the-foe' },
  ],
  chaos_daemons: [
    { name: 'Blood Legion', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Cavalcade of Chaos', dp: 1, disposition: 'disruption' },
    { name: 'Daemonic Incursion', dp: 3, disposition: 'take-and-hold' },
    { name: 'Legion of Excess', dp: 2, disposition: 'priority-assets' },
    { name: 'Lords of the Warp', dp: 1, disposition: 'take-and-hold' },
    { name: 'Plague Legion', dp: 2, disposition: 'take-and-hold' },
    { name: 'Scintillating Legion', dp: 2, disposition: 'priority-assets' },
    { name: 'Shadow Legion', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Warptide', dp: 1, disposition: 'reconnaissance' },
  ],
  chaos_knights: [
    { name: 'Bastions of Tyranny', dp: 1, disposition: 'priority-assets' },
    { name: 'Helhunt Lance', dp: 2, disposition: 'disruption' },
    { name: 'Houndpack Lance', dp: 2, disposition: 'reconnaissance' },
    { name: 'Hunting Warpack', dp: 1, disposition: 'reconnaissance' },
    { name: 'Iconoclast Fiefdom', dp: 1, disposition: 'take-and-hold' },
    { name: 'Infernal Lance', dp: 3, disposition: 'priority-assets' },
    { name: 'Lords of Dread', dp: 2, disposition: 'take-and-hold' },
    { name: 'Traitoris Lance', dp: 2, disposition: 'purge-the-foe' },
  ],
  chaos_space_marines: [
    { name: 'Cabal of Chaos', dp: 1, disposition: 'disruption' },
    { name: 'Chaos Cult', dp: 2, disposition: 'priority-assets' },
    { name: 'Creations of Bile', dp: 3, disposition: 'take-and-hold' },
    { name: 'Cult of the Arkifane', dp: 2, disposition: 'priority-assets' },
    { name: 'Deceptors', dp: 2, disposition: 'disruption' },
    { name: 'Devotees of Destruction', dp: 1, disposition: 'priority-assets' },
    { name: 'Dread Talons', dp: 2, disposition: 'disruption' },
    { name: 'Fellhammer Siege-Host', dp: 2, disposition: 'take-and-hold' },
    { name: 'Huron’s Marauders', dp: 3, disposition: 'disruption' },
    { name: 'Murdertalon Raiders', dp: 1, disposition: 'reconnaissance' },
    { name: 'Nightmare Hunt', dp: 2, disposition: 'disruption' },
    { name: 'Pactbound Zealots', dp: 3, disposition: 'disruption' },
    { name: 'Renegade Raiders', dp: 3, disposition: 'priority-assets' },
    { name: 'Renegade Warband', dp: 2, disposition: 'priority-assets' },
    { name: 'Soulforged Warpack', dp: 2, disposition: 'take-and-hold' },
    { name: 'Veterans of the Long War', dp: 2, disposition: 'take-and-hold' },
    { name: 'Warpstrike Champions', dp: 2, disposition: 'disruption' },
  ],
  dark_angels: [
    { name: 'Assault Brethren', dp: 1, disposition: 'take-and-hold' },
    { name: 'Darkflight Pursuit', dp: 1, disposition: 'reconnaissance' },
    { name: 'Deathwatch Support', dp: 1, disposition: 'disruption' },
    { name: 'Devastator Brethren', dp: 1, disposition: 'purge-the-foe' },
    { name: 'Gauntlet Task Force', dp: 1, disposition: 'reconnaissance' },
    { name: 'Gladius Task Force', dp: 3, disposition: 'take-and-hold' },
    { name: 'Gravis Linebreaker Force', dp: 1, disposition: 'take-and-hold' },
    { name: 'Gravis Siege Force', dp: 1, disposition: 'take-and-hold' },
    { name: 'Inner Circle Task Force', dp: 1, disposition: 'priority-assets' },
    { name: 'Ironclad Champions', dp: 1, disposition: 'priority-assets' },
    { name: 'Ironstorm Spearhead', dp: 1, disposition: 'purge-the-foe' },
    { name: 'Phobos Shadow Force', dp: 1, disposition: 'disruption' },
    { name: 'Phobos Shock Force', dp: 1, disposition: 'disruption' },
    { name: 'Stormlance Task Force', dp: 1, disposition: 'reconnaissance' },
    { name: 'Tactical Brethren', dp: 1, disposition: 'priority-assets' },
    { name: 'Tacticus Attack Force', dp: 1, disposition: 'take-and-hold' },
    { name: 'Tacticus Firestorm Force', dp: 1, disposition: 'priority-assets' },
    { name: 'Terminator Storm Force', dp: 1, disposition: 'priority-assets' },
    { name: 'Wrath of the Rock', dp: 2, disposition: 'take-and-hold' },
  ],
  death_guard: [
    { name: 'Champions of Contagion', dp: 2, disposition: 'take-and-hold' },
    { name: 'Contagion Engines', dp: 1, disposition: 'reconnaissance' },
    { name: 'Death Lord’s Chosen', dp: 2, disposition: 'priority-assets' },
    { name: 'Flyblown Host', dp: 1, disposition: 'reconnaissance' },
    { name: 'Mortarion’s Hammer', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Paragons of Putrescence', dp: 1, disposition: 'priority-assets' },
    { name: 'Shamblerot Vectorium', dp: 2, disposition: 'disruption' },
    { name: 'Tallyband Summoners', dp: 2, disposition: 'disruption' },
    { name: 'Virulent Vectorium', dp: 3, disposition: 'take-and-hold' },
  ],
  deathwatch: [
    { name: 'Assault Brethren', dp: 1, disposition: 'take-and-hold' },
    { name: 'Black Spear Task Force', dp: 3, disposition: 'priority-assets' },
    { name: 'Devastator Brethren', dp: 1, disposition: 'purge-the-foe' },
    { name: 'Gauntlet Task Force', dp: 1, disposition: 'reconnaissance' },
    { name: 'Gladius Task Force', dp: 3, disposition: 'take-and-hold' },
    { name: 'Gravis Linebreaker Force', dp: 1, disposition: 'take-and-hold' },
    { name: 'Gravis Siege Force', dp: 1, disposition: 'take-and-hold' },
    { name: 'Ironclad Champions', dp: 1, disposition: 'priority-assets' },
    { name: 'Ironstorm Spearhead', dp: 1, disposition: 'purge-the-foe' },
    { name: 'Phobos Shadow Force', dp: 1, disposition: 'disruption' },
    { name: 'Phobos Shock Force', dp: 1, disposition: 'disruption' },
    { name: 'Stormlance Task Force', dp: 1, disposition: 'reconnaissance' },
    { name: 'Tactical Brethren', dp: 1, disposition: 'priority-assets' },
    { name: 'Tacticus Attack Force', dp: 1, disposition: 'take-and-hold' },
    { name: 'Tacticus Firestorm Force', dp: 1, disposition: 'priority-assets' },
    { name: 'Terminator Storm Force', dp: 1, disposition: 'priority-assets' },
  ],
  drukhari: [
    { name: 'Covenite Coterie', dp: 2, disposition: 'take-and-hold' },
    { name: 'Exhibition of Slaughter', dp: 1, disposition: 'reconnaissance' },
    { name: 'Kabalite Agonysts', dp: 1, disposition: 'disruption' },
    { name: 'Kabalite Cartel', dp: 2, disposition: 'disruption' },
    { name: 'Realspace Raiders', dp: 2, disposition: 'priority-assets' },
    { name: 'Reaper’s Wager', dp: 3, disposition: 'priority-assets' },
    { name: 'Skysplinter Assault', dp: 2, disposition: 'reconnaissance' },
    { name: 'Spectacle of Spite', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Tools of Torment', dp: 1, disposition: 'take-and-hold' },
  ],
  emperors_children: [
    { name: 'Carnival of Excess', dp: 3, disposition: 'disruption' },
    { name: 'Coterie of the Conceited', dp: 3, disposition: 'priority-assets' },
    { name: 'Court of the Phoenician', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Elegant Brutes', dp: 1, disposition: 'take-and-hold' },
    { name: 'Frenzied Host', dp: 1, disposition: 'reconnaissance' },
    { name: 'Mercurial Host', dp: 2, disposition: 'reconnaissance' },
    { name: 'Peerless Bladesmen', dp: 2, disposition: 'priority-assets' },
    { name: 'Rapid Evisceration', dp: 2, disposition: 'disruption' },
    { name: 'Slaanesh’s Chosen', dp: 1, disposition: 'purge-the-foe' },
    { name: 'Spectacle of Slaughter', dp: 1, disposition: 'disruption' },
  ],
  genestealer_cults: [
    { name: 'Biosanctic Broodsurge', dp: 2, disposition: 'take-and-hold' },
    { name: 'Brood Brothers Auxilia', dp: 2, disposition: 'take-and-hold' },
    { name: 'Final Day', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Heroes of the Uprising', dp: 1, disposition: 'disruption' },
    { name: 'Host of Ascension', dp: 3, disposition: 'take-and-hold' },
    { name: 'Outlander Claw', dp: 2, disposition: 'reconnaissance' },
    { name: 'Purestrain Broodswarm', dp: 1, disposition: 'priority-assets' },
    { name: 'Xenocreed Congregation', dp: 2, disposition: 'priority-assets' },
    { name: 'Xenocult Masses', dp: 1, disposition: 'reconnaissance' },
  ],
  grey_knights: [
    { name: 'Argent Assault', dp: 1, disposition: 'priority-assets' },
    { name: 'Augurium Task Force', dp: 2, disposition: 'reconnaissance' },
    { name: 'Banishers', dp: 2, disposition: 'disruption' },
    { name: 'Brotherhood Strike', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Fires of Purgation', dp: 1, disposition: 'disruption' },
    { name: 'Hallowed Conclave', dp: 2, disposition: 'take-and-hold' },
    { name: 'Immaterial Interdiction', dp: 1, disposition: 'reconnaissance' },
    { name: 'Sanctic Spearhead', dp: 2, disposition: 'priority-assets' },
    { name: 'Warpbane Task Force', dp: 3, disposition: 'take-and-hold' },
  ],
  imperial_knights: [
    { name: 'Dominus Foebreakers', dp: 1, disposition: 'priority-assets' },
    { name: 'Freeblade Company', dp: 3, disposition: 'priority-assets' },
    { name: 'Gate Warden Lance', dp: 2, disposition: 'take-and-hold' },
    { name: 'Questor Forgepact', dp: 1, disposition: 'disruption' },
    { name: 'Questoris Companions', dp: 3, disposition: 'take-and-hold' },
    { name: 'Spearhead-at-Arms', dp: 2, disposition: 'reconnaissance' },
    { name: 'Throne-Bonded Outriders', dp: 1, disposition: 'reconnaissance' },
    { name: 'Valourstrike Lance', dp: 2, disposition: 'purge-the-foe' },
  ],
  leagues_of_votann: [
    { name: 'Armoured Trailblazers', dp: 1, disposition: 'disruption' },
    { name: 'Brandfast Oathband', dp: 2, disposition: 'take-and-hold' },
    { name: 'Dêlve Assault Shift', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Farseekers', dp: 1, disposition: 'reconnaissance' },
    { name: 'Hearthband', dp: 3, disposition: 'priority-assets' },
    { name: 'Hearthfyre Arsenal', dp: 2, disposition: 'priority-assets' },
    { name: 'Hearthguard Covenant', dp: 1, disposition: 'priority-assets' },
    { name: 'Mercenary Oathband', dp: 2, disposition: 'take-and-hold' },
    { name: 'Needgaârd Oathband', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Persecution Prospect', dp: 2, disposition: 'disruption' },
  ],
  necrons: [
    { name: 'Annihilation Legion', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Awakened Dynasty', dp: 3, disposition: 'take-and-hold' },
    { name: 'Canoptek Court', dp: 2, disposition: 'take-and-hold' },
    { name: 'Cryptek Conclave', dp: 2, disposition: 'priority-assets' },
    { name: 'Cursed Legion', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Hand of the Dynasty', dp: 1, disposition: 'take-and-hold' },
    { name: 'Hypercrypt Legion', dp: 2, disposition: 'reconnaissance' },
    { name: 'Obeisance Phalanx', dp: 2, disposition: 'disruption' },
    { name: 'Pantheon of Woe', dp: 2, disposition: 'disruption' },
    { name: 'Skyshroud Spearhead', dp: 1, disposition: 'reconnaissance' },
    { name: 'Starshatter Arsenal', dp: 3, disposition: 'priority-assets' },
    { name: 'The Phaeron’s Armoury', dp: 1, disposition: 'priority-assets' },
  ],
  orks: [
    { name: 'Blitz Brigade', dp: 1, disposition: 'take-and-hold' },
    { name: 'Brute Bosses', dp: 1, disposition: 'purge-the-foe' },
    { name: 'Bully Boyz', dp: 1, disposition: 'purge-the-foe' },
    { name: 'Da Big Hunt', dp: 1, disposition: 'purge-the-foe' },
    { name: 'Dread Mob', dp: 1, disposition: 'purge-the-foe' },
    { name: 'Flyboyz', dp: 1, disposition: 'reconnaissance' },
    { name: 'Green Tide', dp: 1, disposition: 'take-and-hold' },
    { name: 'Kult of Speed', dp: 1, disposition: 'reconnaissance' },
    { name: 'Madcap Meks', dp: 1, disposition: 'disruption' },
    { name: 'Runt Swarm', dp: 1, disposition: 'priority-assets' },
    { name: 'Shoota Boyz', dp: 1, disposition: 'purge-the-foe' },
    { name: 'Taktikal Brigade', dp: 1, disposition: 'take-and-hold' },
    { name: 'War Horde', dp: 3, disposition: 'take-and-hold' },
    { name: 'Wreckas', dp: 1, disposition: 'priority-assets' },
    { name: 'Wurrband', dp: 1, disposition: 'disruption' },
  ],
  space_marines: [
    { name: 'Assault Brethren', dp: 1, disposition: 'take-and-hold' },
    { name: 'Blade of Ultramar', dp: 3, disposition: 'take-and-hold' },
    { name: 'Ceramite Sentinels', dp: 2, disposition: 'take-and-hold' },
    { name: 'Deathwatch Support', dp: 1, disposition: 'disruption' },
    { name: 'Devastator Brethren', dp: 1, disposition: 'purge-the-foe' },
    { name: 'Forgefather’s Seekers', dp: 2, disposition: 'priority-assets' },
    { name: 'Gauntlet Task Force', dp: 1, disposition: 'reconnaissance' },
    { name: 'Gladius Task Force', dp: 3, disposition: 'take-and-hold' },
    { name: 'Gravis Linebreaker Force', dp: 1, disposition: 'take-and-hold' },
    { name: 'Gravis Siege Force', dp: 1, disposition: 'take-and-hold' },
    { name: 'Ironclad Champions', dp: 1, disposition: 'priority-assets' },
    { name: 'Ironstorm Spearhead', dp: 1, disposition: 'purge-the-foe' },
    { name: 'Medusa’s Wrath', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Phobos Shadow Force', dp: 1, disposition: 'disruption' },
    { name: 'Phobos Shock Force', dp: 1, disposition: 'disruption' },
    { name: 'Shadowmark Talon', dp: 2, disposition: 'disruption' },
    { name: 'Spearpoint Task Force', dp: 2, disposition: 'reconnaissance' },
    { name: 'Stormlance Task Force', dp: 1, disposition: 'reconnaissance' },
    { name: 'Tactical Brethren', dp: 1, disposition: 'priority-assets' },
    { name: 'Tacticus Attack Force', dp: 1, disposition: 'take-and-hold' },
    { name: 'Tacticus Firestorm Force', dp: 1, disposition: 'priority-assets' },
    { name: 'Terminator Storm Force', dp: 1, disposition: 'priority-assets' },
  ],
  space_wolves: [
    { name: 'Assault Brethren', dp: 1, disposition: 'take-and-hold' },
    { name: 'Champions of Fenris', dp: 1, disposition: 'priority-assets' },
    { name: 'Deathwatch Support', dp: 1, disposition: 'disruption' },
    { name: 'Devastator Brethren', dp: 1, disposition: 'purge-the-foe' },
    { name: 'Gauntlet Task Force', dp: 1, disposition: 'reconnaissance' },
    { name: 'Gladius Task Force', dp: 3, disposition: 'take-and-hold' },
    { name: 'Gravis Linebreaker Force', dp: 1, disposition: 'take-and-hold' },
    { name: 'Gravis Siege Force', dp: 1, disposition: 'take-and-hold' },
    { name: 'Ironclad Champions', dp: 1, disposition: 'priority-assets' },
    { name: 'Ironstorm Spearhead', dp: 1, disposition: 'purge-the-foe' },
    { name: 'Phobos Shadow Force', dp: 1, disposition: 'disruption' },
    { name: 'Phobos Shock Force', dp: 1, disposition: 'disruption' },
    { name: 'Saga of the Beastslayer', dp: 1, disposition: 'purge-the-foe' },
    { name: 'Saga of the Great Wolf', dp: 2, disposition: 'take-and-hold' },
    { name: 'Stormlance Task Force', dp: 1, disposition: 'reconnaissance' },
    { name: 'Tactical Brethren', dp: 1, disposition: 'priority-assets' },
    { name: 'Tacticus Attack Force', dp: 1, disposition: 'take-and-hold' },
    { name: 'Tacticus Firestorm Force', dp: 1, disposition: 'priority-assets' },
    { name: 'Terminator Storm Force', dp: 1, disposition: 'priority-assets' },
  ],
  tau: [
    { name: 'Advanced Acquisition Cadre', dp: 1, disposition: 'reconnaissance' },
    { name: 'Auxiliary Cadre', dp: 1, disposition: 'disruption' },
    { name: 'Experimental Prototype Cadre', dp: 1, disposition: 'priority-assets' },
    { name: 'Kauyon', dp: 2, disposition: 'reconnaissance' },
    { name: 'Kroot Hunting Pack', dp: 2, disposition: 'take-and-hold' },
    { name: 'Mont’ka', dp: 3, disposition: 'take-and-hold' },
    { name: 'Retaliation Cadre', dp: 3, disposition: 'purge-the-foe' },
  ],
  thousand_sons: [
    { name: 'Changehost of Deceit', dp: 2, disposition: 'reconnaissance' },
    { name: 'Grand Coven', dp: 3, disposition: 'disruption' },
    { name: 'Hexwarp Thrallband', dp: 3, disposition: 'take-and-hold' },
    { name: 'Ritual of Regeneration', dp: 1, disposition: 'take-and-hold' },
    { name: 'Rubricae Phalanx', dp: 3, disposition: 'take-and-hold' },
    { name: 'Sekhetar Cohort', dp: 1, disposition: 'disruption' },
    { name: 'Servants of Change', dp: 1, disposition: 'reconnaissance' },
    { name: 'Warpforged Cabal', dp: 2, disposition: 'priority-assets' },
    { name: 'Warpmeld Pact', dp: 2, disposition: 'purge-the-foe' },
  ],
  tyranids: [
    { name: 'Ambush Predators', dp: 1, disposition: 'disruption' },
    { name: 'Assimilation Swarm', dp: 2, disposition: 'priority-assets' },
    { name: 'Crusher Stampede', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Invasion Fleet', dp: 3, disposition: 'take-and-hold' },
    { name: 'Subterranean Assault', dp: 3, disposition: 'disruption' },
    { name: 'Synaptic Nexus', dp: 2, disposition: 'disruption' },
    { name: 'Talons of the Norn Queen', dp: 1, disposition: 'take-and-hold' },
    { name: 'Unending Swarm', dp: 2, disposition: 'take-and-hold' },
    { name: 'Vanguard Onslaught', dp: 2, disposition: 'reconnaissance' },
    { name: 'Warrior Bioform Onslaught', dp: 1, disposition: 'take-and-hold' },
  ],
  world_eaters: [
    { name: 'Berzerker Warband', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Brazen Engines', dp: 1, disposition: 'disruption' },
    { name: 'Butchers of Khorne', dp: 1, disposition: 'take-and-hold' },
    { name: 'Cult of Blood', dp: 2, disposition: 'priority-assets' },
    { name: 'Goretrack Onslaught', dp: 2, disposition: 'take-and-hold' },
    { name: 'Khorne Daemonkin', dp: 2, disposition: 'reconnaissance' },
    { name: 'Possessed Slaughterband', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Vessels of Wrath', dp: 1, disposition: 'priority-assets' },
  ],
}

/** A faction's Detachments, or an empty list for an unknown key. */
export function detachmentsFor(factionKey: string): Detachment[] {
  return detachmentsByFaction[factionKey] ?? []
}

/** What one Disposition is worth to one faction. */
export interface DispositionTally {
  disposition: DispositionKey
  /** Detachments granting it. 0 means the army cannot take that stance. */
  count: number
  /** Share of the faction's whole pool, 0–1. Compare against the flat 0.2 baseline. */
  share: number
  /**
   * Cheapest DP into this stance, or `null` when `count` is 0. Battle size caps
   * total DP, so the cheap route is often the only one that fits alongside the
   * rest of a list.
   */
  minDp: number | null
  /** The stance's Detachments, cheapest first. */
  detachments: Detachment[]
}

/**
 * A faction's five Disposition tallies, in canonical Disposition order. Returned
 * as an array rather than a Record so callers can iterate without index checks.
 */
export function dispositionTally(factionKey: string): DispositionTally[] {
  const all = detachmentsFor(factionKey)
  return dispositions.map((d) => {
    const matching = all.filter((x) => x.disposition === d.key).sort((a, b) => a.dp - b.dp)
    return {
      disposition: d.key,
      count: matching.length,
      share: all.length === 0 ? 0 : matching.length / all.length,
      minDp: matching.length ? Math.min(...matching.map((x) => x.dp)) : null,
      detachments: matching,
    }
  })
}

/**
 * A faction's Disposition tallies ordered by how much of its Detachment pool
 * grants each, richest first (ties keep canonical order). The head is what an
 * opponent should expect on a blind drop.
 */
export function dispositionLean(factionKey: string): DispositionTally[] {
  return dispositionTally(factionKey)
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count)
}
