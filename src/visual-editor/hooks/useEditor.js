"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEditor = void 0;
// useEditor 自定义Hook - 提供可视化编辑器的核心功能
var react_1 = require("react");
var react_redux_1 = require("react-redux");
var visualEditorSlice_1 = require("../store/visualEditorSlice");
var useEditor = function (_a) {
    var canvasRef = _a.canvasRef;
    var dispatch = (0, react_redux_1.useDispatch)();
    // 从Redux获取编辑器状态
    var _b = (0, react_redux_1.useSelector)(function (state) { return state.visualEditor; }), components = _b.components, selectedComponentId = _b.selectedComponentId;
    // 本地状态管理
    var _c = (0, react_1.useState)({
        isDragging: false,
        startX: 0,
        startY: 0,
        initialX: 0,
        initialY: 0
    }), dragState = _c[0], setDragState = _c[1];
    var _d = (0, react_1.useState)({
        isResizing: false,
        startX: 0,
        startY: 0,
        initialWidth: 0,
        initialHeight: 0
    }), resizeState = _d[0], setResizeState = _d[1];
    var _e = (0, react_1.useState)(1), zoom = _e[0], setZoom = _e[1];
    var _f = (0, react_1.useState)({ x: 0, y: 0 }), canvasPosition = _f[0], setCanvasPosition = _f[1];
    var _g = (0, react_1.useState)(false), isCanvasDragging = _g[0], setIsCanvasDragging = _g[1];
    var _h = (0, react_1.useState)({ x: 0, y: 0 }), canvasStartPosition = _h[0], setCanvasStartPosition = _h[1];
    // 拖拽相关的引用
    var dragCounter = (0, react_1.useRef)(0);
    var canvasDragRef = (0, react_1.useRef)({ startX: 0, startY: 0 });
    // 获取选中的组件
    var selectedComponent = selectedComponentId ? components[selectedComponentId] : null;
    // 处理组件点击
    var handleComponentClick = (0, react_1.useCallback)(function (componentId) {
        dispatch((0, visualEditorSlice_1.selectComponent)(componentId));
    }, [dispatch]);
    // 处理画布点击
    var handleCanvasClick = (0, react_1.useCallback)(function (e) {
        // 如果点击的是画布背景，清除选中状态
        if (e.target === canvasRef.current) {
            dispatch((0, visualEditorSlice_1.selectComponent)(null));
        }
    }, [dispatch, canvasRef]);
    // 处理组件拖拽开始
    var handleComponentDragStart = (0, react_1.useCallback)(function (componentId, e) {
        var component = components[componentId];
        if (!component)
            return;
        setDragState({
            isDragging: true,
            componentId: componentId,
            startX: e.clientX,
            startY: e.clientY,
            initialX: component.x,
            initialY: component.y
        });
        // 如果组件未被选中，则选中它
        if (selectedComponentId !== componentId) {
            dispatch((0, visualEditorSlice_1.selectComponent)(componentId));
        }
    }, [components, selectedComponentId, dispatch]);
    // 处理组件拖拽移动
    var handleComponentDragMove = (0, react_1.useCallback)(function (e) {
        if (!dragState.isDragging || !dragState.componentId)
            return;
        var deltaX = e.clientX - dragState.startX;
        var deltaY = e.clientY - dragState.startY;
        dispatch((0, visualEditorSlice_1.moveComponent)({
            componentId: dragState.componentId,
            deltaX: deltaX,
            deltaY: deltaY
        }));
    }, [dragState, dispatch]);
    // 处理组件拖拽结束
    var handleComponentDragEnd = (0, react_1.useCallback)(function () {
        setDragState({
            isDragging: false,
            startX: 0,
            startY: 0,
            initialX: 0,
            initialY: 0
        });
    }, []);
    // 处理组件缩放开始
    var handleComponentResizeStart = (0, react_1.useCallback)(function (componentId, e, handle) {
        var component = components[componentId];
        if (!component)
            return;
        e.stopPropagation();
        setResizeState({
            isResizing: true,
            componentId: componentId,
            startX: e.clientX,
            startY: e.clientY,
            initialWidth: component.width,
            initialHeight: component.height,
            handle: handle
        });
    }, [components]);
    // 处理组件缩放移动
    var handleComponentResizeMove = (0, react_1.useCallback)(function (e) {
        var _a, _b;
        if (!resizeState.isResizing || !resizeState.componentId)
            return;
        var deltaX = e.clientX - resizeState.startX;
        var deltaY = e.clientY - resizeState.startY;
        var newWidth = resizeState.initialWidth;
        var newHeight = resizeState.initialHeight;
        var newX = ((_a = components[resizeState.componentId]) === null || _a === void 0 ? void 0 : _a.x) || 0;
        var newY = ((_b = components[resizeState.componentId]) === null || _b === void 0 ? void 0 : _b.y) || 0;
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
        dispatch((0, visualEditorSlice_1.updateComponent)({
            componentId: resizeState.componentId,
            updates: { width: newWidth, height: newHeight, x: newX, y: newY }
        }));
    }, [resizeState, components, dispatch]);
    // 处理组件缩放结束
    var handleComponentResizeEnd = (0, react_1.useCallback)(function () {
        setResizeState({
            isResizing: false,
            startX: 0,
            startY: 0,
            initialWidth: 0,
            initialHeight: 0
        });
    }, []);
    // 处理画布拖拽开始
    var handleCanvasDragStart = (0, react_1.useCallback)(function (e) {
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
    var handleCanvasDragMove = (0, react_1.useCallback)(function (e) {
        if (!isCanvasDragging)
            return;
        var deltaX = e.clientX - canvasDragRef.current.startX;
        var deltaY = e.clientY - canvasDragRef.current.startY;
        setCanvasPosition(function (prev) { return ({
            x: prev.x + deltaX,
            y: prev.y + deltaY
        }); });
        canvasDragRef.current = {
            startX: e.clientX,
            startY: e.clientY
        };
    }, [isCanvasDragging]);
    // 处理画布拖拽结束
    var handleCanvasDragEnd = (0, react_1.useCallback)(function () {
        setIsCanvasDragging(false);
    }, []);
    // 处理缩放
    var handleZoom = (0, react_1.useCallback)(function (delta) {
        setZoom(function (prev) {
            var newZoom = prev + delta;
            return Math.max(0.1, Math.min(3, newZoom)); // 限制缩放范围在0.1到3之间
        });
    }, []);
    // 放大
    var zoomIn = (0, react_1.useCallback)(function () {
        handleZoom(0.1);
    }, [handleZoom]);
    // 缩小
    var zoomOut = (0, react_1.useCallback)(function () {
        handleZoom(-0.1);
    }, [handleZoom]);
    // 重置缩放
    var resetZoom = (0, react_1.useCallback)(function () {
        setZoom(1);
        setCanvasPosition({ x: 0, y: 0 });
    }, []);
    // 添加组件
    var addNewComponent = (0, react_1.useCallback)(function (componentData) {
        dispatch((0, visualEditorSlice_1.addComponent)(componentData));
    }, [dispatch]);
    // 删除组件
    var removeComponent = (0, react_1.useCallback)(function (componentId) {
        dispatch((0, visualEditorSlice_1.deleteComponent)(componentId));
    }, [dispatch]);
    // 更新组件属性
    var updateComponentProps = (0, react_1.useCallback)(function (componentId, updates) {
        dispatch((0, visualEditorSlice_1.updateComponent)({
            componentId: componentId,
            updates: updates
        }));
    }, [dispatch]);
    // 处理键盘快捷键
    var handleKeyDown = (0, react_1.useCallback)(function (e) {
        // Delete键删除选中的组件
        if (e.key === 'Delete' && selectedComponentId) {
            dispatch((0, visualEditorSlice_1.deleteComponent)(selectedComponentId));
        }
        // Ctrl+Z 撤销
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            dispatch((0, visualEditorSlice_1.undo)());
        }
        // Ctrl+Y 重做
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            dispatch((0, visualEditorSlice_1.redo)());
        }
    }, [selectedComponentId, dispatch]);
    // 绑定全局事件监听
    (0, react_1.useEffect)(function () {
        window.addEventListener('mousemove', handleComponentDragMove);
        window.addEventListener('mousemove', handleComponentResizeMove);
        window.addEventListener('mousemove', handleCanvasDragMove);
        window.addEventListener('mouseup', handleComponentDragEnd);
        window.addEventListener('mouseup', handleComponentResizeEnd);
        window.addEventListener('mouseup', handleCanvasDragEnd);
        window.addEventListener('keydown', handleKeyDown);
        return function () {
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
    (0, react_1.useEffect)(function () {
        var handleDragStart = function () { return dragCounter.current++; };
        var handleDragEnd = function () { return dragCounter.current--; };
        document.addEventListener('dragstart', handleDragStart);
        document.addEventListener('dragend', handleDragEnd);
        return function () {
            document.removeEventListener('dragstart', handleDragStart);
            document.removeEventListener('dragend', handleDragEnd);
        };
    }, []);
    return {
        // 状态
        components: components,
        selectedComponent: selectedComponent,
        selectedComponentId: selectedComponentId,
        dragState: dragState,
        resizeState: resizeState,
        zoom: zoom,
        canvasPosition: canvasPosition,
        isCanvasDragging: isCanvasDragging,
        // 方法
        handleComponentClick: handleComponentClick,
        handleCanvasClick: handleCanvasClick,
        handleComponentDragStart: handleComponentDragStart,
        handleComponentResizeStart: handleComponentResizeStart,
        handleCanvasDragStart: handleCanvasDragStart,
        zoomIn: zoomIn,
        zoomOut: zoomOut,
        resetZoom: resetZoom,
        addNewComponent: addNewComponent,
        removeComponent: removeComponent,
        updateComponentProps: updateComponentProps
    };
};
exports.useEditor = useEditor;
