import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import VueRouter from "unplugin-vue-router/vite";

export default defineConfig({
  base: "/translate/",
  plugins: [VueRouter({}), vue()],
});
