import withNuxt from "./.nuxt/eslint.config.mjs";
import prettier from "eslint-config-prettier";
import oxlint from "eslint-plugin-oxlint";

export default withNuxt()
  .append(...oxlint.configs["flat/recommended"], prettier)
  .removeRules(
    "@typescript-eslint/no-explicit-any",
    "vue/no-v-html",
    "vue/no-multiple-template-root",
  );
