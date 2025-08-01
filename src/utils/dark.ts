import { useDark } from "@vueuse/core";

export const DarkModeInject: InjectionKey<Ref<boolean>> = Symbol("DarkModeInject");

export const useAutoDarkMode = () => {
  const isDark = useDark();
  provide(DarkModeInject, isDark);
  return isDark;
};

export const useAppIsDark = () => {
  return inject(DarkModeInject)!;
};
