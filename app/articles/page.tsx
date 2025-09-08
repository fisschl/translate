"use client";

import { Fragment, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Switch } from "@/components/ui/switch";
import { translateLanguages } from "@/lib/translate";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
} from "@/components/ai-elements/prompt-input";
import { Loader } from "@/components/ai-elements/loader";

export default function TranslationPanel() {
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("简体中文");
  const [sendOnPaste, setSendOnPaste] = useState(true);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/translate/articles/api",
    }),
    onFinish: () => {
      setInput("");
    },
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || status === "submitted") return;

    sendMessage(
      { text: input.trim() },
      {
        body: {
          targetLanguage: language,
        },
      }
    );
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (!sendOnPaste) return;

    const pastedText = e.clipboardData.getData("text");
    if (pastedText) {
      setInput(pastedText);
      setTimeout(() => handleSubmit(), 100);
    }
  };

  return (
    <div className="flex-1 h-full bg-background flex flex-col">
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.map((message) =>
            message.parts.map((part, i) => {
              switch (part.type) {
                case "text":
                  return (
                    <Fragment key={`${message.id}-${i}`}>
                      <Message from={message.role}>
                        <MessageContent>
                          <Response>{part.text}</Response>
                        </MessageContent>
                      </Message>
                    </Fragment>
                  );
                default:
                  return null;
              }
            })
          )}
          {status === "submitted" && <Loader />}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-card">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={handlePaste}
            placeholder="输入需要翻译的文本..."
            className="min-h-[80px]"
            disabled={status === "submitted"}
          />
          <PromptInputToolbar>
            <PromptInputModelSelect
              onValueChange={(value) => {
                setLanguage(value);
              }}
              value={language}
            >
              <PromptInputModelSelectTrigger>
                <PromptInputModelSelectValue />
              </PromptInputModelSelectTrigger>
              <PromptInputModelSelectContent>
                {translateLanguages.map((model) => (
                  <PromptInputModelSelectItem
                    key={model.value}
                    value={model.value}
                  >
                    {model.label}
                  </PromptInputModelSelectItem>
                ))}
              </PromptInputModelSelectContent>
            </PromptInputModelSelect>
            <div className="flex items-center gap-2">
              <Switch
                id="send-on-paste"
                checked={sendOnPaste}
                onCheckedChange={setSendOnPaste}
              />
              <label
                htmlFor="send-on-paste"
                className="text-sm text-foreground"
              >
                粘贴时发送
              </label>
            </div>
            <PromptInputSubmit
              disabled={status === "submitted" || !input.trim()}
              status={status}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}
