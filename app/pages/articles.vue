<script setup lang="ts">
import { useChat } from "@ai-sdk/vue";

const { messages, input, handleSubmit, status } = useChat({
  api: "/translate/api/chat",
});

const formState = reactive({
  input,
  sendOnPaste: true,
});

const handleFormSubmit = async (e: Event) => {
  input.value = input.value.trim();
  await nextTick();
  handleSubmit(e, {
    data: {
      prompt: "请将以下内容翻译成中文：",
    },
  });
};

const handleKeyDown = (e: KeyboardEvent) => {
  // 检测粘贴快捷键 (Ctrl+V 或 Cmd+V)
  if ((e.ctrlKey || e.metaKey) && e.key === "v" && formState.sendOnPaste) {
    setTimeout(() => {
      handleFormSubmit(e);
    }, 60);
    return;
  }
  // 检测回车键发送
  if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
    e.preventDefault();
    handleFormSubmit(e);
    return;
  }
};
</script>

<template>
  <TranslateNavigation class="sticky top-0 bg-neutral-50/50 dark:bg-neutral-900/50" />
  <UContainer class="flex flex-col">
    <ol class="my-8 flex flex-1 flex-col gap-5">
      <li v-for="message in messages" :key="message.id" class="flex flex-col">
        <template v-if="message.role === 'user'">
          <template v-for="(part, index) in message.parts" :key="index">
            <pre
              v-if="part.type === 'text'"
              class="self-end font-sans whitespace-pre-wrap text-gray-500 dark:text-gray-400"
              style="max-width: 80%"
              v-text="part.text"
            ></pre>
          </template>
        </template>
        <template v-else-if="message.role === 'assistant'">
          <template v-for="(part, index) in message.parts" :key="index">
            <pre
              v-if="part.type === 'text'"
              class="self-start font-sans whitespace-pre-wrap text-gray-800 dark:text-gray-100"
              v-text="part.text"
            ></pre>
          </template>
        </template>
      </li>
    </ol>
    <UForm :state="formState" class="pb-3" @submit="handleFormSubmit">
      <UFormField name="input" class="mb-3">
        <UTextarea
          v-model="formState.input"
          autofocus
          placeholder="请输入内容进行翻译"
          autoresize
          class="w-full"
          @keydown="handleKeyDown"
        />
      </UFormField>
      <div class="flex items-center gap-3">
        <p class="grow"></p>
        <USwitch
          v-model="formState.sendOnPaste"
          color="secondary"
          label="在粘贴时发送"
          class="mx-4"
        />
        <UButton
          type="submit"
          icon="i-lucide-rocket"
          class="px-4"
          :loading="status === 'streaming'"
        >
          发送
        </UButton>
      </div>
    </UForm>
  </UContainer>
</template>

<style scoped></style>
