"use strict";
/**
 * YYC³ 可视化编程代码编译器
 * 负责将可视化节点编译成可执行的代码
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
exports.CodeCompiler = void 0;
var Babel = require("@babel/standalone");
/**
 * 代码编译器类
 */
var CodeCompiler = /** @class */ (function () {
    function CodeCompiler(project, options) {
        if (options === void 0) { options = {}; }
        this.project = project;
        this.options = __assign({ framework: 'react', typescript: false, minify: false, sourceMaps: false, optimization: 'basic' }, options);
    }
    /**
     * 编译项目为可执行代码
     */
    CodeCompiler.prototype.compile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, warnings, errors, dependencies, rawCode, transformedCode, performance_1, compileTime, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        warnings = [];
                        errors = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        // 1. 项目验证
                        return [4 /*yield*/, this.validateProject(warnings, errors)];
                    case 2:
                        // 1. 项目验证
                        _a.sent();
                        if (errors.length > 0) {
                            return [2 /*return*/, this.createErrorResult(errors, warnings, startTime)];
                        }
                        dependencies = this.analyzeDependencies();
                        rawCode = this.generateCode();
                        return [4 /*yield*/, this.transformCode(rawCode, warnings, errors)
                            // 5. 性能分析
                        ];
                    case 3:
                        transformedCode = _a.sent();
                        performance_1 = this.analyzePerformance();
                        compileTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                code: transformedCode,
                                dependencies: dependencies,
                                warnings: warnings,
                                errors: errors,
                                metadata: {
                                    compileTime: compileTime,
                                    nodeCount: this.project.nodes.length,
                                    edgeCount: this.project.edges.length,
                                    complexity: this.calculateComplexity(),
                                    performance: performance_1
                                }
                            }];
                    case 4:
                        error_1 = _a.sent();
                        errors.push({
                            type: 'COMPILATION_ERROR',
                            message: error_1 instanceof Error ? error_1.message : 'Unknown compilation error'
                        });
                        return [2 /*return*/, this.createErrorResult(errors, warnings, startTime)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 项目验证
     */
    CodeCompiler.prototype.validateProject = function (warnings, errors) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 验证节点连接
                this.validateNodeConnections(warnings, errors);
                // 验证循环依赖
                this.validateCyclicDependencies(warnings, errors);
                // 验证数据流
                this.validateDataFlow(warnings, errors);
                // 验证组件兼容性
                this.validateComponentCompatibility(warnings, errors);
                return [2 /*return*/];
            });
        });
    };
    CodeCompiler.prototype.validateNodeConnections = function (warnings, errors) {
        var _loop_1 = function (edge) {
            var sourceNode = this_1.project.nodes.find(function (n) { return n.id === edge.sourceNodeId; });
            var targetNode = this_1.project.nodes.find(function (n) { return n.id === edge.targetNodeId; });
            if (!sourceNode || !targetNode) {
                errors.push({
                    type: 'INVALID_CONNECTION',
                    message: 'Connection references non-existent node',
                    nodeId: edge.sourceNodeId
                });
                return "continue";
            }
            var sourcePort = sourceNode.outputs.find(function (p) { return p.id === edge.sourcePortId; });
            var targetPort = targetNode.inputs.find(function (p) { return p.id === edge.targetPortId; });
            if (!sourcePort || !targetPort) {
                errors.push({
                    type: 'INVALID_PORT',
                    message: 'Connection references non-existent port',
                    nodeId: sourceNode.id
                });
                return "continue";
            }
            // 类型兼容性检查
            if (!this_1.isTypeCompatible(sourcePort.type, targetPort.type)) {
                warnings.push({
                    type: 'TYPE_MISMATCH',
                    message: "Type mismatch: ".concat(sourcePort.type, " -> ").concat(targetPort.type),
                    nodeId: sourceNode.id,
                    severity: 'medium'
                });
            }
        };
        var this_1 = this;
        for (var _i = 0, _a = this.project.edges; _i < _a.length; _i++) {
            var edge = _a[_i];
            _loop_1(edge);
        }
    };
    CodeCompiler.prototype.validateCyclicDependencies = function (warnings, errors) {
        var _this = this;
        var visited = new Set();
        var recursionStack = new Set();
        var dfs = function (nodeId) {
            if (recursionStack.has(nodeId)) {
                return true; // 发现循环
            }
            if (visited.has(nodeId)) {
                return false;
            }
            visited.add(nodeId);
            recursionStack.add(nodeId);
            // 检查所有输出连接
            var outgoingEdges = _this.project.edges.filter(function (e) { return e.sourceNodeId === nodeId; });
            for (var _i = 0, outgoingEdges_1 = outgoingEdges; _i < outgoingEdges_1.length; _i++) {
                var edge = outgoingEdges_1[_i];
                if (dfs(edge.targetNodeId)) {
                    errors.push({
                        type: 'CYCLIC_DEPENDENCY',
                        message: 'Cyclic dependency detected in node graph',
                        nodeId: nodeId
                    });
                    return true;
                }
            }
            recursionStack.delete(nodeId);
            return false;
        };
        for (var _i = 0, _a = this.project.nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            if (!visited.has(node.id)) {
                dfs(node.id);
            }
        }
    };
    CodeCompiler.prototype.validateDataFlow = function (warnings, errors) {
        var _loop_2 = function (node) {
            var _loop_4 = function (input) {
                if (input.required) {
                    var hasConnection = this_2.project.edges.some(function (e) { return e.targetNodeId === node.id && e.targetPortId === input.id; });
                    if (!hasConnection && input.defaultValue === undefined) {
                        warnings.push({
                            type: 'MISSING_REQUIRED_INPUT',
                            message: "Required input '".concat(input.name, "' is not connected and has no default value"),
                            nodeId: node.id,
                            severity: 'high'
                        });
                    }
                }
            };
            for (var _d = 0, _e = node.inputs; _d < _e.length; _d++) {
                var input = _e[_d];
                _loop_4(input);
            }
        };
        var this_2 = this;
        // 检查必需输入是否已连接
        for (var _i = 0, _a = this.project.nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            _loop_2(node);
        }
        var _loop_3 = function (node) {
            var _loop_5 = function (output) {
                var hasConnection = this_3.project.edges.some(function (e) { return e.sourceNodeId === node.id && e.sourcePortId === output.id; });
                if (!hasConnection) {
                    warnings.push({
                        type: 'UNUSED_OUTPUT',
                        message: "Output '".concat(output.name, "' is not connected"),
                        nodeId: node.id,
                        severity: 'low'
                    });
                }
            };
            for (var _f = 0, _g = node.outputs; _f < _g.length; _f++) {
                var output = _g[_f];
                _loop_5(output);
            }
        };
        var this_3 = this;
        // 检查未使用的输出
        for (var _b = 0, _c = this.project.nodes; _b < _c.length; _b++) {
            var node = _c[_b];
            _loop_3(node);
        }
    };
    CodeCompiler.prototype.validateComponentCompatibility = function (warnings, errors) {
        var framework = this.options.framework;
        for (var _i = 0, _a = this.project.nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            // 检查框架兼容性
            if (node.type.includes('react') && framework !== 'react') {
                warnings.push({
                    type: 'FRAMEWORK_MISMATCH',
                    message: "React-specific component used in ".concat(framework, " project"),
                    nodeId: node.id,
                    severity: 'medium'
                });
            }
            // 检查功能兼容性
            if (node.category === 'emotion' && !this.project.metadata.emotionEnabled) {
                warnings.push({
                    type: 'FEATURE_DISABLED',
                    message: 'Emotion component used but emotion feature is disabled',
                    nodeId: node.id,
                    severity: 'medium'
                });
            }
            if (node.category === 'ai' && !this.project.metadata.aiEnabled) {
                warnings.push({
                    type: 'FEATURE_DISABLED',
                    message: 'AI component used but AI feature is disabled',
                    nodeId: node.id,
                    severity: 'medium'
                });
            }
        }
    };
    /**
     * 依赖分析
     */
    CodeCompiler.prototype.analyzeDependencies = function () {
        var dependencies = new Set();
        // 基础框架依赖
        switch (this.options.framework) {
            case 'react':
                dependencies.add('react');
                dependencies.add('react-dom');
                break;
            case 'vue':
                dependencies.add('vue');
                break;
        }
        // 分析节点依赖
        for (var _i = 0, _a = this.project.nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            switch (node.category) {
                case 'ui':
                    dependencies.add('@/components/ui');
                    break;
                case 'emotion':
                    dependencies.add('@yyc3/emotion-sound-platform');
                    dependencies.add('@/hooks/use-emotion-detection');
                    break;
                case 'ai':
                    dependencies.add('@/hooks/use-ai');
                    dependencies.add('@/services/ai');
                    break;
            }
            // 特殊节点依赖
            if (node.type === 'chart') {
                dependencies.add('recharts');
            }
            if (node.type === 'map') {
                dependencies.add('react-leaflet');
            }
        }
        return Array.from(dependencies);
    };
    /**
     * 代码生成
     */
    CodeCompiler.prototype.generateCode = function () {
        switch (this.options.framework) {
            case 'react':
                return this.generateReactCode();
            case 'vue':
                return this.generateVueCode();
            case 'vanilla':
                return this.generateVanillaCode();
            default:
                throw new Error("Unsupported framework: ".concat(this.options.framework));
        }
    };
    CodeCompiler.prototype.generateReactCode = function () {
        var imports = this.generateReactImports();
        var interfaces = this.generateTypeDefinitions();
        var component = this.generateReactComponent();
        var styles = this.generateStyles();
        return [imports, interfaces, component, styles].filter(Boolean).join('\n\n');
    };
    CodeCompiler.prototype.generateReactImports = function () {
        var imports = [];
        // React核心导入
        imports.push("import React, { useState, useEffect, useCallback, useMemo } from 'react'");
        // UI组件导入
        var uiComponents = new Set();
        this.project.nodes.filter(function (n) { return n.category === 'ui'; }).forEach(function (node) {
            switch (node.type) {
                case 'button':
                    uiComponents.add('Button');
                    break;
                case 'input':
                    uiComponents.add('Input');
                    break;
                case 'card':
                    uiComponents.add('Card');
                    break;
            }
        });
        if (uiComponents.size > 0) {
            imports.push("import { ".concat(Array.from(uiComponents).join(', '), " } from '@/components/ui'"));
        }
        // 功能导入
        if (this.project.metadata.emotionEnabled) {
            imports.push("import { useYYC3EmotionDetection } from '@/hooks/use-emotion-detection'");
        }
        if (this.project.metadata.aiEnabled) {
            imports.push("import { useYYC3AI } from '@/hooks/use-ai'");
        }
        return imports.join('\n');
    };
    CodeCompiler.prototype.generateTypeDefinitions = function () {
        if (!this.options.typescript)
            return '';
        var interfaces = [];
        // 组件Props接口
        var componentName = this.getComponentName();
        interfaces.push("interface ".concat(componentName, "Props {\n  className?: string\n  onInit?: () => void\n}"));
        // 状态接口
        var stateFields = this.extractStateFields();
        if (stateFields.length > 0) {
            interfaces.push("interface AppState {\n".concat(stateFields.map(function (field) { return "  ".concat(field.name, ": ").concat(field.type); }).join('\n'), "\n}"));
        }
        return interfaces.join('\n\n');
    };
    CodeCompiler.prototype.generateReactComponent = function () {
        var componentName = this.getComponentName();
        var propsType = this.options.typescript ? "".concat(componentName, "Props") : '';
        var hooks = this.generateReactHooks();
        var effects = this.generateReactEffects();
        var handlers = this.generateReactHandlers();
        var jsx = this.generateReactJSX();
        return "function ".concat(componentName, "(").concat(propsType ? "props: ".concat(propsType) : '', ") {\n").concat(hooks, "\n\n").concat(effects, "\n\n").concat(handlers, "\n\n  return (\n").concat(jsx, "\n  )\n}");
    };
    CodeCompiler.prototype.generateReactHooks = function () {
        var _this = this;
        var hooks = [];
        // 状态管理
        var stateFields = this.extractStateFields();
        stateFields.forEach(function (field) {
            hooks.push("  const [".concat(field.name, ", set").concat(_this.toPascalCase(field.name), "] = useState").concat(_this.options.typescript ? "<".concat(field.type, ">") : '', "(").concat(JSON.stringify(field.defaultValue), ")"));
        });
        // 功能hooks
        if (this.project.metadata.emotionEnabled) {
            hooks.push('  const { detectEmotion, currentEmotion } = useYYC3EmotionDetection()');
        }
        if (this.project.metadata.aiEnabled) {
            hooks.push('  const { generateResponse, isLoading } = useYYC3AI()');
        }
        return hooks.join('\n');
    };
    CodeCompiler.prototype.generateReactEffects = function () {
        var effects = [];
        // 初始化效果
        effects.push("  useEffect(() => {\n    // Component initialization\n  }, [])");
        // 情感检测效果
        if (this.project.metadata.emotionEnabled) {
            effects.push("  useEffect(() => {\n    if (currentEmotion) {\n      // Handle emotion changes\n    }\n  }, [currentEmotion])");
        }
        return effects.join('\n\n');
    };
    CodeCompiler.prototype.generateReactHandlers = function () {
        var _this = this;
        var handlers = [];
        // 为逻辑节点生成处理函数
        var logicNodes = this.project.nodes.filter(function (n) { return n.category === 'logic'; });
        logicNodes.forEach(function (node) {
            var handlerName = "handle".concat(_this.toPascalCase(node.label));
            handlers.push("  const ".concat(handlerName, " = useCallback((").concat(_this.generateHandlerParams(node), ") => {\n    ").concat(_this.generateHandlerBody(node), "\n  }, [])"));
        });
        return handlers.join('\n\n');
    };
    CodeCompiler.prototype.generateReactJSX = function () {
        var _this = this;
        // 按位置排序UI节点
        var uiNodes = this.project.nodes
            .filter(function (n) { return n.category === 'ui'; })
            .sort(function (a, b) { return a.position.y - b.position.y || a.position.x - b.position.x; });
        var jsx = uiNodes.map(function (node) { return _this.generateNodeJSX(node); }).join('\n');
        return "    <div className=\"visual-app\">\n".concat(jsx, "\n    </div>");
    };
    CodeCompiler.prototype.generateNodeJSX = function (node) {
        switch (node.type) {
            case 'button':
                return "      <Button\n        onClick={".concat(this.findEventHandler(node, 'click') || '() => {}', "}\n        variant=\"").concat(node.properties.variant || 'default', "\"\n        size=\"").concat(node.properties.size || 'medium', "\"\n        className=\"mb-4\"\n      >\n        ").concat(node.properties.text || '按钮', "\n      </Button>");
            case 'input':
                return "      <Input\n        placeholder=\"".concat(node.properties.placeholder || '请输入...', "\"\n        value={").concat(this.findStateBinding(node, 'value') || "''", "}\n        className=\"mb-4\"\n      />");
            case 'card':
                return "      <Card className=\"mb-4\">\n        <div className=\"p-4\">\n          ".concat(node.properties.content || '卡片内容', "\n        </div>\n      </Card>");
            default:
                return "      <div /* ".concat(node.label, " */ className=\"mb-4\">\n        {/* TODO: Implement ").concat(node.type, " component */}\n      </div>");
        }
    };
    CodeCompiler.prototype.generateVueCode = function () {
        return "<template>\n  <div class=\"visual-app\">\n    <!-- Generated Vue component -->\n  </div>\n</template>\n\n<script>\nexport default {\n  name: '".concat(this.getComponentName(), "',\n  data() {\n    return {\n      // Component data\n    }\n  },\n  mounted() {\n    // Component initialization\n  }\n}\n</script>\n\n<style scoped>\n.visual-app {\n  padding: 1rem;\n}\n</style>");
    };
    CodeCompiler.prototype.generateVanillaCode = function () {
        return "// Generated vanilla JavaScript\n(function() {\n  'use strict';\n  \n  // Component initialization\n  function init() {\n  }\n  \n  // Auto-initialize when DOM is ready\n  if (document.readyState === 'loading') {\n    document.addEventListener('DOMContentLoaded', init);\n  } else {\n    init();\n  }\n})();";
    };
    CodeCompiler.prototype.generateStyles = function () {
        return "/* Generated styles */\n.visual-app {\n  min-height: 100vh;\n  padding: 2rem;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n}\n\n.visual-app > * + * {\n  margin-top: 1rem;\n}";
    };
    /**
     * 代码转换和优化
     */
    CodeCompiler.prototype.transformCode = function (code, warnings, errors) {
        return __awaiter(this, void 0, void 0, function () {
            var transformedCode, result;
            return __generator(this, function (_a) {
                try {
                    transformedCode = code;
                    // Babel转换
                    if (this.options.framework === 'react') {
                        result = Babel.transform(code, {
                            presets: __spreadArray([
                                '@babel/preset-react'
                            ], (this.options.typescript ? ['@babel/preset-typescript'] : []), true),
                            plugins: __spreadArray([], (this.options.optimization !== 'none' ? ['@babel/plugin-transform-runtime'] : []), true)
                        });
                        if (result.code) {
                            transformedCode = result.code;
                        }
                    }
                    // 代码优化
                    if (this.options.optimization === 'advanced') {
                        transformedCode = this.optimizeCode(transformedCode);
                    }
                    // 代码压缩
                    if (this.options.minify) {
                        transformedCode = this.minifyCode(transformedCode);
                    }
                    return [2 /*return*/, transformedCode];
                }
                catch (error) {
                    errors.push({
                        type: 'TRANSFORM_ERROR',
                        message: error instanceof Error ? error.message : 'Code transformation failed'
                    });
                    return [2 /*return*/, code]; // 返回原始代码
                }
                return [2 /*return*/];
            });
        });
    };
    CodeCompiler.prototype.optimizeCode = function (code) {
        // 基础代码优化
        return code
            .replace(/\/\*[\s\S]*?\*\//g, '') // 移除块注释
            .replace(/\/\/.*$/gm, '') // 移除行注释
            .replace(/\s+/g, ' ') // 压缩空白字符
            .trim();
    };
    CodeCompiler.prototype.minifyCode = function (code) {
        // 简单的代码压缩
        return code
            .replace(/\s*{\s*/g, '{')
            .replace(/\s*}\s*/g, '}')
            .replace(/\s*;\s*/g, ';')
            .replace(/\s*,\s*/g, ',')
            .replace(/\s*=\s*/g, '=')
            .trim();
    };
    /**
     * 性能分析
     */
    CodeCompiler.prototype.analyzePerformance = function () {
        var nodeCount = this.project.nodes.length;
        var edgeCount = this.project.edges.length;
        // 估算包大小 (KB)
        var estimatedBundleSize = this.estimateBundleSize();
        // 计算渲染复杂度
        var renderComplexity = this.calculateRenderComplexity();
        // 估算内存使用 (MB)
        var memoryUsage = (nodeCount * 0.1) + (edgeCount * 0.05);
        // 估算执行时间 (ms)
        var executionTime = Math.max(10, nodeCount * 2 + edgeCount * 1);
        return {
            estimatedBundleSize: estimatedBundleSize,
            renderComplexity: renderComplexity,
            memoryUsage: memoryUsage,
            executionTime: executionTime
        };
    };
    CodeCompiler.prototype.estimateBundleSize = function () {
        var size = 50; // 基础大小 (KB)
        // 根据节点类型估算大小
        for (var _i = 0, _a = this.project.nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            switch (node.category) {
                case 'ui':
                    size += 5;
                    break;
                case 'emotion':
                    size += 20;
                    break;
                case 'ai':
                    size += 30;
                    break;
                case 'logic':
                    size += 2;
                    break;
                case 'data':
                    size += 3;
                    break;
            }
        }
        return size;
    };
    CodeCompiler.prototype.calculateRenderComplexity = function () {
        var complexity = 1;
        // UI节点增加复杂度
        var uiNodes = this.project.nodes.filter(function (n) { return n.category === 'ui'; });
        complexity += uiNodes.length * 0.5;
        // 连接增加复杂度
        complexity += this.project.edges.length * 0.2;
        // 嵌套层级增加复杂度
        var maxDepth = this.calculateMaxDepth();
        complexity += maxDepth * 0.3;
        return Math.round(complexity * 10) / 10;
    };
    CodeCompiler.prototype.calculateMaxDepth = function () {
        var _this = this;
        // 计算节点图的最大深度
        var visited = new Set();
        var maxDepth = 0;
        var dfs = function (nodeId, depth) {
            if (visited.has(nodeId))
                return;
            visited.add(nodeId);
            maxDepth = Math.max(maxDepth, depth);
            var outgoingEdges = _this.project.edges.filter(function (e) { return e.sourceNodeId === nodeId; });
            for (var _i = 0, outgoingEdges_2 = outgoingEdges; _i < outgoingEdges_2.length; _i++) {
                var edge = outgoingEdges_2[_i];
                dfs(edge.targetNodeId, depth + 1);
            }
        };
        // 从没有输入连接的节点开始
        var rootNodes = this.project.nodes.filter(function (node) {
            return !_this.project.edges.some(function (edge) { return edge.targetNodeId === node.id; });
        });
        for (var _i = 0, rootNodes_1 = rootNodes; _i < rootNodes_1.length; _i++) {
            var rootNode = rootNodes_1[_i];
            dfs(rootNode.id, 1);
        }
        return maxDepth;
    };
    CodeCompiler.prototype.calculateComplexity = function () {
        // McCabe圈复杂度的简化版本
        var complexity = 1; // 基础复杂度
        // 条件节点增加复杂度
        var logicNodes = this.project.nodes.filter(function (n) { return n.category === 'logic'; });
        complexity += logicNodes.length;
        // 循环增加复杂度
        var loops = this.detectLoops();
        complexity += loops * 2;
        return complexity;
    };
    CodeCompiler.prototype.detectLoops = function () {
        var _this = this;
        // 简单的循环检测
        var loopCount = 0;
        var visited = new Set();
        var recursionStack = new Set();
        var dfs = function (nodeId) {
            if (recursionStack.has(nodeId)) {
                loopCount++;
                return true;
            }
            if (visited.has(nodeId))
                return false;
            visited.add(nodeId);
            recursionStack.add(nodeId);
            var outgoingEdges = _this.project.edges.filter(function (e) { return e.sourceNodeId === nodeId; });
            for (var _i = 0, outgoingEdges_3 = outgoingEdges; _i < outgoingEdges_3.length; _i++) {
                var edge = outgoingEdges_3[_i];
                dfs(edge.targetNodeId);
            }
            recursionStack.delete(nodeId);
            return false;
        };
        for (var _i = 0, _a = this.project.nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            if (!visited.has(node.id)) {
                dfs(node.id);
            }
        }
        return loopCount;
    };
    // 工具方法
    CodeCompiler.prototype.createErrorResult = function (errors, warnings, startTime) {
        return {
            code: '',
            dependencies: [],
            warnings: warnings,
            errors: errors,
            metadata: {
                compileTime: Date.now() - startTime,
                nodeCount: this.project.nodes.length,
                edgeCount: this.project.edges.length,
                complexity: 0,
                performance: {
                    estimatedBundleSize: 0,
                    renderComplexity: 0,
                    memoryUsage: 0,
                    executionTime: 0
                }
            }
        };
    };
    CodeCompiler.prototype.isTypeCompatible = function (sourceType, targetType) {
        var _a;
        if (sourceType === targetType)
            return true;
        var compatibilityRules = {
            'string': ['object', 'any'],
            'number': ['string', 'object', 'any'],
            'boolean': ['string', 'object', 'any'],
            'object': ['any'],
            'array': ['object', 'any'],
            'function': ['any'],
            'emotion': ['object', 'any'],
            'ai-response': ['object', 'string', 'any']
        };
        return ((_a = compatibilityRules[sourceType]) === null || _a === void 0 ? void 0 : _a.includes(targetType)) || false;
    };
    CodeCompiler.prototype.getComponentName = function () {
        return this.toPascalCase(this.project.name.replace(/[^\w\s]/g, '').replace(/\s+/g, ' '));
    };
    CodeCompiler.prototype.toPascalCase = function (str) {
        return str.replace(/(?:^|[\s-_])(\w)/g, function (_, char) { return char.toUpperCase(); });
    };
    CodeCompiler.prototype.extractStateFields = function () {
        var fields = [];
        for (var _i = 0, _a = this.project.nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            Object.entries(node.properties).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                if (key.startsWith('state_')) {
                    var fieldName = key.replace('state_', '');
                    fields.push({
                        name: fieldName,
                        type: typeof value,
                        defaultValue: value
                    });
                }
            });
        }
        return fields;
    };
    CodeCompiler.prototype.generateHandlerParams = function (node) {
        var _this = this;
        var inputEdges = this.project.edges.filter(function (e) { return e.targetNodeId === node.id; });
        if (inputEdges.length === 0)
            return 'event';
        var params = inputEdges.map(function (edge) {
            var sourceNode = _this.project.nodes.find(function (n) { return n.id === edge.sourceNodeId; });
            var sourcePort = sourceNode === null || sourceNode === void 0 ? void 0 : sourceNode.outputs.find(function (p) { return p.id === edge.sourcePortId; });
            return sourcePort ? "".concat(sourcePort.name, ": ").concat(sourcePort.type) : 'data';
        });
        return params.join(', ');
    };
    CodeCompiler.prototype.generateHandlerBody = function (node) {
        var _this = this;
        var outputEdges = this.project.edges.filter(function (e) { return e.sourceNodeId === node.id; });
        var body = '// Handler implementation\n';
        if (outputEdges.length > 0) {
            body += '\n    // Trigger connected outputs\n';
            outputEdges.forEach(function (edge) {
                var targetNode = _this.project.nodes.find(function (n) { return n.id === edge.targetNodeId; });
                if (targetNode) {
                    body += "    // -> ".concat(targetNode.label, "\n");
                }
            });
        }
        return body;
    };
    CodeCompiler.prototype.findEventHandler = function (node, eventType) {
        var edge = this.project.edges.find(function (e) {
            return e.sourceNodeId === node.id && e.sourcePortId === eventType;
        });
        if (edge) {
            var targetNode = this.project.nodes.find(function (n) { return n.id === edge.targetNodeId; });
            if (targetNode) {
                return "handle".concat(this.toPascalCase(targetNode.label));
            }
        }
        return null;
    };
    CodeCompiler.prototype.findStateBinding = function (node, property) {
        var edge = this.project.edges.find(function (e) {
            return e.targetNodeId === node.id && e.targetPortId === property;
        });
        if (edge) {
            var sourceNode = this.project.nodes.find(function (n) { return n.id === edge.sourceNodeId; });
            if (sourceNode) {
                return this.toCamelCase(sourceNode.label);
            }
        }
        return null;
    };
    CodeCompiler.prototype.findChangeHandler = function (node) {
        var edge = this.project.edges.find(function (e) {
            return e.sourceNodeId === node.id && e.sourcePortId === 'change';
        });
        if (edge) {
            var targetNode = this.project.nodes.find(function (n) { return n.id === edge.targetNodeId; });
            if (targetNode) {
                return "handle".concat(this.toPascalCase(targetNode.label));
            }
        }
        return null;
    };
    CodeCompiler.prototype.toCamelCase = function (str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
    };
    return CodeCompiler;
}());
exports.CodeCompiler = CodeCompiler;
