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
  version: 'v1.1',
  url: 'https://mfm.warhammer-community.com/en/',
} as const

/** Faction key (as in `factions.ts`) → its Detachments, alphabetical by name. */
export const detachmentsByFaction: Record<string, Detachment[]> = {
  adepta_sororitas: [
    { name: 'Army of Faith', dp: 2, disposition: 'take-and-hold' },
    { name: 'Bringers of Flame', dp: 2, disposition: 'priority-assets' },
    { name: 'Champions of Faith', dp: 2, disposition: 'disruption' },
    { name: 'Chorus of Condemnation', dp: 1, disposition: 'reconnaissance' },
    { name: 'Hallowed Martyrs', dp: 3, disposition: 'priority-assets' },
    { name: 'Penitent Host', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Sacred Champions', dp: 1, disposition: 'take-and-hold' },
    { name: 'Sanctified Orators', dp: 1, disposition: 'disruption' },
  ],
  adeptus_custodes: [
    { name: 'Auric Champions', dp: 2, disposition: 'priority-assets' },
    { name: 'Lions of the Emperor', dp: 2, disposition: 'disruption' },
    { name: 'Might of the Moritoi', dp: 1, disposition: 'take-and-hold' },
    { name: 'Null Maiden Vigil', dp: 2, disposition: 'reconnaissance' },
    { name: 'Shield Host', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Silent Hunters', dp: 1, disposition: 'reconnaissance' },
    { name: 'Solar Spearhead', dp: 2, disposition: 'take-and-hold' },
    { name: 'Talons of the Emperor', dp: 3, disposition: 'take-and-hold' },
    { name: 'Tharanatoi Hammerblow', dp: 1, disposition: 'priority-assets' },
  ],
  adeptus_mechanicus: [
    { name: 'Cohort Acquisitus', dp: 1, disposition: 'reconnaissance' },
    { name: 'Cohort Cybernetica', dp: 2, disposition: 'take-and-hold' },
    { name: 'Data-Psalm Conclave', dp: 2, disposition: 'disruption' },
    { name: 'Eradication Cohort', dp: 3, disposition: 'purge-the-foe' },
    { name: 'Explorator Maniple', dp: 2, disposition: 'priority-assets' },
    { name: 'Haloscreed Battle Clade', dp: 3, disposition: 'priority-assets' },
    { name: 'Lords of the Forge', dp: 1, disposition: 'priority-assets' },
    { name: 'Luminen Auto-Choir', dp: 1, disposition: 'disruption' },
    { name: 'Rad-Zone Corps', dp: 2, disposition: 'take-and-hold' },
    { name: 'Skitarii Hunter Cohort', dp: 2, disposition: 'reconnaissance' },
  ],
  aeldari: [
    { name: 'Armoured Warhost', dp: 1, disposition: 'reconnaissance' },
    { name: 'Aspect Host', dp: 3, disposition: 'disruption' },
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
    { name: 'Warhost', dp: 3, disposition: 'reconnaissance' },
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
    { name: 'Recon Element', dp: 3, disposition: 'reconnaissance' },
    { name: 'Siege Regiment', dp: 2, disposition: 'disruption' },
    { name: 'Steel Hammer', dp: 2, disposition: 'purge-the-foe' },
  ],
  black_templars: [
    { name: 'Anvil Siege Force', dp: 2, disposition: 'take-and-hold' },
    { name: 'Armoured Speartip', dp: 3, disposition: 'take-and-hold' },
    { name: 'Bastion Task Force', dp: 3, disposition: 'take-and-hold' },
    { name: 'Ceramite Sentinels', dp: 3, disposition: 'take-and-hold' },
    { name: 'Companions of Vehemence', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Firestorm Assault Force', dp: 2, disposition: 'priority-assets' },
    { name: 'Fulguris Task Force', dp: 1, disposition: 'reconnaissance' },
    { name: 'Gladius Task Force', dp: 3, disposition: 'priority-assets' },
    { name: 'Godhammer Assault Force', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Headhunter Task Force', dp: 2, disposition: 'priority-assets' },
    { name: 'Ironstorm Spearhead', dp: 2, disposition: 'take-and-hold' },
    { name: "Marshal's Household", dp: 1, disposition: 'priority-assets' },
    { name: 'Orbital Assault Force', dp: 2, disposition: 'take-and-hold' },
    { name: 'Stormlance Task Force', dp: 2, disposition: 'disruption' },
    { name: 'Subversion Assets', dp: 1, disposition: 'disruption' },
    { name: 'The Living Miracle', dp: 1, disposition: 'disruption' },
    { name: 'Vanguard Spearhead', dp: 2, disposition: 'reconnaissance' },
    { name: 'Vengeful Hosts', dp: 1, disposition: 'take-and-hold' },
    { name: 'Vindication Task Force', dp: 2, disposition: 'priority-assets' },
    { name: 'Wrathful Procession', dp: 1, disposition: 'take-and-hold' },
  ],
  blood_angels: [
    { name: '1st Company Task Force', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Angelic Inheritors', dp: 3, disposition: 'priority-assets' },
    { name: 'Anvil Siege Force', dp: 2, disposition: 'take-and-hold' },
    { name: 'Armoured Speartip', dp: 3, disposition: 'take-and-hold' },
    { name: 'Bastion Task Force', dp: 2, disposition: 'take-and-hold' },
    { name: 'Ceramite Sentinels', dp: 3, disposition: 'take-and-hold' },
    { name: 'Encarmine Speartip', dp: 1, disposition: 'disruption' },
    { name: 'Firestorm Assault Force', dp: 2, disposition: 'priority-assets' },
    { name: 'Fulguris Task Force', dp: 1, disposition: 'reconnaissance' },
    { name: 'Gladius Task Force', dp: 3, disposition: 'priority-assets' },
    { name: 'Headhunter Task Force', dp: 2, disposition: 'priority-assets' },
    { name: 'Ironstorm Spearhead', dp: 2, disposition: 'take-and-hold' },
    { name: 'Legacy of Grace', dp: 1, disposition: 'priority-assets' },
    { name: 'Liberator Assault Group', dp: 3, disposition: 'take-and-hold' },
    { name: 'Librarius Conclave', dp: 1, disposition: 'reconnaissance' },
    { name: 'Orbital Assault Force', dp: 2, disposition: 'take-and-hold' },
    { name: 'Rage-Cursed Onslaught', dp: 3, disposition: 'purge-the-foe' },
    { name: 'Stormlance Task Force', dp: 2, disposition: 'disruption' },
    { name: 'Subversion Assets', dp: 1, disposition: 'disruption' },
    { name: 'The Angelic Host', dp: 2, disposition: 'disruption' },
    { name: 'The Lost Brethren', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Vanguard Spearhead', dp: 2, disposition: 'reconnaissance' },
    { name: 'Vengeful Hosts', dp: 1, disposition: 'take-and-hold' },
    { name: 'Wrath of the Doomed', dp: 1, disposition: 'purge-the-foe' },
  ],
  chaos_daemons: [
    { name: 'Blood Legion', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Cavalcade of Chaos', dp: 1, disposition: 'disruption' },
    { name: 'Daemonic Incursion', dp: 3, disposition: 'disruption' },
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
    { name: 'Creations of Bile', dp: 3, disposition: 'purge-the-foe' },
    { name: 'Cult of the Arkifane', dp: 2, disposition: 'priority-assets' },
    { name: 'Deceptors', dp: 2, disposition: 'disruption' },
    { name: 'Devotees of Destruction', dp: 1, disposition: 'priority-assets' },
    { name: 'Dread Talons', dp: 2, disposition: 'disruption' },
    { name: 'Fellhammer Siege-Host', dp: 2, disposition: 'take-and-hold' },
    { name: 'Huron’s Marauders', dp: 3, disposition: 'disruption' },
    { name: 'Murdertalon Raiders', dp: 1, disposition: 'reconnaissance' },
    { name: 'Nightmare Hunt', dp: 2, disposition: 'disruption' },
    { name: 'Pactbound Zealots', dp: 3, disposition: 'priority-assets' },
    { name: 'Renegade Raiders', dp: 3, disposition: 'reconnaissance' },
    { name: 'Renegade Warband', dp: 2, disposition: 'priority-assets' },
    { name: 'Soulforged Warpack', dp: 2, disposition: 'take-and-hold' },
    { name: 'Veterans of the Long War', dp: 2, disposition: 'take-and-hold' },
    { name: 'Warpstrike Champions', dp: 2, disposition: 'disruption' },
  ],
  dark_angels: [
    { name: '1st Company Task Force', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Anvil Siege Force', dp: 2, disposition: 'take-and-hold' },
    { name: 'Armoured Speartip', dp: 3, disposition: 'take-and-hold' },
    { name: 'Bastion Task Force', dp: 2, disposition: 'take-and-hold' },
    { name: 'Ceramite Sentinels', dp: 3, disposition: 'take-and-hold' },
    { name: 'Company of Hunters', dp: 2, disposition: 'disruption' },
    { name: 'Dark Age Arsenal', dp: 1, disposition: 'priority-assets' },
    { name: 'Darkflight Pursuit', dp: 1, disposition: 'reconnaissance' },
    { name: 'Firestorm Assault Force', dp: 2, disposition: 'priority-assets' },
    { name: 'Fulguris Task Force', dp: 1, disposition: 'reconnaissance' },
    { name: 'Gladius Task Force', dp: 3, disposition: 'priority-assets' },
    { name: 'Headhunter Task Force', dp: 2, disposition: 'priority-assets' },
    { name: 'Inner Circle Task Force', dp: 2, disposition: 'priority-assets' },
    { name: 'Interrogation Conclave', dp: 1, disposition: 'take-and-hold' },
    { name: 'Ironstorm Spearhead', dp: 2, disposition: 'take-and-hold' },
    { name: 'Librarius Conclave', dp: 1, disposition: 'reconnaissance' },
    { name: 'Lion’s Blade Task Force', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Orbital Assault Force', dp: 2, disposition: 'take-and-hold' },
    { name: 'Stormlance Task Force', dp: 3, disposition: 'disruption' },
    { name: 'Subversion Assets', dp: 1, disposition: 'disruption' },
    { name: 'Unforgiven Task Force', dp: 2, disposition: 'take-and-hold' },
    { name: 'Vanguard Spearhead', dp: 2, disposition: 'reconnaissance' },
    { name: 'Vengeful Hosts', dp: 1, disposition: 'take-and-hold' },
    { name: 'Wrath of the Rock', dp: 3, disposition: 'priority-assets' },
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
    { name: '1st Company Task Force', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Anvil Siege Force', dp: 2, disposition: 'take-and-hold' },
    { name: 'Armoured Speartip', dp: 3, disposition: 'take-and-hold' },
    { name: 'Bastion Task Force', dp: 2, disposition: 'take-and-hold' },
    { name: 'Black Spear Task Force', dp: 3, disposition: 'purge-the-foe' },
    { name: 'Ceramite Sentinels', dp: 3, disposition: 'take-and-hold' },
    { name: 'Firestorm Assault Force', dp: 2, disposition: 'priority-assets' },
    { name: 'Fulguris Task Force', dp: 1, disposition: 'reconnaissance' },
    { name: 'Gladius Task Force', dp: 3, disposition: 'priority-assets' },
    { name: 'Headhunter Task Force', dp: 2, disposition: 'priority-assets' },
    { name: 'Ironstorm Spearhead', dp: 2, disposition: 'take-and-hold' },
    { name: 'Librarius Conclave', dp: 1, disposition: 'reconnaissance' },
    { name: 'Orbital Assault Force', dp: 2, disposition: 'take-and-hold' },
    { name: 'Stormlance Task Force', dp: 2, disposition: 'disruption' },
    { name: 'Subversion Assets', dp: 1, disposition: 'disruption' },
    { name: 'Vanguard Spearhead', dp: 2, disposition: 'reconnaissance' },
    { name: 'Vengeful Hosts', dp: 1, disposition: 'take-and-hold' },
  ],
  drukhari: [
    { name: 'Covenite Coterie', dp: 2, disposition: 'take-and-hold' },
    { name: 'Exhibition of Slaughter', dp: 1, disposition: 'reconnaissance' },
    { name: 'Kabalite Agonysts', dp: 1, disposition: 'disruption' },
    { name: 'Kabalite Cartel', dp: 2, disposition: 'disruption' },
    { name: 'Realspace Raiders', dp: 2, disposition: 'priority-assets' },
    { name: 'Reaper’s Wager', dp: 3, disposition: 'purge-the-foe' },
    { name: 'Skysplinter Assault', dp: 2, disposition: 'reconnaissance' },
    { name: 'Spectacle of Spite', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Tools of Torment', dp: 1, disposition: 'take-and-hold' },
  ],
  emperors_children: [
    { name: 'Carnival of Excess', dp: 2, disposition: 'disruption' },
    { name: 'Coterie of the Conceited', dp: 3, disposition: 'priority-assets' },
    { name: 'Court of the Phoenician', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Elegant Brutes', dp: 1, disposition: 'take-and-hold' },
    { name: 'Frenzied Host', dp: 1, disposition: 'reconnaissance' },
    { name: 'Mercurial Host', dp: 2, disposition: 'reconnaissance' },
    { name: 'Peerless Bladesmen', dp: 2, disposition: 'priority-assets' },
    { name: 'Rapid Evisceration', dp: 2, disposition: 'disruption' },
    { name: 'Slaanesh’s Chosen', dp: 2, disposition: 'purge-the-foe' },
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
    { name: 'Canoptek Court', dp: 3, disposition: 'take-and-hold' },
    { name: 'Cryptek Conclave', dp: 2, disposition: 'priority-assets' },
    { name: 'Cursed Legion', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Hand of the Dynasty', dp: 1, disposition: 'take-and-hold' },
    { name: 'Hypercrypt Legion', dp: 2, disposition: 'reconnaissance' },
    { name: 'Obeisance Phalanx', dp: 2, disposition: 'disruption' },
    { name: 'Pantheon of Woe', dp: 2, disposition: 'disruption' },
    { name: 'Skyshroud Spearhead', dp: 1, disposition: 'reconnaissance' },
    { name: 'Starshatter Arsenal', dp: 3, disposition: 'priority-assets' },
    { name: "The Phaeron's Armoury", dp: 1, disposition: 'priority-assets' },
  ],
  orks: [
    { name: 'Blitz Brigade', dp: 2, disposition: 'reconnaissance' },
    { name: 'Bully Boyz', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Da Big Hunt', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Dread Mob', dp: 2, disposition: 'priority-assets' },
    { name: 'Equatorial Hordes', dp: 1, disposition: 'disruption' },
    { name: 'Freebooter Krew', dp: 2, disposition: 'take-and-hold' },
    { name: 'Green Tide', dp: 3, disposition: 'take-and-hold' },
    { name: 'Kult of Speed', dp: 2, disposition: 'disruption' },
    { name: 'More Dakka!', dp: 1, disposition: 'disruption' },
    { name: "Rollin' Deff", dp: 1, disposition: 'priority-assets' },
    { name: 'Speedwaaagh!', dp: 2, disposition: 'reconnaissance' },
    { name: 'Taktikal Brigade', dp: 1, disposition: 'reconnaissance' },
    { name: 'War Horde', dp: 3, disposition: 'take-and-hold' },
  ],
  space_marines: [
    { name: '1st Company Task Force', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Anvil Siege Force', dp: 2, disposition: 'take-and-hold' },
    { name: 'Armoured Speartip', dp: 3, disposition: 'take-and-hold' },
    { name: 'Bastion Task Force', dp: 2, disposition: 'take-and-hold' },
    { name: 'Blade of Ultramar', dp: 3, disposition: 'priority-assets' },
    { name: 'Ceramite Sentinels', dp: 3, disposition: 'take-and-hold' },
    { name: 'Emperor’s Shield', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Firestorm Assault Force', dp: 2, disposition: 'priority-assets' },
    { name: 'Forgefather’s Seekers', dp: 2, disposition: 'priority-assets' },
    { name: 'Fulguris Task Force', dp: 1, disposition: 'reconnaissance' },
    { name: 'Gladius Task Force', dp: 3, disposition: 'priority-assets' },
    { name: 'Hammer of Avernii', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Headhunter Task Force', dp: 2, disposition: 'priority-assets' },
    { name: 'Ironstorm Spearhead', dp: 2, disposition: 'take-and-hold' },
    { name: 'Librarius Conclave', dp: 1, disposition: 'reconnaissance' },
    { name: 'Orbital Assault Force', dp: 2, disposition: 'take-and-hold' },
    { name: 'Reclamation Force', dp: 2, disposition: 'take-and-hold' },
    { name: 'Shadowmark Talon', dp: 2, disposition: 'disruption' },
    { name: 'Spearpoint Task Force', dp: 2, disposition: 'disruption' },
    { name: 'Stormlance Task Force', dp: 3, disposition: 'disruption' },
    { name: 'Subversion Assets', dp: 1, disposition: 'disruption' },
    { name: 'Vanguard Spearhead', dp: 2, disposition: 'reconnaissance' },
    { name: 'Vengeful Hosts', dp: 1, disposition: 'take-and-hold' },
  ],
  space_wolves: [
    { name: '1st Company Task Force', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Anvil Siege Force', dp: 2, disposition: 'take-and-hold' },
    { name: 'Armoured Speartip', dp: 3, disposition: 'take-and-hold' },
    { name: 'Bastion Task Force', dp: 2, disposition: 'take-and-hold' },
    { name: 'Ceramite Sentinels', dp: 3, disposition: 'take-and-hold' },
    { name: 'Champions of Fenris', dp: 1, disposition: 'priority-assets' },
    { name: 'Firestorm Assault Force', dp: 2, disposition: 'priority-assets' },
    { name: 'Fulguris Task Force', dp: 1, disposition: 'reconnaissance' },
    { name: 'Gladius Task Force', dp: 3, disposition: 'priority-assets' },
    { name: 'Headhunter Task Force', dp: 2, disposition: 'priority-assets' },
    { name: 'Ironstorm Spearhead', dp: 2, disposition: 'take-and-hold' },
    { name: 'Legends of Saga and Song', dp: 1, disposition: 'take-and-hold' },
    { name: 'Librarius Conclave', dp: 1, disposition: 'reconnaissance' },
    { name: 'Orbital Assault Force', dp: 2, disposition: 'take-and-hold' },
    { name: 'Saga of the Beastslayer', dp: 2, disposition: 'purge-the-foe' },
    { name: 'Saga of the Bold', dp: 2, disposition: 'priority-assets' },
    { name: 'Saga of the Great Wolf', dp: 2, disposition: 'take-and-hold' },
    { name: 'Saga of the Hunter', dp: 2, disposition: 'disruption' },
    { name: 'Stormlance Task Force', dp: 3, disposition: 'disruption' },
    { name: 'Subversion Assets', dp: 1, disposition: 'disruption' },
    { name: 'Vanguard Spearhead', dp: 2, disposition: 'reconnaissance' },
    { name: 'Vengeful Hosts', dp: 1, disposition: 'take-and-hold' },
    { name: 'Veterans of the Fang', dp: 1, disposition: 'disruption' },
  ],
  tau: [
    { name: 'Advanced Acquisition Cadre', dp: 1, disposition: 'reconnaissance' },
    { name: 'Auxiliary Cadre', dp: 1, disposition: 'disruption' },
    { name: 'Experimental Prototype Cadre', dp: 1, disposition: 'priority-assets' },
    { name: 'Kauyon', dp: 2, disposition: 'reconnaissance' },
    { name: 'Kroot Hunting Pack', dp: 2, disposition: 'take-and-hold' },
    { name: 'Mont’ka', dp: 3, disposition: 'priority-assets' },
    { name: 'Retaliation Cadre', dp: 3, disposition: 'purge-the-foe' },
  ],
  thousand_sons: [
    { name: 'Changehost of Deceit', dp: 2, disposition: 'reconnaissance' },
    { name: 'Grand Coven', dp: 3, disposition: 'priority-assets' },
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
    { name: 'Berzerker Warband', dp: 3, disposition: 'purge-the-foe' },
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
