"use client"

import { useEffect, useRef } from "react"
import * as monaco from "monaco-editor"

interface MonacoEditorProps {
  value: string
  language: string
  onChange: (value: string) => void
  options?: monaco.editor.IStandaloneEditorConstructionOptions
  className?: string
}

export default function MonacoEditor({ value, language, onChange, options = {}, className = "" }: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor>()

  useEffect(() => {
    if (editorRef.current) {
      // 配置Monaco Editor主题
      monaco.editor.defineTheme("yanyu-theme", {
        base: "vs",
        inherit: true,
        rules: [
          { token: "comment", foreground: "6a737d", fontStyle: "italic" },
          { token: "keyword", foreground: "d73a49", fontStyle: "bold" },
          { token: "string", foreground: "032f62" },
          { token: "number", foreground: "005cc5" },
          { token: "function", foreground: "6f42c1" },
        ],
        colors: {
          "editor.background": "#ffffff",
          "editor.foreground": "#24292e",
          "editor.lineHighlightBackground": "#f6f8fa",
          "editor.selectionBackground": "#0366d625",
          "editorCursor.foreground": "#044289",
          "editorLineNumber.foreground": "#6a737d",
        },
      })

      // 创建编辑器实例
      monacoRef.current = monaco.editor.create(editorRef.current, {
        value,
        language,
        theme: "yanyu-theme",
        fontSize: 14,
        lineNumbers: "on",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: "on",
        tabSize: 2,
        insertSpaces: true,
        ...options,
      })

      // 监听内容变化
      monacoRef.current.onDidChangeModelContent(() => {
        const currentValue = monacoRef.current?.getValue() || ""
        onChange(currentValue)
      })

      return () => {
        monacoRef.current?.dispose()
      }
    }
  }, [])

  // 更新编辑器内容
  useEffect(() => {
    if (monacoRef.current && monacoRef.current.getValue() !== value) {
      monacoRef.current.setValue(value)
    }
  }, [value])

  // 更新编辑器语言
  useEffect(() => {
    if (monacoRef.current) {
      const model = monacoRef.current.getModel()
      if (model) {
        monaco.editor.setModelLanguage(model, language)
      }
    }
  }, [language])

  return <div ref={editorRef} className={`h-full w-full ${className}`} />
}
