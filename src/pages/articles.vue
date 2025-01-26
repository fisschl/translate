<script setup lang="ts">
import StarterKit from "@tiptap/starter-kit";
import { Editor, EditorContent } from "@tiptap/vue-3";
import { v7 as uuid } from "uuid";
import { onMounted, reactive, ref, shallowRef } from "vue";
import AppHeader from "@/components/AppHeader.vue";
import HtmlContent from "@/components/HtmlContent.vue";
import { socket } from "@/utils/socket";

const loading = ref(false);

const effects: (() => unknown)[] = [];
const clearEffects = () => {
  effects.forEach((fn) => fn());
  effects.length = 0;
};

const resultText = ref("");

const startTranslate = async () => {
  await new Promise((resolve) => setTimeout(resolve, 60));
  const key = uuid();
  const htmlText = editor.value?.getHTML();
  if (!htmlText) return;
  request.text = htmlText;
  loading.value = true;
  clearEffects();
  socket().emit("translation", {
    ...request,
    key,
  });
  const handler = (response: Record<string, any>) => {
    const { text, finished } = response;
    if (finished) loading.value = false;
    resultText.value = text;
  };
  socket().on(key, handler);
  effects.push(() => socket().off(key, handler));
};

const languageOptions = [
  {
    value: "zh",
    label: "简体中文",
  },
  {
    value: "en",
    label: "English",
  },
];

const request = reactive({
  text: "",
  language: "zh",
});

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.ctrlKey) return startTranslate();
};

const editor = shallowRef<Editor>();

onMounted(() => {
  editor.value = new Editor({
    autofocus: true,
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert prose-code:text-sm",
      },
    },
  });
});

const handleClickEditor = ({ target }: MouseEvent) => {
  if (!(target instanceof Element)) return;
  const prose = target.closest(".prose");
  if (prose) return;
  editor.value?.commands.focus();
};

const clearContent = () => {
  editor.value?.commands.clearContent();
};

const handlePaste = async () => {
  await startTranslate();
};
</script>

<template>
  <AppHeader class="justify-center px-2 pt-1" />
  <main class="mt-4 flex gap-5 px-4 pb-6">
    <div class="min-w-0 flex-1">
      <article
        class="editor rounded-md border-gray-200 focus-within:border-blue-500 dark:border-gray-500 dark:focus-within:border-blue-500"
        @keydown="handleKeyDown"
        @paste="handlePaste"
        @click="handleClickEditor"
      >
        <EditorContent class="markdown" :editor="editor" />
      </article>
      <div class="mb-3 flex flex-wrap justify-end gap-3">
        <USelect
          v-model="request.language"
          style="width: 8rem"
          :items="languageOptions"
          value-key="value"
        />
        <p class="flex-1" />
        <UButton
          square
          title="清空内容"
          color="neutral"
          icon="i-tabler-clear-all"
          @click="clearContent"
        />
        <UButton icon="i-tabler-run" @click="startTranslate">
          开始翻译
        </UButton>
      </div>
    </div>
    <div class="markdown min-w-0 flex-1">
      <HtmlContent
        :content="resultText"
        class="prose dark:prose-invert prose-code:text-base mb-2"
      />
      <UIcon
        v-if="loading"
        name="i-tabler-loader-2"
        style="font-size: 20px"
        class="animate-spin"
      />
    </div>
  </main>
</template>

<style scoped>
.markdown :deep(.prose) {
  max-width: none;
}
.markdown :deep(.prose:focus) {
  outline: none;
}

.editor {
  border-width: 2px;
  border-style: dashed;
  min-height: 20rem;
  margin-bottom: 0.8rem;
  padding: 0.6rem 0.8rem;
}
</style>
