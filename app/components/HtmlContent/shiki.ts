import { once } from "lodash-es";
import { codeToHtml } from "shiki";

export const domParser = once(() => new DOMParser());

const getLanguage = (codeElement: Element) => {
  const prefix = "language-";
  const lang = Array.from(codeElement.classList)
    .find((className) => className.startsWith(prefix))
    ?.replace(prefix, "");
  return lang;
};

const highlightElement = async (ele: Element): Promise<HTMLPreElement | undefined> => {
  if (ele.tagName !== "PRE") return;
  const child = ele.firstElementChild;
  if (child?.tagName !== "CODE") return;
  const codeStr = child.textContent?.trim();
  if (!codeStr) return;
  const lang = getLanguage(child);
  if (!lang) return;
  try {
    const html = await codeToHtml(codeStr, {
      lang,
      themes: {
        light: "catppuccin-latte",
        dark: "catppuccin-mocha",
      },
    });
    const doc = domParser().parseFromString(html, "text/html");
    return doc.querySelector("pre") || undefined;
  } catch (error) {
    console.error(error);
    return;
  }
};

export const updateHighlight = async (ele: Element): Promise<Element> => {
  const selfResult = await highlightElement(ele);
  if (selfResult) return selfResult;
  for (const element of ele.querySelectorAll("pre")) {
    const result = await highlightElement(element);
    if (result) element.replaceWith(result);
  }
  return ele;
};
