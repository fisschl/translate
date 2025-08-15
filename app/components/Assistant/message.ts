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
  index?: number;
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

export interface McpServer {
  url: string;
}

export const mcpServers: Record<string, McpServer> = {
  context7: {
    url: "https://mcp.context7.com/mcp",
  },
};

export const createMcpClient = async (name: string, server: McpServer) => {
  const transport = new StreamableHTTPClientTransport(new URL(server.url));
  const client = new Client({ name, version: "1.0.0" });
  await client.connect(transport);
  return client;
};

export const useMcpClient = () => {
  const clients: Record<string, Client> = {};
  const toolsName: Record<string, [string, string]> = {};
  const toolsParam: Record<string, any>[] = [];

  onMounted(async () => {
    for (const [name, server] of Object.entries(mcpServers)) {
      const client = await createMcpClient(name, server);
      clients[name] = client;
      const { tools } = await client.listTools();
      for (const tool of tools) {
        const globalName = [name, tool.name].join("-");
        toolsName[globalName] = [name, tool.name];
        toolsParam.push({
          type: "function",
          function: {
            name: globalName,
            description: tool.description,
            parameters: tool.inputSchema,
          },
        });
      }
    }
  });

  const callTool = async (toolCall: ToolCall) => {
    const [clientName, toolName] = toolsName[toolCall.function.name] || [];
    if (!clientName || !toolName) return `工具调用失败: ${toolCall.function.name} 不存在`;
    try {
      const client = clients[clientName]!;
      const result = await client.callTool({
        name: toolName,
        arguments: JSON.parse(toolCall.function.arguments),
      });
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return `工具调用失败: ${toolCall.function.name} ${error}`;
    }
  };

  return {
    toolsParam,
    callTool,
  };
};
