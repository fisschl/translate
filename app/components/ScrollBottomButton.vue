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
  <UButton
    v-if="isShow"
    class="rounded-full backdrop-blur"
    color="secondary"
    variant="subtle"
    size="xl"
    icon="i-lucide-arrow-down"
    @click="handleClick"
  />
</template>
