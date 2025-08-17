export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { DASHSCOPE_API_KEY } = process.env;
  return await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
});
