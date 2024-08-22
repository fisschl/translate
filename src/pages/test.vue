<script setup lang="ts">
import { open } from "@tauri-apps/api/dialog";
import {
  BaseDirectory,
  createDir,
  readTextFile,
  writeBinaryFile,
} from "@tauri-apps/api/fs";
import destr from "destr";
import { ofetch } from "ofetch";

const dir = "npm-tgz-temp";

const downloadFile = async (url: string) => {
  const urlInfo = new URL(url);
  const fileName = urlInfo.pathname.split("/").pop();
  if (!fileName) {
    ElMessage.error(`文件名获取失败：${url}`);
    return;
  }
  const result = await ofetch(url, {
    responseType: "blob",
  });
  const buffer = await result.arrayBuffer();
  await writeBinaryFile([dir, fileName].join("/"), new Uint8Array(buffer), {
    dir: BaseDirectory.AppCache,
  });
  console.log(fileName);
};

const openFile = async () => {
  await createDir(dir, {
    dir: BaseDirectory.AppCache,
    recursive: true,
  });
  const selected = await open();
  if (typeof selected !== "string") return;
  const contents = await readTextFile(selected);
  if (!contents.startsWith("{")) return;
  const { packages } = destr<any>(contents);
  for (const { resolved } of Object.values<any>(packages)) {
    if (!resolved) continue;
    try {
      await downloadFile(resolved);
    } catch (e) {
      ElMessage.error(String(e));
      return;
    }
  }
};
</script>

<template>
  <main class="p-6">
    <ElButton @click="openFile"> 打开 package-lock.json 文件 </ElButton>
  </main>
</template>

<style scoped></style>
