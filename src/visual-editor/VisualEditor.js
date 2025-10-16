"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualEditor = void 0;
var react_1 = require("react");
var react_redux_1 = require("react-redux");
var visualEditorSlice_1 = require("./store/visualEditorSlice");
var AssetPanel_1 = require("./AssetPanel");
var CanvasArea_1 = require("./CanvasArea");
var PropertyPanel_1 = require("./PropertyPanel");
var useEditor_1 = require("./hooks/useEditor");
var themes = {
    light: {
        bg: "bg-gradient-to-br from-blue-100 via-white to-blue-300",
        panel: "bg-white",
        text: "text-blue-700"
    },
    dark: {
        bg: "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700",
        panel: "bg-gray-900",
        text: "text-blue-200"
    }
};
function generateCode(canvasData, format) {
    switch (format) {
        case 'react':
            return "import React from 'react';\n\nexport default function Generated() {\n  return (\n    <div className=\"relative w-full h-full\">\n".concat(canvasData.map(function (item) {
                var style = "position: 'absolute', left: ".concat(item.x, "px, top: ").concat(item.y, "px, width: ").concat(item.width, "px, height: ").concat(item.height, "px, backgroundColor: '").concat(item.color || '#3b82f6', "'");
                var event = item.onClick ? "onClick={() => {".concat(item.onClick, "}}") : '';
                if (item.type === 'button') {
                    return "      <button style={{".concat(style, "}} ").concat(event, ">").concat(item.name, "</button>");
                }
                else if (item.type === 'input') {
                    return "      <input style={{".concat(style, "}} placeholder=\"").concat(item.name, "\" />");
                }
                else {
                    return "      <div style={{".concat(style, "}}>").concat(item.name, "</div>");
                }
            }).join('\n'), "\n    </div>\n  );\n}");
        case 'vue':
            return "<template>\n  <div class=\"relative w-full h-full\">\n".concat(canvasData.map(function (item) {
                var style = "position: absolute; left: ".concat(item.x, "px; top: ").concat(item.y, "px; width: ").concat(item.width, "px; height: ").concat(item.height, "px; background-color: ").concat(item.color || '#3b82f6', ";");
                if (item.type === 'button') {
                    return "    <button style=\"".concat(style, "\" @click=\"").concat(item.onClick || '', "\">").concat(item.name, "</button>");
                }
                else if (item.type === 'input') {
                    return "    <input style=\"".concat(style, "\" placeholder=\"").concat(item.name, "\" />");
                }
                else {
                    return "    <div style=\"".concat(style, "\">").concat(item.name, "</div>");
                }
            }).join('\n'), "\n  </div>\n</template>\n\n<script setup>\n// Vue 3 Composition API\n</script>");
        case 'json':
            return JSON.stringify({
                version: '1.0',
                components: canvasData.map(function (item) { return ({
                    id: item.id,
                    name: item.name,
                    type: item.type,
                    position: { x: item.x, y: item.y },
                    size: { width: item.width, height: item.height },
                    style: { color: item.color || '#3b82f6' },
                    events: { onClick: item.onClick || null }
                }); })
            }, null, 2);
        case 'dsl':
            return canvasData.map(function (item) {
                return "Component(".concat(item.type, ") {\n  name: \"").concat(item.name, "\"\n  position: (").concat(item.x, ", ").concat(item.y, ")\n  size: (").concat(item.width, ", ").concat(item.height, ")\n  color: \"").concat(item.color || '#3b82f6', "\"\n  onClick: \"").concat(item.onClick || '', "\"\n}");
            }).join('\n\n');
        default:
            return 'Unsupported format';
    }
}
var VisualEditor = function () {
    var dispatch = (0, react_redux_1.useDispatch)();
    var _a = (0, react_redux_1.useSelector)(function (state) { return state.visualEditor; }), components = _a.components, selectedComponentId = _a.selectedComponentId;
    // 将组件对象转换为数组
    var canvasData = Object.values(components || {});
    var selectedAsset = selectedComponentId && components[selectedComponentId] ? components[selectedComponentId] : null;
    var _b = (0, react_1.useState)(false), showCode = _b[0], setShowCode = _b[1];
    var _c = (0, react_1.useState)('light'), theme = _c[0], setTheme = _c[1];
    var _d = (0, react_1.useState)(false), showTeam = _d[0], setShowTeam = _d[1];
    var _e = (0, react_1.useState)('react'), exportFormat = _e[0], setExportFormat = _e[1];
    var _f = (0, react_1.useState)(null), educationConfig = _f[0], setEducationConfig = _f[1];
    var _g = (0, react_1.useState)(true), showEducationMode = _g[0], setShowEducationMode = _g[1];
    // 新增教育功能状态
    var _h = (0, react_1.useState)('knowledge'), activeEducationPanel = _h[0], setActiveEducationPanel = _h[1];
    var _j = (0, react_1.useState)(false), showEducationFeatures = _j[0], setShowEducationFeatures = _j[1];
    var _k = (0, react_1.useState)(false), showEducationModal = _k[0], setShowEducationModal = _k[1];
    // 高级集成功能状态
    var _l = (0, react_1.useState)(false), isMobile = _l[0], setIsMobile = _l[1];
    var _m = (0, react_1.useState)(''), currentCode = _m[0], setCurrentCode = _m[1];
    // 使用编辑器hook
    var editor = (0, useEditor_1.useEditor)();
    // 获取教育级别对应的组件
    var getEducationAssets = function () {
        if (!educationConfig)
            return [{ name: "按钮", type: "button" }, { name: "输入框", type: "input" }, { name: "文本", type: "text" }];
        var config = educationConfig.mode === '義教'
            ? yiJiaoConfig[educationConfig.level]
            : gaoJiaoConfig[educationConfig.level];
        return (config === null || config === void 0 ? void 0 : config.components) || [];
    };
    var handleEducationModeSelect = function (config) {
        setEducationConfig(config);
        setShowEducationMode(false);
    };
    var handleDownload = function (content, filename) {
        var blob = new Blob([content], { type: 'text/plain' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    var getFileExtension = function (format) {
        switch (format) {
            case 'react': return '.jsx';
            case 'vue': return '.vue';
            case 'json': return '.json';
            case 'dsl': return '.dsl';
            default: return '.txt';
        }
    };
    var handleSelect = function (asset) {
        if (asset) {
            dispatch((0, visualEditorSlice_1.selectComponent)(asset.id));
        }
        else {
            dispatch((0, visualEditorSlice_1.selectComponent)(null));
        }
    };
    // 更新组件的处理函数
    var handleUpdateComponent = function (id, updates) {
        dispatch((0, visualEditorSlice_1.updateComponent)({ componentId: id, updates: updates }));
    };
    // 添加组件的处理函数
    var handleAddComponent = function (component) {
        dispatch((0, visualEditorSlice_1.addComponent)(component));
    };
    // 删除组件的处理函数
    var handleDeleteComponent = function (id) {
        dispatch((0, visualEditorSlice_1.deleteComponent)(id));
    };
    return (<div className="flex flex-col h-screen bg-slate-50">
        {/* 教育模式选择 */}
        {showEducationMode && (<EducationModes onModeSelect={handleEducationModeSelect}/>)}
        
        {/* 教育信息栏 */}
        {educationConfig && (<div className="bg-white shadow-sm border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-bold text-blue-700">
                🎯 {educationConfig.mode} - {educationConfig.level} - {educationConfig.userType}模式
              </span>
              <div className="flex gap-2">
                {educationConfig.features.map(function (feature, idx) { return (<span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    {feature}
                  </span>); })}
              </div>
            </div>
            <button className="px-3 py-1 text-gray-500 hover:text-blue-600 text-sm" onClick={function () { return setShowEducationMode(true); }}>
              切换模式
            </button>
          </div>)}
        
        {/* 学生/教师专用面板 */}
        {educationConfig && (<div className="px-4 pt-4">
            {educationConfig.userType === '学生' ? (<StudentFeatures educationLevel={educationConfig.level || ''} mode={educationConfig.mode}/>) : (<TeacherFeatures educationLevel={educationConfig.level || ''} mode={educationConfig.mode}/>)}
          </div>)}
        
        {/* 主编辑区域 */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-col">
            <AssetPanel_1.AssetPanel assets={getEducationAssets()}/>
            
            {/* 教育功能快速入口 */}
            <EducationQuickEntry educationConfig={educationConfig} onOpenModal={function () { return setShowEducationModal(true); }}/>
            
            {/* AI智能助手 */}
            {educationConfig && (<AICodeAssistant currentCode={currentCode} educationLevel={educationConfig.level} onSuggestion={function (suggestion) {
                // 处理AI建议
            }}/>)}
            
            {/* 实时协作 */}
            {educationConfig && (<RealTimeCollaboration roomId={"room-".concat(Date.now())} userId="current-user" userRole={educationConfig.identity === 'student' ? 'student' : 'teacher'}/>)}
            
            {/* 学习进度可视化 */}
            {educationConfig && educationConfig.identity === 'student' && (<ProgressVisualization userId="current-user" timeRange="week"/>)}
            
            {/* 教育功能区域 */}
            {educationConfig && (<div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
                <StudentTeacherFeatures isStudent={educationConfig.identity === 'student'} educationLevel={educationConfig.level} mode={educationConfig.mode}/>
                
                {/* 教育功能展开按钮 */}
                <div className="p-4 border-t border-gray-200">
                  <button onClick={function () { return setShowEducationFeatures(!showEducationFeatures); }} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <span>高级教育功能</span>
                    <span className="transform transition-transform" style={{
                transform: showEducationFeatures ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
                      ⬇️
                    </span>
                  </button>
                </div>
                
                {/* 高级教育功能面板 */}
                {showEducationFeatures && (<div className="border-t border-gray-200 bg-gray-50">
                    {/* 功能选项卡 */}
                    <div className="p-4">
                      <div className="flex flex-wrap gap-1 mb-4">
                        {[
                    { id: 'knowledge', label: '📚 知识探索', icon: '📚' },
                    { id: 'subjects', label: '📁 学科管理', icon: '📁' },
                    { id: 'path', label: '🛣️ 学习路径', icon: '🛣️' },
                    { id: 'tutorial', label: '🎓 互动教程', icon: '🎓' },
                    { id: 'gallery', label: '🎨 作品展示', icon: '🎨' },
                    { id: 'game', label: '🎮 游戏化', icon: '🎮' },
                    { id: 'recommend', label: '🎯 智能推荐', icon: '🎯' },
                    { id: 'language', label: '🌍 多语言', icon: '🌍' }
                ].map(function (tab) { return (<button key={tab.id} className={"px-2 py-1 rounded-full text-xs font-medium transition-all ".concat(activeEducationPanel === tab.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200')} onClick={function () { return setActiveEducationPanel(tab.id); }}>
                            {tab.icon}
                          </button>); })}
                      </div>
                      
                      {/* 功能面板内容 */}
                      <div className="bg-white rounded-lg p-3 max-h-96 overflow-y-auto">
                        {activeEducationPanel === 'knowledge' && (<div>
                            <h4 className="font-medium text-blue-800 mb-2">📚 知识探索学习</h4>
                            <p className="text-sm text-gray-600 mb-2">生成学习笔记、思维脑图、PPT等内容</p>
                            <button className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700" onClick={function () { return setShowEducationModal(true); }}>
                              打开知识探索
                            </button>
                          </div>)}
                        
                        {activeEducationPanel === 'subjects' && (<div>
                            <h4 className="font-medium text-green-800 mb-2">📁 学科分类管理</h4>
                            <p className="text-sm text-gray-600 mb-2">按学科组织项目文件夹</p>
                            <button className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700" onClick={function () { return setShowEducationModal(true); }}>
                              管理学科文件夹
                            </button>
                          </div>)}
                        
                        {activeEducationPanel === 'path' && (<div>
                            <h4 className="font-medium text-purple-800 mb-2">🛣️ 学习路径规划</h4>
                            <p className="text-sm text-gray-600 mb-2">个性化学习计划制定</p>
                            <button className="w-full px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700" onClick={function () { return setShowEducationModal(true); }}>
                              规划学习路径
                            </button>
                          </div>)}
                        
                        {activeEducationPanel === 'tutorial' && (<div>
                            <h4 className="font-medium text-indigo-800 mb-2">🎓 互动教程系统</h4>
                            <p className="text-sm text-gray-600 mb-2">Step-by-step 指导教程</p>
                            <button className="w-full px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700" onClick={function () { return setShowEducationModal(true); }}>
                              开始教程
                            </button>
                          </div>)}
                        
                        {activeEducationPanel === 'gallery' && (<div>
                            <h4 className="font-medium text-orange-800 mb-2">🎨 成果展示</h4>
                            <p className="text-sm text-gray-600 mb-2">学习作品展示和分享</p>
                            <button className="w-full px-3 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700" onClick={function () { return setShowEducationModal(true); }}>
                              查看作品库
                            </button>
                          </div>)}
                        
                        {activeEducationPanel === 'game' && (<div>
                            <h4 className="font-medium text-pink-800 mb-2">🎮 游戏化学习</h4>
                            <p className="text-sm text-gray-600 mb-2">积分、徽章、排行榜激励</p>
                            <button className="w-full px-3 py-2 bg-pink-600 text-white rounded text-sm hover:bg-pink-700" onClick={function () { return setShowEducationModal(true); }}>
                              查看游戏中心
                            </button>
                          </div>)}
                        
                        {activeEducationPanel === 'recommend' && (<div>
                            <h4 className="font-medium text-teal-800 mb-2">🎯 智能推荐</h4>
                            <p className="text-sm text-gray-600 mb-2">AI推荐学习内容和路径</p>
                            <button className="w-full px-3 py-2 bg-teal-600 text-white rounded text-sm hover:bg-teal-700" onClick={function () { return setShowEducationModal(true); }}>
                              获取推荐
                            </button>
                          </div>)}
                        
                        {activeEducationPanel === 'language' && (<div>
                            <h4 className="font-medium text-cyan-800 mb-2">🌍 多语言支持</h4>
                            <p className="text-sm text-gray-600 mb-2">国际化教育内容</p>
                            <button className="w-full px-3 py-2 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700" onClick={function () { return setShowEducationModal(true); }}>
                              切换语言
                            </button>
                          </div>)}
                      </div>
                    </div>
                  </div>)}
              </div>)}
      </div>
      <CanvasArea_1.CanvasArea canvasData={canvasData} onSelect={handleSelect} onAddComponent={handleAddComponent} onUpdateComponent={handleUpdateComponent} onDeleteComponent={handleDeleteComponent}/>
      <PropertyPanel_1.PropertyPanel selectedAsset={selectedAsset} onUpdateComponent={handleUpdateComponent}/>
        </div>
        
        {/* 工具栏 */}
        <div className="absolute top-4 right-4 flex gap-2 z-50">
          <button className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700" onClick={function () { return setShowCode(true); }}>一键导出代码</button>
          <button className="px-4 py-2 bg-gray-800 text-white rounded shadow hover:bg-gray-700" onClick={function () { return setTheme(theme === 'light' ? 'dark' : 'light'); }}>{theme === 'light' ? '暗黑模式' : '浅色模式'}</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700" onClick={function () { return setShowTeam(true); }}>团队入口</button>
        </div>
        {showCode && (<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className={"rounded-xl shadow-2xl p-6 max-w-4xl w-full relative " + themes[theme].panel}>
              <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500" onClick={function () { return setShowCode(false); }}>×</button>
              <h3 className={"font-bold text-lg mb-4 " + themes[theme].text}>代码导出</h3>
              
              <div className="mb-4 flex gap-4 items-center">
                <label className="text-sm font-medium">导出格式：</label>
                <select value={exportFormat} onChange={function (e) { return setExportFormat(e.target.value); }} className="border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="react">React (.jsx)</option>
                  <option value="vue">Vue (.vue)</option>
                  <option value="json">JSON Schema (.json)</option>
                  <option value="dsl">DSL (.dsl)</option>
                </select>
                
                <div className="flex gap-2 ml-auto">
                  <button className="px-3 py-1 bg-gray-600 text-white rounded shadow hover:bg-gray-700 text-sm" onClick={function () {
                var content = generateCode(canvasData, exportFormat);
                navigator.clipboard.writeText(content);
                alert('代码已复制到剪贴板！');
            }}>
                    📋 复制
                  </button>
                  <button className="px-3 py-1 bg-green-600 text-white rounded shadow hover:bg-green-700 text-sm" onClick={function () {
                var content = generateCode(canvasData, exportFormat);
                var filename = 'generated' + getFileExtension(exportFormat);
                handleDownload(content, filename);
            }}>
                    📥 下载
                  </button>
                </div>
              </div>
              
              <pre className="bg-gray-100 rounded p-4 text-xs overflow-auto max-h-[60vh] border">
                {generateCode(canvasData, exportFormat)}
              </pre>
            </div>
          </div>)}
        {showTeam && (<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className={"rounded-xl shadow-2xl p-6 max-w-xl w-full relative " + themes[theme].panel}>
              <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500" onClick={function () { return setShowTeam(false); }}>×</button>
              <h3 className={"font-bold text-lg mb-2 " + themes[theme].text}>团队协作入口</h3>
              <div className="text-gray-500 mb-2">（预留：多人协作、项目管理、成员列表等）</div>
              <div className="flex flex-col gap-2 mb-4">
                <input className="border rounded px-2 py-1" placeholder="团队名称"/>
                <input className="border rounded px-2 py-1" placeholder="成员邮箱（逗号分隔）"/>
                <button className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700">创建/加入团队</button>
              </div>
              <div className="border-t pt-4 mt-4">
                <h4 className={"font-bold mb-2 " + themes[theme].text}>项目管理</h4>
                <ul className="mb-2">
                  <li className="mb-1 text-blue-700 font-semibold">项目A（示例）</li>
                  <li className="mb-1 text-blue-700 font-semibold">项目B（示例）</li>
                </ul>
                <button className="px-3 py-1 bg-green-600 text-white rounded shadow hover:bg-green-700 text-sm">新建项目</button>
              </div>
              <div className="border-t pt-4 mt-4">
                <h4 className={"font-bold mb-2 " + themes[theme].text}>成员列表</h4>
                <ul>
                  <li className="mb-1 text-gray-700">张三（owner）</li>
                  <li className="mb-1 text-gray-700">李四</li>
                  <li className="mb-1 text-gray-700">王五</li>
                </ul>
              </div>
            </div>
          </div>)}
        
        {/* 教育功能完整模态框 */}
        <EducationFeatureModal isOpen={showEducationModal} onClose={function () { return setShowEducationModal(false); }} educationConfig={educationConfig}/>
      </div>);
};
exports.VisualEditor = VisualEditor;
