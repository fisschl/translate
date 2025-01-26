import path from "node:path";
import ui from "@nuxt/ui/vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
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
    ui(),
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
    /**
     * 修复 Chrome 112 兼容性问题
     */
    cssMinify: false,
  },
  css: {
    transformer: "lightningcss",
    lightningcss: {
      targets: browserslistToTargets(browserslist()),
    },
  },
});
