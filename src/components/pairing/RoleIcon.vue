<script setup lang="ts">
import type { PlayerRole } from '../../data/pairing'

defineProps<{ role: PlayerRole }>()
</script>

<template>
  <svg
    v-if="role === 'defender'"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V6l7-3z" />
  </svg>
  <svg
    v-else-if="role === 'attacker'"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M6 20l11-11M17 9l-2-2 3-3 2 2-3 3zM4 20l2-2M14 6l1.5-1.5" />
  </svg>
  <svg
    v-else
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
</template>
