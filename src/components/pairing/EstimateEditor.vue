<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import EstimateGrid from './EstimateGrid.vue'
import type { Player } from '../../data/pairing'
import type { EstimateTable } from '../../data/estimates'

/**
 * The setup step's estimate grid in a modal, so a captain can fix a grade or a
 * layout preference mid-round without leaving the pairing. Every change applies
 * at once; closing only dismisses the dialog.
 */
defineProps<{
  teamName: string
  ourPlayers: Player[]
  oppPlayers: Player[]
}>()

const table = defineModel<EstimateTable>({ required: true })
const emit = defineEmits<{ close: [] }>()

// A native modal dialog brings the focus trap, Escape and the inert page for free.
const dialogEl = useTemplateRef<HTMLDialogElement>('dialog')
onMounted(() => dialogEl.value?.showModal())

const close = () => dialogEl.value?.close()
</script>

<template>
  <dialog
    ref="dialog"
    class="editor"
    aria-labelledby="estimate-editor-title"
    @close="emit('close')"
    @click.self="close"
  >
    <div class="editor-panel">
      <header class="editor-head">
        <h2 id="estimate-editor-title" class="editor-title">{{ teamName }}'s estimates</h2>
        <button type="button" class="btn-primary" @click="close">Done</button>
      </header>
      <p class="editor-note">
        Changes apply straight away to the estimates panel and the projected result.
      </p>
      <EstimateGrid v-model="table" :our-players="ourPlayers" :opp-players="oppPlayers" />
    </div>
  </dialog>
</template>

<style scoped>
.editor {
  width: min(1100px, calc(100vw - 2 * var(--spacing-md)));
  max-height: calc(100dvh - 2 * var(--spacing-md));
  margin: auto;
  padding: 0;
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  background: var(--color-surface-card);
  color: var(--color-body);
}

.editor::backdrop {
  background: var(--color-scrim);
}

.editor-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
}

.editor-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.editor-title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 500;
  letter-spacing: -0.3px;
  color: var(--color-ink);
}

.editor-note {
  font-size: 13px;
  color: var(--color-muted);
}

@media (max-width: 720px) {
  .editor {
    width: calc(100vw - 2 * var(--spacing-xs));
    max-height: calc(100dvh - 2 * var(--spacing-xs));
  }

  .editor-panel {
    padding: var(--spacing-sm);
  }

  .editor-title {
    font-size: 20px;
  }
}
</style>
