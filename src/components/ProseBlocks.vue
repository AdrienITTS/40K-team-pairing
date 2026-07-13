<script setup lang="ts">
import { computed } from 'vue'

// Renders a section string (from analysis.ts) as a mix of paragraphs and bullet
// lists: lines prefixed with "• " are grouped into a <ul>, everything else is a
// paragraph. Keeps the source's scoring tables readable.
const props = defineProps<{ text: string }>()

interface Block {
  type: 'p' | 'ul'
  text?: string
  items?: string[]
}

const blocks = computed<Block[]>(() => {
  const out: Block[] = []
  let list: string[] | null = null
  for (const raw of props.text.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('• ')) {
      if (!list) {
        list = []
        out.push({ type: 'ul', items: list })
      }
      list.push(line.slice(2))
    } else {
      list = null
      out.push({ type: 'p', text: line })
    }
  }
  return out
})
</script>

<template>
  <div class="prose">
    <template v-for="(b, i) in blocks" :key="i">
      <ul v-if="b.type === 'ul'">
        <li v-for="(item, j) in b.items" :key="j">{{ item }}</li>
      </ul>
      <p v-else>{{ b.text }}</p>
    </template>
  </div>
</template>

<style scoped>
.prose {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.prose p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-body);
}

.prose ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: var(--spacing-xs);
}

.prose li {
  position: relative;
  padding-left: var(--spacing-md);
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--color-body-strong);
}

.prose li::before {
  content: '';
  position: absolute;
  left: 3px;
  top: 8px;
  width: 5px;
  height: 5px;
  border-radius: var(--radius-full, 999px);
  background: var(--disp, var(--color-primary));
}
</style>
