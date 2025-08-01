import { sxzz } from "@sxzz/eslint-config";
import oxlint from "eslint-plugin-oxlint";

export default sxzz().append(
  ...oxlint.configs["flat/recommended"],
  {
    rules: {
      "import/no-duplicates": "off",
      "vue/no-unused-refs": "off",
      "vue/require-default-prop": "off",
      "vue/component-name-in-template-casing": [
        "error",
        "PascalCase",
        { registeredComponentsOnly: false },
      ],
    },
  },
  {
    ignores: ["**/dist/**", "**/assets/**", "**/*.js", "**/*.d.ts", "**/*.mjs", "**/*.md"],
  },
);
