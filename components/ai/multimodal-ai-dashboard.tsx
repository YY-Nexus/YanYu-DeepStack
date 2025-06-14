"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Mic, Video, ImageIcon, FileText, Square, Copy, Sparkles, Brain, Zap } from "lucide-react"
import { multimodalAIService } from "@/lib/ai/multimodal-ai-service"

// 多模态AI控制面板组件
export default function MultimodalAIDashboard() {
  // 状态管理
  const [activeTab, setActiveTab] = useState("text")
  const [textInput, setTextInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [results, setResults] = useState<any[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  // 引用
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 处理文本生成
  const handleTextGeneration = useCallback(async () => {
    if (!textInput.trim()) return

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setProcessingProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await multimodalAIService.generateText(textInput, "gpt-4o")

      clearInterval(progressInterval)
      setProcessingProgress(100)

      // 添加结果到列表
      const newResult = {
        id: Date.now(),
        type: "text",
        input: textInput,
        output: response.text,
        timestamp: new Date(),
        model: "gpt-4o",
        tokens: response.usage?.total_tokens || 0,
      }

      setResults((prev) => [newResult, ...prev])
      setTextInput("")
    } catch (error) {
      console.error("文本生成失败:", error)
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }, [textInput])

  // 处理图像分析
  const handleImageAnalysis = useCallback(async (files: File[]) => {
    if (files.length === 0) return

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      for (const file of files) {
        // 模拟进度更新
        const progressInterval = setInterval(() => {
          setProcessingProgress((prev) => Math.min(prev + 5, 90))
        }, 300)

        const response = await multimodalAIService.analyzeImage(file, "请详细分析这张图片的内容")

        clearInterval(progressInterval)
        setProcessingProgress(100)

        // 添加结果到列表
        const newResult = {
          id: Date.now() + Math.random(),
          type: "image",
          input: file.name,
          output: response.analysis,
          timestamp: new Date(),
          model: "gpt-4-vision",
          file: file,
          confidence: response.confidence,
        }

        setResults((prev) => [newResult, ...prev])
      }

      setSelectedFiles([])
    } catch (error) {
      console.error("图像分析失败:", error)
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }, [])

  // 处理语音识别
  const handleVoiceRecognition = useCallback(async (audioBlob: Blob) => {
    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setProcessingProgress((prev) => Math.min(prev + 8, 90))
      }, 250)

      const response = await multimodalAIService.processAudio(audioBlob, "transcribe")

      clearInterval(progressInterval)
      setProcessingProgress(100)

      // 添加结果到列表
      const newResult = {
        id: Date.now(),
        type: "audio",
        input: "语音录音",
        output: response.transcription,
        timestamp: new Date(),
        model: "whisper-1",
        duration: response.duration,
        confidence: response.confidence,
      }

      setResults((prev) => [newResult, ...prev])
    } catch (error) {
      console.error("语音识别失败:", error)
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }, [])

  // 开始录音
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" })
        handleVoiceRecognition(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      setRecordingTime(0)

      // 开始计时
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("开始录音失败:", error)
    }
  }, [handleVoiceRecognition])

  // 停止录音
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
      setIsRecording(false)

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }
  }, [isRecording])

  // 处理文件选择
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || [])
      setSelectedFiles(files)

      // 自动处理图像文件
      const imageFiles = files.filter((file) => file.type.startsWith("image/"))
      if (imageFiles.length > 0) {
        handleImageAnalysis(imageFiles)
      }
    },
    [handleImageAnalysis],
  )

  // 复制结果到剪贴板
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error("复制失败:", error)
    }
  }, [])

  // 格式化录音时间
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">多模态AI控制面板</h1>
          <p className="text-gray-600">文本生成、图像分析、语音识别一体化AI服务</p>
        </div>
      </div>

      {/* 处理进度 */}
      {isProcessing && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>AI正在处理中...</span>
                <span>{processingProgress}%</span>
              </div>
              <Progress value={processingProgress} className="w-full" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 多模态输入面板 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>多模态输入</span>
          </CardTitle>
          <CardDescription>支持文本、图像、语音等多种输入方式的AI处理</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="text" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>文本</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center space-x-2">
                <ImageIcon className="h-4 w-4" />
                <span>图像</span>
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center space-x-2">
                <Mic className="h-4 w-4" />
                <span>语音</span>
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center space-x-2">
                <Video className="h-4 w-4" />
                <span>视频</span>
              </TabsTrigger>
            </TabsList>

            {/* 文本输入 */}
            <TabsContent value="text" className="space-y-4">
              <div className="space-y-4">
                <Textarea
                  placeholder="请输入您想要AI处理的文本内容..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">字符数: {textInput.length}</div>
                  <Button
                    onClick={handleTextGeneration}
                    disabled={!textInput.trim() || isProcessing}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    生成内容
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* 图像输入 */}
            <TabsContent value="image" className="space-y-4">
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700">点击上传图像文件</p>
                  <p className="text-sm text-gray-500">支持 JPG, PNG, GIF, WebP 格式</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">已选择文件:</p>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <ImageIcon className="h-4 w-4" />
                        <span>{file.name}</span>
                        <Badge variant="secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 语音输入 */}
            <TabsContent value="audio" className="space-y-4">
              <div className="space-y-4">
                <div className="text-center space-y-4">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      disabled={isProcessing}
                      size="lg"
                      className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                    >
                      <Mic className="h-5 w-5 mr-2" />
                      开始录音
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-lg font-mono">{formatRecordingTime(recordingTime)}</span>
                        </div>
                      </div>
                      <Button onClick={stopRecording} size="lg" variant="outline">
                        <Square className="h-5 w-5 mr-2" />
                        停止录音
                      </Button>
                    </div>
                  )}
                </div>
                <div className="text-center text-sm text-gray-500">点击开始录音，AI将自动识别语音内容</div>
              </div>
            </TabsContent>

            {/* 视频输入 */}
            <TabsContent value="video" className="space-y-4">
              <div className="text-center space-y-4">
                <Video className="h-16 w-16 mx-auto text-gray-400" />
                <p className="text-lg font-medium text-gray-700">视频处理功能</p>
                <p className="text-sm text-gray-500">即将推出，敬请期待</p>
                <Button disabled variant="outline">
                  <Video className="h-4 w-4 mr-2" />
                  上传视频
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 处理结果 */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>处理结果</CardTitle>
            <CardDescription>AI处理的历史记录和结果</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result) => (
                <div key={result.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {result.type === "text" && <FileText className="h-3 w-3 mr-1" />}
                        {result.type === "image" && <ImageIcon className="h-3 w-3 mr-1" />}
                        {result.type === "audio" && <Mic className="h-3 w-3 mr-1" />}
                        {result.type.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary">{result.model}</Badge>
                      {result.confidence && (
                        <Badge variant="outline">置信度: {(result.confidence * 100).toFixed(1)}%</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(result.output)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <span className="text-xs text-gray-500">{result.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-700">输入:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{result.input}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">输出:</p>
                      <div className="text-sm text-gray-800 bg-blue-50 p-3 rounded whitespace-pre-wrap">
                        {result.output}
                      </div>
                    </div>
                  </div>

                  {result.tokens && <div className="text-xs text-gray-500">使用Token: {result.tokens}</div>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
