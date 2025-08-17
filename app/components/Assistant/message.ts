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
  tool_calls?: ToolCall[];
}

export interface ToolMessage {
  id: string;
  role: "tool";
  content: MessageContent[];
  tool_call_id: string;
}

export type ChatMessage = UserMessage | AssistantMessage | ToolMessage;
