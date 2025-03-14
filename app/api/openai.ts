import { createOpenAI } from "@ai-sdk/openai";

const { OPENAI_API_KEY, OPENAI_PROXY_URL } = process.env;

export const openai = createOpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: OPENAI_PROXY_URL,
});
