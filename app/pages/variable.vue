<script setup lang="ts">
import { object, string, type infer as Infer } from "zod/mini";
import { useIdb } from "~/utils/storage";
import {
  camelCase,
  capitalCase,
  constantCase,
  dotCase,
  kebabCase,
  noCase,
  pascalCase,
  pathCase,
  snakeCase,
} from "change-case";
import { pick } from "lodash-es";
import VariableButton from "~/components/Variable/VariableButton.vue";

useHead({
  title: "变量名生成",
});

const isSending = ref(false);

const systemMessages = computed(() => {
  return [
    {
      role: "system",
      content: [
        "你是一个专业的编程助手，专门负责根据用户提供的词汇或短语生成符合编程规范的变量名。请严格遵守以下规则：",
        "1. 请根据用户提供的词汇或短语，生成 3-5 个不同的变量名选项。各个选项之间用 `,` 分隔。",
        "2. 变量名必须符合 CamelCase 命名规范。",
      ].join("\n"),
    },
    {
      role: "user",
      content: "用户",
    },
    {
      role: "assistant",
      content: "User,Customer,Client",
    },
    {
      role: "user",
      content: "用户信息",
    },
    {
      role: "assistant",
      content: "UserInfo,UserData,CustomerProfile",
    },
    {
      role: "user",
      content: "商品列表",
    },
    {
      role: "assistant",
      content: "ProductList,ItemList,GoodsList,ProductArray",
    },
  ];
});

const FormDataZod = object({
  question: string(),
  caseValue: string(),
  answer: string(),
});

const form = useIdb<Infer<typeof FormDataZod>>({
  key: "translate:variable:form",
  parse: FormDataZod.parse,
  defaultValue: { question: "", caseValue: "camelCase", answer: "" },
});

const toast = useToast();

const changeCaseOptions: {
  value: string;
  label: string;
  action: (value: string) => string;
}[] = [
  {
    value: "pascalCase",
    label: "PascalCase",
    action: pascalCase,
  },
  {
    value: "camelCase",
    label: "camelCase",
    action: camelCase,
  },
  {
    value: "kebabCase",
    label: "kebab-case",
    action: kebabCase,
  },
  {
    value: "snakeCase",
    label: "snake_case",
    action: snakeCase,
  },
  {
    value: "capitalCase",
    label: "Capital Case",
    action: capitalCase,
  },
  {
    value: "constantCase",
    label: "CONSTANT_CASE",
    action: constantCase,
  },
  {
    value: "dotCase",
    label: "dot.case",
    action: dotCase,
  },
  {
    value: "pathCase",
    label: "path/case",
    action: pathCase,
  },
  {
    value: "noCase",
    label: "no case",
    action: noCase,
  },
];

const handleFormSubmit = async () => {
  const input = form.value.question.trim();
  if (!input || isSending.value) return;

  isSending.value = true;

  try {
    const { body } = await fetch("/translate/api/dashscope/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          ...systemMessages.value,
          {
            role: "user",
            content: input,
          },
        ],
        max_tokens: 4 * 1024,
        model: "qwen-turbo",
        stream: true,
      }),
    });

    if (!body) {
      throw new Error("请求失败，请重试");
    }

    const reader = body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new EventSourceParserStream())
      .getReader();

    const assistantMessage = {
      content: "",
    };

    const handleContent = (response: Record<string, any>) => {
      const { choices } = response;
      if (!Array.isArray(choices) || choices.length === 0) return;
      const [{ delta }] = choices;
      const { content } = delta;
      if (!content) return;
      assistantMessage.content += content;
      form.value.answer = assistantMessage.content;
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      handleContent(value);
    }
  } catch (error) {
    toast.add({
      title: "生成失败",
      description: error instanceof Error ? error.message : "请重试",
      color: "error",
    });
  } finally {
    isSending.value = false;
  }
};

const variableNames = computed<string[]>(() => {
  if (!form.value.answer) return [];
  const list = form.value.answer.match(/\b[A-Za-z][A-Za-z0-9]*\b/g) || [];
  const { caseValue } = form.value;
  return list.map((name) => {
    const caseOption = changeCaseOptions.find((option) => option.value === caseValue);
    return caseOption?.action(name) ?? name;
  });
});

const caseSelectOptions = computed(() => {
  return changeCaseOptions.map((option) => pick(option, ["value", "label"]));
});
</script>

<template>
  <div class="page-container">
    <TranslateNavigation />
    <section class="container mt-4 mb-8 flex gap-3 px-6">
      <aside class="w-max shrink-0">
        <URadioGroup
          v-model="form.caseValue"
          size="lg"
          class="case-group"
          :items="caseSelectOptions"
        >
          <template #legend>
            <p class="mb-2">命名风格</p>
          </template>
          <template #label="{ item }">
            <code class="font-mono">{{ item.label }}</code>
          </template>
        </URadioGroup>
      </aside>
      <USeparator orientation="vertical" class="mx-2 h-auto" />
      <main class="flex-1">
        <UForm :state="form" class="mb-2 flex gap-2" @submit="handleFormSubmit">
          <UInput
            v-model="form.question"
            :disabled="isSending"
            autofocus
            size="lg"
            placeholder="请输入含义，AI 将自动生成符合编程规范的变量名"
            class="flex-1"
          />
          <UButton type="submit" :loading="isSending" size="lg" icon="i-lucide-wand-2">
            开始生成
          </UButton>
        </UForm>
        <ul>
          <li v-for="name in variableNames" :key="name" class="mb-1 flex">
            <VariableButton :code-value="name" />
          </li>
        </ul>
      </main>
    </section>
  </div>
</template>

<style scoped>
.page-container {
  min-width: 30rem;
}

.case-group :deep(fieldset.flex > div) {
  margin-bottom: 0.5rem;
}
</style>
