import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

const { OPENAI_API_KEY, OPENAI_PROXY_URL } = process.env;

export const openai = createOpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: OPENAI_PROXY_URL,
});

export const ChatData = z
  .object({
    system: z.string(),
  })
  .partial();

export default defineEventHandler(async (event) => {
  const { messages, data } = await readBody(event);
  const { OPENAI_MODEL } = process.env;
  if (!OPENAI_MODEL) throw new Error("Missing OpenAI model");
  const requestData: z.infer<typeof ChatData> = {};
  const dataParseResult = ChatData.safeParse(data);
  if (dataParseResult.success) Object.assign(requestData, dataParseResult.data);
  const result = streamText({
    model: openai(OPENAI_MODEL),
    messages,
    system: requestData.system,
  });
  return result.toDataStreamResponse();
});
