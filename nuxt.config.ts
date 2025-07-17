export default defineNuxtConfig({
  app: {
    baseURL: "/translate/",
  },
  modules: ["@nuxt/devtools", "@nuxt/ui", "@vueuse/nuxt", "@nuxt/eslint", "@pinia/nuxt"],
  ui: {
    fonts: false,
  },
  nitro: {
    preset: "bun",
  },
  routeRules: {
    "/": { redirect: "/articles" },
  },
});
