'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { translateLanguages } from '../../lib/translate';
import { Conversation, ConversationContent, ConversationScrollButton } from '../ai-elements/conversation';
import { Message, MessageContent } from '../ai-elements/message';
import { Response } from '../ai-elements/response';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
} from '../ai-elements/prompt-input';
import { Loader } from '../ai-elements/loader';

export function TranslationPanel() {
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('简体中文');
  const [sendOnPaste, setSendOnPaste] = useState(true);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/translate/api/translate-chat',
    }),
    onFinish: () => {
      setInput('');
    },
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || status === 'submitted') return;

    sendMessage(
      { text: input.trim() },
      {
        body: {
          targetLanguage: language
        },
      }
    );
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (!sendOnPaste) return;
    
    const pastedText = e.clipboardData.getData('text');
    if (pastedText) {
      setInput(pastedText);
      setTimeout(() => handleSubmit(), 100);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="选择目标语言" />
            </SelectTrigger>
            <SelectContent>
              {translateLanguages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Switch
              id="send-on-paste"
              checked={sendOnPaste}
              onCheckedChange={setSendOnPaste}
            />
            <label htmlFor="send-on-paste" className="text-sm text-foreground">
              粘贴时发送
            </label>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Conversation */}
        <Conversation className="flex-1">
          <ConversationContent>
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground mt-20">
                <p className="text-lg mb-2 text-foreground">欢迎使用 AI 翻译助手</p>
                <p className="text-sm text-muted-foreground">输入任何文本，我将为您翻译成 {language}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) =>
                  message.parts.map((part, i) =>
                    part.type === 'text' ? (
                      <Message key={`${message.id}-${i}`} from={message.role}>
                        <MessageContent>
                          <Response>{part.text}</Response>
                        </MessageContent>
                      </Message>
                    ) : null
                  )
                )}
                {status === 'submitted' && <Loader />}
              </div>
            )}
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
              disabled={status === 'submitted'}
            />
            <PromptInputToolbar>
              <PromptInputSubmit
                disabled={status === 'submitted' || !input.trim()}
                status={status}
              />
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}