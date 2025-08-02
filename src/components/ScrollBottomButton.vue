<script setup lang="ts">
defineProps<{
  isShow: boolean;
}>();

const emit = defineEmits(["click"]);

const handleClick = (e: MouseEvent) => {
  emit("click", e);
};
</script>

<template>
  <ElButton v-if="isShow" class="scroll-button backdrop-blur" round @click="handleClick">
    <ILucideArrowDown class="text-base" />
  </ElButton>
</template>

<style scoped>
.scroll-button {
  --el-button-bg-color: light-dark(#fefefe2f, #2121215b);
}
</style>
