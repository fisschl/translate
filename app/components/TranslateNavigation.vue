<script setup lang="ts">
const route = useRoute();

const menuItems = computed(() => {
  return [
    {
      label: "文本翻译",
      icon: "i-lucide-book-a",
      to: "/articles",
      active: route.path.startsWith("/articles"),
    },
    {
      label: "变量命名",
      icon: "i-lucide-apple",
      to: "/variable",
      active: route.path.startsWith("/variable"),
    },
    {
      label: "编程助手",
      icon: "i-lucide-code-2",
      to: "/coding-assistant",
      active: route.path.startsWith("/coding-assistant"),
      disabled: true,
    },
  ];
});
</script>

<template>
  <UNavigationMenu
    :items="menuItems"
    :class="$style.translateNavigation"
    class="bg-neutral-100/30 px-6 backdrop-blur-md dark:bg-neutral-900/30"
  />
</template>

<style module>
.translateNavigation {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--ui-border);
}
</style>
