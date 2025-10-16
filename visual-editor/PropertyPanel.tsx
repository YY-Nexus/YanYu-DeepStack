import React from "react"

export interface PropertyPanelProps {
  selectedAsset: any | null
  canvasData: any[]
  setCanvasData: (data: any[]) => void
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ selectedAsset, canvasData, setCanvasData }) => {
  if (!selectedAsset) {
    return (
      <aside className="w-64 h-full bg-slate-50 border-l flex flex-col p-4">
        <h2 className="font-bold mb-2 text-blue-700">属性面板</h2>
        <div className="text-gray-400">请选择组件以编辑属性</div>
      </aside>
    )
  }

  // 名称
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setCanvasData(
      canvasData.map((item) =>
        item.id === selectedAsset.id ? { ...item, name: newName } : item
      )
    )
  }
  // 颜色
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setCanvasData(
      canvasData.map((item) =>
        item.id === selectedAsset.id ? { ...item, color } : item
      )
    )
  }
  // 宽高
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const width = Number(e.target.value)
    setCanvasData(
      canvasData.map((item) =>
        item.id === selectedAsset.id ? { ...item, width } : item
      )
    )
  }
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const height = Number(e.target.value)
    setCanvasData(
      canvasData.map((item) =>
        item.id === selectedAsset.id ? { ...item, height } : item
      )
    )
  }
  // 事件绑定（示例：onClick）
  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onClick = e.target.value
    setCanvasData(
      canvasData.map((item) =>
        item.id === selectedAsset.id ? { ...item, onClick } : item
      )
    )
  }

  return (
    <aside className="w-72 min-w-[200px] h-full bg-gradient-to-b from-slate-50 to-blue-50 border-l flex flex-col p-4 rounded-l-2xl shadow-lg">
      <h2 className="font-bold mb-2 text-blue-700 flex items-center justify-between">
        属性面板
        <span className="flex-1 border-b border-blue-200 ml-2" />
      </h2>
      <label className="text-sm text-gray-600 mb-1 mt-2">组件名称</label>
      <input
        type="text"
        value={selectedAsset.name}
        onChange={handleNameChange}
        className="border rounded px-2 py-1 mb-2"
      />
      <label className="text-sm text-gray-600 mb-1">颜色</label>
      <input
        type="color"
        value={selectedAsset.color || "#3b82f6"}
        onChange={handleColorChange}
        className="w-10 h-8 mb-2 border rounded"
      />
      <div className="flex gap-2 mb-2">
        <div className="flex flex-col flex-1">
          <label className="text-sm text-gray-600 mb-1">宽度</label>
          <input
            type="number"
            value={selectedAsset.width}
            min={32}
            onChange={handleWidthChange}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex flex-col flex-1">
          <label className="text-sm text-gray-600 mb-1">高度</label>
          <input
            type="number"
            value={selectedAsset.height}
            min={32}
            onChange={handleHeightChange}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>
      <label className="text-sm text-gray-600 mb-1">点击事件(onClick)</label>
      <input
        type="text"
        value={selectedAsset.onClick || ""}
        onChange={handleEventChange}
        className="border rounded px-2 py-1 mb-2"
        placeholder="如 alert('点击')"
      />
      {/* 可继续扩展更多属性 */}
    </aside>
  )
}
