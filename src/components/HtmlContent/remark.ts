import { once } from "lodash-es";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { codeToHtml } from "shiki";
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
import { unified } from "unified";
import "katex/dist/katex.min.css";

const patch = init([classModule, propsModule, attributesModule, datasetModule, styleModule]);

export const domParser = once(() => new DOMParser());

const highlight = async (options: {
  code: string;
  lang: string;
}): Promise<HTMLPreElement | undefined> => {
  try {
    const html = await codeToHtml(options.code, {
      lang: options.lang,
      themes: { light: "catppuccin-latte", dark: "catppuccin-mocha" },
      defaultColor: "light-dark()",
    });
    const doc = domParser().parseFromString(html, "text/html");
    return doc.querySelector("pre") || undefined;
  } catch {
    return;
  }
};

const handlePreElement = (ele: Element): Promise<HTMLPreElement | undefined> | undefined => {
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
  return highlight({ code: codeStr, lang });
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
  const doc = domParser().parseFromString(result.toString(), "text/html");
  return Array.from(doc.body.children);
};

const elementCache = new WeakMap<Element, VNode>();

export const updateElement = (oldNode: Element, newNode: Element) => {
  const vNode = elementCache.get(oldNode);
  const result = vNode ? patch(vNode, toVNode(newNode)) : toVNode(newNode);
  elementCache.set(oldNode, result);
  return result;
};

export const appendMarkdown = async (element: HTMLElement, markdown: string) => {
  const elements = await markdownToElement(markdown);
  const article = document.createElement("article");
  article.classList.add("prose", "dark:prose-invert", "max-w-none");
  article.append(...elements);
  for (const element of article.children) {
    if (element.tagName === "PRE") {
      const pre = await handlePreElement(element);
      if (pre) element.replaceWith(pre);
    }
  }
  const oldArticle = element.querySelector("article");
  if (oldArticle) updateElement(oldArticle, article);
  else element.append(article);
};
