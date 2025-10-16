"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

// Monaco Editor 类型定义
import type { ForwardedRef } from "react";
interface MonacoEditorProps {
  value?: string;
  language?: string;
  theme?: "vs-dark" | "light" | "vs";
  height?: string;
  width?: string;
  options?: any;
  onChange?: (value: string) => void;
  onMount?: (editor: any, monaco: any) => void;
  className?: string;
  readOnly?: boolean;
  ref?: ForwardedRef<any>;
}

// 错误边界 Hook
function useErrorBoundary() {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const captureError = useCallback((error: Error) => {
    console.error("Monaco Editor Error:", error);
    setError(error);
  }, []);

  return { error, resetError, captureError };
}

// 简化版 Monaco Editor 组件
export const MonacoEditor = React.forwardRef<any, MonacoEditorProps>(
  function MonacoEditor(
    {
      value = "",
      language = "typescript",
      theme = "vs-dark",
      height = "h-96",
      width = "w-full",
      options = {},
      onChange,
      onMount,
      className,
      readOnly = false,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<any>(null);
    // 允许外部 ref 访问 editor 实例
    React.useImperativeHandle(ref, () => editorRef.current, []);
    const monacoRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const { error, resetError, captureError } = useErrorBoundary();

    // 确保组件已挂载
    useEffect(() => {
      setMounted(true);
      return () => {
        setMounted(false);
        // 清理编辑器
        if (editorRef.current) {
          try {
            editorRef.current.dispose();
          } catch (err) {
            console.warn("Editor disposal error:", err);
          }
          editorRef.current = null;
        }
      };
    }, []);

    const initializeMonaco = useCallback(async () => {
      if (!mounted || !containerRef.current || typeof window === "undefined") {
        return;
      }

      try {
        setIsLoading(true);
        resetError();

        // 动态导入 Monaco Editor
        const monaco = await import("monaco-editor");
        monacoRef.current = monaco;

        // 配置 Monaco 环境
        if (!(window as any).MonacoEnvironment) {
          (window as any).MonacoEnvironment = {
            getWorkerUrl: function (moduleId: string, label: string) {
              // 使用内联 worker 避免文件路径问题
              return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
              self.MonacoEnvironment = { baseUrl: '/' };
              self.importScripts = function() {};
              self.postMessage = function(data) {
                if (data.type === 'getWorkerUrl') {
                  self.postMessage({ type: 'workerUrl', url: 'data:text/javascript;charset=utf-8,' });
                }
              };
            `)}`;
            },
          };
        }

        // 清理现有编辑器
        if (editorRef.current) {
          editorRef.current.dispose();
        }

        // 创建编辑器
        const editor = monaco.editor.create(containerRef.current, {
          value,
          language,
          theme,
          readOnly,
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          contextmenu: false,
          selectOnLineNumbers: true,
          quickSuggestions: false,
          parameterHints: { enabled: false },
          suggestOnTriggerCharacters: false,
          acceptSuggestionOnEnter: "off",
          tabCompletion: "off",
          wordBasedSuggestions: "off",
          ...options,
        });

        editorRef.current = editor;

        // 监听值变化
        const disposable = editor.onDidChangeModelContent(() => {
          if (onChange && mounted && editorRef.current) {
            try {
              const currentValue = editor.getValue();
              onChange(currentValue);
            } catch (err) {
              console.warn("Monaco onChange error:", err);
            }
          }
        });

        // 调用 onMount 回调
        if (onMount && mounted) {
          try {
            onMount(editor, monaco);
          } catch (err) {
            console.warn("Monaco onMount error:", err);
          }
        }

        setIsLoading(false);

        // 返回清理函数
        return () => {
          try {
            disposable?.dispose();
            if (editorRef.current) {
              editorRef.current.dispose();
              editorRef.current = null;
            }
          } catch (err) {
            console.warn("Monaco cleanup error:", err);
          }
        };
      } catch (err) {
        captureError(
          err instanceof Error ? err : new Error("Monaco 初始化失败")
        );
        setIsLoading(false);
      }
    }, [
      mounted,
      value,
      language,
      theme,
      readOnly,
      options,
      onChange,
      onMount,
      resetError,
      captureError,
    ]);

    // 初始化编辑器
    useEffect(() => {
      if (!mounted) return;

      let cleanup: (() => void) | undefined;

      const init = async () => {
        try {
          cleanup = await initializeMonaco();
        } catch (err) {
          captureError(
            err instanceof Error ? err : new Error("Monaco 初始化失败")
          );
        }
      };

      // 延迟初始化，避免SSR问题
      const timer = setTimeout(init, 100);

      return () => {
        clearTimeout(timer);
        if (cleanup) {
          cleanup();
        }
      };
    }, [initializeMonaco]);

    // 更新编辑器值
    useEffect(() => {
      if (
        editorRef.current &&
        mounted &&
        value !== editorRef.current.getValue()
      ) {
        try {
          editorRef.current.setValue(value || "");
        } catch (err) {
          console.warn("Monaco setValue error:", err);
        }
      }
    }, [value, mounted]);

    // 更新编辑器主题
    useEffect(() => {
      if (monacoRef.current && editorRef.current && mounted) {
        try {
          monacoRef.current.editor.setTheme(theme);
        } catch (err) {
          console.warn("Monaco setTheme error:", err);
        }
      }
    }, [theme, mounted]);

    // 更新编辑器语言
    useEffect(() => {
      if (monacoRef.current && editorRef.current && mounted) {
        try {
          const model = editorRef.current.getModel();
          if (model) {
            monacoRef.current.editor.setModelLanguage(model, language);
          }
        } catch (err) {
          console.warn("Monaco setLanguage error:", err);
        }
      }
    }, [language, mounted]);

    // 如果组件未挂载，显示占位符
    if (!mounted) {
      return (
        <div
          className={cn(
            "animate-pulse bg-muted rounded-md",
            height,
            width,
            className
          )}
        />
      );
    }

    // 如果有错误，显示错误信息
    if (error) {
      return (
        <div
          className={cn(
            "flex items-center justify-center border border-red-300 bg-red-50 text-red-700 rounded-md",
            height,
            width,
            className
          )}
        >
          <div className="text-center p-4">
            <p className="text-sm font-medium">编辑器加载失败</p>
            <p className="text-xs text-red-600 mt-1 max-w-md">
              {error.message}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={resetError}
                className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 rounded transition-colors"
              >
                重试
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                刷新页面
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={cn("relative", height, width, className)}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background border border-border rounded-md z-10">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">
                加载编辑器...
              </span>
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          className={cn(
            "w-full h-full border border-border rounded-md overflow-hidden bg-background",
            isLoading && "opacity-0"
          )}
        />
      </div>
    );
  }
);

// 后备文本编辑器
export function FallbackEditor({
  value = "",
  language = "text",
  onChange,
  className,
  readOnly = false,
  height = "h-96",
  width = "w-full",
}: {
  value?: string;
  language?: string;
  onChange?: (value: string) => void;
  className?: string;
  readOnly?: boolean;
  height?: string;
  width?: string;
}) {
  const [code, setCode] = useState(value);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setCode(value || "");
    }
  }, [value, mounted]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setCode(newValue);
      if (onChange && mounted) {
        onChange(newValue);
      }
    },
    [onChange, mounted]
  );

  if (!mounted) {
    return (
      <div
        className={cn(
          "animate-pulse bg-muted rounded-md",
          height,
          width,
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative border border-border rounded-md bg-background",
        height,
        width,
        className
      )}
    >
      <div className="absolute top-2 right-2 z-10 text-xs text-muted-foreground bg-background px-2 py-1 rounded border">
        {language}
      </div>
      <textarea
        value={code}
        onChange={handleChange}
        readOnly={readOnly}
        placeholder="在此输入代码..."
        className={cn(
          "w-full h-full p-4 font-mono text-sm",
          "bg-background text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "resize-none overflow-auto rounded-md",
          "border-0 ring-0",
          readOnly && "cursor-not-allowed opacity-70"
        )}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  );
}

// 智能编辑器 - 尝试加载 Monaco，失败时使用后备编辑器
export function SmartEditor(props: MonacoEditorProps) {
  const [useMonaco, setUseMonaco] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "animate-pulse bg-muted rounded-md",
          props.height || "h-96",
          props.width || "w-full"
        )}
      />
    );
  }

  if (!useMonaco) {
    return <FallbackEditor {...props} />;
  }

  return (
    <MonacoEditor
      {...props}
      onMount={(editor, monaco) => {
        if (props.onMount) {
          try {
            props.onMount(editor, monaco);
          } catch (err) {
            console.warn("onMount callback error:", err);
            setUseMonaco(false);
          }
        }
      }}
    />
  );
}

// 默认导出智能编辑器
export default SmartEditor;

// 导出类型
export type { MonacoEditorProps };
