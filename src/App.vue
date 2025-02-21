<script setup lang="ts">
import { debounce } from "lodash-es";
import { ofetch } from "ofetch";
import { watchEffect } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const reportVisit = debounce(() => {
  ofetch("/api/visit_log", {
    method: "POST",
    body: {
      full_path: location.href,
      ua: navigator.userAgent,
    },
  });
}, 500);

watchEffect(() => {
  if (!route.fullPath) return;
  if (typeof navigator === "undefined" || !navigator.userAgent) return;
  reportVisit();
});
</script>

<template>
  <UApp>
    <RouterView />
  </UApp>
</template>

<style>
html:root {
  font-family: "Open Sans Variable", "Noto Sans SC Variable", sans-serif;
  font-size: 16px !important;
}

:root body {
  font-family: inherit;
}

body code {
  font-family: "Fira Code Variable", monospace;
}
</style>
