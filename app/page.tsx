"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/layout/sidebar";
import TopBar from "../components/layout/top-bar";
import MobileNavigation from "../components/layout/mobile-navigation";
import MainContent from "../components/layout/main-content";
import RightPanel from "../components/layout/right-panel-new";
import LoginModal from "../components/auth/login-modal";
import ProjectManager from "../components/project/project-manager";
import DeploymentManager from "../components/deployment/deployment-manager";
import { AuthProvider, useAuth } from "../components/auth/auth-provider";
import { useProjectStore } from "../lib/project-store";
import type { ModuleType } from "../types/modules";
import { BrandLogo } from "../components/ui/brand-logo";
import { Toaster } from "../components/ui/toaster";
import CodePreview from "../components/ai/code-preview";
import ModelSelector from "../components/ai/model-selector";
// import PromptSettings from "@/components/ai/prompt-settings";
// import LocalModelScanner from "@/components/ai/local-model-scanner";

// 在文件顶部添加如下声明，确保 TypeScript 识别 window.unifiedAICall
declare global {
  interface Window {
    unifiedAICall?: (args: {
      model: string;
      prompt: string;
      params: any;
    }) => Promise<any>;
  }
}

function AppContent() {
  const [activeModule, setActiveModule] = 
    useState<ModuleType>("ai-code-generation");
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(true);
  // 导航栏自动收缩相关状态
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  
  // 自动收缩导航栏的效果
  useEffect(() => {
    const activityInterval = setInterval(() => {
      // 检查是否超过30秒无活动
      if (Date.now() - lastActivityTime > 30000) {
        setSidebarCollapsed(true);
        setRightPanelCollapsed(true);
      }
    }, 5000); // 每5秒检查一次
    
    // 监听用户活动
    const handleUserActivity = () => {
      setLastActivityTime(Date.now());
      setSidebarCollapsed(false);
      setRightPanelCollapsed(false);
    };
    
    // 添加事件监听器
    document.addEventListener('mousemove', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);
    document.addEventListener('scroll', handleUserActivity);
    
    return () => {
      clearInterval(activityInterval);
      document.removeEventListener('mousemove', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('scroll', handleUserActivity);
    };
  }, [lastActivityTime]);

  const { user } = useAuth();
  const { currentProject } = useProjectStore();

  // 代码生成相关状态
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");
  const [model, setModel] = useState("gpt-4");
  const [params, setParams] = useState({ temperature: 0.7, maxTokens: 2048 });
  const [localModels, setLocalModels] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // 自动扫描本地模型
  useEffect(() => {
    // LocalModelScanner.scan().then(setLocalModels);
  }, []);

  // 根据模块渲染对应内容
  const renderModuleContent = () => {
    switch (activeModule) {
      case "ai-code-generation":
        return <MainContent activeModule={activeModule} />;
      case "app-development":
        return currentProject ? (
          <MainContent activeModule={activeModule} />
        ) : (
          <ProjectManager />
        );
      case "real-time-preview":
        return <MainContent activeModule={activeModule} />;
      case "automation-production":
        return <MainContent activeModule={activeModule} />;
      case "file-review":
        return <MainContent activeModule={activeModule} />;
      case "score-analysis":
        return <MainContent activeModule={activeModule} />;
      case "deployment-management":
        return <DeploymentManager />;
      case "local-model-engine":
        return <MainContent activeModule={activeModule} />;
      default:
        return <MainContent activeModule={activeModule} />;
    }
  };

  // 统一API调用大模型
  const handleSend = async () => {
    // 这里根据 model 来源（本地/远程）自动选择 API
    if (typeof window.unifiedAICall === "function") {
      const result = await window.unifiedAICall({
        model,
        prompt: input,
        params,
      });
      setMessages([...messages, { role: "user", content: input }]);
      setCode(result.code || "");
      setInput("");
    } else {
      // 可选：给出错误提示
      alert("unifiedAICall 未定义，请检查环境或配置。");
    }
  };

  // 启动页面
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-cloud-blue-50 via-white to-mint-green/20">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <BrandLogo variant="3d" size="2xl" interactive={true} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-6 text-2xl font-bold bg-gradient-to-r from-cloud-blue-500 to-mint-green bg-clip-text text-transparent"
        >
          言語云³ 深度堆栈全栈智创引擎
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-2 text-gray-600"
        >
          万象归元于云枢，深栈智启新纪元
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 400 }}
          transition={{ delay: 1.5, duration: 1.5 }}
          className="h-1 bg-gradient-to-r from-cloud-blue-500 via-mint-green to-sky-blue rounded-full mt-8"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.5 }}
          className="mt-4 text-sm text-gray-500"
        >
          正在初始化智能引擎...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cloud-blue-50 via-white to-mint-green/20">
      {/* 移动端导航 */}
      <MobileNavigation
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        isOpen={mobileMenuOpen}
        onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* 主布局容器 */}
      <div className="flex h-screen overflow-hidden pt-16 lg:pt-0">
        {/* 桌面端左侧导航栏 */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="hidden lg:block relative"
        >
          <motion.div
            animate={{ width: sidebarCollapsed ? 80 : 256 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <Sidebar
              activeModule={activeModule}
              onModuleChange={setActiveModule}
              collapsed={sidebarCollapsed}
            />
          </motion.div>
        </motion.div>

        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 桌面端顶部操作区 */}
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="hidden lg:block"
          >
            <TopBar
              onToggleRightPanel={() => setShowRightPanel(!showRightPanel)}
              showRightPanel={showRightPanel}
              onShowLogin={() => setShowLoginModal(true)}
              user={user}
            />
          </motion.div>

          {/* 主内容与右侧面板 */}
          <div className="flex-1 flex overflow-hidden">
            {/* 主内容区 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
              className={`flex-1 overflow-auto transition-all duration-300 ${
                showRightPanel ? 
                (rightPanelCollapsed ? "lg:mr-20" : "lg:mr-80") : 
                ""
              }`}
            >
              {renderModuleContent()}
            </motion.div>

            {/* 右侧信息栏 */}
            {showRightPanel && (
              <motion.div
                initial={{ x: 300 }}
                animate={{ x: 0, width: rightPanelCollapsed ? 5 : 320 }}
                exit={{ x: 300 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="hidden lg:block fixed right-0 top-16 bottom-0 z-10 overflow-hidden"
              >
                <RightPanel collapsed={rightPanelCollapsed} />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* 登录模态框 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Toast 通知 */}
      <Toaster />
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
