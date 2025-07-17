<script setup lang="ts">
import MarkdownContent from "~/components/HtmlContent/MarkdownContent.vue";
import { EventSourceParserStream } from "~/utils/sse";
import { uuid } from "~~/shared/utils/uuid";

const MessageStorageKey = "articles:messages";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "pending" | "success";
}

const messages: ChatMessage[] = reactive([]);

const formState = reactive({
  input: "",
  sendOnPaste: true,
});

const isSending = ref(false);

const handleFormSubmit = async () => {
  if (!formState.input.trim() || isSending.value) return;

  isSending.value = true;
  const userMessage = reactive<ChatMessage>({
    id: uuid(),
    role: "user",
    content: formState.input,
    status: "success",
  });
  messages.push(userMessage);

  const { body } = await fetch("/translate/api/chat/doubao", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: formState.input }],
      thinking: { type: "disabled" },
    }),
  });

  if (!body) {
    isSending.value = false;
    return;
  }

  const reader = body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new EventSourceParserStream())
    .getReader();

  const assistantMessage = reactive<ChatMessage>({
    id: uuid(),
    role: "assistant",
    content: "",
    status: "pending",
  });
  messages.push(assistantMessage);

  const handleContent = async (response: Record<string, any>) => {
    const { choices } = response;
    if (!Array.isArray(choices) || choices.length === 0) return;
    const [{ delta }] = choices;
    const { content } = delta;
    if (!content) return;
    assistantMessage.content += content;
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    await handleContent(value);
  }
  assistantMessage.status = "success";
  isSending.value = false;
  // 存储消息
  const messagesToStore = messages.slice(-24);
  await storage.setItem(MessageStorageKey, messagesToStore);
  await new Promise((resolve) => requestIdleCallback(resolve));
  scrollToBottom();
};

onMounted(async () => {
  const storedMessages = await storage.getItem<ChatMessage[]>(MessageStorageKey);
  if (storedMessages) {
    messages.push(...storedMessages);
  }
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

const handleKeyDown = (e: KeyboardEvent) => {
  // 检测粘贴快捷键 (Ctrl+V 或 Cmd+V)
  if ((e.ctrlKey || e.metaKey) && e.key === "v" && formState.sendOnPaste) {
    setTimeout(() => {
      handleFormSubmit();
    }, 60);
    return;
  }
  // 检测回车键发送
  if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
    e.preventDefault();
    handleFormSubmit();
    return;
  }
};
</script>

<template>
  <TranslateNavigation class="sticky top-0" />
  <UContainer class="flex flex-col">
    <ol ref="list-element" class="my-8 flex flex-1 flex-col gap-5">
      <li v-for="message in messages" :key="message.id" class="flex flex-col">
        <template v-if="message.role === 'user'">
          <pre
            class="font-sans text-sm whitespace-pre-wrap text-gray-500 dark:text-gray-400"
            v-text="message.content"
          ></pre>
        </template>
        <template v-else-if="message.role === 'assistant'">
          <MarkdownContent :markdown="message.content" />
          <UIcon
            v-if="message.status === 'pending'"
            name="i-lucide-loader-circle"
            class="animate-spin"
            size="20"
          />
        </template>
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
