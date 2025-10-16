"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wand2,
  Brain,
  Zap,
  Target,
  Shield,
} from "lucide-react";
import MonacoEditor from "@/components/ui/monaco-editor";
import { BrandButton } from "@/components/ui/brand-button";
import { BrandCard } from "@/components/ui/brand-card";
import { BrandBadge } from "@/components/ui/brand-badge";
import {
  aiService,
  type CodeSuggestion,
  type CodeQualityReport,
} from "@/lib/ai-service";

interface AIEnhancedEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  onAIAssist?: (type: string, data: any) => void;
  className?: string;
}

export default function AIEnhancedEditor({
  value,
  language,
  onChange,
  onAIAssist,
  className = "",
}: AIEnhancedEditorProps) {
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
  const [qualityReport, setQualityReport] = useState<CodeQualityReport | null>(
    null
  );
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showQualityPanel, setShowQualityPanel] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAssistMode, setAiAssistMode] = useState<
    "suggestions" | "completion" | "fix" | "generate"
  >("suggestions");
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [showNLInput, setShowNLInput] = useState(false);

  const editorRef = useRef<any>(null);
  // 修改类型以兼容浏览器和Node.js环境
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 实时分析代码
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (value.trim()) {
        await analyzeCode();
      }
    }, 1000); // 1秒防抖

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, language]);

  // 分析代码质量和获取建议
  const analyzeCode = async () => {
    try {
      setIsAnalyzing(true);

      // 并行获取建议和质量报告
      const [suggestionsResult, qualityResult] = await Promise.all([
        aiService.getCodeSuggestions(value, language),
        aiService.analyzeCodeQuality(value, language),
      ]);

      setSuggestions(suggestionsResult);
      setQualityReport(qualityResult);
    } catch (error) {
      console.error("代码分析失败:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 应用建议修复
  const applySuggestion = (suggestion: CodeSuggestion) => {
    if (suggestion.fix) {
      // 这里应该根据建议的行号和列号来应用修复
      // 简化实现：在当前位置插入修复代码
      const newValue = value + "\n" + suggestion.fix.code;
      onChange(newValue);

      // 从建议列表中移除已应用的建议
      setSuggestions(suggestions.filter((s) => s.id !== suggestion.id));

      onAIAssist?.("suggestion_applied", suggestion);
    }
  };

  // 自然语言生成代码
  const generateFromNaturalLanguage = async () => {
    if (!naturalLanguageInput.trim()) return;

    try {
      setIsAnalyzing(true);
      const result = await aiService.generateCodeFromNaturalLanguage(
        naturalLanguageInput,
        language,
        value
      );

      // 在当前位置插入生成的代码
      const newValue = value + "\n\n" + result.code;
      onChange(newValue);
      setNaturalLanguageInput("");
      setShowNLInput(false);

      onAIAssist?.("code_generated", result);
    } catch (error) {
      console.error("代码生成失败:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 获取质量分数颜色
  const getScoreColor = (score: number) => {
    if (score >= 9) return "text-green-600";
    if (score >= 7) return "text-yellow-600";
    if (score >= 5) return "text-orange-600";
    return "text-red-600";
  };

  // 获取建议类型图标
  const getSuggestionIcon = (type: CodeSuggestion["type"]) => {
    switch (type) {
      case "optimization":
        return Zap;
      case "best-practice":
        return Target;
      case "security":
        return Shield;
      case "performance":
        return Zap;
      case "style":
        return Sparkles;
      default:
        return Lightbulb;
    }
  };

  // 获取严重程度颜色
  const getSeverityColor = (severity: CodeSuggestion["severity"]) => {
    switch (severity) {
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "info":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className={`h-full flex ${className}`}>
      {/* 主编辑器区域 */}
      <div className="flex-1 flex flex-col">
        {/* AI工具栏 */}
        <div className="p-3 bg-gradient-to-r from-cloud-blue-50 to-mint-green/10 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Brain className="h-4 w-4 text-cloud-blue-500" />
                <span className="text-sm font-medium text-gray-700">
                  AI助手
                </span>
              </div>
              {isAnalyzing && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  <Sparkles className="h-4 w-4 text-cloud-blue-500" />
                </motion.div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* AI模式切换 */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[
                  { mode: "suggestions", icon: Lightbulb, tooltip: "智能建议" },
                  { mode: "completion", icon: Zap, tooltip: "代码补全" },
                  { mode: "fix", icon: CheckCircle, tooltip: "错误修复" },
                  { mode: "generate", icon: Wand2, tooltip: "代码生成" },
                ].map(({ mode, icon: Icon, tooltip }) => (
                  <motion.button
                    key={mode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAiAssistMode(mode as any)}
                    className={`p-1.5 rounded-md transition-colors ${
                      aiAssistMode === mode
                        ? "bg-white shadow-sm text-cloud-blue-500"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    title={tooltip}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.button>
                ))}
              </div>

              {/* 自然语言输入按钮 */}
              <BrandButton
                variant="outline"
                size="sm"
                icon={<Wand2 className="h-4 w-4" />}
                onClick={() => setShowNLInput(!showNLInput)}
              >
                自然语言
              </BrandButton>

              {/* 质量报告按钮 */}
              <BrandButton
                variant={showQualityPanel ? "primary" : "outline"}
                size="sm"
                icon={<Target className="h-4 w-4" />}
                onClick={() => setShowQualityPanel(!showQualityPanel)}
              >
                质量报告
              </BrandButton>
            </div>
          </div>

          {/* 自然语言输入框 */}
          <AnimatePresence>
            {showNLInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={naturalLanguageInput}
                    onChange={(e) => setNaturalLanguageInput(e.target.value)}
                    placeholder="用自然语言描述您想要的代码功能..."
                    className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        generateFromNaturalLanguage();
                      }
                    }}
                  />
                  <BrandButton
                    variant="primary"
                    size="sm"
                    onClick={generateFromNaturalLanguage}
                    loading={isAnalyzing}
                    disabled={!naturalLanguageInput.trim()}
                  >
                    生成
                  </BrandButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 编辑器 */}
        <div className="flex-1">
          <MonacoEditor
            ref={editorRef}
            value={value}
            language={language}
            onChange={onChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              wordWrap: "on",
              automaticLayout: true,
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              // 启用AI增强功能
              suggest: {
                showMethods: true,
                showFunctions: true,
                showConstructors: true,
                showFields: true,
                showVariables: true,
                showClasses: true,
                showStructs: true,
                showInterfaces: true,
                showModules: true,
                showProperties: true,
                showEvents: true,
                showOperators: true,
                showUnits: true,
                showValues: true,
                showConstants: true,
                showEnums: true,
                showEnumMembers: true,
                showKeywords: true,
                showWords: true,
                showColors: true,
                showFiles: true,
                showReferences: true,
                showFolders: true,
                showTypeParameters: true,
                showSnippets: true,
              },
            }}
          />
        </div>
      </div>

      {/* AI建议面板 */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="w-80 border-l border-gray-200/50 bg-white"
          >
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-cloud-blue-500" />
                    <span>AI建议</span>
                  </h3>
                  <BrandBadge variant="info" size="sm">
                    {suggestions.length} 条建议
                  </BrandBadge>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 space-y-3">
                {suggestions.map((suggestion) => {
                  const Icon = getSuggestionIcon(suggestion.type);
                  return (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <BrandCard
                        variant="outlined"
                        className={`p-3 border-l-4 ${getSeverityColor(suggestion.severity)}`}
                      >
                        <div className="flex items-start space-x-3">
                          <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-800 mb-1">
                              {suggestion.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-2">
                              {suggestion.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                行 {suggestion.line}:{suggestion.column}
                              </span>
                              <div className="flex items-center space-x-2">
                                <BrandBadge
                                  variant={
                                    suggestion.severity === "error"
                                      ? "error"
                                      : suggestion.severity === "warning"
                                        ? "warning"
                                        : "info"
                                  }
                                  size="sm"
                                >
                                  {suggestion.confidence * 100}%
                                </BrandBadge>
                                {suggestion.fix && (
                                  <BrandButton
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applySuggestion(suggestion)}
                                  >
                                    应用
                                  </BrandButton>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </BrandCard>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 质量报告面板 */}
      <AnimatePresence>
        {showQualityPanel && qualityReport && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="w-80 border-l border-gray-200/50 bg-white"
          >
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                    <Target className="h-5 w-5 text-cloud-blue-500" />
                    <span>质量报告</span>
                  </h3>
                  <BrandBadge
                    variant={
                      qualityReport.overallScore >= 8
                        ? "success"
                        : qualityReport.overallScore >= 6
                          ? "warning"
                          : "error"
                    }
                    size="sm"
                  >
                    {qualityReport.overallScore.toFixed(1)}/10
                  </BrandBadge>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 space-y-4">
                {/* 总体评分 */}
                <BrandCard variant="outlined" className="p-4 text-center">
                  <div
                    className={`text-3xl font-bold mb-2 ${getScoreColor(qualityReport.overallScore)}`}
                  >
                    {qualityReport.overallScore.toFixed(1)}
                  </div>
                  <p className="text-sm text-gray-600">总体质量评分</p>
                </BrandCard>

                {/* 详细指标 */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-800">
                    详细指标
                  </h4>
                  {Object.entries(qualityReport.metrics).map(
                    ([key, metric]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-700 capitalize">
                              {key === "complexity"
                                ? "复杂度"
                                : key === "maintainability"
                                  ? "可维护性"
                                  : key === "readability"
                                    ? "可读性"
                                    : key === "testability"
                                      ? "可测试性"
                                      : key === "security"
                                        ? "安全性"
                                        : key}
                            </span>
                            <span
                              className={`text-sm font-medium ${getScoreColor(metric.score)}`}
                            >
                              {metric.score.toFixed(1)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${metric.score * 10}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className={`h-2 rounded-full ${
                                metric.score >= 8
                                  ? "bg-green-500"
                                  : metric.score >= 6
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* 问题列表 */}
                {qualityReport.issues.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-800">
                      发现的问题
                    </h4>
                    {qualityReport.issues.map((issue, index) => (
                      <BrandCard key={index} variant="outlined" className="p-3">
                        <div className="flex items-start space-x-2">
                          {issue.type === "error" ? (
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                          ) : issue.type === "warning" ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">
                              {issue.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              行 {issue.line}
                            </p>
                          </div>
                        </div>
                      </BrandCard>
                    ))}
                  </div>
                )}

                {/* 改进建议 */}
                {qualityReport.suggestions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-800">
                      改进建议
                    </h4>
                    {qualityReport.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-cloud-blue-500 mt-0.5" />
                        <p className="text-sm text-gray-700">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
