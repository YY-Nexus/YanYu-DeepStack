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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadComponents = exports.addComponents = exports.redo = exports.undo = exports.resetEditor = exports.moveComponent = exports.selectComponent = exports.deleteComponent = exports.updateComponent = exports.addComponent = void 0;
// visualEditorSlice Redux状态管理切片
var toolkit_1 = require("@reduxjs/toolkit");
// 初始状态
var initialState = {
    components: {},
    selectedComponentId: null,
    history: [],
    historyIndex: -1
};
// 创建切片
var visualEditorSlice = (0, toolkit_1.createSlice)({
    name: 'visualEditor',
    initialState: initialState,
    reducers: {
        // 添加组件
        addComponent: function (state, action) {
            var id = "component_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
            var newComponent = __assign({ id: id, type: 'basic', x: 100, y: 100, width: 120, height: 60 }, action.payload);
            state.components[id] = newComponent;
            state.selectedComponentId = id;
            // 记录历史
            state.history = state.history.slice(0, state.historyIndex + 1);
            state.history.push({
                action: 'add',
                componentId: id,
                component: newComponent
            });
            state.historyIndex++;
        },
        // 更新组件
        updateComponent: function (state, action) {
            var _a = action.payload, componentId = _a.componentId, updates = _a.updates;
            var component = state.components[componentId];
            if (component) {
                // 记录更新前的状态
                var previousState = __assign({}, component);
                // 应用更新
                state.components[componentId] = __assign(__assign({}, component), updates);
                // 记录历史
                state.history = state.history.slice(0, state.historyIndex + 1);
                state.history.push({
                    action: 'update',
                    componentId: componentId,
                    previousState: previousState,
                    component: __assign({}, state.components[componentId])
                });
                state.historyIndex++;
            }
        },
        // 删除组件
        deleteComponent: function (state, action) {
            var componentId = action.payload;
            var component = state.components[componentId];
            if (component) {
                // 记录历史
                state.history = state.history.slice(0, state.historyIndex + 1);
                state.history.push({
                    action: 'delete',
                    componentId: componentId,
                    component: component
                });
                state.historyIndex++;
                // 删除组件
                delete state.components[componentId];
                // 如果删除的是选中的组件，清除选中状态
                if (state.selectedComponentId === componentId) {
                    state.selectedComponentId = null;
                }
            }
        },
        // 选择组件
        selectComponent: function (state, action) {
            state.selectedComponentId = action.payload;
        },
        // 移动组件
        moveComponent: function (state, action) {
            var _a = action.payload, componentId = _a.componentId, deltaX = _a.deltaX, deltaY = _a.deltaY;
            var component = state.components[componentId];
            if (component && !component.locked) {
                state.components[componentId] = __assign(__assign({}, component), { x: component.x + deltaX, y: component.y + deltaY });
            }
        },
        // 重置编辑器
        resetEditor: function (state) {
            state.components = {};
            state.selectedComponentId = null;
            state.history = [];
            state.historyIndex = -1;
        },
        // 撤销操作
        undo: function (state) {
            if (state.historyIndex >= 0) {
                var historyItem = state.history[state.historyIndex];
                switch (historyItem.action) {
                    case 'add':
                        // 撤销添加操作，删除组件
                        if (historyItem.componentId) {
                            delete state.components[historyItem.componentId];
                            if (state.selectedComponentId === historyItem.componentId) {
                                state.selectedComponentId = null;
                            }
                        }
                        break;
                    case 'update':
                        // 撤销更新操作，恢复到之前的状态
                        if (historyItem.componentId && historyItem.previousState) {
                            state.components[historyItem.componentId] = historyItem.previousState;
                        }
                        break;
                    case 'delete':
                        // 撤销删除操作，恢复组件
                        if (historyItem.componentId && historyItem.component) {
                            state.components[historyItem.componentId] = historyItem.component;
                        }
                        break;
                }
                state.historyIndex--;
            }
        },
        // 重做操作
        redo: function (state) {
            if (state.historyIndex < state.history.length - 1) {
                state.historyIndex++;
                var historyItem = state.history[state.historyIndex];
                switch (historyItem.action) {
                    case 'add':
                        // 重做添加操作，重新添加组件
                        if (historyItem.componentId && historyItem.component) {
                            state.components[historyItem.componentId] = historyItem.component;
                        }
                        break;
                    case 'update':
                        // 重做更新操作，应用更新
                        if (historyItem.componentId && historyItem.component) {
                            state.components[historyItem.componentId] = historyItem.component;
                        }
                        break;
                    case 'delete':
                        // 重做删除操作，删除组件
                        if (historyItem.componentId) {
                            delete state.components[historyItem.componentId];
                            if (state.selectedComponentId === historyItem.componentId) {
                                state.selectedComponentId = null;
                            }
                        }
                        break;
                }
            }
        },
        // 批量添加组件
        addComponents: function (state, action) {
            var newComponents = {};
            var historyItems = [];
            action.payload.forEach(function (componentData) {
                var id = "component_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
                var newComponent = __assign({ id: id, type: 'basic', x: 100, y: 100, width: 120, height: 60 }, componentData);
                newComponents[id] = newComponent;
                historyItems.push({
                    action: 'add',
                    componentId: id,
                    component: newComponent
                });
            });
            // 合并新组件
            state.components = __assign(__assign({}, state.components), newComponents);
            // 记录历史
            state.history = state.history.slice(0, state.historyIndex + 1);
            state.history = __spreadArray(__spreadArray([], state.history, true), historyItems, true);
            state.historyIndex = state.history.length - 1;
        },
        // 加载组件配置
        loadComponents: function (state, action) {
            state.components = action.payload;
            state.selectedComponentId = null;
            state.history = [];
            state.historyIndex = -1;
        }
    }
});
// 导出action creators
exports.addComponent = (_a = visualEditorSlice.actions, _a.addComponent), exports.updateComponent = _a.updateComponent, exports.deleteComponent = _a.deleteComponent, exports.selectComponent = _a.selectComponent, exports.moveComponent = _a.moveComponent, exports.resetEditor = _a.resetEditor, exports.undo = _a.undo, exports.redo = _a.redo, exports.addComponents = _a.addComponents, exports.loadComponents = _a.loadComponents;
// 导出reducer
exports.default = visualEditorSlice.reducer;
