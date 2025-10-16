"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Cloud,
  Server,
  GitBranch,
  Settings,
  Play,
  RotateCcw,
  ExternalLink,
  Clock,
  Zap,
  Globe,
  Database,
  Shield,
  Monitor,
} from "lucide-react";
import { BrandButton } from "@/components/ui/brand-button";
import { BrandCard } from "@/components/ui/brand-card";
import { BrandBadge } from "@/components/ui/brand-badge";
import { useProjectStore } from "@/lib/project-store";

export default function DeploymentManager() {
  const { currentProject, updateProject } = useProjectStore();
  const [activeTab, setActiveTab] = useState<
    "platforms" | "environments" | "cicd" | "logs"
  >("platforms");
  const [deploymentStatus, setDeploymentStatus] = useState<{
    [key: string]: "idle" | "deploying" | "success" | "error";
  }>({});
  const [deploymentLogs, setDeploymentLogs] = useState<{
    [key: string]: string[];
  }>({});

  // 模拟部署状态
  const simulateDeployment = async (environmentId: string) => {
    setDeploymentStatus((prev) => ({ ...prev, [environmentId]: "deploying" }));
    setDeploymentLogs((prev) => ({
      ...prev,
      [environmentId]: [
        "开始部署...",
        "正在构建项目...",
        "安装依赖包...",
        "编译代码...",
        "优化资源...",
        "上传到服务器...",
        "配置环境变量...",
        "启动服务...",
      ],
    }));

    // 模拟部署过程
    for (let i = 0; i < 8; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // 这里可以更新日志显示进度
    }

    // 随机成功或失败
    const success = Math.random() > 0.2;
    setDeploymentStatus((prev) => ({
      ...prev,
      [environmentId]: success ? "success" : "error",
    }));

    if (success) {
      setDeploymentLogs((prev) => ({
        ...prev,
        [environmentId]: [
          ...(prev[environmentId] || []),
          "部署成功！",
          "服务已启动",
        ],
      }));
    } else {
      setDeploymentLogs((prev) => ({
        ...prev,
        [environmentId]: [
          ...(prev[environmentId] || []),
          "部署失败：连接超时",
          "请检查网络配置",
        ],
      }));
    }
  };

  // 获取部署平台图标
  const getPlatformIcon = (type: string) => {
    switch (type) {
      case "vercel":
        return Globe;
      case "netlify":
        return Cloud;
      case "aws":
        return Server;
      case "azure":
        return Cloud;
      case "gcp":
        return Cloud;
      case "docker":
        return Database;
      default:
        return Server;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "success";
      case "disconnected":
        return "warning";
      case "error":
        return "error";
      default:
        return "info";
    }
  };

  // 获取部署状态颜色
  const getDeploymentStatusColor = (status: string) => {
    switch (status) {
      case "deploying":
        return "warning";
      case "success":
        return "success";
      case "error":
        return "error";
      default:
        return "info";
    }
  };

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Rocket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">选择项目</h3>
          <p className="text-gray-600">请先选择一个项目来管理部署</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-cloud-blue-50 to-mint-green/10">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
              <Rocket className="h-6 w-6 text-cloud-blue-500" />
              <span>部署管理</span>
            </h1>
            <p className="text-gray-600 mt-1">
              管理项目的部署配置和CI/CD流水线
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center space-x-3">
              <BrandBadge variant="info" size="sm">
                {currentProject.name}
              </BrandBadge>
              <BrandButton
                variant="primary"
                icon={<Rocket className="h-4 w-4" />}
              >
                快速部署
              </BrandButton>
            </div>
          </motion.div>
        </div>

        {/* 标签页导航 */}
        <div className="flex space-x-1 mt-6 bg-white rounded-lg p-1">
          {[
            { id: "platforms", name: "部署平台", icon: Cloud },
            { id: "environments", name: "环境管理", icon: Server },
            { id: "cicd", name: "CI/CD", icon: GitBranch },
            { id: "logs", name: "部署日志", icon: Monitor },
          ].map(({ id, name, icon: Icon }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === id
                  ? "bg-cloud-blue-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 p-6 overflow-auto">
        <AnimatePresence mode="wait">
          {activeTab === "platforms" && (
            <motion.div
              key="platforms"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  部署平台
                </h2>
                <BrandButton
                  variant="outline"
                  icon={<Settings className="h-4 w-4" />}
                >
                  添加平台
                </BrandButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    id: "vercel",
                    name: "Vercel",
                    type: "vercel",
                    status: "connected",
                    description: "现代化的前端部署平台",
                    lastDeploy: "2024-01-15 14:30",
                    url: "https://myapp.vercel.app",
                  },
                  {
                    id: "netlify",
                    name: "Netlify",
                    type: "netlify",
                    status: "disconnected",
                    description: "JAMstack部署平台",
                    lastDeploy: null,
                    url: null,
                  },
                  {
                    id: "aws",
                    name: "AWS S3",
                    type: "aws",
                    status: "connected",
                    description: "亚马逊云存储服务",
                    lastDeploy: "2024-01-14 09:15",
                    url: "https://myapp.s3.amazonaws.com",
                  },
                ].map((platform) => {
                  const Icon = getPlatformIcon(platform.type);
                  return (
                    <motion.div
                      key={platform.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <BrandCard
                        variant="outlined"
                        hover={true}
                        className="p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-cloud-blue-500 to-mint-green rounded-lg flex items-center justify-center">
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">
                                {platform.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {platform.description}
                              </p>
                            </div>
                          </div>
                          <BrandBadge
                            variant={getStatusColor(platform.status) as any}
                            size="sm"
                          >
                            {platform.status === "connected"
                              ? "已连接"
                              : platform.status === "disconnected"
                                ? "未连接"
                                : "错误"}
                          </BrandBadge>
                        </div>

                        {platform.status === "connected" && (
                          <div className="space-y-2 mb-4">
                            {platform.lastDeploy && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span>最后部署: {platform.lastDeploy}</span>
                              </div>
                            )}
                            {platform.url && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <ExternalLink className="h-4 w-4" />
                                <a
                                  href={platform.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cloud-blue-500 hover:underline"
                                >
                                  {platform.url}
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex space-x-2">
                          {platform.status === "connected" ? (
                            <>
                              <BrandButton
                                variant="primary"
                                size="sm"
                                icon={<Rocket className="h-4 w-4" />}
                              >
                                部署
                              </BrandButton>
                              <BrandButton
                                variant="outline"
                                size="sm"
                                icon={<Settings className="h-4 w-4" />}
                              >
                                配置
                              </BrandButton>
                            </>
                          ) : (
                            <BrandButton
                              variant="primary"
                              size="sm"
                              className="w-full"
                            >
                              连接平台
                            </BrandButton>
                          )}
                        </div>
                      </BrandCard>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "environments" && (
            <motion.div
              key="environments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  环境管理
                </h2>
                <BrandButton
                  variant="outline"
                  icon={<Settings className="h-4 w-4" />}
                >
                  添加环境
                </BrandButton>
              </div>

              <div className="space-y-4">
                {currentProject.deployment.environments.map((environment) => (
                  <motion.div
                    key={environment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <BrandCard variant="outlined" className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              environment.type === "production"
                                ? "bg-red-100 text-red-600"
                                : environment.type === "staging"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            <Server className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {environment.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              分支: {environment.branch}
                            </p>
                            {environment.url && (
                              <a
                                href={environment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-cloud-blue-500 hover:underline"
                              >
                                {environment.url}
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <BrandBadge
                            variant={
                              getDeploymentStatusColor(
                                deploymentStatus[environment.id] || "idle"
                              ) as any
                            }
                            size="sm"
                          >
                            {deploymentStatus[environment.id] === "deploying"
                              ? "部署中"
                              : deploymentStatus[environment.id] === "success"
                                ? "部署成功"
                                : deploymentStatus[environment.id] === "error"
                                  ? "部署失败"
                                  : "待部署"}
                          </BrandBadge>

                          <div className="flex space-x-2">
                            <BrandButton
                              variant="primary"
                              size="sm"
                              icon={<Play className="h-4 w-4" />}
                              onClick={() => simulateDeployment(environment.id)}
                              disabled={
                                deploymentStatus[environment.id] === "deploying"
                              }
                              loading={
                                deploymentStatus[environment.id] === "deploying"
                              }
                            >
                              部署
                            </BrandButton>
                            <BrandButton
                              variant="outline"
                              size="sm"
                              icon={<RotateCcw className="h-4 w-4" />}
                            >
                              回滚
                            </BrandButton>
                            <BrandButton
                              variant="outline"
                              size="sm"
                              icon={<Settings className="h-4 w-4" />}
                            >
                              配置
                            </BrandButton>
                          </div>
                        </div>
                      </div>

                      {/* 环境变量 */}
                      {Object.keys(environment.variables).length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            环境变量
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(environment.variables).map(
                              ([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="font-mono text-gray-600">
                                    {key}
                                  </span>
                                  <span className="text-gray-400 ml-2">
                                    = ****
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* 自动部署设置 */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Zap className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700">
                              自动部署
                            </span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={environment.autoDeployEnabled}
                              onChange={(e) => {
                                // 更新自动部署设置
                                const updatedEnvironments =
                                  currentProject.deployment.environments.map(
                                    (env) =>
                                      env.id === environment.id
                                        ? {
                                            ...env,
                                            autoDeployEnabled: e.target.checked,
                                          }
                                        : env
                                  );
                                updateProject(currentProject.id, {
                                  deployment: {
                                    ...currentProject.deployment,
                                    environments: updatedEnvironments,
                                  },
                                });
                              }}
                              className="sr-only"
                              title="自动部署开关"
                              placeholder="自动部署开关"
                              aria-label="自动部署开关"
                            />
                            <div
                              className={`w-11 h-6 rounded-full transition-colors ${
                                environment.autoDeployEnabled
                                  ? "bg-cloud-blue-500"
                                  : "bg-gray-200"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                  environment.autoDeployEnabled
                                    ? "translate-x-5"
                                    : "translate-x-0"
                                } mt-0.5 ml-0.5`}
                              />
                            </div>
                          </label>
                        </div>
                      </div>
                    </BrandCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "cicd" && (
            <motion.div
              key="cicd"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  CI/CD 配置
                </h2>
                <BrandButton
                  variant="outline"
                  icon={<Settings className="h-4 w-4" />}
                >
                  配置流水线
                </BrandButton>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CI/CD 状态 */}
                <BrandCard variant="outlined" className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      流水线状态
                    </h3>
                    <BrandBadge
                      variant={
                        currentProject.deployment.cicd.enabled
                          ? "success"
                          : "warning"
                      }
                      size="sm"
                    >
                      {currentProject.deployment.cicd.enabled
                        ? "已启用"
                        : "未启用"}
                    </BrandBadge>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <GitBranch className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          自动化CI/CD
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentProject.deployment.cicd.enabled}
                          onChange={(e) => {
                            updateProject(currentProject.id, {
                              deployment: {
                                ...currentProject.deployment,
                                cicd: {
                                  ...currentProject.deployment.cicd,
                                  enabled: e.target.checked,
                                },
                              },
                            });
                          }}
                          className="sr-only"
                          title="自动化CI/CD开关"
                        />
                        <div
                          className={`w-11 h-6 rounded-full transition-colors ${
                            currentProject.deployment.cicd.enabled
                              ? "bg-cloud-blue-500"
                              : "bg-gray-200"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                              currentProject.deployment.cicd.enabled
                                ? "translate-x-5"
                                : "translate-x-0"
                            } mt-0.5 ml-0.5`}
                          />
                        </div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CI/CD 提供商
                      </label>
                      <select
                        aria-label="CI/CD 提供商"
                        value={currentProject.deployment.cicd.provider}
                        onChange={(e) => {
                          updateProject(currentProject.id, {
                            deployment: {
                              ...currentProject.deployment,
                              cicd: {
                                ...currentProject.deployment.cicd,
                                provider: e.target.value as any,
                              },
                            },
                          });
                        }}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50"
                      >
                        <option value="github-actions">GitHub Actions</option>
                        <option value="gitlab-ci">GitLab CI</option>
                        <option value="jenkins">Jenkins</option>
                        <option value="custom">自定义</option>
                      </select>
                    </div>
                  </div>
                </BrandCard>

                {/* Webhook 配置 */}
                <BrandCard variant="outlined" className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Webhook 配置
                    </h3>
                    <BrandButton
                      variant="outline"
                      size="sm"
                      icon={<Settings className="h-4 w-4" />}
                    >
                      添加
                    </BrandButton>
                  </div>

                  <div className="space-y-3">
                    {currentProject.deployment.cicd.webhooks.length === 0 ? (
                      <div className="text-center py-8">
                        <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          暂无 Webhook 配置
                        </p>
                      </div>
                    ) : (
                      currentProject.deployment.cicd.webhooks.map((webhook) => (
                        <div
                          key={webhook.id}
                          className="p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {webhook.url}
                              </p>
                              <p className="text-xs text-gray-600">
                                事件: {webhook.events.join(", ")}
                              </p>
                            </div>
                            <BrandBadge
                              variant={webhook.active ? "success" : "warning"}
                              size="sm"
                            >
                              {webhook.active ? "活跃" : "禁用"}
                            </BrandBadge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </BrandCard>
              </div>

              {/* Docker 配置 */}
              <BrandCard variant="outlined" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Docker 配置
                  </h3>
                  <BrandBadge
                    variant={
                      currentProject.deployment.docker.enabled
                        ? "success"
                        : "warning"
                    }
                    size="sm"
                  >
                    {currentProject.deployment.docker.enabled
                      ? "已启用"
                      : "未启用"}
                  </BrandBadge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Docker 镜像
                    </label>
                    <input
                      type="text"
                      value={currentProject.deployment.docker.image}
                      onChange={(e) => {
                        updateProject(currentProject.id, {
                          deployment: {
                            ...currentProject.deployment,
                            docker: {
                              ...currentProject.deployment.docker,
                              image: e.target.value,
                            },
                          },
                        });
                      }}
                      placeholder="例如: node:18-alpine"
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      镜像仓库
                    </label>
                    <input
                      type="text"
                      value={currentProject.deployment.docker.registry}
                      onChange={(e) => {
                        updateProject(currentProject.id, {
                          deployment: {
                            ...currentProject.deployment,
                            docker: {
                              ...currentProject.deployment.docker,
                              registry: e.target.value,
                            },
                          },
                        });
                      }}
                      placeholder="例如: docker.io"
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dockerfile 路径
                  </label>
                  <input
                    type="text"
                    value={currentProject.deployment.docker.dockerfile}
                    onChange={(e) => {
                      updateProject(currentProject.id, {
                        deployment: {
                          ...currentProject.deployment,
                          docker: {
                            ...currentProject.deployment.docker,
                            dockerfile: e.target.value,
                          },
                        },
                      });
                    }}
                    placeholder="例如: ./Dockerfile"
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cloud-blue-500/50"
                  />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      启用 Docker 部署
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentProject.deployment.docker.enabled}
                      onChange={(e) => {
                        updateProject(currentProject.id, {
                          deployment: {
                            ...currentProject.deployment,
                            docker: {
                              ...currentProject.deployment.docker,
                              enabled: e.target.checked,
                            },
                          },
                        });
                      }}
                      className="sr-only"
                      title="启用Docker部署开关"
                    />
                    <div
                      className={`w-11 h-6 rounded-full transition-colors ${
                        currentProject.deployment.docker.enabled
                          ? "bg-cloud-blue-500"
                          : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                          currentProject.deployment.docker.enabled
                            ? "translate-x-5"
                            : "translate-x-0"
                        } mt-0.5 ml-0.5`}
                      />
                    </div>
                  </label>
                </div>
              </BrandCard>
            </motion.div>
          )}

          {activeTab === "logs" && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  部署日志
                </h2>
                <BrandButton
                  variant="outline"
                  icon={<RotateCcw className="h-4 w-4" />}
                >
                  刷新日志
                </BrandButton>
              </div>

              <div className="space-y-4">
                {currentProject.deployment.environments.map((environment) => (
                  <BrandCard
                    key={environment.id}
                    variant="outlined"
                    className="p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {environment.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <BrandBadge
                          variant={
                            getDeploymentStatusColor(
                              deploymentStatus[environment.id] || "idle"
                            ) as any
                          }
                          size="sm"
                        >
                          {deploymentStatus[environment.id] === "deploying"
                            ? "部署中"
                            : deploymentStatus[environment.id] === "success"
                              ? "部署成功"
                              : deploymentStatus[environment.id] === "error"
                                ? "部署失败"
                                : "待部署"}
                        </BrandBadge>
                        {deploymentStatus[environment.id] === "deploying" && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "linear",
                            }}
                          >
                            <Zap className="h-4 w-4 text-cloud-blue-500" />
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
                      {deploymentLogs[environment.id] ? (
                        <div className="space-y-1">
                          {deploymentLogs[environment.id].map((log, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="text-sm font-mono text-green-400"
                            >
                              <span className="text-gray-500">
                                [{new Date().toLocaleTimeString()}]
                              </span>{" "}
                              {log}
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center">
                            <Monitor className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">暂无部署日志</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </BrandCard>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
