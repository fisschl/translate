<script setup lang="ts">
import type { ImageUrlContent } from "./message";

const props = defineProps<{
  content: ImageUrlContent;
}>();

const imageUrl = computed(() => props.content.image_url.url);
</script>

<template>
  <img v-if="imageUrl" :src="imageUrl" alt="image" class="max-w-full" />
</template>
