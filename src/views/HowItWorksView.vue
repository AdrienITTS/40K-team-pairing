<script setup lang="ts">
import CodeWindowCard from '../components/CodeWindowCard.vue'

interface ModuleStep {
  title: string
  steps: string[]
  note?: string
}

const modules: ModuleStep[] = [
  {
    title: 'Initial Skirmish',
    steps: [
      'Each team secretly selects one member to be their Defender.',
      "Each team's Defender is revealed simultaneously.",
      'Each team secretly selects two remaining members to be Attackers against the opposing Defender.',
      'The Attackers are revealed simultaneously.',
      'Each team secretly chooses which opposing Attacker their Defender will play against.',
      'The chosen Attackers are revealed — this decides two match-ups.',
      'The Defender declares their layout choice.',
    ],
  },
  {
    title: 'Main Engagement',
    steps: [
      'Each team secretly selects one member to be their Defender.',
      "Each team's Defender is revealed simultaneously.",
      'Each team secretly selects two remaining members to be Attackers against the opposing Defender.',
      'The Attackers are revealed simultaneously.',
      'Each team secretly chooses which opposing Attacker their Defender will play against.',
      'The chosen Attackers are revealed — this decides two match-ups.',
      'The Defender declares their layout choice.',
      'The two refused Attackers play each other, using a layout that cycles A / B / C by round number.',
    ],
  },
  {
    title: 'Champion System',
    steps: [
      'The one player left unmatched on each team becomes the Champion.',
      'The two Champions play each other, using a layout that cycles A / B / C by round number.',
    ],
  },
]

const teamSizeModules = [
  { size: '3 players', modules: 'Main Engagement' },
  { size: '4 players', modules: 'Main Engagement + Champion System' },
  { size: '5 players', modules: 'Initial Skirmish + Main Engagement' },
  { size: '6 players', modules: 'Initial Skirmish + Main Engagement + Champion System' },
  { size: '7 players', modules: 'Initial Skirmish (×2) + Main Engagement' },
  { size: '8 players', modules: 'Initial Skirmish (×2) + Main Engagement + Champion System' },
]

const vpCaps = [
  { source: 'Primary Mission', max: '45 VP', detail: 'up to 15 VP per battle round' },
  {
    source: 'Secondary Missions',
    max: '45 VP',
    detail: 'up to 15 VP per round, 20 VP max per Fixed card',
  },
  { source: 'Battle Ready Army', max: '10 VP', detail: 'flat bonus for a painted army' },
]

const bpTable = [
  { diff: '0–5', player: 10, opponent: 10 },
  { diff: '6–10', player: 11, opponent: 9 },
  { diff: '11–15', player: 12, opponent: 8 },
  { diff: '16–20', player: 13, opponent: 7 },
  { diff: '21–25', player: 14, opponent: 6 },
  { diff: '26–30', player: 15, opponent: 5 },
  { diff: '31–35', player: 16, opponent: 4 },
  { diff: '36–40', player: 17, opponent: 3 },
  { diff: '41–45', player: 18, opponent: 2 },
  { diff: '46–50', player: 19, opponent: 1 },
  { diff: '51+', player: 20, opponent: 0 },
]

const winMargin = [
  { size: '3-player teams', margin: '4 BP' },
  { size: '4-player teams', margin: '6 BP' },
  { size: '5-player teams', margin: '6 BP' },
  { size: '6-player teams', margin: '8 BP' },
  { size: '7-player teams', margin: '10 BP' },
  { size: '8-player teams', margin: '12 BP' },
]

const bpExample = `<span class="muted"># worked example</span>
86 VP   vs   54 VP
──────────────────────
VP differential    32

Winner Battle Points   <span class="highlight">16</span>
Loser Battle Points     <span class="highlight">4</span>`
</script>

<template>
  <main class="how-it-works">
    <section class="hero">
      <p class="badge-pill">Warhammer 40,000 · Teams Event</p>
      <h1>How team games work</h1>
      <p class="lede">
        A Teams Event pits two teams against each other. Every member of one team plays a single
        battle against a member of the other team, and the scores from every table combine to decide
        who wins the round.
      </p>
    </section>

    <section class="block">
      <h2><span class="step">1</span>Build your team</h2>
      <p>
        Each team has a captain, responsible for making sure players submit lists on time and scores
        get reported at the end of each round.
      </p>
      <ul class="rules-list">
        <li>
          Within a team, only one player may use units carrying a given faction keyword — normally
          one player per Codex, including as allies.
        </li>
        <li>
          After mustering an army in the Warhammer 40,000 app, each player also selects one Force
          Disposition card and records it on their roster.
        </li>
        <li>
          For every 5 players on a team (rounding up), only one player may pick each Force
          Disposition.
          <span class="example"
            >e.g. a 5-player team needs 5 different Force Dispositions; an 8-player team needs every
            Force Disposition picked at least once before any can be repeated.</span
          >
        </li>
      </ul>
    </section>

    <section class="block">
      <h2><span class="step">2</span>Pairing system</h2>
      <p>
        At the start of every round, both captains run a pairing system to decide who plays whom.
        Teams secretly nominate players, then reveal simultaneously, so no one can dodge a bad
        match-up. Once pairs are set, each player checks their opponent's Force Disposition to find
        their Primary Mission for the game.
      </p>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Team size</th>
              <th>Modules used</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in teamSizeModules" :key="row.size">
              <td>{{ row.size }}</td>
              <td>{{ row.modules }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="module-grid">
        <article v-for="mod in modules" :key="mod.title" class="module-card">
          <h3>{{ mod.title }}</h3>
          <ol>
            <li v-for="(step, i) in mod.steps" :key="i">{{ step }}</li>
          </ol>
        </article>
      </div>
    </section>

    <section id="play-the-battle" class="block">
      <h2><span class="step">3</span>Play the battle</h2>
      <ul class="rules-list">
        <li>
          Set up the 44&quot; × 60&quot; battlefield per the chosen layout's terrain areas and
          features.
        </li>
        <li>
          Match the layout's edges to Attacker/Defender battlefield edges. Refused Attackers and
          Champions instead roll off, with the winner choosing a side.
        </li>
        <li>
          Secretly choose Tactical or Fixed Secondary Missions and reveal together, then score them
          as conditions are met throughout the game.
        </li>
        <li>
          Declare which units start embarked or in strategic reserves, then deploy alternately —
          Defender first — with the option to redeploy afterward.
        </li>
        <li>
          Roll off for first turn, resolve any pre-battle rules, then play out five battle rounds.
        </li>
      </ul>
    </section>

    <section id="score-the-game" class="block">
      <h2><span class="step">4</span>Score the game</h2>
      <p>
        A player's total VP is capped per source. Anything scored above these caps is ignored, and
        every player scores an extra 10VP for a Battle Ready painted army.
      </p>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>VP source</th>
              <th>Max</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in vpCaps" :key="row.source">
              <td>{{ row.source }}</td>
              <td class="num">{{ row.max }}</td>
              <td>{{ row.detail }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        The individual winner is whoever scores more VP. Both players then convert their VP
        difference into Battle Points (BP) for their team — the two players' BP always add up to 20.
      </p>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>VP difference</th>
              <th>Player BP</th>
              <th>Opponent BP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in bpTable" :key="row.diff">
              <td>{{ row.diff }}</td>
              <td class="num">{{ row.player }}</td>
              <td class="num">{{ row.opponent }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <CodeWindowCard class="example-code" :code="bpExample" />

      <p class="after-code">
        A team's round result comes from summing every player's BP. The higher-scoring team must
        beat the other by a team-size-dependent margin to win the round outright — anything closer
        is a draw.
      </p>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Team size</th>
              <th>Required BP margin</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in winMargin" :key="row.size">
              <td>{{ row.size }}</td>
              <td class="num">{{ row.margin }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        The winning team earns <strong>3 Team Points</strong>, the losing team earns
        <strong>1</strong>, and a draw gives both teams <strong>2</strong>.
      </p>
    </section>

    <section id="tournament-rankings" class="block">
      <h2><span class="step">5</span>Tournament pairings &amp; rankings</h2>
      <p>
        Round one is usually random. After that, teams are paired first by Team Points, then by
        cumulative individual wins across all rounds, then randomly among ties. Final rankings use
        the same order of tiebreakers, with total Battle Points as the last resort — the outright
        winner of the event is simply the last team standing undefeated.
      </p>
    </section>
  </main>
</template>

<style scoped>
.how-it-works {
  padding: var(--spacing-xl) var(--spacing-lg) var(--spacing-section);
  max-width: 880px;
  margin: 0 auto;
}

.hero {
  margin-bottom: var(--spacing-lg);
}

.hero h1 {
  font-size: 48px;
  letter-spacing: -1px;
  margin: var(--spacing-md) 0;
}

.lede {
  font-size: 18px;
  line-height: 1.6;
  color: var(--color-body);
  max-width: 640px;
}

.block {
  margin-bottom: var(--spacing-xxl);
  /* Breathing room when a home-page feature card deep-links to this chapter. */
  scroll-margin-top: var(--spacing-xl);
}

.block h2 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 28px;
  letter-spacing: -0.3px;
  margin-bottom: var(--spacing-md);
}

.step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-pill);
  background: var(--color-surface-card);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  flex-shrink: 0;
}

.block p {
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-body);
  margin-bottom: var(--spacing-sm);
}

.rules-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin: var(--spacing-md) 0;
}

.rules-list li {
  position: relative;
  padding-left: 20px;
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-body);
}

.rules-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 9px;
  width: 6px;
  height: 6px;
  border-radius: var(--radius-pill);
  background: var(--color-muted-soft);
}

.example {
  display: block;
  color: var(--color-muted);
  font-size: 13px;
  margin-top: 4px;
}

.table-wrap {
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin: var(--spacing-md) 0;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th,
td {
  text-align: left;
  padding: 10px var(--spacing-md);
  border-bottom: 1px solid var(--color-hairline);
  white-space: nowrap;
}

th {
  background: var(--color-surface-soft);
  color: var(--color-muted);
  font-weight: 500;
  font-size: 13px;
}

td {
  color: var(--color-body);
}

td.num {
  font-variant-numeric: tabular-nums;
}

tbody tr:last-child td {
  border-bottom: none;
}

.example-code {
  margin: var(--spacing-md) 0;
}

.after-code {
  margin-top: var(--spacing-md);
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.module-card {
  background: var(--color-surface-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.module-card h3 {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 500;
  color: var(--color-ink);
  margin-bottom: var(--spacing-sm);
}

.module-card ol {
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.module-card li {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-body);
}

@media (max-width: 640px) {
  .how-it-works {
    padding: var(--spacing-lg) var(--spacing-md) var(--spacing-xxl);
  }

  .hero h1 {
    font-size: 32px;
  }
}
</style>
