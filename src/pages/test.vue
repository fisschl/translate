<script setup lang="ts">
import { open } from "@tauri-apps/api/dialog";
import { readTextFile } from "@tauri-apps/api/fs";

const openFile = async () => {
  const selected = await open();
  if (typeof selected !== "string") return;
  console.log(selected);
  const contents = await readTextFile(selected);
  console.log(contents);
  if (!contents.startsWith("{")) return;
};
</script>

<template>
  <main>
    <ElButton @click="openFile"> 打开 package-lock.json 文件 </ElButton>
  </main>
</template>

<style scoped></style>
