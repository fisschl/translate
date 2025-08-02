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
} from "snabbdom";
import { unified } from "unified";
import "katex/dist/katex.min.css";

export const patch = init([classModule, propsModule, attributesModule, datasetModule, styleModule]);

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
  const elements = Array.from(doc.body.children).map(async (ele) => {
    if (ele.tagName === "PRE") {
      const child = ele.firstElementChild;
      if (child?.tagName !== "CODE") return ele;
      const codeStr = child.textContent?.trim();
      if (!codeStr) return ele;
      const prefix = "language-";
      const lang = Array.from(child.classList)
        .find((className) => className.startsWith(prefix))
        ?.slice(prefix.length);
      if (!lang || lang === "null" || lang === "undefined") return ele;
      const result = await highlight({ code: codeStr, lang });
      return result || ele;
    }
    return ele;
  });
  return Promise.all(elements);
};
