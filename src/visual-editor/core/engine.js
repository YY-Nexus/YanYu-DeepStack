"use strict";
/**
 * YYC³ 可视化编程核心引擎
 * 提供拖拽式编程的底层支持和代码生成能力
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.visualEngine = exports.VisualProgrammingEngine = void 0;
/**
 * 可视化编程引擎主类
 */
var VisualProgrammingEngine = /** @class */ (function () {
    function VisualProgrammingEngine(project) {
        this.nodeRegistry = new Map();
        this.eventEmitter = new EventTarget();
        this.project = project || this.createEmptyProject();
        this.initializeBuiltinNodes();
    }
    // 项目管理
    VisualProgrammingEngine.prototype.createEmptyProject = function () {
        return {
            id: this.generateId(),
            name: 'Untitled Project',
            description: '',
            nodes: [],
            edges: [],
            metadata: {
                version: '1.0.0',
                created: new Date(),
                modified: new Date(),
                author: 'YYC³ User',
                framework: 'react',
                emotionEnabled: true,
                aiEnabled: true
            }
        };
    };
    VisualProgrammingEngine.prototype.loadProject = function (project) {
        this.project = project;
        this.emit('project-loaded', { project: project });
    };
    VisualProgrammingEngine.prototype.saveProject = function () {
        this.project.metadata.modified = new Date();
        this.emit('project-saved', { project: this.project });
        return this.project;
    };
    // 节点管理
    VisualProgrammingEngine.prototype.addNode = function (nodeType, position) {
        var definition = this.nodeRegistry.get(nodeType);
        if (!definition) {
            throw new Error("Unknown node type: ".concat(nodeType));
        }
        var node = {
            id: this.generateId(),
            type: nodeType,
            label: definition.label,
            category: definition.category,
            position: position,
            size: { width: 200, height: 100 },
            properties: __assign({}, definition.defaultProperties),
            inputs: __spreadArray([], definition.inputs, true),
            outputs: __spreadArray([], definition.outputs, true),
            metadata: {
                description: definition.description,
                documentation: definition.documentation,
                examples: definition.examples
            }
        };
        this.project.nodes.push(node);
        this.emit('node-added', { node: node });
        return node;
    };
    VisualProgrammingEngine.prototype.removeNode = function (nodeId) {
        // 移除节点
        this.project.nodes = this.project.nodes.filter(function (n) { return n.id !== nodeId; });
        // 移除相关连接
        this.project.edges = this.project.edges.filter(function (e) { return e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId; });
        this.emit('node-removed', { nodeId: nodeId });
    };
    VisualProgrammingEngine.prototype.updateNodeProperties = function (nodeId, properties) {
        var node = this.project.nodes.find(function (n) { return n.id === nodeId; });
        if (node) {
            node.properties = __assign(__assign({}, node.properties), properties);
            this.emit('node-updated', { node: node });
        }
    };
    // 连接管理
    VisualProgrammingEngine.prototype.addEdge = function (sourceNodeId, sourcePortId, targetNodeId, targetPortId) {
        // 验证连接的有效性
        if (!this.canConnect(sourceNodeId, sourcePortId, targetNodeId, targetPortId)) {
            return null;
        }
        var edge = {
            id: this.generateId(),
            sourceNodeId: sourceNodeId,
            sourcePortId: sourcePortId,
            targetNodeId: targetNodeId,
            targetPortId: targetPortId,
            type: this.inferEdgeType(sourceNodeId, sourcePortId, targetNodeId, targetPortId)
        };
        this.project.edges.push(edge);
        this.emit('edge-added', { edge: edge });
        return edge;
    };
    VisualProgrammingEngine.prototype.removeEdge = function (edgeId) {
        this.project.edges = this.project.edges.filter(function (e) { return e.id !== edgeId; });
        this.emit('edge-removed', { edgeId: edgeId });
    };
    // 连接验证
    VisualProgrammingEngine.prototype.canConnect = function (sourceNodeId, sourcePortId, targetNodeId, targetPortId) {
        var sourceNode = this.project.nodes.find(function (n) { return n.id === sourceNodeId; });
        var targetNode = this.project.nodes.find(function (n) { return n.id === targetNodeId; });
        if (!sourceNode || !targetNode)
            return false;
        var sourcePort = sourceNode.outputs.find(function (p) { return p.id === sourcePortId; });
        var targetPort = targetNode.inputs.find(function (p) { return p.id === targetPortId; });
        if (!sourcePort || !targetPort)
            return false;
        // 检查类型兼容性
        return this.isTypeCompatible(sourcePort.type, targetPort.type);
    };
    VisualProgrammingEngine.prototype.isTypeCompatible = function (sourceType, targetType) {
        var _a;
        if (sourceType === targetType)
            return true;
        // 特殊兼容性规则
        var compatibilityMap = {
            'string': ['object'],
            'number': ['string', 'object'],
            'boolean': ['string', 'object'],
            'emotion': ['object', 'ai-response'],
            'ai-response': ['object', 'string']
        };
        return ((_a = compatibilityMap[sourceType]) === null || _a === void 0 ? void 0 : _a.includes(targetType)) || false;
    };
    VisualProgrammingEngine.prototype.inferEdgeType = function (sourceNodeId, sourcePortId, targetNodeId, targetPortId) {
        var sourceNode = this.project.nodes.find(function (n) { return n.id === sourceNodeId; });
        var targetNode = this.project.nodes.find(function (n) { return n.id === targetNodeId; });
        if ((sourceNode === null || sourceNode === void 0 ? void 0 : sourceNode.category) === 'emotion' || (targetNode === null || targetNode === void 0 ? void 0 : targetNode.category) === 'emotion') {
            return 'emotion';
        }
        if ((sourceNode === null || sourceNode === void 0 ? void 0 : sourceNode.category) === 'ai' || (targetNode === null || targetNode === void 0 ? void 0 : targetNode.category) === 'ai') {
            return 'ai-flow';
        }
        var sourcePort = sourceNode === null || sourceNode === void 0 ? void 0 : sourceNode.outputs.find(function (p) { return p.id === sourcePortId; });
        if ((sourcePort === null || sourcePort === void 0 ? void 0 : sourcePort.type) === 'function') {
            return 'event';
        }
        return 'data';
    };
    // 代码生成
    VisualProgrammingEngine.prototype.generateCode = function (framework) {
        if (framework === void 0) { framework = 'react'; }
        switch (framework) {
            case 'react':
                return this.generateReactCode();
            case 'vue':
                return this.generateVueCode();
            case 'vanilla':
                return this.generateVanillaCode();
            default:
                throw new Error("Unsupported framework: ".concat(framework));
        }
    };
    VisualProgrammingEngine.prototype.generateReactCode = function () {
        var imports = this.generateReactImports();
        var component = this.generateReactComponent();
        var exports = this.generateReactExports();
        return "".concat(imports, "\n\n").concat(component, "\n\n").concat(exports);
    };
    VisualProgrammingEngine.prototype.generateReactImports = function () {
        var imports = new Set();
        // React基础导入
        imports.add("import React, { useState, useEffect, useCallback } from 'react'");
        // 检查是否需要情感相关导入
        if (this.project.metadata.emotionEnabled) {
            imports.add("import { useYYC3EmotionDetection } from '@/hooks/use-emotion-detection'");
        }
        // 检查是否需要AI相关导入
        if (this.project.metadata.aiEnabled) {
            imports.add("import { useYYC3AI } from '@/hooks/use-ai'");
        }
        // 根据使用的节点类型添加导入
        for (var _i = 0, _a = this.project.nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            var definition = this.nodeRegistry.get(node.type);
            if (definition === null || definition === void 0 ? void 0 : definition.reactImports) {
                definition.reactImports.forEach(function (imp) { return imports.add(imp); });
            }
        }
        return Array.from(imports).join('\n');
    };
    VisualProgrammingEngine.prototype.generateReactComponent = function () {
        var componentName = this.toPascalCase(this.project.name.replace(/\s+/g, ''));
        var hooks = this.generateReactHooks();
        var handlers = this.generateReactHandlers();
        var jsx = this.generateReactJSX();
        return "function ".concat(componentName, "() {\n").concat(hooks, "\n\n").concat(handlers, "\n\n  return (\n").concat(jsx, "\n  )\n}");
    };
    VisualProgrammingEngine.prototype.generateReactHooks = function () {
        var _this = this;
        var hooks = [];
        // 状态管理hooks
        var stateVariables = this.extractStateVariables();
        stateVariables.forEach(function (variable) {
            hooks.push("  const [".concat(variable.name, ", set").concat(_this.toPascalCase(variable.name), "] = useState(").concat(JSON.stringify(variable.defaultValue), ")"));
        });
        // 情感检测hook
        if (this.project.metadata.emotionEnabled) {
            hooks.push("  const { detectEmotion, currentEmotion } = useYYC3EmotionDetection()");
        }
        // AI助手hook
        if (this.project.metadata.aiEnabled) {
            hooks.push("  const { generateResponse, isLoading } = useYYC3AI()");
        }
        return hooks.join('\n');
    };
    VisualProgrammingEngine.prototype.generateReactHandlers = function () {
        var _this = this;
        var handlers = [];
        // 为每个事件节点生成处理函数
        var eventNodes = this.project.nodes.filter(function (node) { return node.category === 'logic'; });
        eventNodes.forEach(function (node) {
            var handlerName = "handle".concat(_this.toPascalCase(node.label));
            var handlerBody = _this.generateHandlerBody(node);
            handlers.push("  const ".concat(handlerName, " = useCallback(").concat(handlerBody, ", [])"));
        });
        return handlers.join('\n\n');
    };
    VisualProgrammingEngine.prototype.generateReactJSX = function () {
        var _this = this;
        // 根据节点生成JSX结构
        var uiNodes = this.project.nodes
            .filter(function (node) { return node.category === 'ui'; })
            .sort(function (a, b) { return a.position.y - b.position.y; }); // 按Y轴位置排序
        var jsx = uiNodes.map(function (node) {
            var definition = _this.nodeRegistry.get(node.type);
            if (definition === null || definition === void 0 ? void 0 : definition.generateJSX) {
                return definition.generateJSX(node, _this.project);
            }
            return "    <div /* ".concat(node.label, " */></div>");
        }).join('\n');
        return "    <div className=\"visual-app\">\n".concat(jsx, "\n    </div>");
    };
    VisualProgrammingEngine.prototype.generateReactExports = function () {
        var componentName = this.toPascalCase(this.project.name.replace(/\s+/g, ''));
        return "export default ".concat(componentName);
    };
    VisualProgrammingEngine.prototype.generateVueCode = function () {
        // Vue代码生成实现
        return "<!-- Generated Vue component -->\n<template>\n  <div>Vue component placeholder</div>\n</template>";
    };
    VisualProgrammingEngine.prototype.generateVanillaCode = function () {
        // 原生JavaScript代码生成实现
    };
    // 工具方法
    VisualProgrammingEngine.prototype.generateId = function () {
        return Math.random().toString(36).substring(2, 15);
    };
    VisualProgrammingEngine.prototype.toPascalCase = function (str) {
        return str.replace(/(?:^|[-_])(\w)/g, function (_, char) { return char.toUpperCase(); });
    };
    VisualProgrammingEngine.prototype.extractStateVariables = function () {
        var variables = [];
        // 从节点属性中提取状态变量
        this.project.nodes.forEach(function (node) {
            Object.entries(node.properties).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                if (key.startsWith('state_')) {
                    variables.push({
                        name: key.replace('state_', ''),
                        defaultValue: value
                    });
                }
            });
        });
        return variables;
    };
    VisualProgrammingEngine.prototype.generateHandlerBody = function (node) {
        var _this = this;
        // 根据节点类型和连接生成处理函数体
        var connectedEdges = this.project.edges.filter(function (e) { return e.sourceNodeId === node.id; });
        var body = '(event) => {\n';
        // 生成处理逻辑
        connectedEdges.forEach(function (edge) {
            var targetNode = _this.project.nodes.find(function (n) { return n.id === edge.targetNodeId; });
            if (targetNode) {
                body += "    // Handle ".concat(targetNode.label, "\n");
            }
        });
        body += '  }';
        return body;
    };
    // 事件系统
    VisualProgrammingEngine.prototype.emit = function (eventType, data) {
        this.eventEmitter.dispatchEvent(new CustomEvent(eventType, { detail: data }));
    };
    VisualProgrammingEngine.prototype.on = function (eventType, callback) {
        this.eventEmitter.addEventListener(eventType, callback);
    };
    VisualProgrammingEngine.prototype.off = function (eventType, callback) {
        this.eventEmitter.removeEventListener(eventType, callback);
    };
    // 注册内置节点
    VisualProgrammingEngine.prototype.initializeBuiltinNodes = function () {
        var _this = this;
        // UI组件节点
        this.registerNode('button', {
            label: '按钮',
            category: 'ui',
            description: '可点击的按钮组件',
            documentation: '创建一个可交互的按钮',
            examples: ['登录按钮', '提交按钮', '取消按钮'],
            inputs: [
                { id: 'text', name: '按钮文本', type: 'string', required: true, defaultValue: '点击我' }
            ],
            outputs: [
                { id: 'click', name: '点击事件', type: 'function', required: false }
            ],
            defaultProperties: {
                text: '点击我',
                variant: 'primary',
                size: 'medium'
            },
            reactImports: ["import { Button } from '@/components/ui/button'"],
            generateJSX: function (node, project) {
                var clickHandler = _this.findConnectedHandler(node.id, 'click', project);
                return "      <Button \n        onClick={".concat(clickHandler || '() => {}', "}\n        variant=\"").concat(node.properties.variant, "\"\n        size=\"").concat(node.properties.size, "\"\n      >\n        ").concat(node.properties.text, "\n      </Button>");
            }
        });
        // 输入框节点
        this.registerNode('input', {
            label: '输入框',
            category: 'ui',
            description: '文本输入组件',
            documentation: '创建一个文本输入框',
            examples: ['用户名输入', '密码输入', '搜索框'],
            inputs: [
                { id: 'placeholder', name: '占位符', type: 'string', required: false, defaultValue: '请输入...' },
                { id: 'value', name: '值', type: 'string', required: false, defaultValue: '' }
            ],
            outputs: [
                { id: 'change', name: '值改变', type: 'function', required: false },
                { id: 'value', name: '当前值', type: 'string', required: false }
            ],
            defaultProperties: {
                placeholder: '请输入...',
                type: 'text'
            },
            reactImports: ["import { Input } from '@/components/ui/input'"],
            generateJSX: function (node, project) {
                return "      <Input \n        placeholder=\"".concat(node.properties.placeholder, "\"\n        type=\"").concat(node.properties.type, "\"\n      />");
            }
        });
        // 情感检测节点
        this.registerNode('emotion-detector', {
            label: '情感检测',
            category: 'emotion',
            description: '检测用户情感状态',
            documentation: '分析文本或语音中的情感信息',
            examples: ['文本情感分析', '语音情感识别'],
            inputs: [
                { id: 'text', name: '输入文本', type: 'string', required: false },
                { id: 'audio', name: '音频输入', type: 'object', required: false }
            ],
            outputs: [
                { id: 'emotion', name: '情感结果', type: 'emotion', required: false },
                { id: 'confidence', name: '置信度', type: 'number', required: false }
            ],
            defaultProperties: {
                mode: 'text',
                sensitivity: 0.7
            },
            reactImports: ["import { EmotionDetector } from '@/components/emotion/detector'"],
            generateJSX: function (node, project) {
                return "      <EmotionDetector \n        mode=\"".concat(node.properties.mode, "\"\n        sensitivity={").concat(node.properties.sensitivity, "}\n      />");
            }
        });
        // AI助手节点
        this.registerNode('ai-assistant', {
            label: 'AI助手',
            category: 'ai',
            description: 'AI智能助手组件',
            documentation: '提供AI对话和智能响应功能',
            examples: ['智能客服', '学习助手', '代码助手'],
            inputs: [
                { id: 'prompt', name: '提示词', type: 'string', required: true },
                { id: 'context', name: '上下文', type: 'object', required: false }
            ],
            outputs: [
                { id: 'response', name: 'AI响应', type: 'ai-response', required: false },
                { id: 'loading', name: '加载状态', type: 'boolean', required: false }
            ],
            defaultProperties: {
                model: 'gpt-4',
                maxTokens: 1000,
                temperature: 0.7
            },
            reactImports: ["import { AIAssistant } from '@/components/ai/assistant'"],
            generateJSX: function (node, project) {
                return "      <AIAssistant \n        model=\"".concat(node.properties.model, "\"\n        maxTokens={").concat(node.properties.maxTokens, "}\n        temperature={").concat(node.properties.temperature, "}\n      />");
            }
        });
    };
    VisualProgrammingEngine.prototype.registerNode = function (type, definition) {
        this.nodeRegistry.set(type, definition);
    };
    VisualProgrammingEngine.prototype.getRegisteredNodes = function () {
        return new Map(this.nodeRegistry);
    };
    VisualProgrammingEngine.prototype.findConnectedHandler = function (nodeId, portId, project) {
        var edge = project.edges.find(function (e) { return e.sourceNodeId === nodeId && e.sourcePortId === portId; });
        if (edge) {
            var targetNode = project.nodes.find(function (n) { return n.id === edge.targetNodeId; });
            if (targetNode) {
                return "handle".concat(this.toPascalCase(targetNode.label));
            }
        }
        return null;
    };
    return VisualProgrammingEngine;
}());
exports.VisualProgrammingEngine = VisualProgrammingEngine;
// 导出引擎实例
exports.visualEngine = new VisualProgrammingEngine();
