<template>
  <div class="remark-test">
    <h1>Remark Markdown 转换测试</h1>

    <!-- 使用 client-only 避免服务端渲染 -->
    <ClientOnly>
      <div class="test-section">
        <h2>测试用例 1: 基本 Markdown 语法</h2>
        <div class="test-input">
          <h3>输入 Markdown:</h3>
          <textarea v-model="test1Input" class="markdown-input" rows="8"></textarea>
        </div>
        <button :disabled="test1Running" @click="runTest1">
          {{ test1Running ? "转换中..." : "运行测试 1" }}
        </button>
        <div v-if="test1Result" class="test-result">
          <h3>转换结果:</h3>
          <div class="html-output" v-html="test1Result"></div>
          <details>
            <summary>查看原始 HTML</summary>
            <pre class="raw-html">{{ test1Result }}</pre>
          </details>
        </div>
      </div>

      <div class="test-section">
        <h2>测试用例 2: 代码块测试</h2>
        <div class="test-input">
          <h3>输入 Markdown:</h3>
          <textarea v-model="test2Input" class="markdown-input" rows="12"></textarea>
        </div>
        <button :disabled="test2Running" @click="runTest2">
          {{ test2Running ? "转换中..." : "运行测试 2" }}
        </button>
        <div v-if="test2Result" class="test-result">
          <h3>转换结果:</h3>
          <div class="html-output" v-html="test2Result"></div>
          <details>
            <summary>查看原始 HTML</summary>
            <pre class="raw-html">{{ test2Result }}</pre>
          </details>
        </div>
      </div>

      <div class="test-section">
        <h2>测试用例 3: 复杂 Markdown 结构</h2>
        <div class="test-input">
          <h3>输入 Markdown:</h3>
          <textarea v-model="test3Input" class="markdown-input" rows="15"></textarea>
        </div>
        <button :disabled="test3Running" @click="runTest3">
          {{ test3Running ? "转换中..." : "运行测试 3" }}
        </button>
        <div v-if="test3Result" class="test-result">
          <h3>转换结果:</h3>
          <div class="html-output" v-html="test3Result"></div>
          <details>
            <summary>查看原始 HTML</summary>
            <pre class="raw-html">{{ test3Result }}</pre>
          </details>
        </div>
      </div>

      <div class="test-section">
        <h2>测试用例 4: 数学公式测试</h2>
        <div class="test-input">
          <h3>输入 Markdown:</h3>
          <textarea v-model="test4Input" class="markdown-input" rows="10"></textarea>
        </div>
        <button :disabled="test4Running" @click="runTest4">
          {{ test4Running ? "转换中..." : "运行测试 4" }}
        </button>
        <div v-if="test4Result" class="test-result">
          <h3>转换结果:</h3>
          <div class="html-output" v-html="test4Result"></div>
          <details>
            <summary>查看原始 HTML</summary>
            <pre class="raw-html">{{ test4Result }}</pre>
          </details>
        </div>
      </div>

      <div class="test-section">
        <h2>批量测试</h2>
        <button :disabled="allTestsRunning" @click="runAllTests">
          {{ allTestsRunning ? "运行中..." : "运行所有测试" }}
        </button>
        <div v-if="allTestsSummary" class="test-summary">
          <h3>测试总结:</h3>
          <pre>{{ allTestsSummary }}</pre>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { markdownToHtml } from "~/components/HtmlContent/remark";

// 测试输入
const test1Input = ref(`# 标题 1
## 标题 2

这是一个**粗体**文本和*斜体*文本。

- 列表项 1
- 列表项 2
  - 嵌套列表项

[链接文本](https://example.com)

> 这是一个引用块`);

const test2Input = ref(`# 代码块测试

## JavaScript 代码块

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
  return "Hello";
}

class Calculator {
  constructor() {
    this.result = 0;
  }

  add(a, b) {
    return a + b;
  }
}
\`\`\`

## Python 代码块

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 计算前10个斐波那契数
for i in range(10):
    print(fibonacci(i))
\`\`\`

## 行内代码

这里有一些 \`行内代码\` 示例。`);

const test3Input = ref(`# 复杂 Markdown 结构测试

## 表格

| 功能 | 支持 | 说明 |
|------|------|------|
| 标题 | ✅ | 支持多级标题 |
| 代码块 | ✅ | 支持语法高亮 |
| 表格 | ✅ | 支持对齐 |
| 数学公式 | ✅ | 支持 LaTeX |

## 任务列表

- [x] 完成基本功能
- [x] 添加代码块支持
- [ ] 添加更多主题
- [ ] 性能优化

## 删除线和强调

~~这是删除的文本~~

**这是粗体文本**
*这是斜体文本*
***这是粗斜体文本***

## 代码块中的特殊字符

\`\`\`html
<div class="container">
  <h1>Hello &lt;World&gt;</h1>
  <p>这是一个 &quot;引号&quot; 示例</p>
</div>
\`\`\``);

const test4Input = ref(`# 数学公式测试

## 行内公式

这是一个行内公式：$E = mc^2$

另一个行内公式：$\\sum_{i=1}^{n} x_i = x_1 + x_2 + \\cdots + x_n$

## 块级公式

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

$$
\\begin{align}
(a + b)^2 &= a^2 + 2ab + b^2 \\\\
&= a^2 + b^2 + 2ab
\\end{align}
$$

## 代码块中的数学

\`\`\`javascript
// 计算圆的面积
const area = Math.PI * radius * radius;
// 公式: A = πr²
\`\`\``);

// 测试状态
const test1Running = ref(false);
const test2Running = ref(false);
const test3Running = ref(false);
const test4Running = ref(false);
const allTestsRunning = ref(false);

// 测试结果
const test1Result = ref("");
const test2Result = ref("");
const test3Result = ref("");
const test4Result = ref("");
const allTestsSummary = ref("");

// 测试函数
const runTest1 = async () => {
  test1Running.value = true;
  test1Result.value = "";

  try {
    const startTime = performance.now();
    const result = await markdownToHtml(test1Input.value);
    const endTime = performance.now();

    test1Result.value = result;

    console.log("测试1结果:", {
      执行时间: `${(endTime - startTime).toFixed(2)}ms`,
      输入长度: test1Input.value.length,
      输出长度: result.length,
      包含标题: result.includes("<h1>"),
      包含粗体: result.includes("<strong>"),
      包含列表: result.includes("<ul>"),
      包含链接: result.includes("<a href="),
    });
  } catch (error) {
    test1Result.value = `❌ 转换失败: ${error}`;
    console.error("测试1错误:", error);
  } finally {
    test1Running.value = false;
  }
};

const runTest2 = async () => {
  test2Running.value = true;
  test2Result.value = "";

  try {
    const startTime = performance.now();
    const result = await markdownToHtml(test2Input.value);
    const endTime = performance.now();

    test2Result.value = result;

    console.log("测试2结果:", {
      执行时间: `${(endTime - startTime).toFixed(2)}ms`,
      输入长度: test2Input.value.length,
      输出长度: result.length,
      包含代码块: result.includes("<pre><code"),
      包含JavaScript: result.includes("javascript"),
      包含Python: result.includes("python"),
      包含行内代码: result.includes("<code>"),
    });
  } catch (error) {
    test2Result.value = `❌ 转换失败: ${error}`;
    console.error("测试2错误:", error);
  } finally {
    test2Running.value = false;
  }
};

const runTest3 = async () => {
  test3Running.value = true;
  test3Result.value = "";

  try {
    const startTime = performance.now();
    const result = await markdownToHtml(test3Input.value);
    const endTime = performance.now();

    test3Result.value = result;

    console.log("测试3结果:", {
      执行时间: `${(endTime - startTime).toFixed(2)}ms`,
      输入长度: test3Input.value.length,
      输出长度: result.length,
      包含表格: result.includes("<table>"),
      包含任务列表: result.includes('type="checkbox"'),
      包含删除线: result.includes("<del>"),
      包含HTML转义: result.includes("&lt;") && result.includes("&gt;"),
    });
  } catch (error) {
    test3Result.value = `❌ 转换失败: ${error}`;
    console.error("测试3错误:", error);
  } finally {
    test3Running.value = false;
  }
};

const runTest4 = async () => {
  test4Running.value = true;
  test4Result.value = "";

  try {
    const startTime = performance.now();
    const result = await markdownToHtml(test4Input.value);
    const endTime = performance.now();

    test4Result.value = result;

    console.log("测试4结果:", {
      执行时间: `${(endTime - startTime).toFixed(2)}ms`,
      输入长度: test4Input.value.length,
      输出长度: result.length,
      包含数学公式: result.includes("katex"),
      包含行内公式: result.includes("$"),
      包含块级公式: result.includes("$$"),
      包含LaTeX: result.includes("\\"),
    });
  } catch (error) {
    test4Result.value = `❌ 转换失败: ${error}`;
    console.error("测试4错误:", error);
  } finally {
    test4Running.value = false;
  }
};

const runAllTests = async () => {
  allTestsRunning.value = true;
  allTestsSummary.value = "";

  const results = [];
  const startTime = performance.now();

  try {
    // 运行所有测试
    await Promise.all([runTest1(), runTest2(), runTest3(), runTest4()]);

    const endTime = performance.now();

    // 收集结果
    results.push(`总执行时间: ${(endTime - startTime).toFixed(2)}ms`);
    results.push(`测试1: ${test1Result.value.includes("❌") ? "失败" : "通过"}`);
    results.push(`测试2: ${test2Result.value.includes("❌") ? "失败" : "通过"}`);
    results.push(`测试3: ${test3Result.value.includes("❌") ? "失败" : "通过"}`);
    results.push(`测试4: ${test4Result.value.includes("❌") ? "失败" : "通过"}`);

    const passedTests = results.filter((r) => r.includes("通过")).length;
    results.push(`\n总结: ${passedTests}/4 个测试通过`);

    allTestsSummary.value = results.join("\n");
  } catch (error) {
    allTestsSummary.value = `❌ 批量测试失败: ${error}`;
  } finally {
    allTestsRunning.value = false;
  }
};

// 页面加载完成后自动运行第一个测试
onMounted(() => {
  // 延迟执行，确保 DOM 完全渲染
  setTimeout(() => {
    runTest1();
  }, 100);
});
</script>

<style scoped>
.remark-test {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #333;
  background-color: #fff;
}

.test-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.test-section h2 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.test-input {
  margin-bottom: 15px;
}

.test-input h3 {
  margin-bottom: 10px;
  color: #495057;
  font-size: 1.1rem;
}

.markdown-input {
  width: 100%;
  min-height: 200px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 14px;
  line-height: 1.4;
  resize: vertical;
  background-color: white;
  color: #333;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin: 10px 5px 10px 0;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.test-result {
  margin-top: 20px;
}

.test-result h3 {
  margin-bottom: 10px;
  color: #495057;
  font-size: 1.1rem;
}

.html-output {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 15px;
  line-height: 1.6;
  color: #333;
}

.html-output :deep(h1) {
  color: #2c3e50;
  border-bottom: 2px solid #e1e5e9;
  padding-bottom: 10px;
}

.html-output :deep(h2) {
  color: #34495e;
  margin-top: 30px;
}

.html-output :deep(code) {
  background-color: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 0.9em;
  color: #333;
}

.html-output :deep(pre) {
  background-color: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  padding: 15px;
  overflow-x: auto;
  margin: 15px 0;
}

.html-output :deep(pre code) {
  background: none;
  padding: 0;
  color: #333;
}

.html-output :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 15px 0;
}

.html-output :deep(th),
.html-output :deep(td) {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
  color: #333;
}

.html-output :deep(th) {
  background-color: #f8f9fa;
  font-weight: bold;
}

.html-output :deep(blockquote) {
  border-left: 4px solid #007bff;
  margin: 15px 0;
  padding: 10px 20px;
  background-color: #f8f9fa;
  font-style: italic;
  color: #333;
}

.html-output :deep(ul),
.html-output :deep(ol) {
  padding-left: 20px;
}

.html-output :deep(li) {
  margin: 5px 0;
  color: #333;
}

.html-output :deep(a) {
  color: #007bff;
  text-decoration: none;
}

.html-output :deep(a:hover) {
  text-decoration: underline;
}

.html-output :deep(del) {
  text-decoration: line-through;
  color: #6c757d;
}

.html-output :deep(strong) {
  font-weight: bold;
  color: #333;
}

.html-output :deep(em) {
  font-style: italic;
  color: #333;
}

details {
  margin-top: 10px;
}

details summary {
  cursor: pointer;
  color: #007bff;
  font-weight: bold;
  margin-bottom: 10px;
}

.raw-html {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
  color: #333;
}

.test-summary {
  margin-top: 15px;
  padding: 15px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 13px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #333;
}

.test-summary h3 {
  margin-top: 0;
  color: #495057;
  font-size: 1rem;
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .remark-test {
    color: #e1e5e9;
    background-color: #1a1a1a;
  }

  .test-section {
    border-color: #404040;
    background-color: #2d2d2d;
  }

  .test-section h2 {
    color: #e1e5e9;
  }

  .test-input h3 {
    color: #b0b0b0;
  }

  .markdown-input {
    border-color: #404040;
    background-color: #2d2d2d;
    color: #e1e5e9;
  }

  .test-result h3 {
    color: #b0b0b0;
  }

  .html-output {
    background-color: #2d2d2d;
    border-color: #404040;
    color: #e1e5e9;
  }

  .html-output :deep(h1) {
    color: #e1e5e9;
    border-bottom-color: #404040;
  }

  .html-output :deep(h2) {
    color: #d0d0d0;
  }

  .html-output :deep(code) {
    background-color: #404040;
    color: #e1e5e9;
  }

  .html-output :deep(pre) {
    background-color: #404040;
    border-color: #555;
  }

  .html-output :deep(pre code) {
    color: #e1e5e9;
  }

  .html-output :deep(th),
  .html-output :deep(td) {
    border-color: #404040;
    color: #e1e5e9;
  }

  .html-output :deep(th) {
    background-color: #404040;
  }

  .html-output :deep(blockquote) {
    background-color: #404040;
    color: #e1e5e9;
  }

  .html-output :deep(li) {
    color: #e1e5e9;
  }

  .html-output :deep(del) {
    color: #888;
  }

  .html-output :deep(strong) {
    color: #e1e5e9;
  }

  .html-output :deep(em) {
    color: #e1e5e9;
  }

  details summary {
    color: #4dabf7;
  }

  .raw-html {
    background-color: #404040;
    border-color: #555;
    color: #e1e5e9;
  }

  .test-summary {
    background-color: #2d2d2d;
    border-color: #404040;
    color: #e1e5e9;
  }

  .test-summary h3 {
    color: #b0b0b0;
  }

  /* 深色模式下的按钮样式 */
  button {
    background-color: #4dabf7;
  }

  button:hover:not(:disabled) {
    background-color: #339af0;
  }

  button:disabled {
    background-color: #555;
  }

  /* 深色模式下的链接颜色 */
  .html-output :deep(a) {
    color: #4dabf7;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .remark-test {
    padding: 10px;
  }

  .test-section {
    padding: 15px;
  }

  .markdown-input {
    font-size: 12px;
    padding: 10px;
  }

  .html-output {
    padding: 15px;
  }
}
</style>
