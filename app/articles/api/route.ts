import { convertToModelMessages, streamText } from "ai";
import { createDeepSeek } from "@ai-sdk/deepseek";

const { DEEPSEEK_API_KEY } = process.env;

const deepseek = createDeepSeek({
  apiKey: DEEPSEEK_API_KEY,
});

export const maxDuration = 30;

const translationPrompts: Record<string, string[]> = {
  zh: [
    "请将用户输入内容准确翻译成中文，保持原文格式。",
    "若代码块未指定语言，可根据上下文判断并在译文中正确标注。",
  ],
  en: [
    "Translate the user's input into English accurately, maintaining the original formatting.",
    "If the code block has no specified language, determine it based on context and label it correctly in the translation.",
  ],
  ja: [
    "ユーザーの入力を正確に日本語に翻訳し、元のフォーマットを維持してください。",
    "コードブロックに言語が指定されていない場合は、コンテキストに基づいて判断し、翻訳で正しくラベルを付けてください。",
  ],
};

export async function POST(req: Request) {
  const { messages, targetLanguage } = await req.json();
  const systemPrompts = translationPrompts[targetLanguage || "zh"].join("\n");

  const result = streamText({
    model: deepseek("deepseek-chat"),
    messages: convertToModelMessages(messages),
    system: systemPrompts,
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
