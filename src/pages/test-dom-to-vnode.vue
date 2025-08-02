<script setup lang="ts">
import { ref, type FunctionalComponent } from "vue";
import { domToVNode, markdownToElement } from "@/components/HtmlContent/remark";

const markdownInput = ref(`# 测试标题

这是一个测试段落，包含 **加粗** 和 *斜体* 文本。

## 代码示例

\`\`\`javascript
console.log('Hello World');
\`\`\`

- 列表项 1
- 列表项 2

> 这是一个引用块
`);

const htmlOutput = ref("");
const renderedOutput = ref("");
const errorMessage = ref("");

const vNodes = ref<(VNode | null | string)[]>([]);

const testDomToVNode = async () => {
  try {
    errorMessage.value = "";

    // 1. 将 Markdown 转换为 DOM 元素
    const elements = await markdownToElement(markdownInput.value);

    // 2. 显示原始 HTML
    htmlOutput.value = elements.map((el) => el.outerHTML).join("\n");

    // 3. 测试 domToVNode 转换
    vNodes.value = elements.map((el) => domToVNode(el));

    // 5. 尝试渲染结果
    renderedOutput.value = elements.map((el) => el.outerHTML).join("");
  } catch (error) {
    errorMessage.value = `错误: ${error instanceof Error ? error.message : String(error)}`;
    console.error("测试失败:", error);
  }
};

// 页面加载时自动测试
testDomToVNode();

const VNodeComponent: FunctionalComponent = () => {
  return vNodes.value;
};
</script>

<template>
  <div class="test-page">
    <h1>DOM to VNode 测试页面</h1>

    <div class="test-section">
      <h2>测试输入</h2>
      <textarea
        v-model="markdownInput"
        placeholder="输入 Markdown 文本进行测试"
        class="markdown-input"
        rows="10"
      />

      <button class="test-button" @click="testDomToVNode">测试 DOM to VNode 转换</button>
    </div>

    <div class="test-section">
      <h2>测试结果</h2>

      <div class="result-section">
        <h3>原始 HTML</h3>
        <div class="html-output" v-html="htmlOutput" />
      </div>

      <div class="result-section">
        <h3>VNode 结构</h3>
        <VNodeComponent />
      </div>

      <div class="result-section">
        <h3>渲染结果</h3>
        <div class="rendered-output" v-html="renderedOutput" />
      </div>
    </div>

    <div class="test-section">
      <h2>错误信息</h2>
      <div v-if="errorMessage" class="error-output">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.test-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: #0d1117;
  color: #c9d1d9;
  min-height: 100vh;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #30363d;
  border-radius: 8px;
  background: #161b22;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.test-section h1 {
  color: #f0f6fc;
  margin-bottom: 20px;
}

.test-section h2 {
  margin-top: 0;
  color: #58a6ff;
  border-bottom: 2px solid #30363d;
  padding-bottom: 8px;
}

.test-section h3 {
  color: #7c8184;
  margin-bottom: 10px;
}

.markdown-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #30363d;
  border-radius: 6px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 14px;
  resize: vertical;
  background-color: #0d1117;
  color: #c9d1d9;
}

.markdown-input:focus {
  outline: none;
  border-color: #58a6ff;
  box-shadow: 0 0 0 3px rgba(56, 139, 253, 0.15);
}

.test-button {
  margin-top: 10px;
  padding: 10px 20px;
  background: #238636;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.test-button:hover {
  background: #2ea043;
}

.test-button:active {
  background: #1f6f3a;
}

.result-section {
  margin-bottom: 20px;
}

.html-output,
.vnode-output,
.rendered-output {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 12px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 12px;
  white-space: pre-wrap;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
  color: #c9d1d9;
}

.rendered-output {
  background: #161b22;
  font-family: inherit;
  font-size: 14px;
  white-space: normal;
  color: #c9d1d9;
}

.rendered-output :deep(h1),
.rendered-output :deep(h2),
.rendered-output :deep(h3),
.rendered-output :deep(h4),
.rendered-output :deep(h5),
.rendered-output :deep(h6) {
  color: #58a6ff;
}

.rendered-output :deep(strong) {
  color: #f0f6fc;
}

.rendered-output :deep(em) {
  color: #79c0ff;
}

.rendered-output :deep(code) {
  background: #21262d;
  color: #ff7b72;
  padding: 2px 4px;
  border-radius: 3px;
}

.rendered-output :deep(pre) {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 12px;
  overflow-x: auto;
}

.rendered-output :deep(blockquote) {
  border-left: 4px solid #30363d;
  padding-left: 12px;
  color: #7c8184;
  margin: 0;
}

.rendered-output :deep(ul),
.rendered-output :deep(ol) {
  color: #c9d1d9;
}

.error-output {
  background: #da3633;
  border: 1px solid #f85149;
  border-radius: 6px;
  padding: 12px;
  color: #ffffff;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 12px;
  white-space: pre-wrap;
}
</style>
