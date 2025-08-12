<script setup lang="ts">
import { useClipboard } from "@vueuse/core";
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
    const { body } = await fetch("https://bronya.world/api/doubao/chat", {
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
        model: "doubao-seed-1.6-250615",
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

const { copy, copied } = useClipboard();

whenever(copied, () => {
  toast.add({
    title: "复制成功",
    description: "已复制变量名到剪贴板",
    color: "success",
  });
});

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
  <section>
    <TranslateNavigation />
    <UForm :state="form" class="container mt-4 mb-4 flex gap-2 px-6" @submit="handleFormSubmit">
      <UInput
        v-model="form.question"
        :disabled="isSending"
        autofocus
        size="lg"
        placeholder="请输入含义，AI 将自动生成符合编程规范的变量名"
        class="flex-1"
      />
      <USelect v-model="form.caseValue" :items="caseSelectOptions" style="width: 12rem" />
      <UButton type="submit" :loading="isSending" size="lg" icon="i-lucide-wand-2">
        开始生成
      </UButton>
    </UForm>
    <ul class="container mb-8 px-6">
      <li v-for="name in variableNames" :key="name" class="group mb-1 flex">
        <UButton class="w-full" variant="ghost" color="neutral" @click="copy(name)">
          <code class="flex-1 truncate text-left font-mono text-base font-normal">{{ name }}</code>
          <UIcon
            name="i-lucide-copy"
            class="ml-2 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </UButton>
      </li>
    </ul>
  </section>
</template>
