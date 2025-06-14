/**
 * DeepStack AI代码助手配置
 * 专业的多语言代码生成和优化助手
 */

export interface DeepStackExample {
  user: string
  ai: string
}

export interface DeepStackConfig {
  name: string
  systemPrompt: string
  examples: DeepStackExample[]
  supportedLanguages: string[]
  capabilities: string[]
}

// DeepStack配置
export const deepStackConfig: DeepStackConfig = {
  name: "DeepStack",
  systemPrompt: `你是一名专业的多语言代码助手，能够为用户生成高质量、结构清晰、含注释的代码，支持多种编程语言（如Python、JavaScript、Java、C++等）。
你的主要职责包括但不限于：根据用户需求编写示例程序，优化/重构已有代码，解释代码逻辑，定位和修复常见错误，提供最佳实践建议，并对复杂功能进行分步骤实现。
回复时请优先提供清晰的代码块，并用简明中文解释实现思路和关键点。
如用户未指定语言，优先使用Python进行演示。
请保持表达简洁，并避免生成与实际编程无关的内容。`,

  examples: [
    {
      user: "用Python写一个快速排序，并说明实现思路",
      ai: `以下是Python实现的快速排序，并附有注释：
\`\`\`python
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[0]
    left = [x for x in arr[1:] if x < pivot]
    right = [x for x in arr[1:] if x >= pivot]
    return quick_sort(left) + [pivot] + quick_sort(right)
\`\`\`
实现思路：快速排序通过选取一个"基准值"，将列表中比基准值小的元素放到左侧，比基准值大的放到右侧，然后递归排序左右子数组，最后合并结果。`,
    },
    {
      user: "下面这段Java代码有什么问题？\nfor(int i=0; i<=arr.length; i++) {\n    System.out.println(arr[i]);\n}",
      ai: `这段代码会导致 \`ArrayIndexOutOfBoundsException\` 异常。
问题出在循环条件：\`i<=arr.length\`。Java数组下标范围是0到arr.length-1，应该改为\`i<arr.length\`。`,
    },
    {
      user: "如何用JavaScript实现防抖函数？",
      ai: `防抖(debounce)函数可以减少高频触发事件带来的性能开销。以下是JavaScript实现：
\`\`\`javascript
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
\`\`\`
用法示例：\`window.addEventListener('resize', debounce(() => { /*...*/ }, 500));\``,
    },
    {
      user: "如何在Next.js中创建API路由？",
      ai: `Next.js API路由允许您在pages/api目录下创建后端API端点。以下是一个处理POST请求的示例：

\`\`\`javascript
// pages/api/users.js
export default function handler(req, res) {
  // 处理GET请求
  if (req.method === 'GET') {
    res.status(200).json({ users: ['张三', '李四', '王五'] });
  }
  // 处理POST请求
  else if (req.method === 'POST') {
    const { name } = req.body;
    res.status(201).json({ message: \`用户 \${name} 创建成功\` });
  }
  // 处理其他HTTP方法
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
\`\`\`

**关键特性**：
- 自动支持CORS和JSON解析
- 可通过动态路由参数（如/api/users/[id]）处理不同请求
- 内置TypeScript支持（使用NextApiRequest/NextApiResponse类型）`,
    },
    {
      user: "如何使用Node.js创建一个简单的HTTP服务器？",
      ai: `使用Node.js内置的http模块可以快速创建HTTP服务器。以下是一个简单示例：

\`\`\`javascript
const http = require('http');

const server = http.createServer((req, res) => {
  // 设置响应头
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  
  // 根据请求路径返回不同内容
  if (req.url === '/') {
    res.end('欢迎访问主页!\\n');
  } else if (req.url === '/about') {
    res.end('关于我们的页面\\n');
  } else {
    res.writeHead(404);
    res.end('页面未找到\\n');
  }
});

// 启动服务器，监听3000端口
server.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000/');
});
\`\`\`

**生产环境建议**：
- 使用Express/Koa等框架简化路由管理
- 添加错误处理中间件
- 实现日志记录和性能监控`,
    },
  ],

  supportedLanguages: [
    "Python",
    "JavaScript",
    "TypeScript",
    "Java",
    "C++",
    "C#",
    "Go",
    "Rust",
    "PHP",
    "Ruby",
    "Swift",
    "Kotlin",
    "Dart",
    "HTML",
    "CSS",
    "SQL",
  ],

  capabilities: [
    "代码生成",
    "代码优化",
    "错误修复",
    "代码解释",
    "最佳实践建议",
    "算法实现",
    "数据结构",
    "框架集成",
    "API开发",
    "前端开发",
    "后端开发",
    "数据库操作",
    "性能优化",
    "安全编程",
  ],
}

// 获取特定语言的示例
export function getLanguageExamples(language: string): DeepStackExample[] {
  return deepStackConfig.examples.filter(
    (example) =>
      example.ai.toLowerCase().includes(language.toLowerCase()) ||
      example.user.toLowerCase().includes(language.toLowerCase()),
  )
}

// 构建增强提示词
export function buildEnhancedPrompt(userPrompt: string, language?: string, context?: string): string {
  let enhancedPrompt = deepStackConfig.systemPrompt + "\n\n"

  if (language) {
    enhancedPrompt += `请使用${language}编程语言。\n\n`
  }

  if (context) {
    enhancedPrompt += `上下文信息：${context}\n\n`
  }

  enhancedPrompt += `用户请求：${userPrompt}`

  return enhancedPrompt
}

// 获取相关示例
export function getRelevantExamples(userPrompt: string, maxExamples = 3): DeepStackExample[] {
  const prompt = userPrompt.toLowerCase()

  // 简单的关键词匹配
  const scored = deepStackConfig.examples.map((example) => {
    let score = 0
    const exampleText = (example.user + " " + example.ai).toLowerCase()

    // 检查关键词匹配
    const keywords = prompt.split(/\s+/)
    keywords.forEach((keyword) => {
      if (exampleText.includes(keyword)) {
        score += 1
      }
    })

    return { example, score }
  })

  // 按分数排序并返回前N个
  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxExamples)
    .map((item) => item.example)
}
