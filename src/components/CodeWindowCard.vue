<script setup lang="ts">
defineProps<{
  code: string
}>()
</script>

<template>
  <div class="code-window-card">
    <div class="code-window-chrome" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -- static, author-authored strings only, never user input -->
    <pre class="code-window-body" v-html="code"></pre>
  </div>
</template>

<style scoped>
.code-window-card {
  background: var(--color-surface-dark);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.code-window-chrome {
  display: flex;
  gap: 6px;
  padding: var(--spacing-sm) var(--spacing-lg);
}

.code-window-chrome span {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-pill);
  background: var(--color-on-dark-soft);
  opacity: 0.4;
}

.code-window-body {
  background: var(--color-surface-dark-soft);
  color: var(--color-on-dark);
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.7;
  padding: var(--spacing-lg);
  margin: 0 var(--spacing-lg) var(--spacing-lg);
  border-radius: var(--radius-md);
  overflow-x: auto;
}

.code-window-body :deep(.muted) {
  color: var(--color-on-dark-soft);
}

.code-window-body :deep(.highlight) {
  color: var(--color-primary);
}
</style>
