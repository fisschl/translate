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
  vite: {
    server: {
      proxy: {
        "/api": {
          target: "http://14.103.118.144",
          changeOrigin: true,
        },
      },
    },
  },
});
