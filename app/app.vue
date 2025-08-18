<script setup lang="ts">
import "@fontsource-variable/fira-code";
import "~/assets/MiSans/mi-sans.css";
import "~/assets/css/reset.css";
import favicon from "~/assets/icons/favicon.svg";

useHead({
  link: [
    {
      rel: "icon",
      type: "image/svg+xml",
      href: favicon,
    },
  ],
});
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
