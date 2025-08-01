<script setup lang="ts">
import pLimit from "p-limit";
import { MarkdownHandler } from "./remark";
import "@fontsource-variable/fira-code";

const props = defineProps<{
  markdown: string;
  size?: "sm" | "base";
}>();

const limit = pLimit(1);
const container = useTemplateRef("container-element");

const handler = shallowRef<MarkdownHandler | null>(null);
onMounted(() => {
  if (!container.value) return;
  handler.value = new MarkdownHandler({ container: container.value });
});

watchEffect(() => {
  if (!handler.value) return;
  const content = props.markdown;
  limit(async () => {
    await handler.value?.update(content);
  });
});
</script>

<template>
  <article
    ref="container-element"
    :class="[
      'prose dark:prose-invert max-w-none',
      size === 'sm' && 'prose-sm',
      size === 'base' && 'prose-base',
    ]"
  />
</template>

<style scoped>
.prose :deep(code) {
  font-family: "Fira Code Variable", monospace;
}
</style>

<style>
/* Shiki 语法高亮深色模式支持 */
html.dark .shiki,
html.dark .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
  /* Optional, if you also want font styles */
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}
</style>
