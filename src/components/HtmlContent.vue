<script setup lang="ts">
import {
  attributesModule,
  classModule,
  datasetModule,
  fragment,
  init,
  propsModule,
  styleModule,
  toVNode,
  type VNode,
} from "snabbdom";
import { useTemplateRef, watchEffect } from "vue";

const props = defineProps<{
  content?: string;
}>();

const articleElement = useTemplateRef<HTMLElement>("article-element");

const patch = init(
  [classModule, propsModule, attributesModule, datasetModule, styleModule],
  undefined,
  { experimental: { fragments: true } },
);

const parser = new DOMParser();

const cache: { vNode?: VNode } = {};

const createInnerElement = (article: HTMLElement) => {
  const element = document.createElement("p");
  article.replaceChildren(element);
  return element;
};

watchEffect(() => {
  const html = props.content;
  if (!html) return;
  const element = articleElement.value;
  if (!element) return;
  const { body } = parser.parseFromString(html, "text/html");
  const nodes = Array.from(body.children).map((node) => toVNode(node));
  const oldNode = cache.vNode || createInnerElement(element);
  cache.vNode = patch(oldNode, fragment(nodes));
});
</script>

<template>
  <article ref="article-element" />
</template>
