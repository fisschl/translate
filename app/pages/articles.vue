<script setup lang="ts">
import { boolean, object, string } from "zod/mini";
import MarkdownContent from "~/components/HtmlContent/MarkdownContent.vue";
import { html2markdown, useTiptapEditor } from "~/components/Tiptap/editor";
import TiptapEditorContent from "~/components/Tiptap/TiptapEditorContent.vue";
import { EventSourceParserStream } from "~/utils/sse";
import { useIdb } from "~/utils/storage";

const formData = useIdb({
  key: "translate:articles:form:data",
  schema: object({
    input: string(),
    output: string(),
    sendOnPaste: boolean(),
  }),
  defaultValue: {
    input: "",
    output: "",
    sendOnPaste: true,
  },
  onReady(data) {
    if (data.input) editor.value?.commands.setContent(data.input);
  },
});

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

const isSending = ref(false);

const handleFormSubmit = async () => {
  const htmlInput = editor.value?.getHTML();
  if (!htmlInput) return;
  formData.value.input = htmlInput;
  const input = await html2markdown(htmlInput);
  if (!input || isSending.value) return;
  try {
    isSending.value = true;
    const { body } = await fetch("/translate/api/doubao/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          ...systemMessages.value,
          ...prepareMessages.value,
          {
            role: "user",
            content: input,
          },
        ],
        thinking: { type: "disabled" },
        max_tokens: 32 * 1024,
        model: "doubao-seed-1-6-flash-250715",
        stream: true,
      }),
    });
    if (!body) return;
    const reader = body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new EventSourceParserStream())
      .getReader();
    formData.value.output = "";
    const handleContent = (response: Record<string, any>) => {
      const { choices } = response;
      if (!Array.isArray(choices) || choices.length === 0) return;
      const [{ delta }] = choices;
      const { content } = delta;
      if (!content) return;
      formData.value.output += content;
    };
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      handleContent(value);
    }
  } finally {
    isSending.value = false;
  }
};

const editor = useTiptapEditor({
  onEnter: () => {
    handleFormSubmit();
    return true;
  },
  onPaste: () => {
    if (!formData.value.sendOnPaste) return;
    setTimeout(() => handleFormSubmit(), 100);
  },
  autofocus: true,
  placeholder: "请输入内容进行翻译",
});
</script>

<template>
  <section>
    <TranslateNavigation />
    <div class="mb-10 flex px-6 pt-4">
      <!-- 左侧输入区域 -->
      <div class="flex-1">
        <TiptapEditorContent :editor="editor" class="text-editor" />
        <div class="flex items-center gap-4 pt-3">
          <p class="grow" />
          <UCheckbox v-model="formData.sendOnPaste" label="在粘贴时发送" />
          <UButton
            type="submit"
            :loading="isSending"
            icon="i-lucide-rocket"
            @click="handleFormSubmit"
          >
            发送
          </UButton>
        </div>
      </div>
      <USeparator orientation="vertical" class="mx-3 h-auto" />
      <!-- 右侧翻译结果区域 -->
      <div class="flex-1">
        <MarkdownContent v-if="formData.output" :markdown="formData.output" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.text-editor {
  min-height: calc(100dvh - 10rem);
}
</style>
