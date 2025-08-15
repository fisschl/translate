<script setup lang="ts">
import { pick } from "lodash-es";
import MarkdownContent from "~/components/HtmlContent/MarkdownContent.vue";
import ScrollBottomButton from "~/components/ScrollBottomButton.vue";
import { useTiptapEditor } from "~/components/Tiptap/editor";
import TiptapEditorContent from "~/components/Tiptap/TiptapEditorContent.vue";
import { useBottomScroll } from "~/utils/scroll";
import { EventSourceParserStream } from "~/utils/sse";
import { storage } from "~/utils/storage";
import { uuid } from "~/utils/uuid";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const messages = useStorageAsync<ChatMessage[]>("articles:messages", [], storage);
const sendOnPaste = ref(true);

const isSending = ref(false);

const systemMessages = computed(() => {
  return [
    {
      role: "user",
      content: [
        "你是一个翻译助手，你的任务是将用户输入的内容翻译成中文。你需要遵守以下翻译细则：",
        "1. 你的翻译需要尽量符合信达雅的准则，不需要添加任何解释和说明。",
        "2. 对于没有指定编程语言的代码块，你可以根据上下文判断其语言并在译文中正确指定。",
      ].join("\n"),
    },
  ];
});

const prepareMessages = computed(() => {
  return [
    {
      role: "user",
      content: [
        "Hello World, This is a **bold** text with *italic* formatting.",
        "",
        "- List item 1",
        "- List item 2",
        "",
        "```",
        "// prints 'Hello'",
        "console.log('Hello');",
        "```",
      ].join("\n"),
    },
    {
      role: "assistant",
      content: [
        "你好世界, 这是一个**粗体**文本，带有*斜体*格式。",
        "",
        "- 列表项 1",
        "- 列表项 2",
        "",
        "```javascript",
        "// 打印 'Hello'",
        "console.log('Hello');",
        "```",
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
        ...prepareMessages.value,
        ...messages.value.slice(-5).map((message) => pick(message, ["role", "content"])),
      ],
      thinking: { type: "disabled" },
      max_tokens: 32 * 1024,
      model: "doubao-seed-1-6-flash-250715",
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
  onPaste: () => {
    if (!sendOnPaste.value) return;
    setTimeout(() => handleFormSubmit(), 100);
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
      @click="handleClickScrollToBottom"
    />
    <section class="px-6 pb-4">
      <TiptapEditorContent :editor="editor" class="mb-3" />
      <div class="flex items-center gap-4">
        <p class="grow" />
        <UCheckbox v-model="sendOnPaste" label="在粘贴时发送" />
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
