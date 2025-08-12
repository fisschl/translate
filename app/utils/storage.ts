import { get, set, del } from "idb-keyval";

export const joinGlobalPath = (...keys: string[]) => {
  return ["translate", ...keys].join(":");
};

export const storage = {
  getItem: async (key: string) => {
    const value = await get(joinGlobalPath(key));
    return value ?? null;
  },
  setItem: async (key: string, value: string) => {
    await set(joinGlobalPath(key), value);
  },
  removeItem: async (key: string) => {
    await del(joinGlobalPath(key));
  },
};
