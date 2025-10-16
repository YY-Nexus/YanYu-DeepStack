"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Code,
  Copy,
  Save,
  Star,
  Play,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { BrandButton } from "@/components/ui/brand-button";
import { BrandCard } from "@/components/ui/brand-card";
import { BrandBadge } from "@/components/ui/brand-badge";

function AiCodeGeneration() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [language, setLanguage] = useState("python");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);

  // 代码生成逻辑可在此补充
  const models = [
    { id: "gpt-4", name: "GPT-4" },
    { id: "claude-3", name: "Claude-3" },
    { id: "llama3", name: "Llama3" },
    { id: "qwen2", name: "Qwen2" },
    { id: "codellama", name: "CodeLlama" },
  ];
  const languages = [
    "python",
    "javascript",
    "typescript",
    "java",
    "cpp",
    "go",
    "rust",
    "php",
  ];

  // 分屏/合并切换
  const [split, setSplit] = useState(false); // true=分屏，false=合并 (默认合屏)

  // 跳转本地大模型管理页
  const handleGoLocalModel = () => {
    window.location.href = "/admin/local-models";
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* 顶部标题栏：彩色渐变旋变大字居中 */}
      <div className="w-full flex flex-col items-center justify-center px-8 pt-8 pb-2 select-none">
        <h1 className="gradient-rotate text-3xl md:text-4xl font-extrabold text-center select-none">
          言传千行代码丨语枢万物智联
        </h1>
      </div>
      {/* 顶部功能栏：模型选择、语言选择，下拉式 */}
      <div className="flex items-center px-8 py-4 border-b border-gray-200 bg-white/90 gap-4">
        <div className="flex-1 flex items-center">
          {/* 原“本地大模型管理”按钮已删除 */}
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-4 py-2 border rounded-lg text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            title="选择大模型"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-4 py-2 border rounded-lg text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            title="选择目标语言"
          >
            {languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          {/* 分屏/合并切换按钮，主内容区和左侧导航栏第三项交互一致 */}
          <button
            className={`rounded border px-4 py-2 font-medium transition-all duration-150 shadow-sm hover:bg-blue-100 active:scale-95 ${split ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"}`}
            onClick={() => setSplit((v) => !v)}
            title={split ? "切换为合并视图" : "切换为分屏视图"}
          >
            <Code className="w-4 h-4 mr-1 inline-block" />
            {split ? "分屏" : "合并"}
          </button>
        </div>
      </div>
      {/* 主内容区一分为二或合并，分割线加阴影 */}
      <div className="flex flex-1">
        {/* 左侧：AI智能交互区 */}
        <div
          className="flex-1 flex flex-col bg-white/80 transition-all duration-300"
        >
          {/* 对话历史区 */}
          <div className="flex-1 overflow-auto p-6 space-y-2">
            {/* 红色框“AI智能交互区”已删除，仅保留空内容或注释 */}
            {messages.length === 0 && (
              <div className="text-gray-300 text-center mt-20 select-none text-base">
                暂无对话
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-2 text-base ${msg.role === "user" ? "text-blue-700" : "text-green-700"}`}
              >
                <b>{msg.role === "user" ? "我" : "AI"}：</b> {msg.content}
              </div>
            ))}
          </div>
          {/* 用户输入区，参照蓝色箭头位置 */}
          <div className="p-4 border-t flex items-center gap-2 bg-white">
            <input
              className="flex-1 rounded-full border px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-150"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="请输入需求、问题或指令..."
            />
            <button
              className="rounded-full bg-gray-100 p-2 text-xl hover:bg-blue-200 active:scale-95 transition"
              title="表情"
              tabIndex={0}
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <button
              className="rounded-full bg-gray-100 p-2 text-xl hover:bg-blue-200 active:scale-95 transition"
              title="上传"
              tabIndex={0}
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              className="rounded-full bg-gray-100 p-2 text-xl hover:bg-blue-200 active:scale-95 transition"
              title="语音"
              tabIndex={0}
            >
              <AlertCircle className="w-5 h-5" />
            </button>
            <button
              className="rounded-full bg-blue-500 text-white px-6 py-2 font-semibold text-base hover:bg-blue-600 active:scale-95 transition flex items-center gap-1"
              onClick={async () => {
                if (!prompt.trim()) return;
                setMessages((msgs) => [
                  ...msgs,
                  { role: "user", content: prompt },
                ]);
                setIsGenerating(true);
                // 这里可接入统一API调用
                setTimeout(() => {
                  setMessages((msgs) => [
                    ...msgs,
                    { role: "ai", content: `已收到：${prompt}` },
                  ]);
                  // 生成代码时自动分屏
                  setSplit(true);
                  // 模拟生成代码内容
                  setGeneratedCode(`# ${prompt}\n\n# 由${selectedModel}生成的${language}代码示例\nprint("Hello from AI code generation")`);
                  setIsGenerating(false);
                  setPrompt("");
                }, 1200);
              }}
              disabled={isGenerating || !prompt.trim()}
              tabIndex={0}
            >
              <Play className="w-4 h-4" />
              发送
            </button>
          </div>
        </div>
        {/* 右侧：智能生成内容/代码预览区 */}

        {split && (
          <RightPanel
            generatedCode={generatedCode}
            setGeneratedCode={setGeneratedCode}
          />
        )}
      </div>
    </div>
  );
}

// 只保留一份定义在文件底部
function RightPanel({
  generatedCode,
  setGeneratedCode,
}: {
  generatedCode: string;
  setGeneratedCode: (v: string) => void;
}) {
  return (
    <div className="flex-1 flex flex-col bg-gray-50 transition-all duration-300">
      <div className="flex-1 p-6 overflow-auto">
        <div className="bg-white rounded-lg shadow p-4 min-h-[300px] text-base text-gray-800 font-mono whitespace-pre-wrap">
          {generatedCode || ""}
        </div>
      </div>
      <div className="p-4 border-t flex gap-2 bg-white">
        <button
          className="rounded border px-4 py-2 hover:bg-blue-100 active:scale-95 transition flex items-center gap-1"
          onClick={() => navigator.clipboard.writeText(generatedCode)}
          disabled={!generatedCode}
          tabIndex={0}
        >
          <Copy className="w-4 h-4" />
          复制
        </button>
        <button
          className="rounded border px-4 py-2 hover:bg-blue-100 active:scale-95 transition flex items-center gap-1"
          onClick={() => setGeneratedCode("")}
          tabIndex={0}
        >
          <Save className="w-4 h-4" />
          清空
        </button>
        <button
          className="rounded border px-4 py-2 hover:bg-blue-100 active:scale-95 transition flex items-center gap-1"
          onClick={() => alert("下载功能开发中")}
          tabIndex={0}
        >
          <DownloadIcon />
          下载
        </button>
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 20 20">
      <path
        d="M10 3v10m0 0l-4-4m4 4l4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="4" y="15" width="12" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

export default AiCodeGeneration;
