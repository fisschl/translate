import { deepseek } from "@ai-sdk/deepseek";
import { streamText } from "ai";
import type { ModelMessage } from "ai";

export const maxDuration = 30;

// System prompts for different languages - now only in backend
const translationPrompts: Record<string, ModelMessage[]> = {
  chinese: [
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
  english: [
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
  japanese: [
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
};

export async function POST(req: Request) {
  const { messages, data } = await req.json();

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Messages are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { targetLanguage = "chinese" } = data;

  // Get system prompts for the target language
  const systemPrompts =
    translationPrompts[targetLanguage] || translationPrompts["chinese"];

  const result = streamText({
    model: deepseek("deepseek-chat"), // Fixed to Deepseek model
    messages: [
      // Add system messages from backend (these contain the translation instructions)
      ...systemPrompts,
      // Add the conversation history
      ...messages,
    ],
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
