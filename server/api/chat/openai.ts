import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { env } from "node:process";
import { z } from "zod";

const { OPENAI_API_KEY, OPENAI_PROXY_URL, OPENAI_MODEL } = env;

const openai = createOpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: OPENAI_PROXY_URL,
});

export const ChatDataZod = z
  .object({
    system: z.string(),
  })
  .partial();

export default defineEventHandler(async (event) => {
  const { messages, data } = await readBody(event);
  const configs: z.infer<typeof ChatDataZod> = {};
  {
    const result = ChatDataZod.safeParse(data);
    if (result.success) Object.assign(configs, result.data);
  }
  const result = streamText({
    model: openai(OPENAI_MODEL!),
    messages,
    system: configs.system,
  });
  return result.toDataStreamResponse();
});
