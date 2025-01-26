<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
onMounted(() => {
  router.replace("/articles");
});
</script>

<template>
  <div class="flex h-dvh items-center justify-center">
    <p class="text-lg">Redirecting...</p>
  </div>
</template>
