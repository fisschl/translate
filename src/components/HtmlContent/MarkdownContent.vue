<script setup lang="ts">
import {
  attributesModule,
  classModule,
  datasetModule,
  init,
  propsModule,
  styleModule,
  toVNode,
  type VNode,
} from "snabbdom";
import { markdownToElement } from "./remark";
import "@fontsource-variable/fira-code";

const props = defineProps<{
  markdown: string;
}>();
const patch = init([classModule, propsModule, attributesModule, datasetModule, styleModule]);

const container = useTemplateRef("container-element");

const lastVNode = shallowRef<VNode | null>(null);

watchEffect(() => {
  if (!container.value) return;
  const { markdown } = props;
  const element = container.value;
  if (!element) return;
  markdownToElement(markdown).then(async (elements) => {
    await nextTick();
    const article = document.createElement("article");
    article.classList.add("prose", "dark:prose-invert", "max-w-none");
    article.append(...elements);
    if (lastVNode.value) {
      lastVNode.value = patch(lastVNode.value, toVNode(article));
      return;
    }
    const placeholder = document.createElement("article");
    element.append(placeholder);
    lastVNode.value = patch(placeholder, toVNode(article));
  });
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
