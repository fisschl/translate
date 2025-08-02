<script setup lang="ts">
import BookA from "~icons/lucide/book-a";

const route = useRoute();

const menuItems = computed(() => {
  return [
    {
      label: "文本翻译",
      icon: markRaw(BookA),
      to: "/articles",
      active: route.path.startsWith("/articles"),
    },
  ];
});

const defaultActive = computed(() => {
  const item = menuItems.value.find((item) => item.active);
  if (!item) return "";
  return item.to;
});
</script>

<template>
  <ElMenu
    mode="horizontal"
    router
    :default-active="defaultActive"
    class="translate-navigation backdrop-blur-md"
  >
    <ElMenuItem v-for="item in menuItems" :key="item.to" :index="item.to">
      <ElIcon class="mr-2">
        <component :is="item.icon" />
      </ElIcon>
      <span> {{ item.label }} </span>
    </ElMenuItem>
  </ElMenu>
</template>

<style scoped>
.translate-navigation {
  --el-menu-horizontal-height: 3rem;
  --el-menu-bg-color: light-dark(#ffffffb5, #1c1c1c56);
  position: sticky;
  top: 0;
}
</style>
