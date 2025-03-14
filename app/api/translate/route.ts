import { openai } from "@/app/api/openai";
import { streamText } from "ai";

const TranslatePromptChinese = `
你是一名专业翻译助手。请将以下内容翻译为中文：
`;

const TranslatePromptEnglish = `
You are a professional translation assistant. Please translate the following text into English:
`;

const LanguageOptions: Record<string, string> = {
  zh: TranslatePromptChinese,
  en: TranslatePromptEnglish,
};

export interface TranslateRequest {
  language?: string;
  prompt: string;
}

const { OPENAI_MODEL } = process.env;

export async function POST(req: Request) {
  const request: TranslateRequest = await req.json();
  const language = request.language || "zh";
  const system = LanguageOptions[language] || TranslatePromptChinese;
  if (!OPENAI_MODEL) throw new Error("OPENAI_MODEL is not set");
  const result = streamText({
    model: openai(OPENAI_MODEL),
    system,
    prompt: request.prompt,
  });
  return result.toDataStreamResponse();
}
