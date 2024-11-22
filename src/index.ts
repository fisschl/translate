import { reactiveComputed } from "@vueuse/core";
import { debounce } from "lodash-es";
import { useRoute } from "vue-router";

/**
 * 生成 URLSearchParams 对象
 */
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

export { debounce };

/**
 * 删除对象中的属性
 */
export const unset = (data: any, key: string) => {
  delete data[key];
};

/**
 * 清空一个对象
 */
export const clearObject = <T extends object>(data: T) => {
  Object.keys(data).forEach((key) => unset(data, key));
};

/**
 * 从当前路由中提取所有字符串类型的查询参数。
 */
export const useRouteQuery = () => {
  const route = useRoute();
  return reactiveComputed(() => {
    return recordQuery(route.query);
  });
};
