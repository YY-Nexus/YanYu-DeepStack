"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { BrandCard } from "@/components/ui/brand-card";
import { BrandLogo } from "@/components/ui/brand-logo";
import { type ModuleType, moduleConfigs } from "@/types/modules";

interface SidebarProps {
  activeModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
  collapsed?: boolean;
}

export default function Sidebar({
  activeModule,
  onModuleChange,
  collapsed = false,
}: SidebarProps) {
  const [loadingModule, setLoadingModule] = useState<ModuleType | null>(null);
  return (
    <div className={`h-full bg-white/90 backdrop-blur-md border-r border-gray-200/50 shadow-xl transition-all duration-300`}>
      {/* Logo区域 */}
      <motion.div 
        animate={{ padding: collapsed ? '20px' : '24px' }}
        className="border-b border-gray-200/50 bg-gradient-to-br from-cloud-blue-50 to-mint-green/10 flex justify-center"
      >
        <motion.div
          animate={{ width: collapsed ? 0 : 'auto', opacity: collapsed ? 0 : 1 }}
          className="overflow-hidden"
        >
          <BrandLogo
            context="sidebar"
            interactive={true}
            className="flex justify-center"
          />
        </motion.div>
      </motion.div>

      {/* 导航菜单 */}
      <nav className="p-4 space-y-2">
        {moduleConfigs.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <BrandCard
              variant={activeModule === module.id ? "glass" : "default"}
              hover={true}
              className={`cursor-pointer transition-all duration-300 ${
                activeModule === module.id
                  ? `border-l-4 border-cloud-blue-500 bg-gradient-to-r from-cloud-blue-50 to-transparent shadow-glow`
                  : "hover:bg-gray-50"
              } ${loadingModule === module.id ? "opacity-60 pointer-events-none" : ""}`}
              onClick={async () => {
                if (loadingModule) return;
                setLoadingModule(module.id);
                onModuleChange(module.id); // 只切换模块，不跳转路由
                setTimeout(() => setLoadingModule(null), 800);
              }}
            >
              <div className="p-3">
                <div className="flex items-center space-x-3">
                  <motion.span
                    className="text-2xl flex justify-center flex-1"
                    animate={
                      loadingModule === module.id
                        ? { rotate: [0, 20, -20, 0] }
                        : {}
                    }
                    transition={{
                      duration: 0.6,
                      repeat: loadingModule === module.id ? Infinity : 0,
                    }}
                  >
                    {module.icon}
                  </motion.span>
                  <motion.div
                    animate={{ width: collapsed ? 0 : 'auto', opacity: collapsed ? 0 : 1 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    <h3
                      className={`font-medium transition-colors ${
                        activeModule === module.id
                          ? "text-cloud-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      {module.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {module.description}
                    </p>
                  </motion.div>
                </div>
              </div>
            </BrandCard>
          </motion.div>
        ))}
      </nav>

      {/* 底部信息 */}
      <motion.div
        animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : 'auto' }}
        className="absolute bottom-4 left-4 right-4 overflow-hidden"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <BrandCard variant="glass" className="text-center">
            <div className="p-3">
              <p className="text-xs text-gray-600 font-medium">
                言枢象限·语启未来
              </p>
              <div className="mt-2 flex justify-center space-x-1">
                {[1, 2, 3].map((dot) => (
                  <motion.div
                    key={dot}
                    className="w-1.5 h-1.5 bg-cloud-blue-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: dot * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          </BrandCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
