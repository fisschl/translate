export const headersPick = (headers: Headers, keys: string[]) => {
  const result = new Headers();
  for (const key of keys) {
    const value = headers.get(key);
    if (value) result.set(key, value);
  }
  return result;
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { DASHSCOPE_API_KEY } = process.env;
  const response = await fetch(
    "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
      },
      body: JSON.stringify(body),
    },
  );
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
