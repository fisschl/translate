import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import remarkMath from "remark-math";
import rehypeStringify from "rehype-stringify";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export const markdownToHtml = async (markdown: string) => {
  const result = await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(markdown);
  return result.toString();
};
