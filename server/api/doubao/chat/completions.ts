export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { DOUBAO_API_KEY } = process.env;
  return await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DOUBAO_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
});
