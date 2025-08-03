<script setup lang="ts">
import { domToVNode, markdownToElement, type MaybeVNode } from "./remark";
import type { FunctionalComponent } from "vue";

const props = defineProps<{
  markdown: string;
}>();

const vNodes = shallowRef<MaybeVNode[]>([]);

watchEffect(() => {
  markdownToElement(props.markdown).then((elements) => {
    vNodes.value = elements.map(domToVNode);
  });
});

const Content: FunctionalComponent = () => {
  return vNodes.value;
};
</script>

<template>
  <Content />
</template>
