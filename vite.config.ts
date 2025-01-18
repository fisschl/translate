import { defineConfig } from "vite";
import cssnano from "cssnano";
import legacy from "@vitejs/plugin-legacy";
import tailwindcss from "tailwindcss";
import tailwindNesting from "tailwindcss/nesting";
import postcssPresetEnv from "postcss-preset-env";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  base: "/translate/",
  plugins: [
    react(),
    legacy({
      modernPolyfills: true,
    }),
  ],
  build: {
    cssMinify: false,
  },
  css: {
    devSourcemap: true,
    transformer: "postcss",
    postcss: {
      plugins: [
        tailwindNesting(),
        tailwindcss(),
        postcssPresetEnv(),
        cssnano(),
      ],
    },
  },
});
