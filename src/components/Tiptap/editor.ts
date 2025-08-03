import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import { Editor, type Extension } from "@tiptap/vue-3";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

export const useTiptapEditor = (options?: {
  content?: string;
  extensions?: Extension[];
  onPaste?: (event: ClipboardEvent) => void;
  autofocus?: boolean;
  onEnter?: () => boolean;
  placeholder?: string;
}) => {
  const editor = shallowRef<Editor | undefined>(undefined);

  const extensions = computed(() => {
    const extensions: Extension[] = [
      StarterKit.extend({
        addKeyboardShortcuts() {
          return {
            Enter: () => {
              if (options?.onEnter) return options.onEnter();
              return false;
            },
          };
        },
      }),
    ];
    if (options?.placeholder)
      extensions.push(
        Placeholder.configure({
          placeholder: options.placeholder,
        }),
      );
    if (options?.extensions) extensions.push(...options.extensions);
    return extensions.map((item) => markRaw(item));
  });

  onMounted(() => {
    editor.value = new Editor({
      content: options?.content,
      extensions: extensions.value,
      editorProps: {
        attributes: {
          class: "prose dark:prose-invert",
        },
      },
      onPaste(e) {
        if (options?.onPaste) options.onPaste(e);
      },
      autofocus: options?.autofocus,
    });
  });

  onBeforeUnmount(() => {
    editor.value?.destroy();
  });

  const markdownContent = async () => {
    const html = editor.value?.getHTML();
    if (!html) return "";
    const markdown = await unified()
      .use(rehypeParse)
      .use(rehypeRemark)
      .use(remarkGfm)
      .use(remarkStringify)
      .process(html);
    return markdown.toString().trim();
  };

  return {
    editor,
    markdownContent,
  };
};
