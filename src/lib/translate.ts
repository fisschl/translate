export const translateLanguages = [
  { label: "简体中文", value: "简体中文" },
  { label: "English", value: "英语" },
  { label: "日本語", value: "日语" },
];

export const translatePrompts = [
  {
    value: "简体中文",
    prompts: [
      {
        role: "user",
        content: [
          "请将用户输入内容准确翻译成中文，保持原文格式。",
          "若代码块未指定语言，可根据上下文判断并在译文中正确标注。",
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          "Hello World, This is a **bold** text with *italic* formatting.",
          "",
          "- List item 1",
          "- List item 2",
          "",
          "```",
          "// This is a sample code comment that explains the following line will print a greeting message",
          "console.log('Hello World');",
          "```",
        ].join("\n"),
      },
      {
        role: "assistant",
        content: [
          "你好世界, 这是一个**粗体**文本，带有*斜体*格式。",
          "",
          "- 列表项 1",
          "- 列表项 2",
          "",
          "```javascript",
          "// 这是一个示例代码注释，解释下一行将打印一条问候消息",
          "console.log('Hello World');",
          "```",
        ].join("\n"),
      },
    ],
  },
  {
    value: "英语",
    prompts: [
      {
        role: "user",
        content: [
          "Translate the user's input into English accurately, maintaining the original formatting.",
          "If the code block has no specified language, determine it based on context and label it correctly in the translation.",
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          "你好世界, 这是一个**粗体**文本，带有*斜体*格式。",
          "",
          "- 列表项 1",
          "- 列表项 2",
          "",
          "```javascript",
          "// This is a sample code comment that explains the following line will print a greeting message",
          "console.log('Hello World');",
          "```",
        ].join("\n"),
      },
      {
        role: "assistant",
        content: [
          "Hello World, this is a **bold** text with *italic* formatting.",
          "",
          "- List item 1",
          "- List item 2",
          "",
          "```javascript",
          "// This is a sample code comment that explains the following line will print a greeting message",
          "console.log('Hello World');",
          "```",
        ].join("\n"),
      },
    ],
  },
  {
    value: "日语",
    prompts: [
      {
        role: "user",
        content: [
          "ユーザーの入力を正確に日本語に翻訳し、元のフォーマットを維持してください。",
          "コードブロックに言語が指定されていない場合は、コンテキストに基づいて判断し、翻訳で正しくラベルを付けてください。",
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          "Hello World, This is a **bold** text with *italic* formatting.",
          "",
          "- List item 1",
          "- List item 2",
          "",
          "```",
          "// This is a sample code comment that explains the following line will print a greeting message",
          "console.log('Hello World');",
          "```",
        ].join("\n"),
      },
      {
        role: "assistant",
        content: [
          "こんにちは世界、これは*斜体*フォーマットを含む**太字**テキストです。",
          "",
          "- リストアイテム 1",
          "- リストアイテム 2",
          "",
          "```javascript",
          "// これはサンプルコードのコメントで、次の行が挨拶メッセージを出力することを説明しています",
          "console.log('Hello World');",
          "```",
        ].join("\n"),
      },
    ],
  },
];