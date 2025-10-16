import React, { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Zap, Code, FlaskConical, Database } from "lucide-react";

// 新设计仪表盘右侧面板
export default function ModelEngineDashboardPanel({
  onQuickAction
}: {
  onQuickAction?: (action: string) => void
}) {
  // 系统状态模拟
  const [cpu, setCpu] = useState(49);
  const [mem, setMem] = useState(92); // 高内存占用，触发红色
  const [nodes, setNodes] = useState(5);
  const [models, setModels] = useState(48);
  const [todayCalls, setTodayCalls] = useState(19);
  const [codeLines, setCodeLines] = useState(95);

  // 定时刷新模拟
  useEffect(() => {
    const timer = setInterval(() => {
      setCpu(Math.floor(40 + Math.random() * 30));
      setMem(Math.floor(80 + Math.random() * 20));
      setNodes(5 + Math.floor(Math.random() * 2));
      setModels(48 + Math.floor(Math.random() * 2));
      setTodayCalls(15 + Math.floor(Math.random() * 10));
      setCodeLines(90 + Math.floor(Math.random() * 10));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-80 flex flex-col gap-4">
      {/* 系统状态 */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-2">
        <div className="font-semibold text-base mb-2">系统状态</div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-500 text-sm">CPU使用率</span>
          <Progress value={cpu} className="w-32 h-2" />
          <span className="ml-2 text-gray-700 font-bold text-base">{cpu}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-sm">内存使用率</span>
          <Progress value={mem} className={`w-32 h-2 ${mem > 85 ? 'text-red-500' : ''}`} />
          <span className={`ml-2 font-bold text-base ${mem > 85 ? 'text-red-500' : 'text-gray-700'}`}>{mem}%</span>
        </div>
      </div>
      {/* 统计区块 */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center">
          <div className="text-2xl font-bold text-blue-500 mb-1">{nodes}</div>
          <div className="text-xs text-gray-500">节点</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center">
          <div className="text-2xl font-bold text-purple-500 mb-1">{models}</div>
          <div className="text-xs text-gray-500">模型</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center">
          <div className="text-2xl font-bold text-orange-500 mb-1">{todayCalls}</div>
          <div className="text-xs text-gray-500">今日调用</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center">
          <div className="text-2xl font-bold text-green-500 mb-1">{codeLines}</div>
          <div className="text-xs text-gray-500">代码量</div>
        </div>
      </div>
      {/* 快捷操作 */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-2">
        <div className="font-semibold text-base mb-2">快捷操作</div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1" onClick={() => onQuickAction?.('code')}>
            <Code className="mr-1 h-4 w-4" />
            生成代码
          </Button>
          <Button variant="secondary" size="sm" className="flex-1" onClick={() => onQuickAction?.('experiment')}>
            <FlaskConical className="mr-1 h-4 w-4" />
            创建实验
          </Button>
          <Button variant="secondary" size="sm" className="flex-1" onClick={() => onQuickAction?.('data')}>
            <Database className="mr-1 h-4 w-4" />
            数据分析
          </Button>
        </div>
      </div>
    </div>
  );
}
