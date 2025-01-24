import { sxzz } from "@sxzz/eslint-config";

export default sxzz([
  {
    rules: {
      "@eslint-community/eslint-comments/no-unlimited-disable": "off",
      "vue/no-unused-refs": "off",
      "vue/component-name-in-template-casing": [
        "error",
        "PascalCase",
        { registeredComponentsOnly: false },
      ],
      "vue/require-default-prop": "off",
      "vue/multi-word-component-names": "off",
    },
  },
]);
