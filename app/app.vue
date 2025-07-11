<script lang="ts" setup>
import "./assets/css/main.css";

useHead({
  link: [
    {
      rel: "icon",
      type: "image/svg+xml",
      href: "/favicon.svg",
    },
  ],
});
</script>

<template>
  <UApp> <NuxtPage /> </UApp>
</template>
