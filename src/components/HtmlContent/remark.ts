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

export const updateElement = (oldNode: Element | VNode, newNode: Element) => {
  return patch(oldNode, toVNode(newNode));
};

export const domParser = once(() => new DOMParser());

const highlight = async (options: {
  code: string;
  lang: string;
}): Promise<HTMLPreElement | undefined> => {
  try {
    const html = await codeToHtml(options.code, {
      lang: options.lang,
      themes: { light: "catppuccin-latte", dark: "catppuccin-mocha" },
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

export class MarkdownHandler {
  private container: HTMLElement;

  constructor(options: { container: HTMLElement }) {
    this.container = options.container;
  }

  vNodeCache: (VNode | undefined)[] = [];
  htmlCache: (string | undefined)[] = [];

  async handleElement(element: Element) {
    return (await handlePreElement(element)) || element;
  }

  async update(content: string) {
    const leftList = Array.from(this.container.children);
    const rightList = await markdownToElement(content);
    const length = Math.max(leftList.length, rightList.length);
    for (let i = 0; i < length; i++) {
      const leftNode = leftList[i];
      const rightNode = rightList[i];
      if (!rightNode) {
        leftNode?.remove();
        this.vNodeCache[i] = undefined;
        this.htmlCache[i] = undefined;
        continue;
      }
      if (leftNode && this.htmlCache[i] === rightNode.outerHTML) continue;
      this.htmlCache[i] = rightNode.outerHTML;
      const willUpdate = await this.handleElement(rightNode);
      if (!leftNode) {
        const emptyNode = document.createElement(willUpdate.tagName);
        this.container.append(emptyNode);
        this.vNodeCache[i] = updateElement(emptyNode, willUpdate);
        continue;
      }
      const vNode = this.vNodeCache[i];
      if (!vNode) {
        leftNode.remove();
        continue;
      }
      this.vNodeCache[i] = updateElement(vNode, willUpdate);
    }
  }
}
