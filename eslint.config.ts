import withNuxt from "./.nuxt/eslint.config.mjs";
import prettier from "eslint-config-prettier";

export default withNuxt()
  .removeRules(
    "@typescript-eslint/no-explicit-any",
    "vue/no-v-html",
    "vue/no-multiple-template-root",
  )
  .append(prettier);
