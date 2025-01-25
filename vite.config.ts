import path from "node:path";
import ui from "@nuxt/ui/vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import AutoImport from "unplugin-auto-import/vite";
import IconsResolver from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import Components from "unplugin-vue-components/vite";
import { VueRouterAutoImports } from "unplugin-vue-router";
import VueRouter from "unplugin-vue-router/vite";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";

export default defineConfig({
  base: "/translate/",
  plugins: [
    VueRouter({
      exclude: ["**/utils/**", "**/components/**", "**/assets/**"],
    }),
    vue(),
    vueJsx(),
    AutoImport({
      imports: ["vue", VueRouterAutoImports],
    }),
    ui(),
    Components({
      deep: false,
      resolvers: [IconsResolver()],
    }),
    Icons({}),
    vueDevTools(),
  ],
  server: {
    proxy: {
      "/api/": {
        target: "https://bronya.world",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve("./src"),
    },
  },
  build: {
    cssMinify: "lightningcss",
  },
  css: {
    transformer: "lightningcss",
    lightningcss: {
      targets: browserslistToTargets(browserslist()),
    },
  },
});
