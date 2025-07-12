<script setup lang="ts">
import pLimit from "p-limit";
import { updateMarkdownContainer } from "./remark";
import "./markdown.css";
import "@fontsource-variable/fira-code";

const props = defineProps<{
  markdown: string;
}>();

const limit = pLimit(1);
const container = useTemplateRef("container-element");
const content = computed(() => {
  if (!container.value) return;
  return props.markdown;
});

watch(content, (value) => {
  if (!value) return;
  limit(async () => {
    const ele = container.value;
    if (!ele) return;
    await updateMarkdownContainer(ele, value);
  });
});
</script>

<template>
  <article
    ref="container-element"
    class="markdown-content font-sans text-gray-800 dark:text-gray-100"
  ></article>
</template>
