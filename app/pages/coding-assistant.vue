<script setup lang="ts">
import { pick } from "lodash-es";
import { context7Client, listToolsParam, type ChatMessage } from "~/components/Assistant/message";
import ScrollBottomButton from "~/components/ScrollBottomButton.vue";
import { useTiptapEditor } from "~/components/Tiptap/editor";
import TiptapEditorContent from "~/components/Tiptap/TiptapEditorContent.vue";
import { useBottomScroll } from "~/utils/scroll";
import { EventSourceParserStream } from "~/utils/sse";
import { storage } from "~/utils/storage";
import { uuid } from "~/utils/uuid";

const messages = useStorageAsync<ChatMessage[]>("coding-assistant:messages", [], storage);
const isSending = ref(false);

const systemMessages = computed(() => {
  return [
    {
      role: "user",
      content: [
        "你是一个编程助手，你的任务是解答用户的问题，并帮助用户完成编程任务。",
        "你具有调用工具的能力，请根据用户的需求选择合适的工具。",
        "仔细揣摩用户意图，在思考过程之后，提供逻辑清晰且内容完整的回答。",
      ].join("\n"),
    },
  ];
});

const handleFormSubmit = async () => {
  const input = await markdownContent();
  if (!input || isSending.value) return;
  isSending.value = true;
  messages.value.push({
    id: uuid(),
    role: "user",
    content: input,
  });
  editor.value?.commands.setContent("");

  const { body } = await fetch("https://bronya.world/api/doubao/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        ...systemMessages.value,
        ...messages.value.slice(-5).map((message) => pick(message, ["role", "content"])),
      ],
      max_tokens: 16 * 1024,
      model: "doubao-seed-1-6-thinking-250715",
      tools: await listToolsParam(context7Client),
      stream: true,
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
  messages.value.push(assistantMessage);

  const handleContent = (response: Record<string, any>) => {
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
    handleContent(value);
  }
  assistantMessage.status = undefined;
  isSending.value = false;
  if (messages.value.length > 16) messages.value = messages.value.slice(-16);
};

const scrollTarget = shallowRef<HTMLElement | null>(null);
onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 60));
  const container = document.querySelector("#__nuxt");
  if (!(container instanceof HTMLElement)) return;
  scrollTarget.value = container;
  const interval = setInterval(() => scrollToBottom(), 60);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  clearInterval(interval);
});

const listElement = useTemplateRef("list-element");

const { scrollBottom, scrollToBottom } = useBottomScroll({
  target: scrollTarget,
  watchElement: listElement,
});

const isShowScrollToBottom = computed(() => {
  return scrollBottom.value > 30;
});

const { editor, markdownContent } = useTiptapEditor({
  onEnter: () => {
    handleFormSubmit();
    return true;
  },
  autofocus: true,
  placeholder: "请输入内容进行翻译",
});

const handleClickScrollToBottom = () => {
  scrollToBottom();
  editor.value?.commands.focus();
};
</script>

<template>
  <section class="flex flex-col">
    <TranslateNavigation />
    <ol ref="list-element" class="my-6 flex flex-1 flex-col gap-8 px-6">
      <li v-for="message in messages" :key="message.id" class="flex flex-col">
        <template v-if="message.role === 'user'"> </template>
        <template v-else-if="message.role === 'assistant'"> </template>
      </li>
    </ol>
    <ScrollBottomButton
      :is-show="isShowScrollToBottom"
      class="fixed bottom-10 left-1/2 -translate-x-1/2"
      @click="handleClickScrollToBottom"
    />
    <section class="px-6 pb-4">
      <TiptapEditorContent :editor="editor" class="mb-3" />
      <div class="flex items-center gap-4">
        <p class="grow" />
        <UButton
          type="submit"
          :loading="isSending"
          icon="i-lucide-rocket"
          @click="handleFormSubmit"
        >
          发送
        </UButton>
      </div>
    </section>
  </section>
</template>

<style scoped></style>
