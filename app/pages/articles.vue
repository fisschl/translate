<script setup lang="ts">
import { boolean, object, enum as zEnum, type infer as Infer } from "zod/mini";
import MarkdownContent from "~/components/HtmlContent/MarkdownContent.vue";
import { html2markdown, useTiptapEditor } from "~/components/Tiptap/editor";
import TiptapEditorContent from "~/components/Tiptap/TiptapEditorContent.vue";
import { EventSourceParserStream } from "~/utils/sse";
import { useIdb } from "~/utils/storage";
import { translateLanguages, translatePrompts } from "~/components/Translation/translate";

useHead({
  title: "翻译文章",
});

const models = ["qwen-turbo", "qwen-plus"];
const languagesValues = translateLanguages.map((item) => item.value);

const FormDataZod = object({
  sendOnPaste: boolean(),
  language: zEnum(languagesValues),
  model: zEnum(models),
});

const formData = useIdb<Infer<typeof FormDataZod>>({
  key: "translate:articles:form:data",
  parse: FormDataZod.parse,
  defaultValue: {
    sendOnPaste: true,
    language: "简体中文",
    model: "qwen-turbo",
  },
});

const isSending = ref(false);
const output = ref("");

const handleFormSubmit = async () => {
  const htmlInput = editor.value?.getHTML();
  if (!htmlInput || isSending.value) return;
  try {
    isSending.value = true;
    const input = await html2markdown(htmlInput);
    if (!input) throw new Error("输入不能为空");
    const prompt = translatePrompts.find((item) => item.value === formData.value.language);
    if (!prompt) throw new Error("未找到翻译提示");
    const { body } = await fetch("/translate/api/dashscope/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: formData.value.model,
        messages: [...prompt.prompts, { role: "user", content: input }],
        enable_thinking: false,
        stream: true,
      }),
    });
    if (!body) throw new Error("响应体为空");
    const reader = body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new EventSourceParserStream())
      .getReader();
    output.value = "";
    const handleContent = (response: Record<string, any>) => {
      const { choices } = response;
      if (!Array.isArray(choices) || choices.length === 0) return;
      const [{ delta }] = choices;
      const { content } = delta;
      if (!content) return;
      output.value += content;
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
            v-model="formData.language"
            :items="translateLanguages"
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
      <MarkdownContent v-if="output" :markdown="output" class="min-w-0" />
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
