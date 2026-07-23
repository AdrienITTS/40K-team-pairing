<script setup lang="ts">
import type { TeamSide } from '../../data/pairing'

defineProps<{
  teamSide: TeamSide
  teamName: string
}>()
</script>

<template>
  <div class="selecting">
    <div class="selecting-head" :class="`side-${teamSide.toLowerCase()}`">
      <span class="team-dot" />
      <span class="selecting-team">{{ teamName }}</span>
      <span class="selecting-label">is selecting</span>
    </div>
    <slot />
  </div>
</template>

<style scoped>
/* The banner sits inline with its slotted content (the step label, faction
   tiles and confirm button), so the whole selection reads as one row. It wraps
   on narrow screens. */
.selecting {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-xs) var(--spacing-sm);
}

.selecting-head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-left: 3px solid transparent;
  border-radius: var(--radius-md);
}

.selecting-head.side-a {
  border-left-color: var(--color-accent-teal);
}

.selecting-head.side-b {
  border-left-color: var(--color-accent-amber);
}

.team-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-pill);
}

.side-a .team-dot {
  background: var(--color-accent-teal);
}

.side-b .team-dot {
  background: var(--color-accent-amber);
}

.selecting-team {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-ink);
}

.selecting-label {
  font-size: 13px;
  color: var(--color-muted);
}
</style>
