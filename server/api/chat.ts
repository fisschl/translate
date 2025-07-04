import { CoreMessage, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const { OPENAI_API_KEY, OPENAI_PROXY_URL } = process.env;

export const openai = createOpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: OPENAI_PROXY_URL,
});

interface ChatData {
  prompt?: string;
}

const handleMessages = (messages: CoreMessage[], data?: ChatData) => {
  if (!data) return;
  const promptIndex = messages.findLastIndex((item) => item.role === "user");
  if (data.prompt) {
    const promptMessage: CoreMessage = {
      role: "user",
      content: data.prompt,
    };
    messages.splice(promptIndex, 0, promptMessage);
  }
};

export default defineEventHandler(async (event) => {
  const { messages, data } = await readBody(event);
  const { OPENAI_MODEL } = process.env;
  if (!OPENAI_MODEL) throw new Error("Missing OpenAI model");
  handleMessages(messages, data);
  const result = streamText({
    model: openai(OPENAI_MODEL),
    messages,
  });
  return result.toDataStreamResponse();
});
