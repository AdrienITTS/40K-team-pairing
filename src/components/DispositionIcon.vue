<script setup lang="ts">
import type { DispositionSymbol } from '../data/dispositions'

defineProps<{ symbol: DispositionSymbol }>()
</script>

<template>
  <!-- Line-art versions of the five Force Disposition symbols, drawn in
       currentColor so callers tint them via the disposition accent token. -->
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- Take and Hold — a crenellated keep -->
    <g v-if="symbol === 'keep'">
      <path d="M4 21v-9h16v9M4 12V8l2-2v2h2V4l2-2 2 2v2h2V6l2 2v4" />
      <path d="M10 21v-4a2 2 0 0 1 4 0v4" />
    </g>
    <!-- Purge the Foe — an upright sword -->
    <g v-else-if="symbol === 'sword'">
      <path d="M12 2l2 4v9h-4V6l2-4zM8 15h8M12 15v6" />
    </g>
    <!-- Disruption — a lit bomb. Fuse leaves the top-centre and curls right so
         it reads as a bomb rather than a ♂ glyph. -->
    <g v-else-if="symbol === 'bomb'">
      <circle cx="11" cy="15.5" r="6" />
      <path d="M11 9.5c0-2.4 1.3-3.6 3.2-3.6" />
      <path d="M15 4.4l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5z" />
    </g>
    <!-- Reconnaissance — an eye -->
    <g v-else-if="symbol === 'eye'">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </g>
    <!-- Priority Assets — a navigation arrow -->
    <path v-else d="M3 11l18-8-8 18-2.5-7.5z" />
  </svg>
</template>

<style scoped>
svg {
  width: 100%;
  height: 100%;
}
</style>
