<script setup lang="ts">
import { boolean, object, string } from "zod/mini";
import MarkdownContent from "~/components/HtmlContent/MarkdownContent.vue";
import { html2markdown, useTiptapEditor } from "~/components/Tiptap/editor";
import TiptapEditorContent from "~/components/Tiptap/TiptapEditorContent.vue";
import { EventSourceParserStream } from "~/utils/sse";
import { useIdb } from "~/utils/storage";

useHead({
  title: "翻译文章",
});

const formData = useIdb({
  key: "translate:articles:form:data",
  schema: object({
    input: string(),
    output: string(),
    sendOnPaste: boolean(),
    targetLang: string(),
    model: string(),
  }),
  defaultValue: {
    input: "",
    output: "",
    sendOnPaste: true,
    targetLang: "Chinese",
    model: "qwen-mt-turbo",
  },
  onReady(data) {
    if (data.input) editor.value?.commands.setContent(data.input);
  },
});

const targetLangs = [
  {
    label: "简体中文",
    value: "Chinese",
    prompts: [
      {
        role: "user",
        content: [
          "请将用户输入内容准确翻译成中文，保持原文格式。",
          "若代码块未指定语言，可根据上下文判断并在译文中正确标注。",
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          "Hello World, This is a **bold** text with *italic* formatting.",
          "",
          "- List item 1",
          "- List item 2",
          "",
          "```",
          "// This is a sample code comment that explains the following line will print a greeting message",
          "console.log('Hello World');",
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
          "// 这是一个示例代码注释，解释下一行将打印一条问候消息",
          "console.log('Hello World');",
          "```",
        ].join("\n"),
      },
    ],
  },
  {
    label: "English",
    value: "English",
    prompts: [
      {
        role: "user",
        content: [
          "Translate the user's input into English accurately, maintaining the original formatting.",
          "If the code block has no specified language, determine it based on context and label it correctly in the translation.",
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          "你好世界, 这是一个**粗体**文本，带有*斜体*格式。",
          "",
          "- 列表项 1",
          "- 列表项 2",
          "",
          "```javascript",
          "// This is a sample code comment that explains the following line will print a greeting message",
          "console.log('Hello World');",
          "```",
        ].join("\n"),
      },
      {
        role: "assistant",
        content: [
          "Hello World, this is a **bold** text with *italic* formatting.",
          "",
          "- List item 1",
          "- List item 2",
          "",
          "```javascript",
          "// This is a sample code comment that explains the following line will print a greeting message",
          "console.log('Hello World');",
          "```",
        ].join("\n"),
      },
    ],
  },
  {
    label: "日本語",
    value: "Japanese",
    prompts: [
      {
        role: "user",
        content: [
          "ユーザーの入力を正確に日本語に翻訳し、元のフォーマットを維持してください。",
          "コードブロックに言語が指定されていない場合は、コンテキストに基づいて判断し、翻訳で正しくラベルを付けてください。",
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          "Hello World, This is a **bold** text with *italic* formatting.",
          "",
          "- List item 1",
          "- List item 2",
          "",
          "```",
          "// This is a sample code comment that explains the following line will print a greeting message",
          "console.log('Hello World');",
          "```",
        ].join("\n"),
      },
      {
        role: "assistant",
        content: [
          "こんにちは世界、これは*斜体*フォーマットを含む**太字**テキストです。",
          "",
          "- リストアイテム 1",
          "- リストアイテム 2",
          "",
          "```javascript",
          "// これはサンプルコードのコメントで、次の行が挨拶メッセージを出力することを説明しています",
          "console.log('Hello World');",
          "```",
        ].join("\n"),
      },
    ],
  },
  {
    label: "Русский",
    value: "Russian",
    prompts: [
      {
        role: "user",
        content: [
          "Переведите ввод пользователя на русский язык точно, сохранив исходное форматирование.",
          "Если для блока кода не указан язык, определите его по контексту и правильно пометьте в переводе.",
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          "Hello World, This is a **bold** text with *italic* formatting.",
          "",
          "- List item 1",
          "- List item 2",
          "",
          "```",
          "// This is a sample code comment that explains the following line will print a greeting message",
          "console.log('Hello World');",
          "```",
        ].join("\n"),
      },
      {
        role: "assistant",
        content: [
          "Привет мир, это **жирный** текст с *курсивным* форматированием.",
          "",
          "- Пункт списка 1",
          "- Пункт списка 2",
          "",
          "```javascript",
          "// Это пример комментария к коду, объясняющий, что следующая строка выведет приветственное сообщение",
          "console.log('Hello World');",
          "```",
        ].join("\n"),
      },
    ],
  },
];

const fetchOptions: Record<string, () => Promise<void>> = {
  "qwen-mt": async () => {
    const input = await html2markdown(formData.value.input);
    if (!input) throw new Error("输入不能为空");
    const { body } = await fetch("/translate/api/dashscope/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: formData.value.model,
        messages: [{ role: "user", content: input }],
        translation_options: {
          source_lang: "auto",
          target_lang: formData.value.targetLang,
        },
        stream: true,
      }),
    });
    if (!body) throw new Error("响应体为空");
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
      formData.value.output = content;
    };
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      handleContent(value);
    }
  },
  "doubao-seed": async () => {
    const input = await html2markdown(formData.value.input);
    if (!input) throw new Error("输入不能为空");
    const lang = targetLangs.find((item) => item.value === formData.value.targetLang);
    if (!lang) throw new Error("在语言列表中未找到目标语言");
    const { body } = await fetch("/translate/api/doubao/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: formData.value.model,
        messages: [...lang.prompts, { role: "user", content: input }],
        thinking: { type: "disabled" },
        stream: true,
      }),
    });
    if (!body) throw new Error("响应体为空");
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
  },
  qwen: async () => {
    const input = await html2markdown(formData.value.input);
    if (!input) throw new Error("输入不能为空");
    const lang = targetLangs.find((item) => item.value === formData.value.targetLang);
    if (!lang) throw new Error("在语言列表中未找到目标语言");
    const { body } = await fetch("/translate/api/dashscope/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: formData.value.model,
        messages: [...lang.prompts, { role: "user", content: input }],
        enable_thinking: false,
        stream: true,
      }),
    });
    if (!body) throw new Error("响应体为空");
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
  },
};

const models = [
  { label: "Qwen MT Turbo", value: "qwen-mt-turbo", modelType: "qwen-mt" },
  { label: "Qwen MT Plus", value: "qwen-mt-plus", modelType: "qwen-mt" },
  {
    label: "Doubao Seed 1.6 Flash",
    value: "doubao-seed-1-6-flash-250715",
    modelType: "doubao-seed",
  },
  { label: "Doubao Seed 1.6", value: "doubao-seed-1-6-250615", modelType: "doubao-seed" },
  { label: "Qwen Turbo", value: "qwen-turbo", modelType: "qwen" },
  { label: "Qwen Plus", value: "qwen-plus", modelType: "qwen" },
];

const isSending = ref(false);

const handleFormSubmit = async () => {
  const htmlInput = editor.value?.getHTML();
  if (!htmlInput || isSending.value) return;
  formData.value.input = htmlInput;
  try {
    isSending.value = true;
    // 获取当前模型的类型
    const model = models.find((item) => item.value === formData.value.model);
    if (!model) throw new Error(`未找到模型类型`);
    // 调用对应类型的fetch函数
    const fetchFn = fetchOptions[model.modelType];
    if (!fetchFn) throw new Error(`未找到模型类型 '${model.modelType}' 对应的处理函数`);
    await fetchFn();
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
    <div class="three-column-grid mb-10 px-6 pt-4">
      <!-- 左侧输入区域 -->
      <div class="min-w-0">
        <TiptapEditorContent :editor="editor" class="text-editor" />
        <div class="flex items-center gap-4 pt-3">
          <!-- 模型选择 -->
          <USelect
            v-model="formData.model"
            :items="models"
            placeholder="选择模型"
            class="w-50"
            @change="handleFormSubmit"
          />
          <!-- 目标语言选择 -->
          <USelect
            v-model="formData.targetLang"
            :items="targetLangs"
            placeholder="选择目标语言"
            class="w-30"
            @change="handleFormSubmit"
          />
          <p class="grow" />
          <USwitch v-model="formData.sendOnPaste" label="在粘贴时发送" />
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
      <USeparator orientation="vertical" class="h-auto" />
      <!-- 右侧翻译结果区域 -->
      <MarkdownContent v-if="formData.output" :markdown="formData.output" class="min-w-0" />
    </div>
  </section>
</template>

<style scoped>
.text-editor {
  min-height: calc(100dvh - 10rem);
}

.three-column-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0.75rem;
}
</style>
