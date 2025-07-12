<template>
  <div class="markdown-test">
    <h1>Markdown 内容渲染测试</h1>
    <div class="test-section">
      <h2>测试用例：完整的 Markdown 内容</h2>
      <div class="test-content">
        <MarkdownContent :markdown="markdownContent" />
      </div>
      <div class="test-info">
        <h3>测试说明</h3>
        <p>此测试用例包含了以下 Markdown 元素：</p>
        <ul>
          <li>多级标题 (H1-H6)</li>
          <li>段落和文本格式化</li>
          <li>链接和强调</li>
          <li>JavaScript 代码块</li>
          <li>Python 代码块</li>
          <li>行内代码</li>
          <li>引用块</li>
          <li>有序和无序列表</li>
          <li>表格</li>
          <li>水平分割线</li>
          <li>图片</li>
          <li>任务列表</li>
          <li>删除线</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MarkdownContent from "@/components/HtmlContent/MarkdownContent.vue";
import { ref } from "vue";

// 完整的 Markdown 测试内容
const markdownContent = ref(`# Markdown 内容渲染测试

这是一个完整的 Markdown 内容测试，包含了各种常见的 Markdown 元素。

## 文本格式化

这是**粗体文本**，这是*斜体文本*，这是~~删除的文本~~。

### 链接和引用

访问 [GitHub](https://github.com) 了解更多信息。

> 这是一个引用块，用于突出显示重要的信息或引用他人的话。

## 代码示例

### JavaScript 代码块

\`\`\`javascript
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

  static create() {
    return new Calculator();
  }
}

// 使用示例
const calc = Calculator.create();
console.log(calc.add(5, 3)); // 输出: 8
console.log(calc.multiply(4, 6)); // 输出: 24
\`\`\`

### Python 代码块

\`\`\`python
class DataProcessor:
    def __init__(self):
        self.data = []

    def add_data(self, item):
        self.data.append(item)

    def process_data(self):
        return {
            'count': len(self.data),
            'sum': sum(self.data),
            'average': sum(self.data) / len(self.data) if self.data else 0
        }

    @staticmethod
    def validate_data(data):
        return all(isinstance(x, (int, float)) for x in data)

# 使用示例
processor = DataProcessor()
processor.add_data(10)
processor.add_data(20)
processor.add_data(30)
result = processor.process_data()
print(f"处理结果: {result}")
\`\`\`

### 行内代码

在文本中使用 \`console.log()\` 来输出信息，或者使用 \`Math.PI\` 获取圆周率。

## 列表

### 无序列表

- 第一项
- 第二项
  - 嵌套项 1
  - 嵌套项 2
- 第三项

### 有序列表

1. 第一步
2. 第二步
   1. 子步骤 A
   2. 子步骤 B
3. 第三步

### 任务列表

- [x] 完成基础功能
- [x] 添加样式支持
- [ ] 性能优化
- [ ] 添加更多测试用例

## 表格

| 功能 | 支持状态 | 说明 |
|------|----------|------|
| 标题 | ✅ | 支持 H1-H6 |
| 代码块 | ✅ | 支持语法高亮 |
| 表格 | ✅ | 支持对齐 |
| 列表 | ✅ | 支持嵌套 |
| 链接 | ✅ | 支持外部链接 |
| 图片 | ✅ | 支持本地和远程 |

## 其他元素

### 水平分割线

---

### 数学公式

行内公式：$E = mc^2$

块级公式：

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## 总结

这个测试用例涵盖了 Markdown 的所有主要功能，包括：

1. **文本格式化** - 粗体、斜体、删除线
2. **代码显示** - JavaScript 和 Python 代码块
3. **结构化内容** - 标题、列表、表格
4. **引用和链接** - 引用块、外部链接
5. **特殊元素** - 分割线、图片、数学公式

通过这个测试，可以验证 MarkdownContent 组件是否正确渲染各种 Markdown 元素。`);
</script>

<style scoped>
.markdown-test {
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
  border-bottom: 2px solid #e1e5e9;
  padding-bottom: 10px;
}

.test-content {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 30px;
  margin: 20px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.test-info {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 20px;
  margin-top: 20px;
}

.test-info h3 {
  margin-top: 0;
  color: #495057;
  font-size: 1.1rem;
}

.test-info ul {
  margin: 10px 0;
  padding-left: 20px;
}

.test-info li {
  margin: 5px 0;
  color: #666;
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .markdown-test {
    color: #e1e5e9;
    background-color: #1a1a1a;
  }

  .test-section {
    border-color: #404040;
    background-color: #2d2d2d;
  }

  .test-section h2 {
    color: #e1e5e9;
    border-bottom-color: #404040;
  }

  .test-content {
    background-color: #2d2d2d;
    border-color: #404040;
  }

  .test-info {
    background-color: #2d2d2d;
    border-color: #404040;
  }

  .test-info h3 {
    color: #b0b0b0;
  }

  .test-info li {
    color: #adb5bd;
  }
}
</style>
