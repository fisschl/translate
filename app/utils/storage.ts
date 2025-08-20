import { debounce } from "lodash-es";
import { watchIgnorable } from "@vueuse/core";

export const useIdb = <T extends object>(options: {
  key: string;
  defaultValue: T;
  parse?: (data: unknown) => T | Promise<T>;
  onReady?: (data: T) => void;
}) => {
  const data = ref<T>(options.defaultValue);

  const setData = debounce(async () => {
    const idb = await import("./idb").then(({ idb }) => idb);
    if (!data.value) {
      await idb.del(options.key);
      return;
    }
    await idb.set(options.key, JSON.stringify(data.value));
  }, 600);

  const { ignoreUpdates } = watchIgnorable(data, setData, { deep: true });

  onMounted(async () => {
    const idb = await import("./idb").then(({ idb }) => idb);
    try {
      const stringValue = await idb.get(options.key);
      if (!stringValue) return;
      const objectValue = JSON.parse(stringValue);
      const parsedValue = options.parse ? await options.parse(objectValue) : objectValue;
      ignoreUpdates(() => (data.value = parsedValue));
      await nextTick();
    } catch (error) {
      console.error(error);
    } finally {
      if (options.onReady) options.onReady(data.value);
    }
  });

  return data;
};
