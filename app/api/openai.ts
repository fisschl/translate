import { createOpenAI } from "@ai-sdk/openai";

const { OPEN_AI_API_KEY, OPEN_AI_BASE_URL } = process.env;

export const openai = createOpenAI({
  apiKey: OPEN_AI_API_KEY,
  baseURL: OPEN_AI_BASE_URL,
});
