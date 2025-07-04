export default defineNuxtConfig({
  app: {
    baseURL: "/translate/",
  },
  modules: ["@nuxt/devtools", "@nuxt/ui", "@vueuse/nuxt", "@nuxt/eslint", "@pinia/nuxt"],
  ui: {
    fonts: false,
  },
  compatibilityDate: "2025-06-27",
  future: {
    compatibilityVersion: 4,
  },
});
