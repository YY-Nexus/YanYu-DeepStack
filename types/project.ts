// 项目管理相关类型定义
export interface Project {
  id: string
  name: string
  description: string
  type: "web" | "mobile" | "desktop" | "api" | "ai-model"
  status: "active" | "archived" | "template"
  visibility: "private" | "public" | "team"

  // 项目元数据
  metadata: {
    createdAt: string
    updatedAt: string
    createdBy: string
    tags: string[]
    language: string
    framework: string
    version: string
  }

  // 项目文件结构
  files: ProjectFile[]

  // 团队协作
  team: TeamMember[]
  permissions: ProjectPermissions

  // 版本控制
  versions: ProjectVersion[]
  currentVersion: string

  // 部署配置
  deployment: DeploymentConfig

  // AI配置
  aiConfig: AIConfig
}

export interface ProjectFile {
  id: string
  name: string
  path: string
  type: "file" | "folder"
  content?: string
  language?: string
  size: number
  lastModified: string
  modifiedBy: string
  parent?: string
  children?: string[]
}

export interface TeamMember {
  userId: string
  name: string
  email: string
  avatar?: string
  role: "owner" | "admin" | "editor" | "viewer"
  joinedAt: string
  lastActive: string
  permissions: string[]
}

export interface ProjectPermissions {
  read: string[]
  write: string[]
  admin: string[]
  deploy: string[]
  share: string[]
}

export interface ProjectVersion {
  id: string
  version: string
  name: string
  description: string
  createdAt: string
  createdBy: string
  changes: VersionChange[]
  snapshot: ProjectSnapshot
  tags: string[]
}

export interface VersionChange {
  type: "added" | "modified" | "deleted" | "renamed"
  filePath: string
  oldPath?: string
  description: string
  diff?: string
}

export interface ProjectSnapshot {
  files: { [path: string]: string }
  metadata: any
}

export interface DeploymentConfig {
  platforms: DeploymentPlatform[]
  environments: DeploymentEnvironment[]
  cicd: CICDConfig
  docker: DockerConfig
}

export interface DeploymentPlatform {
  id: string
  name: string
  type: "vercel" | "netlify" | "aws" | "azure" | "gcp" | "docker"
  config: any
  status: "connected" | "disconnected" | "error"
  lastDeploy?: string
}

export interface DeploymentEnvironment {
  id: string
  name: string
  type: "development" | "staging" | "production"
  url?: string
  branch: string
  autoDeployEnabled: boolean
  variables: { [key: string]: string }
}

export interface CICDConfig {
  enabled: boolean
  provider: "github-actions" | "gitlab-ci" | "jenkins" | "custom"
  config: any
  webhooks: WebhookConfig[]
}

export interface WebhookConfig {
  id: string
  url: string
  events: string[]
  secret?: string
  active: boolean
}

export interface DockerConfig {
  enabled: boolean
  dockerfile: string
  image: string
  registry: string
  buildArgs: { [key: string]: string }
}

export interface AIConfig {
  codeCompletion: {
    enabled: boolean
    model: string
    suggestions: boolean
    autoComplete: boolean
  }
  codeReview: {
    enabled: boolean
    autoReview: boolean
    qualityThreshold: number
  }
  naturalLanguage: {
    enabled: boolean
    model: string
    contextWindow: number
  }
}
