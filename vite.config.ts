import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import AutoImport from "unplugin-auto-import/vite";
import IconsResolver from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import TurboConsole from "unplugin-turbo-console/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
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
    vueDevTools(),
    tailwindcss(),
    AutoImport({
      imports: ["vue", VueRouterAutoImports],
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      deep: false,
      resolvers: [IconsResolver(), ElementPlusResolver()],
    }),
    Icons({ compiler: "vue3" }),
    TurboConsole({}),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
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
  server: {
    proxy: {
      "/api": {
        target: "https://bronya.world",
        changeOrigin: true,
      },
    },
  },
});
