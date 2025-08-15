<script setup lang="ts">
import { EditorContent, type Editor } from "@tiptap/vue-3";

const props = defineProps<{
  editor?: Editor;
}>();

const handleClick = (e: MouseEvent) => {
  const { target } = e;
  if (!(target instanceof Element)) return;
  const tiptap = target.closest(".tiptap");
  if (tiptap) return;
  props.editor?.commands.focus();
};
</script>

<template>
  <EditorContent
    :editor="editor"
    class="editor-content rounded-md border-gray-300 focus-within:border-blue-500 dark:border-gray-600"
    @click="handleClick"
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
