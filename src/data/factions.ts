export interface FactionInfo {
  key: string
  name: string
  allegiance: 'Imperium' | 'Chaos' | 'Xenos'
  lore: string
  /** Tabletop difficulty rating, 1 (forgiving) to 5 (demanding). */
  difficulty: number
  playstyle: string
}

export interface Allegiance {
  id: string
  title: string
  blurb: string
  factions: FactionInfo[]
}

export const allegiances: Allegiance[] = [
  {
    id: 'imperium',
    title: 'Imperium',
    blurb:
      'The armies of Mankind — Space Marines, the Astra Militarum, and the Emperor’s servants.',
    factions: [
      {
        key: 'adepta_sororitas',
        name: 'Adepta Sororitas',
        allegiance: 'Imperium',
        lore: 'Zealous warrior-nuns of the Adepta Sororitas, armed with faith and bolter, who burn heretics and xenos alike in the Emperor’s name.',
        difficulty: 3,
        playstyle:
          'Durable, faith-fuelled infantry that leans on Acts of Faith and miracle dice to swing key moments; rewards committed midfield trades backed by cheap, resilient troops.',
      },
      {
        key: 'adeptus_custodes',
        name: 'Adeptus Custodes',
        allegiance: 'Imperium',
        lore: 'The Emperor’s personal bodyguard, genetically perfected golden warriors who have stood watch over the Golden Throne for ten thousand years.',
        difficulty: 2,
        playstyle:
          'A small elite model count where every model is a genuine threat; plays a straightforward "every model matters" list, favoring durable melee units and forgiving decision trees.',
      },
      {
        key: 'adeptus_mechanicus',
        name: 'Adeptus Mechanicus',
        allegiance: 'Imperium',
        lore: 'The tech-priests of Mars, a cult of the Machine God who wage war with irradiated weapons, arcane rites, and legions of skitarii and cybernetic constructs.',
        difficulty: 4,
        playstyle:
          'Layered buff and debuff stacking rewards careful sequencing turn to turn; strong ranged output but fragile bodies punish any mispositioning.',
      },
      {
        key: 'astra_militarum',
        name: 'Astra Militarum',
        allegiance: 'Imperium',
        lore: 'The Imperial Guard, humanity’s numberless conscript armies who win wars through sheer weight of bodies, artillery, and armor rather than individual skill.',
        difficulty: 3,
        playstyle:
          'A horde-and-artillery army built on cheap blob infantry, orders, and tank spam; rewards board control and screening over unit-by-unit finesse.',
      },
      {
        key: 'black_templars',
        name: 'Black Templars',
        allegiance: 'Imperium',
        lore: 'Zealous Space Marine crusaders sworn to earn the Emperor’s forgiveness through unending war, marching behind Sword Brethren and holy reliquaries.',
        difficulty: 2,
        playstyle:
          'An aggressive, melee-forward Marine list built around cheap, buffed infantry squads charging early; a straightforward, high-tempo game plan.',
      },
      {
        key: 'blood_angels',
        name: 'Blood Angels',
        allegiance: 'Imperium',
        lore: 'Space Marines cursed by the Black Rage and Red Thirst, descendants of Sanguinius who combine noble chivalry with barely-restrained bloodlust in battle.',
        difficulty: 3,
        playstyle:
          'An alpha-strike army leaning on deep strike and jump-pack units to close the distance turn one, aiming to win the fight before the opponent can respond.',
      },
      {
        key: 'dark_angels',
        name: 'Dark Angels',
        allegiance: 'Imperium',
        lore: 'The secretive First Legion, hunting the Fallen across the galaxy while presenting themselves as a noble Chapter, all while guarding a ten-thousand-year-old shame.',
        difficulty: 3,
        playstyle:
          'A gunline-leaning Marine army that stacks shooting buffs onto durable elite squads, favoring patient positioning over rushed engagements.',
      },
      {
        key: 'deathwatch',
        name: 'Deathwatch',
        allegiance: 'Imperium',
        lore: 'The Long Vigil made flesh — Space Marines drawn from every Chapter to hunt xenos threats too dangerous for a single Chapter to face alone.',
        difficulty: 3,
        playstyle:
          'A flexible, kill-team-style elite force with mixed wargear and special-issue ammo, rewarding tailored loadouts and sharp target-priority calls each game.',
      },
      {
        key: 'grey_knights',
        name: 'Grey Knights',
        allegiance: 'Imperium',
        lore: 'The Imperium’s secret daemon hunters, psychic warrior-monks whose existence is denied even as they purge the galaxy of Chaos incursions.',
        difficulty: 3,
        playstyle:
          'An elite, psyker-heavy force leaning on stacked psychic damage and force weapons; a small model count rewards careful target selection each turn.',
      },
      {
        key: 'imperial_knights',
        name: 'Imperial Knights',
        allegiance: 'Imperium',
        lore: 'Feudal noble pilots bound to towering war machines by sacred oath, deploying alone or in Households to crush enemies beneath armored feet.',
        difficulty: 2,
        playstyle:
          'A very low model count of huge, resilient walkers; one of the simplest decision trees in the game, though losing a single Knight is always costly.',
      },
      {
        key: 'space_marines',
        name: 'Space Marines',
        allegiance: 'Imperium',
        lore: 'The Emperor’s finest, genetically-enhanced transhuman warriors organized into a thousand Chapters, each ready to answer the call across the stars.',
        difficulty: 2,
        playstyle:
          'The generalist toolbox faction — flexible, durable multi-wound infantry that can lean shooting or melee depending on Chapter tactics; forgiving for new players.',
      },
      {
        key: 'space_wolves',
        name: 'Space Wolves',
        allegiance: 'Imperium',
        lore: 'Savage and fiercely loyal sons of Leman Russ, who fight as much for honor and glory as for the Emperor, led by their Rune Priests and Wolf Lords.',
        difficulty: 3,
        playstyle:
          'An aggressive melee Marine list built around fast-moving assault units and combined-arms detachment tricks; rewards decisive, well-timed charges.',
      },
    ],
  },
  {
    id: 'chaos',
    title: 'Chaos',
    blurb:
      'The Ruinous Powers and their followers — traitor legions, daemons, and the Dark Gods’ chosen.',
    factions: [
      {
        key: 'chaos_daemons',
        name: 'Chaos Daemons',
        allegiance: 'Chaos',
        lore: 'Manifestations of the Ruinous Powers given physical form on the battlefield, unpredictable and volatile, bound loosely to the Chaos Gods they serve.',
        difficulty: 4,
        playstyle:
          'A fast, deep-striking army with swingy, high-ceiling damage output; rewards aggressive turn-one and turn-two commitment despite the randomness of daemonic rules.',
      },
      {
        key: 'chaos_knights',
        name: 'Chaos Knights',
        allegiance: 'Chaos',
        lore: 'Renegade Knight households who broke their oaths to serve the Dark Gods, piloting corrupted war engines soaked in blood and heresy.',
        difficulty: 2,
        playstyle:
          'Like their loyalist counterparts, a small count of huge resilient models; simple to pilot but punishing to lose one, favoring aggressive board presence.',
      },
      {
        key: 'chaos_space_marines',
        name: 'Chaos Space Marines',
        allegiance: 'Chaos',
        lore: 'Renegade Space Marines who turned from the Emperor to serve Chaos, their armor scarred with heresy and their bodies twisted by the gifts of the Dark Gods.',
        difficulty: 3,
        playstyle:
          'A flexible Chaos toolbox army, leaning on cheap, durable infantry and cult legion detachment rules to tailor tactics to the matchup.',
      },
      {
        key: 'death_guard',
        name: 'Death Guard',
        allegiance: 'Chaos',
        lore: 'Nurgle’s chosen, plague-ridden legionaries who shrug off wounds that would kill lesser warriors, spreading rot and despair wherever they march.',
        difficulty: 2,
        playstyle:
          'An extremely durable, slow-moving attrition army; wins by grinding through damage over many turns rather than outmaneuvering, forgiving of positioning mistakes.',
      },
      {
        key: 'emperors_children',
        name: 'Emperor’s Children',
        allegiance: 'Chaos',
        lore: 'Slaanesh’s chosen legion, obsessed with sensation and perfection in all things, delivering exquisite violence through Noise Marines and Kakophoni.',
        difficulty: 3,
        playstyle:
          'A precision-strike army that stacks excess-damage and sonic-weapon rules to burst down single high-value targets; rewards careful target prioritization.',
      },
      {
        key: 'thousand_sons',
        name: 'Thousand Sons',
        allegiance: 'Chaos',
        lore: 'Magnus’s cursed sons, sorcerer-legionaries entombed in psychically-animated armor after the Rubric that turned most of their number to dust.',
        difficulty: 4,
        playstyle:
          'A psychic-phase-heavy army stacking mortal wounds and buffs through its casters; rewards careful sequencing of powers and sharp target priority.',
      },
      {
        key: 'world_eaters',
        name: 'World Eaters',
        allegiance: 'Chaos',
        lore: 'Khorne’s chosen berserkers, driven by the Butcher’s Nails to ceaseless slaughter, caring nothing for strategy beyond closing the distance and killing.',
        difficulty: 2,
        playstyle:
          'A pure melee alpha-strike army built for fast, aggressive charges turn one or two; a simple, high-tempo game plan with little subtlety.',
      },
    ],
  },
  {
    id: 'xenos',
    title: 'Xenos',
    blurb: 'The alien races of the galaxy — from the ancient Aeldari to the ever-hungry Tyranids.',
    factions: [
      {
        key: 'aeldari',
        name: 'Aeldari',
        allegiance: 'Xenos',
        lore: 'The ancient Aeldari, remnants of a once galaxy-spanning empire, wield Path-based mastery of war and psychic gifts with unmatched speed and precision.',
        difficulty: 5,
        playstyle:
          'An extremely fast, glass-cannon army with deep rules interactions across its Aspects and stratagems; rewards precise movement and punishes any mistake severely.',
      },
      {
        key: 'drukhari',
        name: 'Drukhari',
        allegiance: 'Xenos',
        lore: 'The Dark Eldar, sadistic raiders from Commorragh who feed on the suffering of others to stave off their species’ slow spiritual death.',
        difficulty: 4,
        playstyle:
          'A hyper-aggressive glass-cannon raider army built around fast transports and alpha-strike damage; extremely rewarding when it lands, unforgiving when it misfires.',
      },
      {
        key: 'genestealer_cults',
        name: 'Genestealer Cults',
        allegiance: 'Xenos',
        lore: 'Hidden insurgent cells seeded across the Imperium by Tyranid Genestealers, working from the shadows to weaken worlds from within before the Hive Fleets arrive.',
        difficulty: 4,
        playstyle:
          'An ambush-based army leaning heavily on reserves and cult ambush rules; rewards careful board-state reading and precise timing of the reveal.',
      },
      {
        key: 'leagues_of_votann',
        name: 'Leagues of Votann',
        allegiance: 'Xenos',
        lore: 'Void-dwelling dwarf-like Kin who abandoned the Imperium millennia ago, now returning in armored, ion-shielded war-throngs to reclaim what’s theirs.',
        difficulty: 2,
        playstyle:
          'A durable, ion-shielded gunline army with straightforward shooting output and resilient infantry; a forgiving playstyle for newer players.',
      },
      {
        key: 'necrons',
        name: 'Necrons',
        allegiance: 'Xenos',
        lore: 'An ancient, undying robotic empire slowly reawakening from a sixty-million-year slumber, its immortal warriors rising again and again through Reanimation Protocols.',
        difficulty: 3,
        playstyle:
          'An attritional durability army leaning on Reanimation Protocols to out-heal incoming damage; rewards patient, methodical play over aggression.',
      },
      {
        key: 'orks',
        name: 'Orks',
        allegiance: 'Xenos',
        lore: 'The green tide, a boisterous warrior race who believe with such conviction that their crude vehicles and guns actually work — because they believe it hard enough.',
        difficulty: 2,
        playstyle:
          'A horde melee army built on cheap, numerous Boyz and momentum-based charges; a forgiving, high-model-count playstyle that rewards aggression over precision.',
      },
      {
        key: 'tau',
        name: 'T’au Empire',
        allegiance: 'Xenos',
        lore: 'A young, expansionist empire built on the doctrine of the Greater Good, relying on advanced railgun and plasma technology delivered from range rather than close combat.',
        difficulty: 3,
        playstyle:
          'A pure ranged-firepower army built around markerlight synergy and a mobile gunline; rewards maintaining range bands and denying enemy charges.',
      },
      {
        key: 'tyranids',
        name: 'Tyranids',
        allegiance: 'Xenos',
        lore: 'An extragalactic hive mind devouring entire worlds to fuel its endless biological evolution, adapting new bio-forms to counter whatever resistance it encounters.',
        difficulty: 4,
        playstyle:
          'An adaptable swarm army stacking synapse control and layered waves of bio-forms; rewards careful synapse-range management and sustained board control.',
      },
    ],
  },
]

const factionNamesByKey = new Map<string, string>(
  allegiances.flatMap((a) => a.factions.map((f) => [f.key, f.name] as const)),
)

/** Resolve a faction key to its display name, or a neutral placeholder when unset. */
export function factionName(key: string | null): string {
  if (!key) return '—'
  return factionNamesByKey.get(key) ?? key
}
