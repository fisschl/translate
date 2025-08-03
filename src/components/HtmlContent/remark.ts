import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkStringify from "remark-stringify";
import { codeToHtml } from "shiki";
import { unified } from "unified";
import { h, type VNode } from "vue";
import type { Root } from "mdast";
import "katex/dist/katex.min.css";

export const domParser = new DOMParser();

export function splitMarkdown(markdownText: string): string[] {
  const processor = unified().use(remarkParse).use(remarkStringify);
  const { children } = processor.parse(markdownText);
  return children.map((node) => {
    const tempAst: Root = {
      type: "root",
      children: [node],
    };
    return processor.stringify(tempAst).trim();
  });
}

const handlePreCode = async (ele: Element) => {
  if (ele.tagName !== "PRE") return;
  const child = ele.firstElementChild;
  if (child?.tagName !== "CODE") return;
  const codeStr = child.textContent?.trim();
  if (!codeStr) return;
  const prefix = "language-";
  const lang = Array.from(child.classList)
    .find((className) => className.startsWith(prefix))
    ?.slice(prefix.length);
  if (!lang || lang === "null" || lang === "undefined") return;
  try {
    const html = await codeToHtml(codeStr, {
      lang,
      themes: { light: "catppuccin-latte", dark: "catppuccin-mocha" },
      defaultColor: "light-dark()",
    });
    const doc = domParser.parseFromString(html, "text/html");
    return doc.querySelector("pre") || undefined;
  } catch {
    return;
  }
};

export const markdownToElement = async (markdown: string) => {
  const result = await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(markdown);
  const doc = domParser.parseFromString(result.toString(), "text/html");
  for (const element of doc.querySelectorAll("pre")) {
    const pre = await handlePreCode(element);
    if (pre) element.replaceWith(pre);
  }
  return Array.from(doc.body.children);
};

export type MaybeVNode = VNode | null | string;

export function domToVNode(dom: Node): MaybeVNode {
  if (dom.nodeType === Node.TEXT_NODE) return dom.textContent || null;
  if (!(dom instanceof Element)) return null;

  const props: Record<string, string> = {};
  Array.from(dom.attributes).forEach((attr) => {
    props[attr.name] = attr.value;
  });

  const children = Array.from(dom.childNodes)
    .map((child) => domToVNode(child))
    .filter((child) => child !== null);

  return h(dom.tagName.toLowerCase(), props, children);
}
