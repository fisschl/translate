<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { EditorContent } from "@tiptap/vue-3";

defineProps<{
  editor?: Editor;
}>();
</script>

<template>
  <EditorContent
    :editor="editor"
    class="editor-content rounded-md border-gray-300 focus-within:border-blue-500 dark:border-gray-600"
  />
</template>

<style scoped>
.editor-content {
  border-width: 2px;
  border-style: dashed;
  min-height: 3rem;
}

.editor-content :deep(.tiptap) {
  min-height: 4rem;
  padding: 0.5rem 0.75rem;
  max-width: none;
}

.editor-content :deep(.tiptap:focus) {
  outline: none;
}

.editor-content :deep(p.is-editor-empty:first-child::before) {
  color: var(--color-gray-400);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
