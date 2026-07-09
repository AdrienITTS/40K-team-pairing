<script setup lang="ts">
import { computed } from 'vue'
import type { SecondaryMission } from '../data/secondaries'

const props = defineProps<{ mission: SecondaryMission }>()

// A mission that offers a FIXED variant is scored either way; all others are
// purely Tactical. Derive the eyebrow so it is always correct for every card.
const kindLabel = computed(() =>
  props.mission.sections.some((s) => s.chip?.toUpperCase() === 'FIXED')
    ? 'SECONDARY · FIXED / TACTICAL'
    : 'SECONDARY · TACTICAL',
)
</script>

<template>
  <div class="rules" role="group" :aria-label="`${mission.name}, mission details`">
    <p class="eyebrow">{{ kindLabel }}</p>
    <h2 class="mission-name">{{ mission.name }}</h2>

    <!-- Text fields are trusted, build-time HTML from the source card data. -->
    <p v-if="mission.whenDrawn" class="when-drawn" v-html="mission.whenDrawn"></p>

    <div v-for="(section, si) in mission.sections" :key="si" class="section">
      <header class="section-head">
        <span class="section-when">{{ section.when }}</span>
        <span v-if="section.chip" class="chip" :class="`chip-${section.chip.toLowerCase()}`">
          {{ section.chip }}
        </span>
      </header>
      <p class="trigger">
        <span class="trigger-label">WHEN</span>
        <span>{{ section.trigger }}</span>
      </p>
      <ul class="rows">
        <template v-for="(row, ri) in section.rows" :key="ri">
          <li v-if="row.or" class="or-divider" aria-hidden="true">or</li>
          <li class="row">
            <span class="row-text" v-html="row.text"></span>
            <span class="vp" :class="{ 'vp-plus': row.plus }">
              <span class="vp-value">{{ row.vp }}</span>
              <span class="vp-unit">VP</span>
            </span>
          </li>
        </template>
      </ul>
      <p v-if="section.cap" class="cap">{{ section.cap }}</p>
    </div>

    <div v-if="mission.action" class="action">
      <p class="action-title">Action · {{ mission.action.title }}</p>
      <dl class="action-rows">
        <template v-for="(r, ai) in mission.action.rows" :key="ai">
          <dt>{{ r.k }}</dt>
          <dd v-html="r.v"></dd>
        </template>
      </dl>
    </div>

    <p v-if="mission.designerNote" class="designer-note" v-html="mission.designerNote"></p>
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
  margin: 2px 0 var(--spacing-xs);
  color: var(--color-ink);
}

.when-drawn {
  font-size: 12px;
  line-height: 1.45;
  color: var(--color-body);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-left: 3px solid var(--color-primary);
  background: var(--color-surface-soft);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin-bottom: var(--spacing-sm);
}

.section {
  border-top: 1px solid var(--color-hairline);
  padding-top: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.section-when {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-muted);
}

.chip {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 2px var(--spacing-xs);
  border-radius: var(--radius-xs);
  border: 1px solid var(--color-hairline);
  color: var(--color-body-strong);
}

.chip-fixed {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: var(--color-primary-tint);
}

.chip-tactical {
  color: var(--color-accent-teal);
  border-color: var(--color-accent-teal);
  background: var(--color-accent-teal-tint);
}

.trigger {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
  font-size: 13px;
  color: var(--color-body);
  margin-bottom: var(--spacing-xs);
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

.rows {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.row-text {
  font-size: 13px;
  line-height: 1.4;
  color: var(--color-body-strong);
}

.or-divider {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-muted);
  text-align: center;
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

.cap {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--color-muted);
  text-align: right;
  margin-top: var(--spacing-sm);
}

.action {
  border-top: 1px solid var(--color-hairline);
  padding-top: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.action-title {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
}

.action-rows {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--spacing-xxs) var(--spacing-md);
  font-size: 13px;
  line-height: 1.45;
}

.action-rows dt {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--color-muted);
  padding-top: 2px;
}

.action-rows dd {
  color: var(--color-body-strong);
}

.designer-note {
  font-size: 12px;
  font-style: italic;
  line-height: 1.45;
  color: var(--color-muted);
  margin-top: var(--spacing-sm);
}

/* --- Rich inline styling of the source card HTML (bold terms, underlines,
   and amber-highlighted mission keywords), mirroring the printed card. --- */
.rules :deep(b) {
  font-weight: 700;
  color: var(--color-ink);
}

.rules :deep(u) {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}

.rules :deep(.cB__mark) {
  font-weight: 600;
  padding: 0 4px;
  border-radius: var(--radius-xs);
  background: var(--color-accent-amber-tint);
  color: var(--color-accent-amber);
}

.rules :deep(.cB__wmWord) {
  font-weight: 700;
  color: var(--color-ink);
}

@media (max-width: 640px) {
  .rules {
    padding: var(--spacing-lg);
  }
}
</style>
