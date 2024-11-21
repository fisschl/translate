import { useRoute } from "vue-router";
import { reactiveComputed } from "@vueuse/core";

export const toSearchParams = (
  data: object | null | undefined,
  searchParams = new URLSearchParams(),
) => {
  if (!data) return searchParams;
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "number" || typeof value === "boolean")
      searchParams.set(key, value.toString());
    else if (typeof value === "string") searchParams.set(key, value);
  }
  return searchParams;
};

/**
 * 提取一个对象中所有字符串类型的值。
 */
export const recordQuery = (query: unknown) => {
  const result: Record<string, string | undefined> = {};
  if (!query || typeof query !== "object") return result;
  for (const [key, value] of Object.entries(query)) {
    if (!value) continue;
    if (typeof value === "string") result[key] = value;
  }
  return result;
};

export const useRouteQuery = () => {
  const route = useRoute();
  return reactiveComputed(() => {
    return recordQuery(route.query);
  });
};

export const toString = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "function") return "";
  if (Array.isArray(value)) return value.map(toString).join(",");
  return String(value);
};
