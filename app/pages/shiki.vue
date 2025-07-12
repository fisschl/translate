<template>
  <div class="shiki-test">
    <h1>Shiki 语法高亮测试</h1>

    <!-- 使用 client-only 避免服务端渲染 -->
    <ClientOnly>
      <div class="test-section">
        <h2>测试用例 1: 基本 JavaScript 代码</h2>
        <div ref="testElement1" class="test-element">
          <pre>
            <code class="language-javascript">
function hello() {
  console.log("Hello, World!");
  return "Hello";
}
            </code>
          </pre>
        </div>
        <button :disabled="test1Running" @click="runTest1">
          {{ test1Running ? "处理中..." : "运行测试 1" }}
        </button>
        <div v-if="test1Result" class="test-result">
          <h3>测试结果:</h3>
          <pre>{{ test1Result }}</pre>
        </div>
      </div>

      <div class="test-section">
        <h2>测试用例 2: 复杂 JavaScript 代码</h2>
        <div ref="testElement2" class="test-element">
          <pre>
            <code class="language-javascript">
class Calculator {
  constructor() {
    this.result = 0;
  }

  add(a, b) {
    return a + b;
  }

  multiply(a, b) {
    return a * b;
  }
}
            </code>
          </pre>
        </div>
        <button :disabled="test2Running" @click="runTest2">
          {{ test2Running ? "处理中..." : "运行测试 2" }}
        </button>
        <div v-if="test2Result" class="test-result">
          <h3>测试结果:</h3>
          <pre>{{ test2Result }}</pre>
        </div>
      </div>

      <div class="test-section">
        <h2>测试用例 3: Java 代码</h2>
        <div ref="testElement3" class="test-element">
          <pre>
            <code class="language-java">
public class Calculator {
    private int result;

    public Calculator() {
        this.result = 0;
    }

    public int add(int a, int b) {
        return a + b;
    }

    public int multiply(int a, int b) {
        return a * b;
    }

    public static void main(String[] args) {
        Calculator calc = new Calculator();
        System.out.println("Sum: " + calc.add(5, 3));
        System.out.println("Product: " + calc.multiply(4, 6));
    }
}
            </code>
          </pre>
        </div>
        <button :disabled="test3Running" @click="runTest3">
          {{ test3Running ? "处理中..." : "运行测试 3" }}
        </button>
        <div v-if="test3Result" class="test-result">
          <h3>测试结果:</h3>
          <pre>{{ test3Result }}</pre>
        </div>
      </div>

      <div class="test-section">
        <h2>测试用例 4: TypeScript 代码</h2>
        <div ref="testElement4" class="test-element">
          <pre>
            <code class="language-typescript">
interface User {
  id: number;
  name: string;
  email: string;
}

class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }
}
            </code>
          </pre>
        </div>
        <button :disabled="test4Running" @click="runTest4">
          {{ test4Running ? "处理中..." : "运行测试 4" }}
        </button>
        <div v-if="test4Result" class="test-result">
          <h3>测试结果:</h3>
          <pre>{{ test4Result }}</pre>
        </div>
      </div>

      <div class="test-section">
        <h2>测试用例 5: 空代码块</h2>
        <div ref="testElement5" class="test-element">
          <pre>
            <code class="language-javascript"></code>
          </pre>
        </div>
        <button :disabled="test5Running" @click="runTest5">
          {{ test5Running ? "处理中..." : "运行测试 5" }}
        </button>
        <div v-if="test5Result" class="test-result">
          <h3>测试结果:</h3>
          <pre>{{ test5Result }}</pre>
        </div>
      </div>

      <div class="test-section">
        <h2>测试用例 6: 没有 language 标记的代码</h2>
        <div ref="testElement6" class="test-element">
          <pre>
            <code>console.log("No language class");</code>
          </pre>
        </div>
        <button :disabled="test6Running" @click="runTest6">
          {{ test6Running ? "处理中..." : "运行测试 6" }}
        </button>
        <div v-if="test6Result" class="test-result">
          <h3>测试结果:</h3>
          <pre>{{ test6Result }}</pre>
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
import { updateHighlight } from "~/components/HtmlContent/shiki";

// 测试元素引用
const testElement1 = ref<HTMLElement>();
const testElement2 = ref<HTMLElement>();
const testElement3 = ref<HTMLElement>();
const testElement4 = ref<HTMLElement>();
const testElement5 = ref<HTMLElement>();
const testElement6 = ref<HTMLElement>();

// 测试状态
const test1Running = ref(false);
const test2Running = ref(false);
const test3Running = ref(false);
const test4Running = ref(false);
const test5Running = ref(false);
const test6Running = ref(false);
const allTestsRunning = ref(false);

// 测试结果
const test1Result = ref("");
const test2Result = ref("");
const test3Result = ref("");
const test4Result = ref("");
const test5Result = ref("");
const test6Result = ref("");
const allTestsSummary = ref("");

// 测试函数
const runTest1 = async () => {
  if (!testElement1.value) return;

  test1Running.value = true;
  test1Result.value = "";

  try {
    const startTime = performance.now();
    await updateHighlight(testElement1.value);
    const endTime = performance.now();

    const preElement = testElement1.value.querySelector("pre");
    const hasHighlighting = preElement && preElement.innerHTML.includes('class="shiki"');

    test1Result.value = `✅ 测试通过
执行时间: ${(endTime - startTime).toFixed(2)}ms
语法高亮应用: ${hasHighlighting ? "是" : "否"}
处理前代码长度: ${testElement1.value.textContent?.length || 0}
处理后HTML长度: ${preElement?.innerHTML.length || 0}`;
  } catch (error) {
    test1Result.value = `❌ 测试失败: ${error}`;
  } finally {
    test1Running.value = false;
  }
};

const runTest2 = async () => {
  if (!testElement2.value) return;

  test2Running.value = true;
  test2Result.value = "";

  try {
    const startTime = performance.now();
    await updateHighlight(testElement2.value);
    const endTime = performance.now();

    const preElement = testElement2.value.querySelector("pre");
    const hasHighlighting = preElement && preElement.innerHTML.includes('class="shiki"');
    const hasClassKeyword = preElement && preElement.innerHTML.includes('class="keyword"');

    test2Result.value = `✅ 测试通过
执行时间: ${(endTime - startTime).toFixed(2)}ms
语法高亮应用: ${hasHighlighting ? "是" : "否"}
class关键字高亮: ${hasClassKeyword ? "是" : "否"}
处理前代码长度: ${testElement2.value.textContent?.length || 0}
处理后HTML长度: ${preElement?.innerHTML.length || 0}`;
  } catch (error) {
    test2Result.value = `❌ 测试失败: ${error}`;
  } finally {
    test2Running.value = false;
  }
};

const runTest3 = async () => {
  if (!testElement3.value) return;

  test3Running.value = true;
  test3Result.value = "";

  try {
    const startTime = performance.now();
    await updateHighlight(testElement3.value);
    const endTime = performance.now();

    const preElement = testElement3.value.querySelector("pre");
    const hasHighlighting = preElement && preElement.innerHTML.includes('class="shiki"');
    const hasJavaSyntax = preElement && preElement.innerHTML.includes("public class");

    test3Result.value = `✅ 测试通过
执行时间: ${(endTime - startTime).toFixed(2)}ms
语法高亮应用: ${hasHighlighting ? "是" : "否"}
Java语法识别: ${hasJavaSyntax ? "是" : "否"}
处理前代码长度: ${testElement3.value.textContent?.length || 0}
处理后HTML长度: ${preElement?.innerHTML.length || 0}`;
  } catch (error) {
    test3Result.value = `❌ 测试失败: ${error}`;
  } finally {
    test3Running.value = false;
  }
};

const runTest4 = async () => {
  if (!testElement4.value) return;

  test4Running.value = true;
  test4Result.value = "";

  try {
    const startTime = performance.now();
    await updateHighlight(testElement4.value);
    const endTime = performance.now();

    const preElement = testElement4.value.querySelector("pre");
    const hasHighlighting = preElement && preElement.innerHTML.includes('class="shiki"');
    const hasTypeScriptSyntax = preElement && preElement.innerHTML.includes("interface ");

    test4Result.value = `✅ 测试通过
执行时间: ${(endTime - startTime).toFixed(2)}ms
语法高亮应用: ${hasHighlighting ? "是" : "否"}
TypeScript语法识别: ${hasTypeScriptSyntax ? "是" : "否"}
处理前代码长度: ${testElement4.value.textContent?.length || 0}
处理后HTML长度: ${preElement?.innerHTML.length || 0}`;
  } catch (error) {
    test4Result.value = `❌ 测试失败: ${error}`;
  } finally {
    test4Running.value = false;
  }
};

const runTest5 = async () => {
  if (!testElement5.value) return;

  test5Running.value = true;
  test5Result.value = "";

  try {
    const startTime = performance.now();
    await updateHighlight(testElement5.value);
    const endTime = performance.now();

    const preElement = testElement5.value.querySelector("pre");
    const isEmpty = !preElement?.textContent?.trim();

    test5Result.value = `✅ 测试通过
执行时间: ${(endTime - startTime).toFixed(2)}ms
空代码块处理: ${isEmpty ? "正确跳过" : "错误处理"}
处理后HTML长度: ${preElement?.innerHTML.length || 0}`;
  } catch (error) {
    test5Result.value = `❌ 测试失败: ${error}`;
  } finally {
    test5Running.value = false;
  }
};

const runTest6 = async () => {
  if (!testElement6.value) return;

  test6Running.value = true;
  test6Result.value = "";

  try {
    const startTime = performance.now();
    await updateHighlight(testElement6.value);
    const endTime = performance.now();

    const preElement = testElement6.value.querySelector("pre");
    const hasHighlighting = preElement && preElement.innerHTML.includes('class="shiki"');
    const hasLanguageClass = preElement
      ?.querySelector("code")
      ?.classList.contains("language-javascript");

    test6Result.value = `✅ 测试通过
执行时间: ${(endTime - startTime).toFixed(2)}ms
语法高亮应用: ${hasHighlighting ? "是" : "否"}
无language标记处理: ${!hasLanguageClass ? "正确跳过" : "错误处理"}
处理后HTML长度: ${preElement?.innerHTML.length || 0}`;
  } catch (error) {
    test6Result.value = `❌ 测试失败: ${error}`;
  } finally {
    test6Running.value = false;
  }
};

const runAllTests = async () => {
  allTestsRunning.value = true;
  allTestsSummary.value = "";

  const results = [];
  const startTime = performance.now();

  try {
    // 运行所有测试
    await Promise.all([runTest1(), runTest2(), runTest3(), runTest4(), runTest5(), runTest6()]);

    const endTime = performance.now();

    // 收集结果
    results.push(`总执行时间: ${(endTime - startTime).toFixed(2)}ms`);
    results.push(`测试1: ${test1Result.value.includes("✅") ? "通过" : "失败"}`);
    results.push(`测试2: ${test2Result.value.includes("✅") ? "通过" : "失败"}`);
    results.push(`测试3: ${test3Result.value.includes("✅") ? "通过" : "失败"}`);
    results.push(`测试4: ${test4Result.value.includes("✅") ? "通过" : "失败"}`);
    results.push(`测试5: ${test5Result.value.includes("✅") ? "通过" : "失败"}`);
    results.push(`测试6: ${test6Result.value.includes("✅") ? "通过" : "失败"}`);

    const passedTests = results.filter((r) => r.includes("通过")).length;
    results.push(`\n总结: ${passedTests}/6 个测试通过`);

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
.shiki-test {
  max-width: 1200px;
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

.test-element {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  margin: 10px 0;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 14px;
  line-height: 1.4;
  overflow-x: auto;
  color: #333;
}

.test-element code {
  display: block;
  width: 100%;
  color: #333;
}

.test-element pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
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

.test-result,
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

.test-result h3,
.test-summary h3 {
  margin-top: 0;
  color: #495057;
  font-size: 1rem;
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .shiki-test {
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

  .test-element {
    background-color: #2d2d2d;
    border-color: #404040;
    color: #e1e5e9;
  }

  .test-element code {
    color: #e1e5e9;
  }

  .test-element pre {
    color: #e1e5e9;
  }

  .test-result,
  .test-summary {
    background-color: #2d2d2d;
    border-color: #404040;
    color: #e1e5e9;
  }

  .test-result h3,
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
}

/* 响应式设计 */
@media (max-width: 768px) {
  .shiki-test {
    padding: 10px;
  }

  .test-section {
    padding: 15px;
  }

  .test-element {
    font-size: 12px;
    padding: 10px;
  }
}
</style>
