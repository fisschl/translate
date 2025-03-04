import { debounce } from "lodash-es";
import { ofetch } from "ofetch";

export const reportVisit = debounce(() => {
  if (typeof window === "undefined") return;
  if (location.hostname.includes("localhost")) return;
  ofetch("/api/visit", {
    baseURL: "https://bronya.world",
    method: "POST",
    body: {
      full_path: location.href,
      ua: navigator.userAgent,
    },
  });
}, 500);
