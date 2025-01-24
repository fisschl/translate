<script setup lang="ts">
const links = [
  {
    label: "翻译",
    icon: "i-tabler-language-hiragana",
    to: "/articles",
  },
  {
    label: "命名",
    icon: "i-tabler-writing-sign",
    to: "/variables",
  },
];
</script>

<template>
  <UNavigationMenu :items="links" />
</template>

<style scoped></style>
