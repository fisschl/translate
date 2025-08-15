<script setup lang="ts">
import {
  useMcpClient,
  type ChatMessage,
  type ToolCall,
  type ToolMessage,
} from "~/components/Assistant/message";
import ScrollBottomButton from "~/components/ScrollBottomButton.vue";
import { useTiptapEditor } from "~/components/Tiptap/editor";
import TiptapEditorContent from "~/components/Tiptap/TiptapEditorContent.vue";
import MarkdownContent from "~/components/HtmlContent/MarkdownContent.vue";
import { useBottomScroll } from "~/utils/scroll";
import { EventSourceParserStream } from "~/utils/sse";
import { storage } from "~/utils/storage";
import { uuid } from "~/utils/uuid";
import ImageContent from "~/components/Assistant/ImageContent.vue";
import { last } from "lodash-es";

const messages = useStorageAsync<ChatMessage[]>("coding-assistant:messages", [], storage);
const isSending = ref(false);

const systemMessages = computed(() => {
  return [
    {
      role: "user",
      content: [
        "你是一个编程助手，你的任务是解答用户的问题，并帮助用户完成编程任务。",
        "你具有调用工具的能力，请根据用户的需求选择合适的工具。",
        "仔细揣摩用户意图，在思考过程之后，提供逻辑清晰且内容完整的回答。",
      ].join("\n"),
    },
  ];
});

const mcpClient = useMcpClient();

onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 60));
  const container = document.querySelector("#__nuxt");
  if (!(container instanceof HTMLElement)) return;
  scrollTarget.value = container;
  const interval = setInterval(() => scrollToBottom(), 60);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  clearInterval(interval);
});

const handleFormSubmit = async () => {
  const input = await markdownContent();
  if (!input || isSending.value) return;
  isSending.value = true;

  messages.value.push({
    id: uuid(),
    role: "user",
    content: [
      {
        type: "text",
        text: input,
      },
    ],
  });
  editor.value?.commands.setContent("");

  const { body } = await fetch("https://bronya.world/api/doubao/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [...systemMessages.value, ...messages.value],
      max_tokens: 32 * 1024,
      model: "doubao-seed-1-6-thinking-250715",
      tools: mcpClient.toolsParam,
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

  const assistantMessage: ChatMessage = {
    id: uuid(),
    role: "assistant",
    content: [],
    status: "pending",
  };
  messages.value.push(assistantMessage);

  const handleTextContentResponse = (text: unknown) => {
    if (!text || typeof text !== "string") return;
    const contentList = assistantMessage.content;
    const lastContent = last(contentList);
    if (lastContent && lastContent.type === "text") {
      lastContent.text += text;
      return;
    }
    contentList.push({
      type: "text",
      text,
    });
  };

  const handleToolCallResponse = (toolCall: ToolCall) => {
    const tool_calls = reactive(assistantMessage.tool_calls || []);
    assistantMessage.tool_calls = tool_calls;
    const existingCall = tool_calls.find((call) => call.index === toolCall.index);
    if (existingCall) {
      existingCall.function.arguments += toolCall.function.arguments;
      return;
    }
    tool_calls.push(toolCall);
  };

  const handleContent = (response: Record<string, any>) => {
    const { choices } = response;
    if (!Array.isArray(choices) || choices.length === 0) return;
    const [{ delta }] = choices;

    // 处理内容更新
    if (delta.content) handleTextContentResponse(delta.content);

    // 处理工具调用
    if (delta.tool_calls && Array.isArray(delta.tool_calls))
      for (const toolCall of delta.tool_calls) handleToolCallResponse(toolCall);
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    handleContent(value);
  }

  for (const toolCall of assistantMessage.tool_calls || []) {
    // 调用 MCP 工具
    const result = await mcpClient.callTool(toolCall);
    // 创建工具消息
    const toolMessage: ToolMessage = {
      id: uuid(),
      role: "tool",
      content: [
        {
          type: "text",
          text: result,
        },
      ],
      tool_call_id: toolCall.id,
    };
    messages.value.push(toolMessage);
  }

  // 移除 pending 状态
  if (assistantMessage.status) delete assistantMessage.status;

  isSending.value = false;
  if (messages.value.length > 32) messages.value = messages.value.slice(-32);
};

const scrollTarget = shallowRef<HTMLElement | null>(null);

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
  autofocus: true,
  placeholder: "请输入编程相关问题",
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
          <div class="flex items-start gap-3">
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white"
            >
              <Icon name="i-lucide-user" class="h-4 w-4" />
            </div>
            <div class="flex-1 space-y-2">
              <div class="prose prose-sm max-w-none">
                <div v-for="(content, index) in message.content" :key="index">
                  <MarkdownContent v-if="content.type === 'text'" :markdown="content.text" />
                  <ImageContent v-else-if="content.type === 'image_url'" :content="content" />
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="message.role === 'assistant'">
          <div class="flex items-start gap-3">
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500 text-white"
            >
              <Icon name="i-lucide-bot" class="h-4 w-4" />
            </div>
            <div class="flex-1 space-y-2">
              <div class="prose prose-sm max-w-none">
                <p v-if="message.status === 'pending'" class="text-gray-500">
                  <Icon name="i-lucide-loader-2" class="mr-2 inline h-4 w-4 animate-spin" />
                  正在思考...
                </p>
                <div v-else>
                  <div v-if="message.content.length > 0" class="space-y-2">
                    <div v-for="(content, index) in message.content" :key="index">
                      <MarkdownContent v-if="content.type === 'text'" :markdown="content.text" />
                      <ImageContent v-else-if="content.type === 'image_url'" :content="content" />
                    </div>
                  </div>
                  <div
                    v-if="message.tool_calls && message.tool_calls.length > 0"
                    class="mt-2 space-y-2"
                  >
                    <div
                      v-for="toolCall in message.tool_calls"
                      :key="toolCall.id"
                      class="rounded-lg bg-gray-100 p-3"
                    >
                      <p class="text-sm font-medium text-gray-700">
                        工具调用: {{ toolCall.function.name }}
                      </p>
                      <p class="mt-1 text-xs text-gray-600">
                        参数: {{ toolCall.function.arguments }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="message.role === 'tool'">
          <div class="flex items-start gap-3">
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500 text-white"
            >
              <Icon name="i-lucide-wrench" class="h-4 w-4" />
            </div>
            <div class="flex-1 space-y-2">
              <div class="prose prose-sm max-w-none">
                <div v-for="(content, index) in message.content" :key="index">
                  <MarkdownContent v-if="content.type === 'text'" :markdown="content.text" />
                  <ImageContent v-else-if="content.type === 'image_url'" :content="content" />
                </div>
              </div>
            </div>
          </div>
        </template>
      </li>
    </ol>
    <ScrollBottomButton
      :is-show="isShowScrollToBottom"
      class="fixed bottom-10 left-1/2 -translate-x-1/2"
      @click="handleClickScrollToBottom"
    />
    <section class="px-6 pb-4">
      <div class="mb-3 rounded-lg border border-green-300 bg-green-100 p-3">
        <div class="flex items-center gap-2">
          <Icon name="i-lucide-check-circle" class="h-4 w-4 text-green-600" />
          <span class="text-sm text-green-800">
            MCP 工具已就绪 ({{ mcpClient.toolsParam?.length || 0 }} 个工具可用)
          </span>
        </div>
      </div>

      <TiptapEditorContent :editor="editor" class="mb-3" />
      <div class="flex items-center gap-4">
        <p class="grow" />
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
