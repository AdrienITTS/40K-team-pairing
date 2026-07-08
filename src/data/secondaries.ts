// AUTO-GENERATED from https://gdmissions.app/11th/secondary-missions/<slug>-defender.
// Each mission's card image lives at /images/secondaries/<key>.png.
// Regenerate with scripts/extract secondary data rather than hand-editing.

/** One scoring line within a section. `text` is an HTML string. */
export interface SecondaryRow {
  text: string
  vp: string
  /** This row is an alternative to the previous one (render an "OR" divider). */
  or?: boolean
  /** This row's VP is an additive bonus (its `vp` reads like "+1"). */
  plus?: boolean
  cumulative?: boolean
}

/** A scoring block on the card (typically a FIXED and/or TACTICAL variant). */
export interface SecondarySection {
  when: string
  /** "FIXED" | "TACTICAL", when the card offers both. */
  chip?: string
  trigger: string
  /** Scores per qualifying event rather than once. */
  perEvent?: boolean
  /** VP cap for the section, e.g. "MAX 5VP". */
  cap?: string
  rows: SecondaryRow[]
}

/** An Action some missions require (STARTS / UNITS / USE LIMIT / COMPLETES / EFFECT rows; v is HTML). */
export interface SecondaryAction {
  title: string
  rows: { k: string; v: string }[]
}

export interface SecondaryMission {
  /** Slug = card-image basename, e.g. "a-grievous-blow". */
  key: string
  name: string
  /** Eyebrow label, e.g. "SECONDARY \u00b7 FIXED / TACTICAL". */
  kindLabel?: string
  /** WHEN DRAWN clause (HTML). */
  whenDrawn?: string
  action?: SecondaryAction
  /** Designer's note (HTML). */
  designerNote?: string
  sections: SecondarySection[]
}

export const secondaryMissions: SecondaryMission[] = [
  {
    key: 'a-grievous-blow',
    name: 'A Grievous Blow',
    kindLabel: 'SECONDARY · FIXED / TACTICAL',
    whenDrawn:
      '<b>WHEN DRAWN:</b> If there are no enemy units with a <b>starting strength</b> of 13 or more on the battlefield, <u>you can</u> discard this card and draw one new <b>Secondary Mission</b> card.',
    sections: [
      {
        when: 'ANY BATTLE ROUND',
        chip: 'FIXED',
        trigger: 'End of a turn',
        perEvent: true,
        rows: [
          {
            text: 'For each enemy unit with a <b>starting strength</b> of 13 or more that is <b>destroyed</b> this turn.',
            vp: '4',
          },
        ],
      },
      {
        when: 'ANY BATTLE ROUND',
        chip: 'TACTICAL',
        trigger: 'End of a turn',
        rows: [
          {
            text: 'One or more enemy units with a <b>starting strength</b> of 13 or more were <b>destroyed</b> this turn.',
            vp: '5',
          },
        ],
      },
    ],
  },
  {
    key: 'a-tempting-target',
    name: 'A Tempting Target',
    whenDrawn:
      "<b>WHEN DRAWN:</b> Your opponent selects one <b>objective</b> (excluding <b>home objectives</b>) within No Man's Land to be your <b>tempting target</b>.",
    sections: [
      {
        when: 'ANY BATTLE ROUND',
        trigger: 'End of your turn',
        rows: [
          {
            text: 'You control your <b>tempting target</b>.',
            vp: '5',
          },
        ],
      },
    ],
  },
  {
    key: 'assassination',
    name: 'Assassination',
    kindLabel: 'SECONDARY · FIXED / TACTICAL',
    sections: [
      {
        when: 'ANY BATTLE ROUND',
        chip: 'FIXED',
        trigger: 'While this card is active',
        perEvent: true,
        rows: [
          {
            text: 'For each enemy <b>CHARACTER</b> model <b>destroyed</b> this turn.',
            vp: '3',
          },
          {
            text: 'For each of those models with a <b>W</b> of 4 or more.',
            vp: '+1',
            plus: true,
            cumulative: true,
          },
        ],
      },
      {
        when: 'ANY BATTLE ROUND',
        chip: 'TACTICAL',
        trigger: "End of either player's turn",
        rows: [
          {
            text: 'One or more enemy <b>CHARACTER</b> models were <b>destroyed</b> this turn.',
            vp: '5',
          },
          {
            text: 'All enemy <b>CHARACTER</b> models have been <b>destroyed</b> during the battle.',
            vp: '5',
            or: true,
          },
        ],
      },
    ],
  },
  {
    key: 'beacon',
    name: 'Beacon',
    whenDrawn:
      '<b>WHEN DRAWN:</b> Select one friendly unit on the battlefield or embarked within a <b>TRANSPORT</b> on the battlefield to be your <span class="cB__mark">beacon</span> unit.',
    sections: [
      {
        when: 'ANY BATTLE ROUND',
        trigger:
          "End of your opponent's turn or the end of the fifth battle round (whichever comes first)",
        rows: [
          {
            text: 'Your <span class="cB__mark">beacon</span> unit is on the battlefield and not within your deployment zone.',
            vp: '3',
          },
          {
            text: 'Your <span class="cB__mark">beacon</span> unit is on the battlefield and not within your territory.',
            vp: '5',
            or: true,
          },
        ],
      },
    ],
  },
  {
    key: 'behind-enemy-lines',
    name: 'Behind Enemy Lines',
    whenDrawn:
      '<b>WHEN DRAWN:</b> If it is the first battle round, <u>you can</u> draw one new <b>Secondary Mission</b> card and shuffle this card back into your <b>Secondary</b> <b>Mission</b> deck.',
    sections: [
      {
        when: 'ANY BATTLE ROUND',
        trigger: 'End of your turn',
        cap: 'MAX 5VP',
        rows: [
          {
            text: "For each friendly unit (excluding <b>AIRCRAFT</b> and <b>battle-shocked</b> units) wholly within your opponent's deployment zone.",
            vp: '3',
          },
        ],
      },
    ],
  },
  {
    key: 'bring-it-down',
    name: 'Bring It Down',
    kindLabel: 'SECONDARY · FIXED / TACTICAL',
    whenDrawn:
      '<b>WHEN DRAWN:</b> If there are no enemy models with a <b>Wounds</b> characteristic of 10 or more on the battlefield, <u>you can</u> discard this card and draw one new <b>Secondary Mission</b> card.',
    sections: [
      {
        when: 'ANY BATTLE ROUND',
        chip: 'FIXED',
        trigger: 'End of a turn',
        perEvent: true,
        rows: [
          {
            text: 'For each enemy model with a <b>Wounds</b> characteristic of 10 or more that is <b>destroyed</b> this turn.',
            vp: '4',
          },
        ],
      },
      {
        when: 'ANY BATTLE ROUND',
        chip: 'TACTICAL',
        trigger: 'End of a turn',
        rows: [
          {
            text: 'One or more enemy models with a <b>Wounds</b> characteristic of 10 or more were <b>destroyed</b> this turn.',
            vp: '5',
          },
        ],
      },
    ],
  },
  {
    key: 'burden-of-trust',
    name: 'Burden of Trust',
    whenDrawn:
      '<b>WHEN DRAWN/START OF YOUR TURN:</b> For each <b>objective</b>, you can select one friendly unit on the battlefield to <b>guard</b> that <b>objective</b>. Until the start of your next turn, while that unit is within range of that <b>objective</b> and while you control that <b>objective</b>, that <b>objective</b> is <span class="cB__mark">guarded</span> by your army.',
    sections: [
      {
        when: 'ANY BATTLE ROUND',
        trigger:
          "End of your opponent's turn or the end of the fifth battle round (whichever comes first)",
        cap: 'MAX 5VP',
        rows: [
          {
            text: 'For each <b>objective</b> <span class="cB__mark">guarded</span> by your army.',
            vp: '2',
          },
        ],
      },
    ],
  },
  {
    key: 'centre-ground',
    name: 'Centre Ground',
    sections: [
      {
        when: 'ANY BATTLE ROUND',
        trigger: 'End of your turn',
        rows: [
          {
            text: 'One or more friendly units (excluding <b>AIRCRAFT</b> and <b>battle-shocked</b> units) are within 3" of the centre of the battlefield, and <u>no</u> enemy units are within <u>3"</u> of the centre of the battlefield.',
            vp: '3',
          },
          {
            text: 'One or more friendly units (excluding <b>AIRCRAFT</b> and <b>battle-shocked</b> units) are within 3" of the centre of the battlefield, and <u>no</u> enemy units are within <u>6"</u> of the centre of the battlefield.',
            vp: '5',
            or: true,
          },
        ],
      },
    ],
  },
  {
    key: 'cleanse',
    name: 'Cleanse',
    whenDrawn:
      '<b>WHEN DRAWN:</b> If the Plunder <b>Secondary Mission</b> is active for you, <u>you can</u> draw one new <b>Secondary Mission</b> card and shuffle this card back into your <b>Secondary Mission</b> deck.',
    action: {
      title: 'CLEANSE',
      rows: [
        {
          k: 'STARTS',
          v: 'Your Shooting phase.',
        },
        {
          k: 'UNITS',
          v: 'One friendly unit within range of one <b>objective</b> (excluding your <b>home objective</b>).',
        },
        {
          k: 'USE LIMIT',
          v: 'Unlimited. Each unit that starts this <b>action</b> this phase must be within range of a different <b>objective</b>.',
        },
        {
          k: 'COMPLETES',
          v: 'End of your turn, if that unit is controlling that <b>objective</b>.',
        },
        {
          k: 'EFFECT',
          v: 'That <b>objective</b> is <span class="cB__mark">cleansed</span> by your army.',
        },
      ],
    },
    sections: [
      {
        when: 'ANY BATTLE ROUND',
        trigger: 'End of your turn',
        rows: [
          {
            text: 'One <b>objective</b> was <span class="cB__mark">cleansed</span> by your army this turn.',
            vp: '2',
          },
          {
            text: 'Two or more <b>objectives</b> were <span class="cB__mark">cleansed</span> by your army this turn.',
            vp: '5',
            or: true,
          },
        ],
      },
    ],
  },
  {
    key: 'defend-stronghold',
    name: 'Defend Stronghold',
    whenDrawn:
      '<b>WHEN DRAWN:</b> If it is the first battle round, draw one new <b>Secondary Mission</b> card and shuffle this card back into your <b>Secondary Mission</b> deck.',
    sections: [
      {
        when: 'SECOND BATTLE ROUND ONWARDS',
        trigger:
          "End of your opponent's turn or the end of the fifth battle round (whichever comes first)",
        rows: [
          {
            text: 'You control your <b>home objective</b>.',
            vp: '3',
          },
          {
            text: 'No enemy units are within your deployment zone.',
            vp: '+2',
            plus: true,
            cumulative: true,
          },
        ],
      },
    ],
  },
  {
    key: 'display-of-might',
    name: 'Display of Might',
    sections: [
      {
        when: 'ANY BATTLE ROUND',
        trigger: 'End of your turn',
        rows: [
          {
            text: "There are more friendly units than enemy units (excluding <b>AIRCRAFT</b> and <b>battle-shocked</b> units) wholly within No Man's Land.",
            vp: '2',
          },
        ],
      },
      {
        when: 'ANY BATTLE ROUND',
        trigger: "End of your opponent's turn",
        rows: [
          {
            text: "There are more friendly units than enemy units (excluding <b>AIRCRAFT</b> and <b>battle-shocked</b> units) wholly within No Man's Land.",
            vp: '5',
          },
        ],
      },
    ],
  },
  {
    key: 'engage-on-all-fronts',
    name: 'Engage on All Fronts',
    kindLabel: 'SECONDARY · FIXED / TACTICAL',
    whenDrawn:
      'If one or more friendly units (excluding <b>AIRCRAFT</b> and <b>battle-shocked</b> units) are wholly within a table quarter, and those units are not within 6" of the centre of the battlefield, you have a <span class="cB__mark">presence</span> in that table quarter.',
    sections: [
      {
        when: 'ANY BATTLE ROUND',
        chip: 'FIXED',
        trigger: 'End of your turn',
        rows: [
          {
            text: 'You have a <span class="cB__mark">presence</span> in <span class="cB__wmWord" data-n="3">three</span> table quarters.',
            vp: '2',
          },
          {
            text: 'You have a <span class="cB__mark">presence</span> in <span class="cB__wmWord" data-n="4">four</span> table quarters.',
            vp: '4',
            or: true,
          },
        ],
      },
      {
        when: 'ANY BATTLE ROUND',
        chip: 'TACTICAL',
        trigger: 'End of your turn',
        rows: [
          {
            text: 'You have a <span class="cB__mark">presence</span> in <span class="cB__wmWord" data-n="3">three</span> table quarters.',
            vp: '3',
          },
          {
            text: 'You have a <span class="cB__mark">presence</span> in <span class="cB__wmWord" data-n="4">four</span> table quarters.',
            vp: '5',
            or: true,
          },
        ],
      },
    ],
  },
  {
    key: 'forward-position',
    name: 'Forward Position',
    whenDrawn:
      '<b>WHEN DRAWN:</b> If it is the first battle round, <u>you can</u> draw one new <b>Secondary Mission</b> card and shuffle this card back into your <b>Secondary</b> <b>Mission</b> deck.',
    sections: [
      {
        when: 'ANY BATTLE ROUND',
        trigger: 'End of your turn',
        rows: [
          {
            text: "You control your opponent's <b>home objective</b> and/or each <b>expansion objective</b>.",
            vp: '5',
          },
        ],
      },
    ],
  },
  {
    key: 'no-prisoners',
    name: 'No Prisoners',
    sections: [
      {
        when: 'ANY BATTLE ROUND',
        trigger: 'End of a turn',
        cap: 'MAX 5VP',
        rows: [
          {
            text: 'For each enemy unit <b>destroyed</b> this turn.',
            vp: '2',
          },
        ],
      },
    ],
  },
  {
    key: 'outflank',
    name: 'Outflank',
    designerNote:
      "<b>Designer's Note:</b> Opposite battlefield edges are those parallel to each other.",
    sections: [
      {
        when: 'ANY BATTLE ROUND',
        trigger: 'End of your turn',
        rows: [
          {
            text: 'One or more friendly units (excluding <b>AIRCRAFT</b> and <b>battle-shocked</b> units) are within 6" of one or more battlefield edges and not within your territory.',
            vp: '3',
          },
          {
            text: 'Two or more friendly units (excluding <b>AIRCRAFT</b> and <b>battle-shocked</b> units) are within 6" of opposite battlefield edges and one or more of those units is not within your territory.',
            vp: '5',
            or: true,
          },
        ],
      },
    ],
  },
  {
    key: 'overwhelming-force',
    name: 'Overwhelming Force',
    sections: [
      {
        when: 'ANY BATTLE ROUND',
        trigger: 'End of a turn',
        cap: 'MAX 5VP',
        rows: [
          {
            text: 'For each enemy unit that started the turn within range of one or more <b>objectives</b> and is <b>destroyed</b>.',
            vp: '3',
          },
        ],
      },
    ],
  },
  {
    key: 'plunder',
    name: 'Plunder',
    whenDrawn:
      '<b>WHEN DRAWN:</b> If the Cleanse <b>Secondary Mission</b> is active for you, <u>you can</u> draw one new <b>Secondary Mission</b> card and shuffle this card back into your <b>Secondary Mission</b> deck.',
    action: {
      title: 'PLUNDER',
      rows: [
        {
          k: 'STARTS',
          v: 'Your Shooting phase.',
        },
        {
          k: 'UNITS',
          v: 'One unit within a <b>terrain area</b> that is not within your territory.',
        },
        {
          k: 'USE LIMIT',
          v: 'Once per turn.',
        },
        {
          k: 'COMPLETES',
          v: 'Immediately.',
        },
        {
          k: 'EFFECT',
          v: 'That <b>terrain area</b> is <span class="cB__mark">plundered</span>.',
        },
      ],
    },
    sections: [
      {
        when: 'ANY BATTLE ROUND',
        trigger: 'End of your turn',
        rows: [
          {
            text: 'A <b>terrain area</b> was <span class="cB__mark">plundered</span> this turn.',
            vp: '5',
          },
        ],
      },
    ],
  },
  {
    key: 'secure-no-man-s-land',
    name: "Secure No Man's Land",
    sections: [
      {
        when: 'ANY BATTLE ROUND',
        trigger: 'End of your turn',
        rows: [
          {
            text: "You control two or more <b>objectives</b> within No Man's Land (excluding your <b>home objective</b>).",
            vp: '5',
          },
        ],
      },
    ],
  },
]
