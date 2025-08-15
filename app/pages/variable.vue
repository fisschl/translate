<script setup lang="ts">
import { storage } from "~/utils/storage";
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

const isSending = ref(false);

const systemMessages = computed(() => {
  return [
    {
      role: "system",
      content: [
        "你是一个专业的编程助手，专门负责根据用户提供的词汇或短语生成符合编程规范的变量名。请严格遵守以下规则：",
        "1. 变量名必须符合 CamelCase 命名规范（首字母小写，后续单词首字母大写）",
        "2. 变量名应该简洁明了，易于理解和记忆",
        "3. 变量名应该具有描述性，能够清楚表达其用途和含义",
        "4. 避免使用过于冗长的名称，保持适中的长度",
        "5. 请根据用户提供的词汇或短语，生成 3-5 个不同的变量名选项。各个选项之间用 `,` 分隔。",
        "6. 只返回变量名，不要添加任何解释或额外文字。",
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

const form = useStorageAsync("variable:form", { question: "", caseValue: "camelCase" }, storage);

const answer = useStorageAsync("variable:answer", "", storage);
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
    const { body } = await fetch("https://bronya.world/api/doubao/chat/completions", {
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
        thinking: { type: "disabled" },
        max_tokens: 8 * 1024,
        model: "doubao-seed-1-6-flash-250715",
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
      answer.value = assistantMessage.content;
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
  if (!answer.value) return [];
  const list = answer.value.match(/\b[A-Za-z][A-Za-z0-9]*\b/g) || [];
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
