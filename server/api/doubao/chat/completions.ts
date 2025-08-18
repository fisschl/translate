import { headersPick } from "../../dashscope/chat/completions";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { DOUBAO_API_KEY } = process.env;
  const response = await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DOUBAO_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const { headers } = response;
  return new Response(response.body, {
    status: response.status,
    headers: headersPick(headers, [
      "Content-Type",
      "Content-Length",
      "Cache-Control",
      "Connection",
    ]),
  });
});
