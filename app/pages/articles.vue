<script setup lang="ts">
import { useChat } from "@ai-sdk/vue";
import type { Message } from "@ai-sdk/vue";
import { debounce } from "lodash-es";
import MarkdownContent from "~/components/HtmlContent/MarkdownContent.vue";

const MessageStorageKey = "articles:messages";

const { messages, input, handleSubmit, status, setMessages } = useChat({
  api: "/translate/api/chat",
  onFinish: debounce(async () => {
    // 只存储最后24条消息
    const messagesToStore = messages.value.slice(-24);
    await storage.setItem(MessageStorageKey, messagesToStore);
  }, 1000),
});

onMounted(async () => {
  const messages = await storage.getItem<Message[]>(MessageStorageKey);
  if (messages) setMessages(messages);
  await new Promise((resolve) => requestIdleCallback(resolve));
  scrollToBottom();
});

const scrollTarget = shallowRef<HTMLElement | null>(null);
onMounted(() => {
  const container = document.querySelector("#__nuxt");
  if (!(container instanceof HTMLElement)) return;
  scrollTarget.value = container;
});

const listElement = useTemplateRef("list-element");

const { scrollBottom, scrollToBottom } = useBottomScroll({
  target: scrollTarget,
  watchElement: listElement,
});

const isShowScrollToBottom = computed(() => {
  return scrollBottom.value > 30;
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
      system: "你是一个翻译助手，请将以下内容翻译成中文。",
    },
  });
  await new Promise((resolve) => requestIdleCallback(resolve));
  scrollToBottom();
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

const isSending = computed(() => status.value === "submitted" || status.value === "streaming");
</script>

<template>
  <TranslateNavigation class="sticky top-0" />
  <UContainer class="flex flex-col">
    <ol ref="list-element" class="my-8 flex flex-1 flex-col gap-5">
      <li v-for="message in messages" :key="message.id" class="flex flex-col">
        <template v-if="message.role === 'user'">
          <template v-for="(part, index) in message.parts" :key="index">
            <pre
              v-if="part.type === 'text'"
              class="font-sans text-sm whitespace-pre-wrap text-gray-500 dark:text-gray-400"
              v-text="part.text"
            ></pre>
          </template>
        </template>
        <template v-else-if="message.role === 'assistant'">
          <template v-for="(part, index) in message.parts" :key="index">
            <MarkdownContent v-if="part.type === 'text'" :markdown="part.text" />
          </template>
        </template>
      </li>
      <li v-if="isSending">
        <UIcon name="i-lucide-loader-circle" class="animate-spin" size="20" />
      </li>
    </ol>
    <UButton
      v-if="isShowScrollToBottom"
      class="fixed bottom-10 left-1/2 -translate-x-1/2 rounded-full"
      color="secondary"
      variant="subtle"
      size="xl"
      icon="i-lucide-arrow-down"
      @click="scrollToBottom"
    />
    <UForm :state="formState" class="pb-4" @submit="handleFormSubmit">
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
        <UButton type="submit" icon="i-lucide-rocket" class="px-4" :loading="isSending">
          发送
        </UButton>
      </div>
    </UForm>
  </UContainer>
</template>

<style scoped></style>
