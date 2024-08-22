<script setup lang="ts">
import "@fontsource-variable/fira-code";
import "@fontsource-variable/noto-sans-sc";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { useDark } from "@vueuse/core";

useDark();
</script>

<template>
  <Suspense>
    <ElConfigProvider :locale="zhCn">
      <RouterView />
    </ElConfigProvider>
  </Suspense>
</template>

<style>
:root {
  color-scheme: dark light;
}

:root:root,
body {
  font-size: 16px !important;
  --el-font-family: "Noto Sans SC Variable";
  font-family: var(--el-font-family), sans-serif;
}

#app {
  height: 100vh;
  overflow: hidden;
}

.el-input input:focus {
  box-shadow: none;
}
</style>
