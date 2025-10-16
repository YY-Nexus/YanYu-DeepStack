// useEditor 自定义Hook - 提供可视化编辑器的核心功能
import { useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { EditorComponent, DragState, ResizeState } from '../types';
import { 
  addComponent, 
  updateComponent, 
  deleteComponent, 
  selectComponent, 
  moveComponent, 
  undo, 
  redo 
} from '../store/visualEditorSlice';

interface UseEditorProps {
  canvasRef: React.RefObject<HTMLDivElement>;
}

export const useEditor = ({ canvasRef }: UseEditorProps) => {
  const dispatch = useDispatch();
  
  // 从Redux获取编辑器状态
  const { components, selectedComponentId } = useSelector((state: any) => state.visualEditor);
  
  // 本地状态管理
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0
  });
  
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    startX: 0,
    startY: 0,
    initialWidth: 0,
    initialHeight: 0,
    initialX: 0,
    initialY: 0
  });
  
  const [zoom, setZoom] = useState(1);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [isCanvasDragging, setIsCanvasDragging] = useState(false);
  const [canvasStartPosition, setCanvasStartPosition] = useState({ x: 0, y: 0 });
  
  // 拖拽相关的引用
  const dragCounter = useRef(0);
  const canvasDragRef = useRef({ startX: 0, startY: 0 });
  
  // 获取选中的组件
  const selectedComponent = selectedComponentId ? components[selectedComponentId] : null;
  
  // 处理组件点击
  const handleComponentClick = useCallback((componentId: string) => {
    dispatch(selectComponent(componentId));
  }, [dispatch]);
  
  // 处理画布点击
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // 如果点击的是画布背景，清除选中状态
    if (e.target === canvasRef.current) {
      dispatch(selectComponent(null));
    }
  }, [dispatch, canvasRef]);
  
  // 处理组件拖拽开始
  const handleComponentDragStart = useCallback((componentId: string, e: React.MouseEvent) => {
    const component = components[componentId];
    if (!component) return;
    
    setDragState({
      isDragging: true,
      componentId,
      startX: e.clientX,
      startY: e.clientY,
      initialX: component.x,
      initialY: component.y
    });
    
    // 如果组件未被选中，则选中它
    if (selectedComponentId !== componentId) {
      dispatch(selectComponent(componentId));
    }
  }, [components, selectedComponentId, dispatch]);
  
  // 处理组件拖拽移动
  const handleComponentDragMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.componentId) return;
    
    const deltaX = e.clientX - dragState.startX;
    const deltaY = e.clientY - dragState.startY;
    
    dispatch(moveComponent({
      componentId: dragState.componentId,
      deltaX,
      deltaY
    }));
  }, [dragState, dispatch]);
  
  // 处理组件拖拽结束
  const handleComponentDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      startX: 0,
      startY: 0,
      initialX: 0,
      initialY: 0
    });
  }, []);
  
  // 处理组件缩放开始
  const handleComponentResizeStart = useCallback((componentId: string, e: React.MouseEvent, handle: string) => {
    const component = components[componentId];
    if (!component) return;
    
    e.stopPropagation();
    
    setResizeState({
      isResizing: true,
      componentId,
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: component.width,
      initialHeight: component.height,
      initialX: component.x,
      initialY: component.y,
      handle: handle as any
    });
  }, [components]);
  
  // 处理组件缩放移动
  const handleComponentResizeMove = useCallback((e: MouseEvent) => {
    if (!resizeState.isResizing || !resizeState.componentId) return;
    
    const deltaX = e.clientX - resizeState.startX;
    const deltaY = e.clientY - resizeState.startY;
    let newWidth = resizeState.initialWidth;
    let newHeight = resizeState.initialHeight;
    let newX = components[resizeState.componentId]?.x || 0;
    let newY = components[resizeState.componentId]?.y || 0;
    
    // 根据缩放手柄的位置计算新的尺寸和位置
    switch (resizeState.handle) {
      case 'e':
        newWidth = Math.max(32, resizeState.initialWidth + deltaX);
        break;
      case 'w':
        newWidth = Math.max(32, resizeState.initialWidth - deltaX);
        newX = resizeState.initialX + deltaX;
        break;
      case 's':
        newHeight = Math.max(32, resizeState.initialHeight + deltaY);
        break;
      case 'n':
        newHeight = Math.max(32, resizeState.initialHeight - deltaY);
        newY = resizeState.initialY + deltaY;
        break;
      case 'se':
        newWidth = Math.max(32, resizeState.initialWidth + deltaX);
        newHeight = Math.max(32, resizeState.initialHeight + deltaY);
        break;
      case 'sw':
        newWidth = Math.max(32, resizeState.initialWidth - deltaX);
        newHeight = Math.max(32, resizeState.initialHeight + deltaY);
        newX = resizeState.initialX + deltaX;
        break;
      case 'ne':
        newWidth = Math.max(32, resizeState.initialWidth + deltaX);
        newHeight = Math.max(32, resizeState.initialHeight - deltaY);
        newY = resizeState.initialY + deltaY;
        break;
      case 'nw':
        newWidth = Math.max(32, resizeState.initialWidth - deltaX);
        newHeight = Math.max(32, resizeState.initialHeight - deltaY);
        newX = resizeState.initialX + deltaX;
        newY = resizeState.initialY + deltaY;
        break;
    }
    
    // 更新组件尺寸和位置
    dispatch(updateComponent({
      componentId: resizeState.componentId,
      updates: { width: newWidth, height: newHeight, x: newX, y: newY }
    }));
  }, [resizeState, components, dispatch]);
  
  // 处理组件缩放结束
  const handleComponentResizeEnd = useCallback(() => {
    setResizeState({
      isResizing: false,
      startX: 0,
      startY: 0,
      initialWidth: 0,
      initialHeight: 0,
      initialX: 0,
      initialY: 0
    });
  }, []);
  
  // 处理画布拖拽开始
  const handleCanvasDragStart = useCallback((e: React.MouseEvent) => {
    if (selectedComponent || dragState.isDragging || resizeState.isResizing) {
      return;
    }
    
    setIsCanvasDragging(true);
    canvasDragRef.current = {
      startX: e.clientX,
      startY: e.clientY
    };
  }, [selectedComponent, dragState.isDragging, resizeState.isResizing]);
  
  // 处理画布拖拽移动
  const handleCanvasDragMove = useCallback((e: MouseEvent) => {
    if (!isCanvasDragging) return;
    
    const deltaX = e.clientX - canvasDragRef.current.startX;
    const deltaY = e.clientY - canvasDragRef.current.startY;
    
    setCanvasPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    canvasDragRef.current = {
      startX: e.clientX,
      startY: e.clientY
    };
  }, [isCanvasDragging]);
  
  // 处理画布拖拽结束
  const handleCanvasDragEnd = useCallback(() => {
    setIsCanvasDragging(false);
  }, []);
  
  // 处理缩放
  const handleZoom = useCallback((delta: number) => {
    setZoom(prev => {
      const newZoom = prev + delta;
      return Math.max(0.1, Math.min(3, newZoom)); // 限制缩放范围在0.1到3之间
    });
  }, []);
  
  // 放大
  const zoomIn = useCallback(() => {
    handleZoom(0.1);
  }, [handleZoom]);
  
  // 缩小
  const zoomOut = useCallback(() => {
    handleZoom(-0.1);
  }, [handleZoom]);
  
  // 重置缩放
  const resetZoom = useCallback(() => {
    setZoom(1);
    setCanvasPosition({ x: 0, y: 0 });
  }, []);
  
  // 添加组件
  const addNewComponent = useCallback((componentData: Omit<EditorComponent, 'id'>) => {
    dispatch(addComponent(componentData));
  }, [dispatch]);
  
  // 删除组件
  const removeComponent = useCallback((componentId: string) => {
    dispatch(deleteComponent(componentId));
  }, [dispatch]);
  
  // 更新组件属性
  const updateComponentProps = useCallback((componentId: string, updates: Partial<EditorComponent>) => {
    dispatch(updateComponent({
      componentId,
      updates
    }));
  }, [dispatch]);
  
  // 处理键盘快捷键
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Delete键删除选中的组件
    if (e.key === 'Delete' && selectedComponentId) {
      dispatch(deleteComponent(selectedComponentId));
    }
    
    // Ctrl+Z 撤销
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      dispatch(undo());
    }
    
    // Ctrl+Y 重做
    if (e.ctrlKey && e.key === 'y') {
      e.preventDefault();
      dispatch(redo());
    }
  }, [selectedComponentId, dispatch]);
  
  // 绑定全局事件监听
  useEffect(() => {
    window.addEventListener('mousemove', handleComponentDragMove);
    window.addEventListener('mousemove', handleComponentResizeMove);
    window.addEventListener('mousemove', handleCanvasDragMove);
    window.addEventListener('mouseup', handleComponentDragEnd);
    window.addEventListener('mouseup', handleComponentResizeEnd);
    window.addEventListener('mouseup', handleCanvasDragEnd);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('mousemove', handleComponentDragMove);
      window.removeEventListener('mousemove', handleComponentResizeMove);
      window.removeEventListener('mousemove', handleCanvasDragMove);
      window.removeEventListener('mouseup', handleComponentDragEnd);
      window.removeEventListener('mouseup', handleComponentResizeEnd);
      window.removeEventListener('mouseup', handleCanvasDragEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    handleComponentDragMove,
    handleComponentResizeMove,
    handleCanvasDragMove,
    handleComponentDragEnd,
    handleComponentResizeEnd,
    handleCanvasDragEnd,
    handleKeyDown
  ]);
  
  // 拖拽计数器，防止拖拽时触发其他事件
  useEffect(() => {
    const handleDragStart = () => dragCounter.current++;
    const handleDragEnd = () => dragCounter.current--;
    
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);
    
    return () => {
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('dragend', handleDragEnd);
    };
  }, []);
  
  return {
    // 状态
    components,
    selectedComponent,
    selectedComponentId,
    dragState,
    resizeState,
    zoom,
    canvasPosition,
    isCanvasDragging,
    
    // 方法
    handleComponentClick,
    handleCanvasClick,
    handleComponentDragStart,
    handleComponentResizeStart,
    handleCanvasDragStart,
    zoomIn,
    zoomOut,
    resetZoom,
    addNewComponent,
    removeComponent,
    updateComponentProps
  };
};