<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const items = ref<NavigationMenuItem[]>([
  {
    label: "文本翻译",
    icon: "i-lucide-book-a",
    to: "/articles",
  },
]);
</script>

<template>
  <UNavigationMenu :items="items" class="w-full justify-center py-1 backdrop-blur-lg" />
</template>
