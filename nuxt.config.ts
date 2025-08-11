export default defineNuxtConfig({
  modules: ["@nuxt/ui", "@nuxt/eslint", "@pinia/nuxt", "@vueuse/nuxt"],
  css: ["~/assets/css/main.css"],
  ui: { fonts: false },
  devtools: { enabled: true },
  nitro: {
    preset: "bun",
  },
  app: {
    baseURL: "/translate/",
    head: {
      link: [
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/translate/favicon.svg",
        },
      ],
    },
  },
  compatibilityDate: "2025-08-09",
});
