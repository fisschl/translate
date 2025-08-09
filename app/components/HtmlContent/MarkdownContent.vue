<script setup lang="ts">
import ContentNode from "./ContentNode.vue";
import { splitMarkdown } from "./remark";
import "@fontsource-variable/fira-code";

const props = defineProps<{
  markdown: string;
}>();

const list = computed(() => {
  return splitMarkdown(props.markdown);
});
</script>

<template>
  <article class="markdown-content prose dark:prose-invert max-w-none">
    <ContentNode v-for="(text, index) in list" :key="index" v-memo="[text]" :markdown="text" />
  </article>
</template>

<style scoped></style>
