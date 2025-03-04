"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { html2Markdown, Markdown } from "@/components/markdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompletion } from "@ai-sdk/react";
import { Loader2, Send, Trash2 } from "lucide-react";
import { useDebounceFn, useMemoizedFn, useMount } from "ahooks";
import { KeyboardEventHandler, useState } from "react";
import pageStyle from "./page.module.css";
import { reportVisit } from "../visit";

const languageOptions = [
  {
    value: "zh",
    label: "简体中文",
  },
  {
    value: "en",
    label: "English",
  },
];

const inputMatch: Record<string, (str: string) => boolean> = {
  zh: (str: string) => {
    const chineseRegex = /[\u4e00-\u9fa5]/g;
    const matches = str.match(chineseRegex);
    if (!matches) return false;
    return matches.length / str.length > 0.8;
  },
  en: (str: string) => {
    const englishRegex = /[a-zA-Z]/g;
    const matches = str.match(englishRegex);
    if (!matches) return false;
    return matches.length / str.length > 0.8;
  },
};

const Page: React.FC = () => {
  useMount(reportVisit);

  const [language, setLanguage] = useState<string>("zh");

  const handlePaste = useMemoizedFn(() => {
    translateClick.run();
  });

  const editor = useEditor({
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert prose-code:text-sm max-w-none",
          pageStyle.editorProse,
        ),
      },
    },
    immediatelyRender: false,
    onPaste: handlePaste,
    autofocus: true,
  });

  const { completion, isLoading, complete } = useCompletion({
    api: "/translate/api/translate",
  });

  const translate = async () => {
    const text = editor?.getText().trim();
    if (!text) return;
    const body = { language };
    if (language === "zh" && inputMatch.zh(text)) {
      body.language = "en";
      setLanguage("en");
    } else if (language === "en" && inputMatch.en(text)) {
      body.language = "zh";
      setLanguage("zh");
    }
    const htmlContent = editor?.getHTML();
    if (!htmlContent) return;
    complete(html2Markdown(htmlContent), {
      body,
    });
  };

  const handleClickEditor = () => {
    if (!editor?.isFocused) editor?.commands.focus();
  };
  const translateClick = useDebounceFn(translate, { wait: 120 });
  const handleKeyDown: KeyboardEventHandler<HTMLElement> = (event) => {
    if (event.key === "Enter") translateClick.run();
  };

  return (
    <div className="flex gap-3 px-3 pt-1 pb-4">
      <section className="min-w-0 flex-1">
        <article
          className={cn(
            "mb-3 rounded-md transition",
            "border-gray-200 focus-within:border-blue-500",
            "dark:border-gray-500 dark:focus-within:border-blue-500",
            pageStyle.editor,
          )}
          onClick={handleClickEditor}
          onKeyDown={handleKeyDown}
        >
          <EditorContent editor={editor} />
        </article>
        <div className="mb-3 flex flex-wrap justify-end gap-3">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className={pageStyle.languageSelect}>
              <SelectValue placeholder="请选择目标语言" />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="flex-1" />
          <Button
            variant="secondary"
            title="清空内容"
            onClick={() => editor?.commands.clearContent()}
          >
            <Trash2 />
          </Button>
          <Button onClick={translateClick.run}>
            <Send />
            开始翻译
          </Button>
        </div>
      </section>
      <section className="min-w-0 flex-1">
        <Markdown content={completion} />
        {isLoading ? (
          <p className="my-4">
            <Loader2 size={20} className="animate-spin" />
          </p>
        ) : null}
      </section>
    </div>
  );
};

export default Page;
