<script setup lang="ts">
import type { PrimaryMission } from '../data/primaries'
import { getDisposition, dispositionName } from '../data/dispositions'
import DispositionIcon from './DispositionIcon.vue'

const props = defineProps<{ mission: PrimaryMission }>()

const youSymbol = getDisposition(props.mission.you).symbol
const facedSymbol = getDisposition(props.mission.faced).symbol
const accent = {
  '--you': `var(--color-disposition-${props.mission.you})`,
  '--faced': `var(--color-disposition-${props.mission.faced})`,
}
</script>

<template>
  <div class="rules" :style="accent" role="group" :aria-label="`${mission.name}, mission details`">
    <header class="head">
      <div>
        <p class="eyebrow">Primary Mission</p>
        <h2 class="mission-name">{{ mission.name }}</h2>
      </div>
      <span class="you-symbol"><DispositionIcon :symbol="youSymbol" /></span>
    </header>

    <!-- Text fields are trusted, build-time HTML from the source card data. -->
    <p v-if="mission.rule" class="rule" v-html="mission.rule"></p>

    <div v-for="(section, si) in mission.sections" :key="si" class="section">
      <p class="section-when">{{ section.when }}</p>
      <p v-if="section.trigger" class="trigger">
        <span class="trigger-label">WHEN</span>
        <span>{{ section.trigger }}</span>
      </p>
      <ul class="tiers">
        <template v-for="(tier, ti) in section.tiers" :key="ti">
          <li v-if="tier.or" class="divider" aria-hidden="true">or</li>
          <li v-else-if="tier.cumulative" class="divider divider-cumulative" aria-hidden="true">
            + cumulative
          </li>
          <li class="tier">
            <span class="tier-text" v-html="tier.text"></span>
            <span class="vp">
              <span class="vp-value">{{ tier.cumulative ? '+' : '' }}{{ tier.vp }}</span>
              <span class="vp-unit">VP</span>
            </span>
          </li>
        </template>
      </ul>
    </div>

    <!-- The action printed on the card's reverse, when it has a back face. -->
    <section v-if="mission.action" class="action">
      <p class="action-label">Action — reverse</p>
      <h3 class="action-title">{{ mission.action.title }}</h3>
      <dl class="action-rows">
        <template v-for="(row, ri) in mission.action.rows" :key="ri">
          <dt>{{ row.k }}</dt>
          <!-- Values are trusted, build-time HTML from the source card data. -->
          <dd v-html="row.v"></dd>
        </template>
      </dl>
    </section>

    <footer class="foot">
      <span class="faced-chip"><DispositionIcon :symbol="facedSymbol" /></span>
      <span class="foot-label">Opponent</span>
      <span class="foot-name">
        {{
          mission.mirror
            ? `${dispositionName(mission.faced)} — Mirror`
            : dispositionName(mission.faced)
        }}
      </span>
    </footer>
  </div>
</template>

<style scoped>
.rules {
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xl);
  background: var(--color-surface-card);
  padding: var(--spacing-md);
  width: 100%;
  max-width: 520px;
}

.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.eyebrow {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--color-muted);
}

.mission-name {
  font-family: var(--font-display);
  font-size: 23px;
  letter-spacing: -0.5px;
  margin: 2px 0 0;
  color: var(--color-ink);
}

/* Your Force Disposition symbol, full colour (matches the card header). */
.you-symbol {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 8px;
  border-radius: var(--radius-md);
  background: var(--you);
  color: var(--color-on-primary);
  flex-shrink: 0;
}

.rule {
  font-size: 12px;
  line-height: 1.45;
  color: var(--color-body);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-left: 3px solid var(--you);
  background: var(--color-surface-soft);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin-top: var(--spacing-sm);
}

.section {
  border-top: 1px solid var(--color-hairline);
  padding-top: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.section-when {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: var(--spacing-xs);
}

.trigger {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
  font-size: 13px;
  color: var(--color-body);
  margin-bottom: var(--spacing-sm);
}

.trigger-label {
  flex-shrink: 0;
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  background: var(--color-ink);
  color: var(--color-canvas);
}

.tiers {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.tier {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.tier-text {
  font-size: 13px;
  line-height: 1.4;
  color: var(--color-body-strong);
}

.divider {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-muted);
  text-align: center;
}

.divider-cumulative {
  color: var(--color-primary);
}

.vp {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  padding: 3px var(--spacing-xs);
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: var(--color-on-primary);
  line-height: 1;
}

.vp-value {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
}

.vp-unit {
  font-family: var(--font-body);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
  margin-top: 2px;
}

/* The reverse-side action, rendered as a labelled rules panel. */
.action {
  border: 1px solid var(--you);
  border-radius: var(--radius-md);
  background: var(--color-surface-soft);
  padding: var(--spacing-sm) var(--spacing-md);
  margin-top: var(--spacing-md);
}

.action-label {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--you);
}

.action-title {
  font-family: var(--font-display);
  font-size: 19px;
  letter-spacing: -0.3px;
  margin: 2px 0 var(--spacing-xs);
  color: var(--color-ink);
}

.action-rows {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: var(--spacing-sm);
  row-gap: var(--spacing-xxs);
}

.action-rows dt {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--color-muted);
  padding-top: 1px;
  white-space: nowrap;
}

.action-rows dd {
  font-size: 13px;
  line-height: 1.4;
  color: var(--color-body-strong);
}

.foot {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  border-top: 1px solid var(--color-hairline);
  padding-top: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

/* The Disposition you face, as a bordered chip (matches the card footer). */
.faced-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 4px;
  border: 1.5px solid var(--faced);
  border-radius: var(--radius-sm);
  color: var(--faced);
  flex-shrink: 0;
}

.foot-label {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-muted);
}

.foot-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-ink);
}

.rules :deep(b) {
  font-weight: 700;
  color: var(--color-ink);
}

@media (max-width: 640px) {
  .rules {
    padding: var(--spacing-lg);
  }
}
</style>
