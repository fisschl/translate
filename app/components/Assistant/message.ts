import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export interface StringContent {
  type: "text";
  text: string;
}

export interface ImageUrlContent {
  type: "image_url";
  image_url: {
    url: string;
  };
}

export type MessageContent = StringContent | ImageUrlContent;

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
  status?: "pending";
}

export interface UserMessage {
  id: string;
  role: "user";
  content: MessageContent[];
}

export interface AssistantMessage {
  id: string;
  role: "assistant";
  content: MessageContent[];
  status?: "pending";
  tool_calls?: ToolCall[];
}

export interface ToolMessage {
  id: string;
  role: "tool";
  content: MessageContent[];
  tool_call_id: string;
}

export type ChatMessage = UserMessage | AssistantMessage | ToolMessage;

export const mcpServers = {
  context7: {
    url: "https://mcp.context7.com/mcp",
  },
};

export const createContext7Client = async () => {
  const transport = new StreamableHTTPClientTransport(new URL(mcpServers.context7.url));
  const client = new Client({
    name: "Context7",
    version: "1.0.0",
    title: "Context7",
  });
  await client.connect(transport);
  return client;
};

export const context7Client = await createContext7Client();

export const listToolsParam = async (client: Client) => {
  const { tools } = await client.listTools();
  return tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));
};
