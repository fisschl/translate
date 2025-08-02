<script setup lang="ts">
import { appendMarkdown } from "./remark";
import "@fontsource-variable/fira-code";

const props = defineProps<{
  markdown: string;
}>();

const container = useTemplateRef("container-element");

watchEffect(() => {
  if (!container.value) return;
  const { markdown } = props;
  const element = container.value;
  if (!element) return;
  appendMarkdown(element, markdown);
});
</script>

<template>
  <div ref="container-element" class="markdown-content" />
</template>

<style scoped>
.markdown-content :deep(code) {
  font-family: var(--font-mono);
}
</style>
