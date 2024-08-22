import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import VueJsx from "@vitejs/plugin-vue-jsx";
import VueRouter from "unplugin-vue-router/vite";
import Icons from "unplugin-icons/vite";
import { VueRouterAutoImports } from "unplugin-vue-router";
import IconsResolver from "unplugin-icons/resolver";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import tailwindcss from "tailwindcss";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import path from "node:path";

export default defineConfig({
  plugins: [
    VueRouter({
      exclude: ["**/utils/**", "**/components/**", "**/assets/**"],
    }),
    vue(),
    VueJsx(),
    AutoImport({
      imports: ["vue", VueRouterAutoImports],
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      deep: false,
      resolvers: [IconsResolver(), ElementPlusResolver()],
    }),
    Icons({}),
  ],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  build: {
    cssMinify: "lightningcss",
  },
  css: {
    devSourcemap: true,
    transformer: "postcss",
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve("./src"),
    },
  },
});
