<script setup lang="ts">
import { computed } from 'vue'
import { gradeSlug, type EstimateGrade } from '../../data/estimates'

const props = defineProps<{ grade: EstimateGrade | null }>()

// Bind the band colour as a custom property so the chip stays token-driven
// (base.css owns the light/dark values) rather than carrying seven CSS rules.
const accent = computed(() =>
  props.grade
    ? {
        '--grade': `var(--color-grade-${gradeSlug(props.grade)})`,
        '--grade-fg': `var(--color-grade-${gradeSlug(props.grade)}-fg)`,
      }
    : undefined,
)
</script>

<template>
  <span class="grade" :class="{ blank: !grade }" :style="accent">{{ grade ?? '–' }}</span>
</template>

<style scoped>
.grade {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  padding: 2px 5px;
  border-radius: var(--radius-xs);
  background: var(--grade);
  color: var(--grade-fg);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
}

.grade.blank {
  background: transparent;
  border: 1px dashed var(--color-hairline);
  color: var(--color-muted-soft);
  font-weight: 500;
}
</style>
