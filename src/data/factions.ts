// Faction reference data for the Teams Event. Alongside lore and a tabletop
// difficulty rating, each entry carries a competitive profile framed for team
// play: an archetype, its damage range, and — most importantly for this app — a
// `consistency` rating on the blind-pairing axis (how badly the army swings
// across the field of possible opponents), plus strengths, weaknesses, a team
// draft role, and a secret-select/counter-pick tip.
//
// These are archetype-level, meta-independent characterisations (the exact tier
// standings shift every balance dataslate); they are editorial, in the same
// spirit as `lore`/`playstyle`, not scraped from any live source.

/** Where an army's damage comes from. */
export type Range = 'Melee' | 'Shooting' | 'Hybrid'

/**
 * How much the army swings across the field of matchups — the core axis of
 * blind pairing. `Consistent` armies are safe to drop blind (they rarely get
 * blown out); `Polarising` armies are feast-or-famine and want to be
 * counter-picked into a favourable matchup.
 */
export type Consistency = 'Consistent' | 'Balanced' | 'Polarising'

export interface FactionInfo {
  key: string
  name: string
  allegiance: 'Imperium' | 'Chaos' | 'Xenos'
  lore: string
  /** Tabletop difficulty rating, 1 (forgiving) to 5 (demanding). */
  difficulty: number
  /** One-line combat identity, e.g. "Melee alpha strike". */
  archetype: string
  range: Range
  consistency: Consistency
  playstyle: string
  /** Competitive strengths, most significant first. */
  strengths: string[]
  /** Competitive weaknesses, most significant first. */
  weaknesses: string[]
  /** How a captain uses this army in a team draft. */
  teamRole: string
  /** Advice for the secret-select / counter-pick pairing modules. */
  pairingTip: string
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
        archetype: 'Faith-fuelled midfield infantry',
        range: 'Hybrid',
        consistency: 'Balanced',
        playstyle:
          'Durable, faith-fuelled infantry that leans on Acts of Faith and miracle dice to swing key moments; rewards committed midfield trades backed by cheap, resilient troops.',
        strengths: [
          'Miracle dice bank guaranteed rolls for clutch charges, saves, and objectives',
          'Cheap, resilient bodies that trade well in the midfield',
          'Strong character and vehicle support for a Marine-adjacent toughness',
        ],
        weaknesses: [
          'Low top-end durability against elite, high-quality attacks',
          'Leans on leaders and buff auras to punch up',
          'Can stall against heavy armour without the right tools',
        ],
        teamRole:
          'A dependable objective-holder you can slot into most matchups — a reliable Defender that grinds the middle.',
        pairingTip:
          'A safe blind drop: miracle dice smooth over bad rolls, so it rarely gets blown out even into a poor matchup.',
      },
      {
        key: 'adeptus_custodes',
        name: 'Adeptus Custodes',
        allegiance: 'Imperium',
        lore: 'The Emperor’s personal bodyguard, genetically perfected golden warriors who have stood watch over the Golden Throne for ten thousand years.',
        difficulty: 2,
        archetype: 'Elite melee bricks',
        range: 'Hybrid',
        consistency: 'Consistent',
        playstyle:
          'A small elite model count where every model is a genuine threat; plays a straightforward "every model matters" list, favoring durable melee units and forgiving decision trees.',
        strengths: [
          'Exceptional per-model durability — hard to shift off an objective',
          'Threatening melee across nearly every unit',
          'Forgiving decision tree with few but decisive activations',
        ],
        weaknesses: [
          'Very low model count strains objective and secondary coverage',
          'Vulnerable to being out-actioned by faster, wider armies',
          'Horde and volume-of-fire lists chip it down over time',
        ],
        teamRole:
          'A rock-solid anchor — survives almost anything and holds its half of the board; an ideal Defender.',
        pairingTip:
          'Safe to commit blind: few armies can table it, so it rarely loses hard even in an unfavourable drop.',
      },
      {
        key: 'adeptus_mechanicus',
        name: 'Adeptus Mechanicus',
        allegiance: 'Imperium',
        lore: 'The tech-priests of Mars, a cult of the Machine God who wage war with irradiated weapons, arcane rites, and legions of skitarii and cybernetic constructs.',
        difficulty: 4,
        archetype: 'Buff-stacked ranged',
        range: 'Shooting',
        consistency: 'Polarising',
        playstyle:
          'Layered buff and debuff stacking rewards careful sequencing turn to turn; strong ranged output but fragile bodies punish any mispositioning.',
        strengths: [
          'High ranged output once doctrines and buffs are layered',
          'Cheap skitarii and servitors give strong action economy',
          'Deep detachment tricks reward expert sequencing',
        ],
        weaknesses: [
          'Fragile infantry that evaporate if caught out of cover',
          'Buff-sequencing dependency punishes any misstep',
          'Steep learning curve with little margin for error',
        ],
        teamRole:
          'A specialist you steer into a favourable shooting matchup rather than a flexible anchor.',
        pairingTip:
          'Risky blind — its ceiling is high but a bad matchup exposes fragile bodies; hold it to counter-pick when you can.',
      },
      {
        key: 'astra_militarum',
        name: 'Astra Militarum',
        allegiance: 'Imperium',
        lore: 'The Imperial Guard, humanity’s numberless conscript armies who win wars through sheer weight of bodies, artillery, and armor rather than individual skill.',
        difficulty: 3,
        archetype: 'Artillery gunline & horde',
        range: 'Shooting',
        consistency: 'Balanced',
        playstyle:
          'A horde-and-artillery army built on cheap blob infantry, orders, and tank spam; rewards board control and screening over unit-by-unit finesse.',
        strengths: [
          'Long threat range through orders and indirect artillery',
          'Cheap infantry blobs screen the board and soak objectives',
          'Tank and artillery redundancy keeps output flowing',
        ],
        weaknesses: [
          'Weak in melee — folds if the line is reached',
          'Leadership and bracketing can swing a turn hard',
          'Tanks can be traded down by dedicated anti-armour',
        ],
        teamRole:
          'A flexible mid-table pick that screens and shoots; comfortable as a Defender that owns its deployment zone.',
        pairingTip:
          'Fine to drop blind — range and screens keep most games close; just wary of fast melee that skips the gunline.',
      },
      {
        key: 'black_templars',
        name: 'Black Templars',
        allegiance: 'Imperium',
        lore: 'Zealous Space Marine crusaders sworn to earn the Emperor’s forgiveness through unending war, marching behind Sword Brethren and holy reliquaries.',
        difficulty: 2,
        archetype: 'Melee-forward crusaders',
        range: 'Hybrid',
        consistency: 'Balanced',
        playstyle:
          'An aggressive, melee-forward Marine list built around cheap, buffed infantry squads charging early; a straightforward, high-tempo game plan.',
        strengths: [
          'Cheap, buffed infantry that hit hard on the charge',
          'Fights-first and re-roll tricks win the melee exchange',
          'High early tempo pressures objectives turn one and two',
        ],
        weaknesses: [
          'Reliant on landing the charge to swing a fight',
          'Less shooting than other Marine flavours',
          'Loses momentum if screened out or stalled',
        ],
        teamRole: 'An aggressive Attacker you point at a bracketed or shooting-light army.',
        pairingTip:
          'Wants a melee-soft target — better held as a counter-pick than dropped blind into a screened gunline.',
      },
      {
        key: 'blood_angels',
        name: 'Blood Angels',
        allegiance: 'Imperium',
        lore: 'Space Marines cursed by the Black Rage and Red Thirst, descendants of Sanguinius who combine noble chivalry with barely-restrained bloodlust in battle.',
        difficulty: 3,
        archetype: 'Jump-pack alpha strike',
        range: 'Hybrid',
        consistency: 'Polarising',
        playstyle:
          'An alpha-strike army leaning on deep strike and jump-pack units to close the distance turn one, aiming to win the fight before the opponent can respond.',
        strengths: [
          'Turn-one threat via deep strike and jump-pack mobility',
          'High melee burst that can delete a key unit outright',
          'Strong characters amplify the alpha strike',
        ],
        weaknesses: [
          'Overcommit risk — a failed strike leaves it exposed',
          'Fragile once the initial punch is spent',
          'Swings on going first against equally fast lists',
        ],
        teamRole:
          'A killer counter-pick — steer it into something fragile it can delete on the first turn.',
        pairingTip:
          'High-variance blind; best deployed as the counter to a soft Defender rather than an anchor.',
      },
      {
        key: 'dark_angels',
        name: 'Dark Angels',
        allegiance: 'Imperium',
        lore: 'The secretive First Legion, hunting the Fallen across the galaxy while presenting themselves as a noble Chapter, all while guarding a ten-thousand-year-old shame.',
        difficulty: 3,
        archetype: 'Durable gunline',
        range: 'Hybrid',
        consistency: 'Consistent',
        playstyle:
          'A gunline-leaning Marine army that stacks shooting buffs onto durable elite squads, favoring patient positioning over rushed engagements.',
        strengths: [
          'Stacks defensive and shooting buffs on resilient squads',
          'Patient positioning grips objectives tightly',
          'Rounds out matchups rather than folding to any one',
        ],
        weaknesses: [
          'Slower — can be out-paced on mobile secondaries',
          'Premium points cost limits model count',
          'Reactive game plan cedes early tempo',
        ],
        teamRole:
          'A dependable anchor/Defender that rounds out the team and rarely loses its half.',
        pairingTip: 'A safe blind drop — hard to blow out, holds ground against most of the field.',
      },
      {
        key: 'deathwatch',
        name: 'Deathwatch',
        allegiance: 'Imperium',
        lore: 'The Long Vigil made flesh — Space Marines drawn from every Chapter to hunt xenos threats too dangerous for a single Chapter to face alone.',
        difficulty: 3,
        archetype: 'Modular kill-teams',
        range: 'Hybrid',
        consistency: 'Balanced',
        playstyle:
          'A flexible, kill-team-style elite force with mixed wargear and special-issue ammo, rewarding tailored loadouts and sharp target-priority calls each game.',
        strengths: [
          'Tailored loadouts and special ammo answer many targets',
          'Flexible mixed-wargear squads adapt mid-game',
          'Strong characters and elite bodies',
        ],
        weaknesses: [
          'Elite low model count strains coverage',
          'Complex to pilot to its full potential',
          'Premium points cost per model',
        ],
        teamRole: 'A flexible pick whose loadout can be aimed at the expected matchup.',
        pairingTip:
          'Adapts reasonably blind, but shines most when you can tune it to a known counter.',
      },
      {
        key: 'grey_knights',
        name: 'Grey Knights',
        allegiance: 'Imperium',
        lore: 'The Imperium’s secret daemon hunters, psychic warrior-monks whose existence is denied even as they purge the galaxy of Chaos incursions.',
        difficulty: 3,
        archetype: 'Psychic elite teleporters',
        range: 'Hybrid',
        consistency: 'Balanced',
        playstyle:
          'An elite, psyker-heavy force leaning on stacked psychic damage and force weapons; a small model count rewards careful target selection each turn.',
        strengths: [
          'Board-wide teleport mobility dictates the engagement',
          'Reliable mortal-wound and force-weapon output',
          'Deep-strike action play scores flexibly',
        ],
        weaknesses: [
          'Low model count with premium points cost',
          'Fragile to concentrated fire once pinned',
          'Thin margins reward near-perfect target priority',
        ],
        teamRole: 'A mobile secondary-scorer/Attacker with strong action economy.',
        pairingTip:
          'Its mobility keeps it flexible blind; especially strong dropped into slow, static lists.',
      },
      {
        key: 'imperial_knights',
        name: 'Imperial Knights',
        allegiance: 'Imperium',
        lore: 'Feudal noble pilots bound to towering war machines by sacred oath, deploying alone or in Households to crush enemies beneath armored feet.',
        difficulty: 2,
        archetype: 'Big-walker elite',
        range: 'Hybrid',
        consistency: 'Polarising',
        playstyle:
          'A very low model count of huge, resilient walkers; one of the simplest decision trees in the game, though losing a single Knight is always costly.',
        strengths: [
          'Enormous durability and damage per model',
          'Dominates elite and low-model armies',
          'Simple, robust game plan',
        ],
        weaknesses: [
          'Very few activations to spread across objectives',
          'Horde and objective spam swarm it off the board',
          'Losing a single Knight is a huge swing',
        ],
        teamRole: 'A specialist — steer it away from horde and objective-spam armies.',
        pairingTip:
          'Feast-or-famine blind: counter-pick it into elite, low-model lists and never drop it into a horde.',
      },
      {
        key: 'space_marines',
        name: 'Space Marines',
        allegiance: 'Imperium',
        lore: 'The Emperor’s finest, genetically-enhanced transhuman warriors organized into a thousand Chapters, each ready to answer the call across the stars.',
        difficulty: 2,
        archetype: 'Generalist toolbox',
        range: 'Hybrid',
        consistency: 'Consistent',
        playstyle:
          'The generalist toolbox faction — flexible, durable multi-wound infantry that can lean shooting or melee depending on Chapter tactics; forgiving for new players.',
        strengths: [
          'Detachment flexibility to lean shooting or melee',
          'Durable multi-wound bodies with strong support',
          'No glaring weakness for an opponent to exploit',
        ],
        weaknesses: [
          'Jack-of-all-trades ceiling — few overwhelming edges',
          'Premium points cost per model',
          'Relies on the pilot to pick the right tools',
        ],
        teamRole: 'The ideal flexible anchor — comfortable dropped into any matchup on the board.',
        pairingTip: 'The safest blind pick in the game; it adapts to almost anything you draw.',
      },
      {
        key: 'space_wolves',
        name: 'Space Wolves',
        allegiance: 'Imperium',
        lore: 'Savage and fiercely loyal sons of Leman Russ, who fight as much for honor and glory as for the Emperor, led by their Rune Priests and Wolf Lords.',
        difficulty: 3,
        archetype: 'Assault marines',
        range: 'Hybrid',
        consistency: 'Balanced',
        playstyle:
          'An aggressive melee Marine list built around fast-moving assault units and combined-arms detachment tricks; rewards decisive, well-timed charges.',
        strengths: [
          'Fast assault units close the distance quickly',
          'Combined-arms detachment tricks reward timing',
          'Strong characters lead punchy melee squads',
        ],
        weaknesses: [
          'Charge-dependent — punished if it whiffs',
          'Less shooting than gunline Chapters',
          'Premium points cost',
        ],
        teamRole: 'An aggressive Attacker/flex that punishes a soft midfield.',
        pairingTip: 'Reasonable blind, but hits hardest aimed at a melee-light target.',
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
        archetype: 'Deep-strike swarm',
        range: 'Hybrid',
        consistency: 'Polarising',
        playstyle:
          'A fast, deep-striking army with swingy, high-ceiling damage output; rewards aggressive turn-one and turn-two commitment despite the randomness of daemonic rules.',
        strengths: [
          'Board-wide deep strike applies pressure everywhere',
          'High melee ceiling that can overrun a flank',
          'Strong summoning and action play',
        ],
        weaknesses: [
          'Swingy output that can underperform when it matters',
          'Fragile to concentrated shooting',
          'Needs early tempo or it falls behind',
        ],
        teamRole: 'A high-ceiling Attacker best committed into a known soft matchup.',
        pairingTip:
          'High-variance blind; counter-pick it into fragile shooting lists rather than trusting the dice.',
      },
      {
        key: 'chaos_knights',
        name: 'Chaos Knights',
        allegiance: 'Chaos',
        lore: 'Renegade Knight households who broke their oaths to serve the Dark Gods, piloting corrupted war engines soaked in blood and heresy.',
        difficulty: 2,
        archetype: 'Big-walker aggressor',
        range: 'Hybrid',
        consistency: 'Polarising',
        playstyle:
          'Like their loyalist counterparts, a small count of huge resilient models; simple to pilot but punishing to lose one, favoring aggressive board presence.',
        strengths: [
          'Durable, high-damage models that push the board',
          'Aggressive presence forces the opponent to react',
          'Strong into elite, low-model armies',
        ],
        weaknesses: [
          'Few activations to contest objectives',
          'Horde and objective spam punish it hard',
          'Losing a single Knight is a major swing',
        ],
        teamRole: 'A specialist — steer it into elite and low-model armies.',
        pairingTip:
          'Like Imperial Knights, counter-pick it and keep it clear of hordes when dropping blind.',
      },
      {
        key: 'chaos_space_marines',
        name: 'Chaos Space Marines',
        allegiance: 'Chaos',
        lore: 'Renegade Space Marines who turned from the Emperor to serve Chaos, their armor scarred with heresy and their bodies twisted by the gifts of the Dark Gods.',
        difficulty: 3,
        archetype: 'Flexible traitor toolbox',
        range: 'Hybrid',
        consistency: 'Consistent',
        playstyle:
          'A flexible Chaos toolbox army, leaning on cheap, durable infantry and cult legion detachment rules to tailor tactics to the matchup.',
        strengths: [
          'Cheap, durable infantry backbone',
          'Detachment flexibility tailors the plan to the matchup',
          'Dark Pacts and strong characters add reach',
        ],
        weaknesses: [
          'No single dominant edge to lean on',
          'Some detachments are more swingy than others',
          'Premium cost on its elite pieces',
        ],
        teamRole: 'A flexible anchor that drops comfortably into most matchups.',
        pairingTip: 'A safe blind pick; it adapts across the field much like loyalist Marines.',
      },
      {
        key: 'death_guard',
        name: 'Death Guard',
        allegiance: 'Chaos',
        lore: 'Nurgle’s chosen, plague-ridden legionaries who shrug off wounds that would kill lesser warriors, spreading rot and despair wherever they march.',
        difficulty: 2,
        archetype: 'Attrition grind',
        range: 'Hybrid',
        consistency: 'Consistent',
        playstyle:
          'An extremely durable, slow-moving attrition army; wins by grinding through damage over many turns rather than outmaneuvering, forgiving of positioning mistakes.',
        strengths: [
          'Extreme durability shrugs off incoming damage',
          'Forgiving of positioning mistakes',
          'Grinds objectives across the full game',
        ],
        weaknesses: [
          'Slow — cedes tempo and mobile secondaries',
          'Modest damage ceiling',
          'Can be out-scored on pace by a faster list',
        ],
        teamRole: 'A stubborn Defender that refuses to die and holds its half of the board.',
        pairingTip:
          'A very safe blind drop: rarely tabled and rarely blown out, whatever it faces.',
      },
      {
        key: 'emperors_children',
        name: 'Emperor’s Children',
        allegiance: 'Chaos',
        lore: 'Slaanesh’s chosen legion, obsessed with sensation and perfection in all things, delivering exquisite violence through Noise Marines and Kakophoni.',
        difficulty: 3,
        archetype: 'Precision burst',
        range: 'Hybrid',
        consistency: 'Balanced',
        playstyle:
          'A precision-strike army that stacks excess-damage and sonic-weapon rules to burst down single high-value targets; rewards careful target prioritization.',
        strengths: [
          'Excess and sonic rules delete high-value targets',
          'Mobile enough to pick its fights',
          'Strong tempo when combos land',
        ],
        weaknesses: [
          'Fragile bodies once the combo pieces are spent',
          'Reliant on chaining its rules together',
          'Can run out of steam in a long game',
        ],
        teamRole: 'A target-priority Attacker aimed at the opponent’s high-value pieces.',
        pairingTip:
          'Fine blind, best when a juicy target to burst down is likely to be on the table.',
      },
      {
        key: 'thousand_sons',
        name: 'Thousand Sons',
        allegiance: 'Chaos',
        lore: 'Magnus’s cursed sons, sorcerer-legionaries entombed in psychically-animated armor after the Rubric that turned most of their number to dust.',
        difficulty: 4,
        archetype: 'Psychic mortal wounds',
        range: 'Shooting',
        consistency: 'Polarising',
        playstyle:
          'A psychic-phase-heavy army stacking mortal wounds and buffs through its casters; rewards careful sequencing of powers and sharp target priority.',
        strengths: [
          'Ignores-defence mortal wound output bypasses tough targets',
          'Powerful casters and cabal board control',
          'Punishes buff-reliant and high-toughness lists',
        ],
        weaknesses: [
          'Expensive, low model count',
          'Fragile bodies outside their buffs',
          'Sequencing-heavy with a steep skill floor',
        ],
        teamRole: 'A specialist — steer it into durable, buff-reliant targets it can bypass.',
        pairingTip:
          'Risky blind; counter-pick it into high-toughness or heavily-buffed armies where mortals shine.',
      },
      {
        key: 'world_eaters',
        name: 'World Eaters',
        allegiance: 'Chaos',
        lore: 'Khorne’s chosen berserkers, driven by the Butcher’s Nails to ceaseless slaughter, caring nothing for strategy beyond closing the distance and killing.',
        difficulty: 2,
        archetype: 'Pure melee alpha strike',
        range: 'Melee',
        consistency: 'Polarising',
        playstyle:
          'A pure melee alpha-strike army built for fast, aggressive charges turn one or two; a simple, high-tempo game plan with little subtlety.',
        strengths: [
          'Brutal charges with a very high melee ceiling',
          'Fast, relentless pressure from turn one',
          'Simple, aggressive game plan',
        ],
        weaknesses: [
          'Almost no answer to being kept at range',
          'Feast-or-famine — swings hard on the charge',
          'Screened and blocked out by a disciplined board',
        ],
        teamRole: 'A dedicated Attacker you throw at a melee-soft Defender.',
        pairingTip:
          'The definition of a counter-pick army — never blind-drop it into a gunline or heavy screen.',
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
        archetype: 'Fast high-skill glass cannon',
        range: 'Hybrid',
        consistency: 'Balanced',
        playstyle:
          'An extremely fast, glass-cannon army with deep rules interactions across its Aspects and stratagems; rewards precise movement and punishes any mistake severely.',
        strengths: [
          'Elite mobility dictates the pace of every engagement',
          'Precise, efficient damage into any profile',
          'Deep stratagem and Aspect interactions reward mastery',
        ],
        weaknesses: [
          'Fragile — trades poorly if caught out of position',
          'Brutally punishing of pilot misplays',
          'Premium points cost',
        ],
        teamRole: 'A skilled pilot’s flex that its speed lets you steer into almost any matchup.',
        pairingTip:
          'In expert hands it drops safely blind — mobility lets it dictate terms even into a rough draw.',
      },
      {
        key: 'drukhari',
        name: 'Drukhari',
        allegiance: 'Xenos',
        lore: 'The Dark Eldar, sadistic raiders from Commorragh who feed on the suffering of others to stave off their species’ slow spiritual death.',
        difficulty: 4,
        archetype: 'Raider alpha strike',
        range: 'Hybrid',
        consistency: 'Polarising',
        playstyle:
          'A hyper-aggressive glass-cannon raider army built around fast transports and alpha-strike damage; extremely rewarding when it lands, unforgiving when it misfires.',
        strengths: [
          'Blistering speed and objective-raiding reach',
          'Alpha-strike damage that removes key units',
          'Transports protect and reposition the strike',
        ],
        weaknesses: [
          'Paper-thin — collapses under return fire',
          'Falls apart if the strike stalls or trades down',
          'Unforgiving of any misfire',
        ],
        teamRole: 'A glass-cannon Attacker — counter-pick it into fragile lists it can overrun.',
        pairingTip: 'High-variance blind; deploy it as the counter, not as a blind anchor.',
      },
      {
        key: 'genestealer_cults',
        name: 'Genestealer Cults',
        allegiance: 'Xenos',
        lore: 'Hidden insurgent cells seeded across the Imperium by Tyranid Genestealers, working from the shadows to weaken worlds from within before the Hive Fleets arrive.',
        difficulty: 4,
        archetype: 'Ambush & reserves',
        range: 'Hybrid',
        consistency: 'Balanced',
        playstyle:
          'An ambush-based army leaning heavily on reserves and cult ambush rules; rewards careful board-state reading and precise timing of the reveal.',
        strengths: [
          'Board-wide ambush pressures every objective',
          'Strong action and secondary-scoring play',
          'Recursion returns destroyed units to the fight',
        ],
        weaknesses: [
          'Individually fragile bodies',
          'Timing-dependent — a mistimed reveal wastes the turn',
          'Complex to pilot to its ceiling',
        ],
        teamRole: 'A tricky secondary-scorer/flex that stresses the opponent’s whole board.',
        pairingTip:
          'Reserves keep it flexible blind; especially strong dropped into static gunlines.',
      },
      {
        key: 'leagues_of_votann',
        name: 'Leagues of Votann',
        allegiance: 'Xenos',
        lore: 'Void-dwelling dwarf-like Kin who abandoned the Imperium millennia ago, now returning in armored, ion-shielded war-throngs to reclaim what’s theirs.',
        difficulty: 2,
        archetype: 'Resilient gunline',
        range: 'Shooting',
        consistency: 'Consistent',
        playstyle:
          'A durable, ion-shielded gunline army with straightforward shooting output and resilient infantry; a forgiving playstyle for newer players.',
        strengths: [
          'Durable, ion-shielded infantry hold the line',
          'Reliable shooting with judgement-token precision',
          'Forgiving, low-variance game plan',
        ],
        weaknesses: [
          'Slow — cedes the mobile secondary game',
          'Low model count strains coverage',
          'Can be out-maneuvered by faster armies',
        ],
        teamRole: 'A dependable shooting anchor/Defender that holds its ground.',
        pairingTip: 'A safe blind drop: consistent output keeps games close whatever it faces.',
      },
      {
        key: 'necrons',
        name: 'Necrons',
        allegiance: 'Xenos',
        lore: 'An ancient, undying robotic empire slowly reawakening from a sixty-million-year slumber, its immortal warriors rising again and again through Reanimation Protocols.',
        difficulty: 3,
        archetype: 'Reanimating attrition',
        range: 'Hybrid',
        consistency: 'Consistent',
        playstyle:
          'An attritional durability army leaning on Reanimation Protocols to out-heal incoming damage; rewards patient, methodical play over aggression.',
        strengths: [
          'Reanimation Protocols out-heal incoming damage',
          'Flexible units grip objectives tightly',
          'Rounds out matchups rather than folding',
        ],
        weaknesses: [
          'Slower — can be out-tempoed',
          'Premium characters and support pieces',
          'Modest ceiling without the right engagements',
        ],
        teamRole: 'A rock-solid anchor/Defender that grinds and holds.',
        pairingTip: 'One of the safest blind picks; very hard to blow out across the field.',
      },
      {
        key: 'orks',
        name: 'Orks',
        allegiance: 'Xenos',
        lore: 'The green tide, a boisterous warrior race who believe with such conviction that their crude vehicles and guns actually work — because they believe it hard enough.',
        difficulty: 2,
        archetype: 'Green-tide horde',
        range: 'Hybrid',
        consistency: 'Balanced',
        playstyle:
          'A horde melee army built on cheap, numerous Boyz and momentum-based charges; a forgiving, high-model-count playstyle that rewards aggression over precision.',
        strengths: [
          'Cheap, numerous bodies flood the board',
          'Momentum charges overwhelm a thin line',
          'Strong into elite, low-model armies',
        ],
        weaknesses: [
          'Swingy output roll to roll',
          'Leadership and mass-wipe risk',
          'Less reliable than a disciplined gunline',
        ],
        teamRole: 'A board-flooding flex/Attacker that shines into low-model armies.',
        pairingTip: 'Fine blind, and a natural answer to Knights and other elite, low-count lists.',
      },
      {
        key: 'tau',
        name: 'T’au Empire',
        allegiance: 'Xenos',
        lore: 'A young, expansionist empire built on the doctrine of the Greater Good, relying on advanced railgun and plasma technology delivered from range rather than close combat.',
        difficulty: 3,
        archetype: 'Mobile gunline',
        range: 'Shooting',
        consistency: 'Balanced',
        playstyle:
          'A pure ranged-firepower army built around markerlight synergy and a mobile gunline; rewards maintaining range bands and denying enemy charges.',
        strengths: [
          'Elite ranged firepower into any target',
          'Markerlight synergy sharpens every shot',
          'Range control keeps threats at arm’s length',
        ],
        weaknesses: [
          'Very weak in melee — folds if charged',
          'Reliant on screens to hold the enemy off',
          'Punished hard by fast alpha-strike lists',
        ],
        teamRole: 'A shooting specialist — steer it away from fast melee.',
        pairingTip:
          'Drop it into shooting or static matchups; keep it well clear of alpha-strike melee.',
      },
      {
        key: 'tyranids',
        name: 'Tyranids',
        allegiance: 'Xenos',
        lore: 'An extragalactic hive mind devouring entire worlds to fuel its endless biological evolution, adapting new bio-forms to counter whatever resistance it encounters.',
        difficulty: 4,
        archetype: 'Adaptive swarm',
        range: 'Hybrid',
        consistency: 'Balanced',
        playstyle:
          'An adaptable swarm army stacking synapse control and layered waves of bio-forms; rewards careful synapse-range management and sustained board control.',
        strengths: [
          'Synapse-buffed waves sustain board control',
          'Flexible bio-forms answer many threats',
          'Depth of models rounds out most matchups',
        ],
        weaknesses: [
          'Synapse-dependent — fragile once it breaks',
          'Complex to manage turn to turn',
          'Individual bio-forms can be brittle off-buff',
        ],
        teamRole: 'An adaptable flex/anchor that rounds out the team.',
        pairingTip:
          'Flexible blind; its wave depth keeps most games competitive whatever you draw.',
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

/**
 * A short 2–4 letter tag for a faction, to tell the logos apart where they show
 * small (e.g. the live selection tiles). Multi-word names use each word's
 * initial (Chaos Space Marines → CSM); a single-word name takes its first three
 * letters (Necrons → NEC).
 */
export function factionAbbr(key: string | null): string {
  if (!key) return '—'
  const words = factionName(key).split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    return words
      .map((word) => word[0])
      .join('')
      .slice(0, 4)
      .toUpperCase()
  }
  return (words[0] ?? '').slice(0, 3).toUpperCase()
}

/**
 * The Space Marine Chapters, which share the Adeptus Astartes identity for team
 * composition. Beyond the general one-player-per-faction-keyword rule, a roster
 * may include at most ONE of these (see GAME.MD § 1). Grey Knights are a
 * separate army and are deliberately not counted among them.
 */
export const SPACE_MARINE_KEYS: ReadonlySet<string> = new Set([
  'space_marines',
  'black_templars',
  'blood_angels',
  'dark_angels',
  'space_wolves',
  'deathwatch',
])

/** Whether a faction key belongs to the once-per-roster Space Marine group. */
export function isSpaceMarine(key: string): boolean {
  return SPACE_MARINE_KEYS.has(key)
}
