import { codeToHtml } from "shiki";
import "./shiki.css";
import { once } from "lodash-es";

const parser = once(() => new DOMParser());

const getLang = (codeElement: Element) => {
  const prefix = "language-";
  const lang = Array.from(codeElement.classList)
    .find((className) => className.startsWith(prefix))
    ?.replace(prefix, "");
  return lang;
};

const isPreCode = (ele: HTMLElement) => {
  const child = ele.firstElementChild;
  return ele.tagName === "PRE" && child && child.tagName === "CODE";
};

export const updateHighlight = async (ele: HTMLElement) => {
  const list: HTMLElement[] = [];
  if (isPreCode(ele)) list.push(ele);
  Array.from(ele.querySelectorAll("pre")).forEach((ele) => {
    if (isPreCode(ele)) list.push(ele);
  });
  for (const preElement of list) {
    const codeElement = preElement.firstElementChild!;
    const codeStr = codeElement.textContent;
    if (!codeStr) continue;
    const lang = getLang(codeElement);
    if (!lang) continue;
    const html = await codeToHtml(codeStr, {
      lang,
      themes: {
        light: "catppuccin-latte",
        dark: "catppuccin-mocha",
      },
    });
    const doc = parser().parseFromString(html, "text/html");
    const parsedPre = doc.querySelector("pre");
    if (!parsedPre) continue;
    preElement.classList.add(...parsedPre.classList);
    preElement.style.cssText = parsedPre.style.cssText;
    preElement.tabIndex = parsedPre.tabIndex;
    preElement.replaceChildren(...parsedPre.children);
  }
};
