import { env } from "node:process";

const { DOUBAO_API_KEY, DOUBAO_MODEL } = env;

export default defineEventHandler(async (event) => {
  const { messages, thinking } = await readBody(event);
  return fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DOUBAO_API_KEY}`,
    },
    body: JSON.stringify({
      model: DOUBAO_MODEL,
      messages,
      stream: true,
      thinking,
    }),
  });
});
