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
  { label: "简体中文", value: "Chinese" },
  { label: "English", value: "English" },
  { label: "日本語", value: "Japanese" },
  { label: "Русский", value: "Russian" },
];

const models = [
  { label: "Qwen-MT-Turbo", value: "qwen-mt-turbo" },
  { label: "Qwen-MT-Plus", value: "qwen-mt-plus" },
];

const isSending = ref(false);

const handleFormSubmit = async () => {
  const htmlInput = editor.value?.getHTML();
  if (!htmlInput) return;
  formData.value.input = htmlInput;
  const input = await html2markdown(htmlInput);
  if (!input || isSending.value) return;
  try {
    isSending.value = true;
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
      formData.value.output = content;
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

const handleLanguageOrModelChange = () => {
  if (formData.value.input && !isSending.value) handleFormSubmit();
};
</script>

<template>
  <section>
    <TranslateNavigation />
    <div class="mb-10 flex px-6 pt-4">
      <!-- 左侧输入区域 -->
      <div class="flex-1">
        <TiptapEditorContent :editor="editor" class="text-editor" />
        <div class="flex items-center gap-4 pt-3">
          <!-- 模型选择 -->
          <USelect
            v-model="formData.model"
            :items="models"
            placeholder="选择模型"
            class="w-40"
            @change="handleLanguageOrModelChange"
          />
          <!-- 目标语言选择 -->
          <USelect
            v-model="formData.targetLang"
            :items="targetLangs"
            placeholder="选择目标语言"
            class="w-30"
            @change="handleLanguageOrModelChange"
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
