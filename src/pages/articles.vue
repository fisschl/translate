<script setup lang="ts">
import { pick } from "lodash-es";
import MarkdownContent from "@/components/HtmlContent/MarkdownContent.vue";
import ScrollBottomButton from "@/components/ScrollBottomButton.vue";
import { useTiptapEditor } from "@/components/Tiptap/editor";
import TiptapEditorContent from "@/components/Tiptap/TiptapEditorContent.vue";
import { useBottomScroll } from "@/utils/scroll";
import { EventSourceParserStream } from "@/utils/sse";
import { storage } from "@/utils/storage";
import { uuid } from "@/utils/uuid";

const MessageStorageKey = "articles:messages";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "pending" | "success";
}

const messages: ChatMessage[] = reactive([]);
const sendOnPaste = ref(true);

const isSending = ref(false);

const systemMessages = () => {
  return [
    {
      role: "system",
      content:
        "你是一个翻译助手，你的工作是将用户输入的内容翻译成中文。你需要遵守以下翻译细则：\n\n1. 你提供的译文需要带有格式，包括标题、列表、代码块等。\n2. 你的翻译需要尽量符合信达雅的准则，不需要添加任何解释。\n3. 对于没有指定编程语言的代码块，你可以根据上下文判断其语言并在译文中正确指定。",
    },
    {
      role: "user",
      content:
        "# Hello World\n\nThis is a **bold** text with *italic* formatting.\n\n- List item 1\n- List item 2\n\n```\nconsole.log('Hello');\n```",
    },
    {
      role: "assistant",
      content:
        "# 你好世界\n\n这是一个**粗体**文本，带有*斜体*格式。\n\n- 列表项 1\n- 列表项 2\n\n```javascript\nconsole.log('Hello');\n```",
    },
  ];
};

const handleFormSubmit = async () => {
  const input = await markdownContent();
  if (!input || isSending.value) return;

  const historyMessages = messages.map((message) => {
    return pick(message, ["role", "content"]);
  });

  isSending.value = true;
  const userMessage = reactive<ChatMessage>({
    id: uuid(),
    role: "user",
    content: input,
    status: "success",
  });
  messages.push(userMessage);
  editor.value?.commands.setContent("");

  const { body } = await fetch("/api/doubao/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        ...systemMessages(),
        ...historyMessages,
        { role: "user", content: userMessage.content },
      ],
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
  assistantMessage.status = "success";
  isSending.value = false;
  // 存储消息
  const messagesToStore = messages.slice(-8);
  await storage.setItem(MessageStorageKey, messagesToStore);
};

storage
  .getItem<ChatMessage[]>(MessageStorageKey)
  .then((storedMessages) => {
    if (!storedMessages) return;
    messages.push(...storedMessages);
  })
  .then(async () => {
    const interval = setInterval(() => scrollToBottom(), 60);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    clearInterval(interval);
  });

const scrollTarget = shallowRef<HTMLElement | null>(null);
onMounted(() => {
  const container = document.querySelector("#app");
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

const { editor, markdownContent } = useTiptapEditor({
  onEnter: () => {
    handleFormSubmit();
    return true;
  },
  onPaste: () => {
    if (!sendOnPaste.value) return;
    setTimeout(() => handleFormSubmit(), 100);
  },
  autofocus: true,
  placeholder: "请输入内容进行翻译",
});
</script>

<template>
  <TranslateNavigation />
  <section class="flex flex-col px-6">
    <ol ref="list-element" class="my-6 flex flex-1 flex-col gap-8">
      <li v-for="message in messages" :key="message.id" class="flex flex-col">
        <template v-if="message.role === 'user'">
          <pre class="text-sm whitespace-pre-wrap" v-text="message.content" />
        </template>
        <template v-else-if="message.role === 'assistant'">
          <MarkdownContent :markdown="message.content" />
        </template>
      </li>
    </ol>
    <ScrollBottomButton
      :is-show="isShowScrollToBottom"
      class="fixed bottom-10 left-1/2 -translate-x-1/2"
      @click="scrollToBottom"
    />
    <section class="pb-4">
      <TiptapEditorContent :editor="editor" class="mb-3" />
      <div class="flex items-center gap-4">
        <p class="grow" />
        <ElCheckbox v-model="sendOnPaste" label="在粘贴时发送" />
        <ElButton
          type="primary"
          native-type="button"
          :loading="isSending"
          @click="handleFormSubmit"
        >
          <ILucideRocket class="mr-2 text-base" />
          发送
        </ElButton>
      </div>
    </section>
  </section>
</template>

<style scoped></style>
