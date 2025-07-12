import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import remarkMath from "remark-math";
import rehypeStringify from "rehype-stringify";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { domParser, updateHighlight } from "./shiki";
import type { VNode } from "snabbdom";

export const markdownToHtml = async (markdown: string) => {
  const result = await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(markdown);
  const doc = domParser().parseFromString(result.toString(), "text/html");
  return Array.from(doc.body.children);
};

const vNodeCache = new WeakMap<Element, (VNode | undefined)[]>();

const isNodeEqual = (left?: Element, right?: Element) => {
  if (!left || !right) return false;
  return left.outerHTML === right.outerHTML;
};

export const updateMarkdownContainer = async (container: HTMLElement, markdown: string) => {
  const leftList = Array.from(container.children);
  const rightList = await markdownToHtml(markdown);
  const length = Math.max(leftList.length, rightList.length);
  const { updateElement } = await import("./snabbdom");
  const vNodeList = vNodeCache.get(container) || [];
  for (let i = 0; i < length; i++) {
    const leftNode = leftList[i];
    let rightNode = rightList[i];
    if (isNodeEqual(leftNode, rightNode)) continue;
    if (!rightNode) {
      leftNode?.remove();
      vNodeList[i] = undefined;
      continue;
    }
    rightNode = await updateHighlight(rightNode);
    if (!leftNode) {
      const emptyNode = document.createElement(rightNode.tagName);
      container.appendChild(emptyNode);
      vNodeList[i] = updateElement(emptyNode, rightNode);
      continue;
    }
    const vNode = vNodeList[i];
    if (!vNode) {
      leftNode.remove();
      continue;
    }
    vNodeList[i] = updateElement(vNode, rightNode);
  }
  vNodeCache.set(container, vNodeList);
};
