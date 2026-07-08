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
.selecting {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.selecting-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
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
