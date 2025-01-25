<script setup lang="ts">
import { useClipboard } from "@vueuse/core";
import { pascalCase } from "change-case";
import { v7 as uuid } from "uuid";
import AppHeader from "@/components/AppHeader.vue";
import { changeCaseOptions } from "@/utils/change-case";
import { socket } from "@/utils/socket";

const request = reactive({
  text: "",
  case: "pascalCase",
});

const loading = ref(false);
const textResult = ref("");

const wordsResult = computed((): string[] => {
  const result = textResult.value.matchAll(/\w+/g);
  const caseItem = changeCaseOptions.find(
    (item) => item.value === request.case,
  );
  const action = caseItem?.action || pascalCase;
  return Array.from(result).map(([item]) => {
    return action(item);
  });
});

const effects: (() => unknown)[] = [];
const clearEffects = () => {
  effects.forEach((fn) => fn());
  effects.length = 0;
};

const startSend = () => {
  const text = request.text.trim();
  if (!text) return;
  request.text = text;
  clearEffects();
  const key = uuid();
  socket().emit("variables", {
    ...request,
    key,
  });
  loading.value = true;
  const handler = (response: Record<string, any>) => {
    const { text, finished } = response;
    if (finished) loading.value = false;
    if (!text) return;
    textResult.value = text;
  };
  socket().on(key, handler);
  effects.push(() => socket().off(key, handler));
};

const clipboard = reactive(useClipboard());
</script>

<template>
  <AppHeader class="justify-center px-2 pt-1" />
  <main class="mt-4 flex gap-5 px-4 pb-6">
    <div class="flex-1">
      <UForm
        :state="request"
        class="mb-4 flex justify-center gap-3"
        @submit="startSend"
      >
        <UFormField name="text">
          <UInput
            v-model="request.text"
            style="min-width: 10rem"
            size="md"
            placeholder="请输入描述"
          />
        </UFormField>
        <UButton type="submit" icon="i-tabler-sparkles"> 开始生成 </UButton>
      </UForm>
      <div class="flex flex-wrap justify-center gap-x-4 gap-y-3">
        <UButton
          v-for="item in wordsResult"
          :key="item"
          variant="soft"
          class="word-result-button"
          @click="clipboard.copy(item)"
        >
          {{ item }}
          <UIcon
            v-if="clipboard.copied && clipboard.text === item"
            name="i-tabler-check"
          />
        </UButton>
        <UIcon
          v-if="loading"
          name="i-tabler-loader-2"
          style="font-size: 20px"
          class="animate-spin"
        />
      </div>
    </div>
    <URadioGroup
      v-model="request.case"
      class="radio-group"
      :items="changeCaseOptions"
    />
  </main>
</template>

<style scoped>
.word-result-button {
  font-family: "Fira Code Variable", monospace;
  font-size: 1rem;
}

.radio-group :deep(fieldset) {
  gap: 1rem;
}

.radio-group :deep(label) {
  font-family: "Fira Code Variable", monospace;
}
</style>
