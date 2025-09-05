'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { translateLanguages, translatePrompts } from '@/lib/translate';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputSubmit,
} from '@/components/ai-elements/prompt-input';
import { Response } from '@/components/ai-elements/response';

const models = ['deepseek-chat', 'deepseek-coder'];

export default function Home() {
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('简体中文');
  const [model, setModel] = useState('deepseek-chat');
  const [sendOnPaste, setSendOnPaste] = useState(true);

  const { messages, append, isLoading } = useChat({
    api: '/api/translate',
    onFinish: () => {
      setInput('');
    },
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input || isLoading) return;

    const prompt = translatePrompts.find((item) => item.value === language);
    if (!prompt) throw new Error('未找到翻译提示');

    const systemMessages = prompt.prompts.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    await append({
      content: input,
      role: 'user',
      data: {
        systemMessages,
        model
      }
    });
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    if (!sendOnPaste) return;
    
    const pastedText = e.clipboardData.getData('text');
    if (pastedText) {
      setTimeout(() => handleSubmit(), 100);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 左侧输入区域 */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="选择模型" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="选择语言" />
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
                <label htmlFor="send-on-paste" className="text-sm">
                  粘贴时发送
                </label>
              </div>
            </div>

            <PromptInput onSubmit={handleSubmit}>
              <PromptInputTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPaste={handlePaste}
                placeholder="请输入内容进行翻译"
                className="min-h-[300px]"
              />
              <PromptInputToolbar>
                <PromptInputTools />
                <PromptInputSubmit
                  disabled={isLoading || !input}
                />
              </PromptInputToolbar>
            </PromptInput>
          </div>

          <Separator orientation="vertical" className="h-auto hidden lg:block" />

          {/* 右侧翻译结果区域 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">翻译结果</h3>
            <div className="min-h-[400px] p-3 border rounded-md bg-muted/50">
              {messages.length > 0 ? (
                messages.map((message, index) => (
                  message.role === 'assistant' && (
                    <Response key={index}>{message.content}</Response>
                  )
                ))
              ) : (
                <p className="text-muted-foreground">等待翻译结果...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
