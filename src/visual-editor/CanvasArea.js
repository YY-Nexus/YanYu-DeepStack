"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasArea = void 0;
var react_1 = require("react");
var CanvasArea = function (_a) {
    var canvasData = _a.canvasData, onSelect = _a.onSelect, onAddComponent = _a.onAddComponent, onUpdateComponent = _a.onUpdateComponent, onDeleteComponent = _a.onDeleteComponent, props = __rest(_a, ["canvasData", "onSelect", "onAddComponent", "onUpdateComponent", "onDeleteComponent"]);
    var canvasRef = (0, react_1.useRef)(null);
    // 拖拽添加组件
    var handleDrop = function (e) {
        e.preventDefault();
        var assetStr = e.dataTransfer.getData("asset");
        if (assetStr) {
            var asset = JSON.parse(assetStr);
            onAddComponent(__assign(__assign({}, asset), { x: 40 + Math.random() * 200, y: 40 + Math.random() * 200, width: 120, height: 40 }));
        }
    };
    var handleDragOver = function (e) {
        e.preventDefault();
    };
    // 拖动、缩放、删除逻辑
    var handleComponentDrag = function (id, dx, dy) {
        var component = canvasData.find(function (c) { return c.id === id; });
        if (component) {
            // 吸附到网格
            var newX = Math.round((component.x + dx) / 32) * 32;
            var newY = Math.round((component.y + dy) / 32) * 32;
            onUpdateComponent(id, { x: newX, y: newY });
        }
    };
    var handleComponentResize = function (id, dw, dh) {
        var component = canvasData.find(function (c) { return c.id === id; });
        if (component) {
            var newWidth = Math.max(32, component.width + dw);
            var newHeight = Math.max(32, component.height + dh);
            onUpdateComponent(id, { width: newWidth, height: newHeight });
        }
    };
    var handleDelete = function (id) {
        onDeleteComponent(id);
    };
    return (<main className="flex-1 h-full flex flex-col items-center justify-center relative bg-gradient-to-br from-blue-100 via-white to-blue-300">
      <div ref={canvasRef} className="w-full max-w-4xl h-[80vh] border-2 border-blue-200 bg-white rounded-2xl relative overflow-hidden shadow-2xl" style={{ minHeight: 400, backgroundImage: "linear-gradient(90deg,#e0e7ef 1px,transparent 1px),linear-gradient(180deg,#e0e7ef 1px,transparent 1px)", backgroundSize: "32px 32px" }} onDrop={handleDrop} onDragOver={handleDragOver}>
        {canvasData.length === 0 && (<div className="text-gray-400 text-center w-full">拖拽左侧组件到画布</div>)}
        {canvasData.map(function (item) { return (<DraggableOnCanvas key={item.id} item={item} onDrag={handleComponentDrag} onResize={handleComponentResize} onDelete={handleDelete} onSelect={props.onSelect}/>); })}
      </div>
    </main>);
};
exports.CanvasArea = CanvasArea;
// 画布内可拖动/缩放/删除的组件
var DraggableOnCanvas = function (_a) {
    var item = _a.item, onDrag = _a.onDrag, onResize = _a.onResize, onDelete = _a.onDelete, onSelect = _a.onSelect;
    var dragData = (0, react_1.useRef)(null);
    var resizeData = (0, react_1.useRef)(null);
    // 拖动
    var handleMouseDown = function (e) {
        dragData.current = { x: e.clientX, y: e.clientY };
        var move = function (ev) {
            if (dragData.current) {
                var dx = ev.clientX - dragData.current.x;
                var dy = ev.clientY - dragData.current.y;
                onDrag(item.id, dx, dy);
                dragData.current = { x: ev.clientX, y: ev.clientY };
            }
        };
        var up = function () {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", up);
        };
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
    };
    // 缩放
    var handleResizeMouseDown = function (e) {
        e.stopPropagation();
        resizeData.current = { w: e.clientX, h: e.clientY };
        var move = function (ev) {
            if (resizeData.current) {
                var dw = ev.clientX - resizeData.current.w;
                var dh = ev.clientY - resizeData.current.h;
                onResize(item.id, dw, dh);
                resizeData.current = { w: ev.clientX, h: ev.clientY };
            }
        };
        var up = function () {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", up);
        };
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
    };
    return (<div className="absolute bg-blue-50 border shadow-md rounded flex items-center justify-center group cursor-pointer" style={{ left: item.x, top: item.y, width: item.width, height: item.height, userSelect: "none", transition: "box-shadow .2s" }} onMouseDown={handleMouseDown} onClick={function (e) { e.stopPropagation(); onSelect && onSelect(item); }}>
      <span className="pointer-events-none select-none text-blue-700 font-bold">{item.name}</span>
      {/* 缩放手柄 */}
      <div className="absolute right-0 bottom-0 w-4 h-4 bg-blue-400 rounded-full cursor-nwse-resize border-2 border-white" onMouseDown={handleResizeMouseDown} style={{ zIndex: 2 }}/>
      {/* 删除按钮 */}
      <button className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" style={{ zIndex: 3 }} onClick={function () { return onDelete(item.id); }}>×</button>
    </div>);
};
