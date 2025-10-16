import React, { useRef } from "react"
import { EditorComponent } from './types';

export interface CanvasAreaProps {
  canvasData: EditorComponent[]
  onSelect?: (component: EditorComponent | null) => void
  onAddComponent: (component: Omit<EditorComponent, 'id'>) => void
  onUpdateComponent: (id: string, updates: Partial<EditorComponent>) => void
  onDeleteComponent: (id: string) => void
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({ canvasData, onSelect, onAddComponent, onUpdateComponent, onDeleteComponent, ...props }) => {
  const canvasRef = useRef<HTMLDivElement>(null)

  // 拖拽添加组件
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const assetStr = e.dataTransfer.getData("asset")
    if (assetStr) {
      const asset = JSON.parse(assetStr)
      onAddComponent({
        ...asset,
        x: 40 + Math.random() * 200,
        y: 40 + Math.random() * 200,
        width: 120,
        height: 40,
      })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // 拖动、缩放、删除逻辑
  const handleComponentDrag = (id: string, dx: number, dy: number) => {
    const component = canvasData.find(c => c.id === id);
    if (component) {
      // 吸附到网格
      const newX = Math.round((component.x + dx) / 32) * 32;
      const newY = Math.round((component.y + dy) / 32) * 32;
      onUpdateComponent(id, { x: newX, y: newY });
    }
  }

  const handleComponentResize = (id: string, dw: number, dh: number) => {
    const component = canvasData.find(c => c.id === id);
    if (component) {
      const newWidth = Math.max(32, component.width + dw);
      const newHeight = Math.max(32, component.height + dh);
      onUpdateComponent(id, { width: newWidth, height: newHeight });
    }
  }

  const handleDelete = (id: string) => {
    onDeleteComponent(id);
  }

  return (
    <main className="flex-1 h-full flex flex-col items-center justify-center relative bg-gradient-to-br from-blue-100 via-white to-blue-300">
      <div
        ref={canvasRef}
        className="w-full max-w-4xl h-[80vh] border-2 border-blue-200 bg-white rounded-2xl relative overflow-hidden shadow-2xl"
        style={{ minHeight: 400, backgroundImage: "linear-gradient(90deg,#e0e7ef 1px,transparent 1px),linear-gradient(180deg,#e0e7ef 1px,transparent 1px)", backgroundSize: "32px 32px" }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {canvasData.length === 0 && (
          <div className="text-gray-400 text-center w-full">拖拽左侧组件到画布</div>
        )}
        {canvasData.map((item) => (
          <DraggableOnCanvas
            key={item.id}
            item={item}
            onDrag={handleComponentDrag}
            onResize={handleComponentResize}
            onDelete={handleDelete}
            onSelect={onSelect}
          />
        ))}
      </div>
    </main>
  )
}

// 画布内可拖动/缩放/删除的组件
const DraggableOnCanvas: React.FC<{
  item: EditorComponent
  onDrag: (id: string, dx: number, dy: number) => void
  onResize: (id: string, dw: number, dh: number) => void
  onDelete: (id: string) => void
  onSelect?: (component: EditorComponent | null) => void
}> = ({ item, onDrag, onResize, onDelete, onSelect }) => {
  const dragData = useRef<{ x: number; y: number } | null>(null)
  const resizeData = useRef<{ w: number; h: number } | null>(null)

  // 拖动
  const handleMouseDown = (e: React.MouseEvent) => {
    dragData.current = { x: e.clientX, y: e.clientY }
    const move = (ev: MouseEvent) => {
      if (dragData.current) {
        const dx = ev.clientX - dragData.current.x
        const dy = ev.clientY - dragData.current.y
        onDrag(item.id, dx, dy)
        dragData.current = { x: ev.clientX, y: ev.clientY }
      }
    }
    const up = () => {
      window.removeEventListener("mousemove", move)
      window.removeEventListener("mouseup", up)
    }
    window.addEventListener("mousemove", move)
    window.addEventListener("mouseup", up)
  }

  // 缩放
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    resizeData.current = { w: e.clientX, h: e.clientY }
    const move = (ev: MouseEvent) => {
      if (resizeData.current) {
        const dw = ev.clientX - resizeData.current.w
        const dh = ev.clientY - resizeData.current.h
        onResize(item.id, dw, dh)
        resizeData.current = { w: ev.clientX, h: ev.clientY }
      }
    }
    const up = () => {
      window.removeEventListener("mousemove", move)
      window.removeEventListener("mouseup", up)
    }
    window.addEventListener("mousemove", move)
    window.addEventListener("mouseup", up)
  }

  return (
    <div
      className="absolute bg-blue-50 border shadow-md rounded flex items-center justify-center group cursor-pointer"
      style={{ left: item.x, top: item.y, width: item.width, height: item.height, userSelect: "none", transition: "box-shadow .2s" }}
      onMouseDown={handleMouseDown}
      onClick={(e) => { e.stopPropagation(); onSelect && onSelect(item) }}
    >
      <span className="pointer-events-none select-none text-blue-700 font-bold">{item.name}</span>
      {/* 缩放手柄 */}
      <div
        className="absolute right-0 bottom-0 w-4 h-4 bg-blue-400 rounded-full cursor-nwse-resize border-2 border-white"
        onMouseDown={handleResizeMouseDown}
        style={{ zIndex: 2 }}
      />
      {/* 删除按钮 */}
      <button
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ zIndex: 3 }}
        onClick={() => onDelete(item.id)}
      >×</button>
    </div>
  )
}
