// AUTO-GENERATED from the RSC data of
// https://gdmissions.app/11th/primary-missions/<deck>/<slug> (the #mission-card-text-panel
// content). Do not hand-edit; regenerate from the source pages. Text is trusted,
// build-time HTML: **bold** markers converted to <b>, entities escaped.

import type { PrimaryContent } from './primaries'

export const primaryContent: Record<string, PrimaryContent> = {
  "battlefield-dominance": {
    "sections": [
      {
        "when": "FIRST & SECOND BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "You control more <b>objectives</b> than your opponent.",
            "vp": 2
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "For each <b>objective</b> you control.",
            "vp": 3
          },
          {
            "text": "For each of those <b>objectives</b> (excluding your <b>home objective</b>) if you control your <b>home objective</b>.",
            "vp": 2,
            "cumulative": true
          }
        ]
      }
    ]
  },
  "immovable-object": {
    "sections": [
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "You control one or more <b>central objectives</b>.",
            "vp": 3
          }
        ]
      },
      {
        "when": "SECOND TO FOURTH BATTLE ROUND",
        "trigger": "End of your Command phase",
        "tiers": [
          {
            "text": "For each <b>objective</b> you control (excluding your <b>home objective</b>).",
            "vp": 5
          }
        ]
      },
      {
        "when": "FIFTH BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "For each <b>objective</b> you control (excluding your <b>home objective</b>).",
            "vp": 5
          }
        ]
      }
    ]
  },
  "determined-acquisition": {
    "sections": [
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "For each <b>objective</b> you control that you did not control at the start of the turn (excluding your <b>home objective</b>).",
            "vp": 2
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "For each <b>objective</b> you control.",
            "vp": 3
          },
          {
            "text": "For each of those <b>objectives</b> that is within your opponent's territory.",
            "vp": 3,
            "cumulative": true
          }
        ]
      }
    ]
  },
  "purge-and-secure": {
    "sections": [
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "One or more enemy units were <b>destroyed</b> this turn by a friendly unit that was within range of one or more <b>objectives</b>.",
            "vp": 3
          },
          {
            "text": "One or more enemy units that started the turn within range of one or more <b>objectives</b> were <b>destroyed</b> this turn.",
            "vp": 3,
            "or": true
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "For each <b>objective</b> you control (excluding your <b>home objective</b>).",
            "vp": 4
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "You control one or more <b>objectives</b> you did not control at the start of the turn (excluding your <b>home objective</b>).",
            "vp": 3
          }
        ]
      }
    ]
  },
  "inescapable-dominion": {
    "sections": [
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "You control three or more <b>objectives</b>.",
            "vp": 4
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "You control two or more <b>objectives</b>.",
            "vp": 5
          },
          {
            "text": "You control more <b>objectives</b> than your opponent.",
            "vp": 4
          }
        ]
      },
      {
        "when": "END OF BATTLE",
        "tiers": [
          {
            "text": "You control your opponent's <b>home objective</b>.",
            "vp": 5
          }
        ]
      }
    ]
  },
  "unstoppable-force": {
    "sections": [
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "One or more enemy units were <b>destroyed</b> this turn.",
            "vp": 3
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "For each <b>objective</b> you control (excluding your <b>home objective</b>).",
            "vp": 4
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "You control one or more <b>objectives</b> you did not control at the start of the turn (excluding your <b>home objective</b>).",
            "vp": 3
          }
        ]
      },
      {
        "when": "END OF BATTLE",
        "tiers": [
          {
            "text": "You control one or more <b>central objectives</b>.",
            "vp": 5
          }
        ]
      }
    ]
  },
  "meatgrinder": {
    "sections": [
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "One or more enemy units were <b>destroyed</b> this turn.",
            "vp": 3
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "You control one or more <b>objectives</b> (excluding your <b>home objective</b>).",
            "vp": 4
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "More enemy units were <b>destroyed</b> this turn than friendly units were <b>destroyed</b> in the previous turn.",
            "vp": 5
          },
          {
            "text": "You control your opponent's <b>home objective</b>.",
            "vp": 5
          }
        ]
      }
    ]
  },
  "punishment": {
    "rule": "<b>START OF YOUR TURN:</b> Select one to three enemy units that are on the battlefield and within range of <b>objectives</b> and/or that <b>destroyed</b> one or more friendly units in the previous turn. If you cannot, select one enemy unit that is on the battlefield. Until the start of your next turn, those units are <b>condemned</b>.",
    "sections": [
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of a turn",
        "tiers": [
          {
            "text": "One or more <b>condemned</b> enemy units left the battlefield this turn.",
            "vp": 5
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "You control one or more <b>objectives</b> (excluding your home <b>objective</b>).",
            "vp": 4
          },
          {
            "text": "You control more <b>objectives</b> than your opponent.",
            "vp": 5
          }
        ]
      },
      {
        "when": "END OF BATTLE",
        "tiers": [
          {
            "text": "You control your opponent's <b>home objective</b>.",
            "vp": 8
          }
        ]
      }
    ]
  },
  "consecrate": {
    "rule": "Each time a friendly unit <b>destroys</b> a unit, that friendly unit becomes a <b>consecration</b> unit. At the end of your turn, for each of your <b>consecration</b> units, you can select one <b>objective</b> it is within range of (excluding your <b>home objective</b>) that has not been <b>consecrated</b>. If you do, place one of your operation markers within range of that <b>objective</b> – that <b>objective</b> is <b>consecrated</b> and that unit is no longer a <b>consecration</b> unit.",
    "sections": [
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "One or two <b>objectives</b> are <b>consecrated</b>.",
            "vp": 3
          },
          {
            "text": "Three or more <b>objectives</b> are <b>consecrated</b>.",
            "vp": 6,
            "or": true
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "You control one or more <b>objectives</b> (excluding your <b>home objective</b>).",
            "vp": 4
          },
          {
            "text": "You control more <b>objectives</b> than your opponent.",
            "vp": 4
          }
        ]
      },
      {
        "when": "END OF BATTLE",
        "tiers": [
          {
            "text": "Your opponent's <b>home objective</b> is <b>consecrated</b>.",
            "vp": 5
          }
        ]
      }
    ]
  },
  "destroyers-wrath": {
    "sections": [
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "One or more enemy units were <b>destroyed</b> this turn.",
            "vp": 3
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "You control one or more <b>objectives</b> (excluding your <b>home objective</b>).",
            "vp": 4
          },
          {
            "text": "You control more <b>objectives</b> than your opponent.",
            "vp": 6
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "More enemy units were <b>destroyed</b> this turn than friendly units were <b>destroyed</b> in the previous turn.",
            "vp": 4
          }
        ]
      }
    ]
  },
  "death-trap": {
    "sections": [
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "For each <b>terrain area trapped</b> this turn.",
            "vp": 2
          },
          {
            "text": "For each of those <b>terrain areas</b> that is an <b>objective</b>.",
            "vp": 3,
            "cumulative": true
          }
        ]
      },
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "One or more enemy units that started the turn within a terrain area were destroyed, if that terrain area is <b>trapped</b>.",
            "vp": 3
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "You control one or more <b>objectives</b> (excluding your <b>home objective</b>).",
            "vp": 4
          }
        ]
      }
    ]
  },
  "delaying-action": {
    "sections": [
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "For each enemy unit <b>destroyed</b> this turn.",
            "vp": 2
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "You control one or more <b>objectives</b> (excluding <b>home objectives</b>).",
            "vp": 4
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "You control one or more <b>central objectives</b> and one or more <b>expansion objectives</b>.",
            "vp": 3
          }
        ]
      }
    ]
  },
  "outmanoeuvre": {
    "sections": [
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "You control your opponent's <b>home objective</b>.",
            "vp": 10
          }
        ]
      },
      {
        "when": "FIRST BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "For each <b>objective</b> you control (excluding your <b>home objective</b>).",
            "vp": 4
          }
        ]
      },
      {
        "when": "SECOND & THIRD BATTLE ROUND",
        "trigger": "End of your Command phase",
        "tiers": [
          {
            "text": "For each <b>objective</b> you control (excluding your <b>home objective</b>).",
            "vp": 5
          }
        ]
      },
      {
        "when": "FOURTH BATTLE ROUND ONWARDS",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "For each <b>objective</b> you control (excluding your <b>home objective</b>).",
            "vp": 6
          }
        ]
      }
    ]
  },
  "smoke-and-mirrors": {
    "sections": [
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "For each <b>objective</b> that is <b>decoyed</b> (see reverse).",
            "vp": 2
          },
          {
            "text": "For each of those <b>objectives</b> that is within your opponent's territory.",
            "vp": 2,
            "cumulative": true
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "You control one or more <b>objectives</b> (excluding your <b>home objective</b>).",
            "vp": 4
          }
        ]
      },
      {
        "when": "END OF BATTLE",
        "tiers": [
          {
            "text": "<b>Four or more objectives</b> are <b>decoyed</b>.",
            "vp": 10
          }
        ]
      }
    ]
  },
  "locate-and-deny": {
    "rule": "<b>START OF THE BATTLE:</b> Select five <b>terrain areas</b> not within your deployment zone; for each one, place one of your <b>operation markers</b> within it. If you cannot, do so for each <b>terrain area</b> that is not within your deployment zone.",
    "sections": [
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "One or more enemy units that started the turn within range of one or more <b>objectives</b> are <b>destroyed</b>.",
            "vp": 4
          },
          {
            "text": "Only one of your <b>operation markers</b> is on the battlefield, if one or more of your units are within the same <b>terrain area</b> as that <b>marker</b>, and no enemy units are within that <b>terrain area</b>.",
            "vp": 4
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "You control one or more <b>objectives</b> (excluding your <b>home objective</b>).",
            "vp": 4
          }
        ]
      },
      {
        "when": "END OF BATTLE",
        "tiers": [
          {
            "text": "Only one of your <b>operation markers</b> is on the battlefield, if one or more of your units are within the same <b>terrain area</b> as that <b>marker</b>, and no enemy units are within that <b>terrain area</b>.",
            "vp": 5
          }
        ]
      }
    ]
  },
  "reconnaissance-sweep": {
    "sections": [
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "Three or more friendly units are wholly within three different table quarters and not within 6\" of the centre of the battlefield.",
            "vp": 3
          },
          {
            "text": "Four or more friendly units are wholly within four different table quarters and not within 6\" of the centre of the battlefield.",
            "vp": 6,
            "or": true
          }
        ]
      },
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "For each enemy unit <b>destroyed</b> this turn.",
            "vp": 1
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "You control one or more <b>objectives</b> (excluding your <b>home objective</b>).",
            "vp": 3
          }
        ]
      }
    ]
  },
  "triangulation": {
    "sections": [
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "You control one or more <b>objectives</b> (excluding your <b>home objective</b>).",
            "vp": 4
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "One <b>objective</b> is <b>triangulated</b> (see reverse).",
            "vp": 3
          },
          {
            "text": "Two <b>objectives</b> are <b>triangulated</b>.",
            "vp": 6,
            "or": true
          },
          {
            "text": "Three or more <b>objectives</b> are <b>triangulated</b>.",
            "vp": 10,
            "or": true
          }
        ]
      },
      {
        "when": "END OF BATTLE",
        "tiers": [
          {
            "text": "You control four or more <b>objectives</b>.",
            "vp": 10
          }
        ]
      }
    ]
  },
  "surveil-the-foe": {
    "rule": "Each time a friendly unit ends a move within range of one <b>objective</b> that has any of your <b>opponent's operation</b> markers within range of it, remove those <b>operation markers</b> from the battlefield.",
    "sections": [
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "One or more enemy units were <b>surveilled</b> this turn (see reverse), unless each of those units is within range of one or more <b>objectives</b> that have one or more <b>operation markers</b> within range of them.",
            "vp": 4
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "You control one or more <b>objectives</b> (excluding your <b>home objective</b>).",
            "vp": 4
          },
          {
            "text": "You control more <b>objectives</b> than your opponent.",
            "vp": 4
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "None of your opponent's <b>operation markers</b> are on the battlefield.",
            "vp": 5
          }
        ]
      }
    ]
  },
  "gather-intel": {
    "sections": [
      {
        "when": "FIRST BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "You control one or more <b>central objectives</b>.",
            "vp": 6
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "You control one or more <b>objectives</b> (excluding your <b>home objective</b>).",
            "vp": 4
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "For each friendly unit that completed the <b>Extract Intelligence action</b> this turn.",
            "vp": 7
          }
        ]
      },
      {
        "when": "END OF BATTLE",
        "tiers": [
          {
            "text": "Three or more of your <b>operation markers</b> are on the battlefield.",
            "vp": 5
          },
          {
            "text": "One of your <b>operation markers</b> is within range of your opponent's <b>home objective</b>.",
            "vp": 5
          }
        ]
      }
    ]
  },
  "search-and-scour": {
    "sections": [
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "You control one or more <b>central objectives</b>.",
            "vp": 3
          },
          {
            "text": "One or more enemy units that started the turn within a <b>terrain area</b> are <b>destroyed</b>.",
            "vp": 2
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "For each <b>objective</b> you control (excluding your <b>home objective</b>).",
            "vp": 4
          }
        ]
      },
      {
        "when": "END OF BATTLE",
        "tiers": [
          {
            "text": "No enemy units are wholly within your territory.",
            "vp": 5
          }
        ]
      }
    ]
  },
  "secure-asset": {
    "sections": [
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "A friendly unit <b>secured the asset</b> this turn (see reverse).",
            "vp": 4
          },
          {
            "text": "One or more enemy units that started the turn within range of one or more <b>central objectives</b> are <b>destroyed</b>.",
            "vp": 2
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "You control one or more <b>objectives</b> (excluding your <b>home objective</b>).",
            "vp": 4
          },
          {
            "text": "You control three or more <b>objectives</b>.",
            "vp": 4
          }
        ]
      }
    ]
  },
  "vital-link": {
    "sections": [
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "You control one or more <b>central objectives</b>.",
            "vp": 2
          },
          {
            "text": "For each of your <b>operation markers</b> within range of one of those <b>objectives</b> (see reverse).",
            "vp": 1,
            "cumulative": true
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "You control one or more <b>objectives</b> (excluding your <b>home objective</b>).",
            "vp": 4
          },
          {
            "text": "One or more of those <b>objectives</b> is a <b>central objective</b>.",
            "vp": 4,
            "cumulative": true
          }
        ]
      },
      {
        "when": "END OF BATTLE",
        "tiers": [
          {
            "text": "You control your opponent's <b>home objective</b>.",
            "vp": 10
          }
        ]
      }
    ]
  },
  "extract-relic": {
    "sections": [
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "A friendly unit <b>performed a sensor sweep</b> this turn.",
            "vp": 4
          },
          {
            "text": "One or more enemy units that started the turn within range of one or more <b>objectives</b> are <b>destroyed</b>.",
            "vp": 3
          },
          {
            "text": "Only one of your opponent's <b>operation markers</b> is on the battlefield, if one or more of your units are within the same <b>terrain area</b> as that <b>operation marker</b>, and no enemy units are within that <b>terrain area</b>.",
            "vp": 4
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "You control one or more <b>objectives</b> (excluding your <b>home objective</b>).",
            "vp": 4
          }
        ]
      },
      {
        "when": "END OF BATTLE",
        "tiers": [
          {
            "text": "Only one of your opponent's <b>operation markers</b> is on the battlefield, if one or more of your units are within the same <b>terrain area</b> as that <b>operation marker</b>, and no enemy units are within that <b>terrain area</b>.",
            "vp": 5
          }
        ]
      }
    ]
  },
  "vanguard-operation": {
    "sections": [
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "A friendly unit <b>performed a vanguard operation</b> this turn.",
            "vp": 4
          },
          {
            "text": "One or more enemy units were <b>destroyed</b> this turn.",
            "vp": 2
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "You control one or more <b>objectives</b> (excluding your <b>home objective</b>).",
            "vp": 4
          }
        ]
      },
      {
        "when": "END OF BATTLE",
        "tiers": [
          {
            "text": "You control your opponent's <b>home objective</b>.",
            "vp": 10
          }
        ]
      }
    ]
  },
  "sabotage": {
    "sections": [
      {
        "when": "ANY BATTLE ROUND",
        "trigger": "End of your turn",
        "tiers": [
          {
            "text": "For each friendly unit that <b>committed sabotage</b> this turn (see reverse).",
            "vp": 3
          },
          {
            "text": "For each of those units that is within range of one or more <b>objectives</b> in your opponent's territory.",
            "vp": 2,
            "cumulative": true
          }
        ]
      },
      {
        "when": "SECOND BATTLE ROUND ONWARDS",
        "trigger": "End of your Command phase (or the end of your turn in the fifth battle round)",
        "tiers": [
          {
            "text": "You control one or more <b>objectives</b> (excluding your <b>home objective</b>).",
            "vp": 4
          }
        ]
      }
    ]
  }
}
