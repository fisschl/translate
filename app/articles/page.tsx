"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Response } from "@/components/ai-elements/response";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ClipboardCheck } from "lucide-react";
import { Fragment, useState } from "react";
import { useMemoizedFn } from "ahooks";

const translateLanguages = [
  { label: "简体中文", value: "zh" },
  { label: "English", value: "en" },
  { label: "日本語", value: "ja" },
];

export default function TranslationPanel() {
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("zh");
  const [sendOnPaste, setSendOnPaste] = useState(true);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/translate/articles/api",
    }),
  });

  const handleSubmit = useMemoizedFn((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || status === "submitted") return;
    const body = {
      targetLanguage: language,
    };
    sendMessage({ text: input.trim() }, { body });
    setInput("");
  });

  const handlePaste = () => {
    if (sendOnPaste) setTimeout(() => handleSubmit(), 250);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
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
            }),
          )}
          {status === "submitted" ? <Loader /> : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="px-4 py-3">
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
            <PromptInputTools>
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
              <PromptInputButton
                variant={sendOnPaste ? "default" : "ghost"}
                onClick={() => setSendOnPaste(!sendOnPaste)}
              >
                <ClipboardCheck size={16} />
                <span> 粘贴时发送 </span>
              </PromptInputButton>
            </PromptInputTools>
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
