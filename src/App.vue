<script setup lang="ts">
import { debounce } from "lodash-es";
import { ofetch } from "ofetch";
import { watchEffect } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const report_visit = debounce((body: Record<string, any>) => {
  ofetch("/api/visit_log", {
    method: "POST",
    body,
  });
}, 500);

watchEffect(() => {
  if (typeof navigator === "undefined" || !navigator.userAgent) return;
  const { fullPath } = route;
  if (!fullPath) return;
  report_visit({
    full_path: fullPath,
    ua: navigator.userAgent,
  });
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
