"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Project, ProjectFile, ProjectVersion, TeamMember } from "@/types/project"

// 创建项目数据类型
interface CreateProjectData extends Omit<Project, "id" | "metadata" | "versions"> {
  metadata?: Partial<Pick<Project["metadata"], "tags" | "language" | "framework">>;
}

interface ProjectStore {
  // 当前状态
  projects: Project[]
  currentProject: Project | null
  currentFile: ProjectFile | null

  // 项目操作
  createProject: (project: CreateProjectData) => Promise<Project>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  duplicateProject: (id: string, name: string) => Promise<Project>

  // 项目选择
  setCurrentProject: (project: Project | null) => void
  loadProject: (id: string) => Promise<Project | null>

  // 文件操作
  createFile: (projectId: string, file: Omit<ProjectFile, "id" | "lastModified" | "modifiedBy">) => Promise<ProjectFile>
  updateFile: (projectId: string, fileId: string, content: string) => Promise<void>
  deleteFile: (projectId: string, fileId: string) => Promise<void>
  renameFile: (projectId: string, fileId: string, newName: string) => Promise<void>
  setCurrentFile: (file: ProjectFile | null) => void

  // 版本控制
  createVersion: (
    projectId: string,
    version: Omit<ProjectVersion, "id" | "createdAt" | "snapshot">,
  ) => Promise<ProjectVersion>
  restoreVersion: (projectId: string, versionId: string) => Promise<void>
  compareVersions: (projectId: string, version1: string, version2: string) => Promise<any>

  // 团队协作
  addTeamMember: (projectId: string, member: Omit<TeamMember, "joinedAt" | "lastActive">) => Promise<void>
  removeTeamMember: (projectId: string, userId: string) => Promise<void>
  updateMemberRole: (projectId: string, userId: string, role: TeamMember["role"]) => Promise<void>

  // 分享和权限
  shareProject: (projectId: string, shareConfig: any) => Promise<string>
  updatePermissions: (projectId: string, permissions: any) => Promise<void>

  // 云端同步
  syncToCloud: (projectId: string) => Promise<void>
  syncFromCloud: (projectId: string) => Promise<void>

  // 搜索和过滤
  searchProjects: (query: string) => Project[]
  filterProjects: (filters: any) => Project[]
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      currentFile: null,

      // 项目操作
      createProject: async (projectData) => {
        const newProject: Project = {
          ...projectData,
          id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: "current-user", // 从认证系统获取
            tags: projectData.metadata?.tags || [],
            language: projectData.metadata?.language || "javascript",
            framework: projectData.metadata?.framework || "react",
            version: "1.0.0",
          },
          files: [
            {
              id: "root",
              name: "root",
              path: "/",
              type: "folder",
              size: 0,
              lastModified: new Date().toISOString(),
              modifiedBy: "current-user",
              children: [],
            },
          ],
          versions: [],
          currentVersion: "1.0.0",
          team: [
            {
              userId: "current-user",
              name: "当前用户",
              email: "user@yanyu.cloud",
              role: "owner",
              joinedAt: new Date().toISOString(),
              lastActive: new Date().toISOString(),
              permissions: ["read", "write", "admin", "deploy", "share"],
            },
          ],
          permissions: {
            read: ["current-user"],
            write: ["current-user"],
            admin: ["current-user"],
            deploy: ["current-user"],
            share: ["current-user"],
          },
          deployment: {
            platforms: [],
            environments: [
              {
                id: "dev",
                name: "开发环境",
                type: "development",
                branch: "main",
                autoDeployEnabled: false,
                variables: {},
              },
            ],
            cicd: {
              enabled: false,
              provider: "github-actions",
              config: {},
              webhooks: [],
            },
            docker: {
              enabled: false,
              dockerfile: "",
              image: "",
              registry: "",
              buildArgs: {},
            },
          },
          aiConfig: {
            codeCompletion: {
              enabled: true,
              model: "gpt-4",
              suggestions: true,
              autoComplete: true,
            },
            codeReview: {
              enabled: true,
              autoReview: false,
              qualityThreshold: 0.8,
            },
            naturalLanguage: {
              enabled: true,
              model: "gpt-4",
              contextWindow: 4000,
            },
          },
        }

        set((state) => ({
          projects: [...state.projects, newProject],
          currentProject: newProject,
        }))

        return newProject
      },

      updateProject: async (id, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? {
                  ...project,
                  ...updates,
                  metadata: {
                    ...project.metadata,
                    ...updates.metadata,
                    updatedAt: new Date().toISOString(),
                  },
                }
              : project,
          ),
          currentProject:
            state.currentProject?.id === id
              ? {
                  ...state.currentProject,
                  ...updates,
                  metadata: {
                    ...state.currentProject.metadata,
                    ...updates.metadata,
                    updatedAt: new Date().toISOString(),
                  },
                }
              : state.currentProject,
        }))
      },

      deleteProject: async (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject,
        }))
      },

      duplicateProject: async (id, name) => {
        const originalProject = get().projects.find((p) => p.id === id)
        if (!originalProject) throw new Error("项目不存在")

        const duplicatedProject: Project = {
          ...originalProject,
          id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name,
          metadata: {
            ...originalProject.metadata,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          versions: [], // 重置版本历史
        }

        set((state) => ({
          projects: [...state.projects, duplicatedProject],
        }))

        return duplicatedProject
      },

      setCurrentProject: (project) => {
        set({ currentProject: project })
      },

      loadProject: async (id) => {
        const project = get().projects.find((p) => p.id === id)
        if (project) {
          set({ currentProject: project })
          return project
        }
        return null
      },

      // 文件操作
      createFile: async (projectId, fileData) => {
        const newFile: ProjectFile = {
          ...fileData,
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          lastModified: new Date().toISOString(),
          modifiedBy: "current-user",
        }

        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  files: [...project.files, newFile],
                  metadata: {
                    ...project.metadata,
                    updatedAt: new Date().toISOString(),
                  },
                }
              : project,
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? {
                  ...state.currentProject,
                  files: [...state.currentProject.files, newFile],
                  metadata: {
                    ...state.currentProject.metadata,
                    updatedAt: new Date().toISOString(),
                  },
                }
              : state.currentProject,
        }))

        return newFile
      },

      updateFile: async (projectId, fileId, content) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  files: project.files.map((file) =>
                    file.id === fileId
                      ? {
                          ...file,
                          content,
                          lastModified: new Date().toISOString(),
                          modifiedBy: "current-user",
                          size: content.length,
                        }
                      : file,
                  ),
                  metadata: {
                    ...project.metadata,
                    updatedAt: new Date().toISOString(),
                  },
                }
              : project,
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? {
                  ...state.currentProject,
                  files: state.currentProject.files.map((file) =>
                    file.id === fileId
                      ? {
                          ...file,
                          content,
                          lastModified: new Date().toISOString(),
                          modifiedBy: "current-user",
                          size: content.length,
                        }
                      : file,
                  ),
                  metadata: {
                    ...state.currentProject.metadata,
                    updatedAt: new Date().toISOString(),
                  },
                }
              : state.currentProject,
        }))
      },

      deleteFile: async (projectId, fileId) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  files: project.files.filter((file) => file.id !== fileId),
                  metadata: {
                    ...project.metadata,
                    updatedAt: new Date().toISOString(),
                  },
                }
              : project,
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? {
                  ...state.currentProject,
                  files: state.currentProject.files.filter((file) => file.id !== fileId),
                  metadata: {
                    ...state.currentProject.metadata,
                    updatedAt: new Date().toISOString(),
                  },
                }
              : state.currentProject,
          currentFile: state.currentFile?.id === fileId ? null : state.currentFile,
        }))
      },

      renameFile: async (projectId, fileId, newName) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  files: project.files.map((file) =>
                    file.id === fileId
                      ? {
                          ...file,
                          name: newName,
                          path: file.path.replace(/[^/]+$/, newName),
                          lastModified: new Date().toISOString(),
                          modifiedBy: "current-user",
                        }
                      : file,
                  ),
                }
              : project,
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? {
                  ...state.currentProject,
                  files: state.currentProject.files.map((file) =>
                    file.id === fileId
                      ? {
                          ...file,
                          name: newName,
                          path: file.path.replace(/[^/]+$/, newName),
                          lastModified: new Date().toISOString(),
                          modifiedBy: "current-user",
                        }
                      : file,
                  ),
                }
              : state.currentProject,
        }))
      },

      setCurrentFile: (file) => {
        set({ currentFile: file })
      },

      // 版本控制
      createVersion: async (projectId, versionData) => {
        const project = get().projects.find((p) => p.id === projectId)
        if (!project) throw new Error("项目不存在")

        const newVersion: ProjectVersion = {
          ...versionData,
          id: `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          snapshot: {
            files: project.files.reduce(
              (acc, file) => {
                if (file.content) {
                  acc[file.path] = file.content
                }
                return acc
              },
              {} as { [path: string]: string },
            ),
            metadata: project.metadata,
          },
        }

        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  versions: [...project.versions, newVersion],
                  currentVersion: newVersion.version,
                }
              : project,
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? {
                  ...state.currentProject,
                  versions: [...state.currentProject.versions, newVersion],
                  currentVersion: newVersion.version,
                }
              : state.currentProject,
        }))

        return newVersion
      },

      restoreVersion: async (projectId, versionId) => {
        const project = get().projects.find((p) => p.id === projectId)
        const version = project?.versions.find((v) => v.id === versionId)
        if (!project || !version) throw new Error("项目或版本不存在")

        // 恢复文件快照
        const restoredFiles = Object.entries(version.snapshot.files).map(([path, content]) => {
          const existingFile = project.files.find((f) => f.path === path)
          return {
            id: existingFile?.id || `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: path.split("/").pop() || "",
            path,
            type: "file" as const,
            content,
            size: content.length,
            lastModified: new Date().toISOString(),
            modifiedBy: "current-user",
          }
        })

        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  files: [project.files[0], ...restoredFiles], // 保留根文件夹
                  currentVersion: version.version,
                  metadata: {
                    ...project.metadata,
                    updatedAt: new Date().toISOString(),
                  },
                }
              : project,
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? {
                  ...state.currentProject,
                  files: [state.currentProject.files[0], ...restoredFiles],
                  currentVersion: version.version,
                  metadata: {
                    ...state.currentProject.metadata,
                    updatedAt: new Date().toISOString(),
                  },
                }
              : state.currentProject,
        }))
      },

      compareVersions: async (projectId, version1, version2) => {
        // 实现版本比较逻辑
        return { differences: [], summary: "版本比较功能开发中" }
      },

      // 团队协作
      addTeamMember: async (projectId, memberData) => {
        const newMember: TeamMember = {
          ...memberData,
          joinedAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        }

        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  team: [...project.team, newMember],
                }
              : project,
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? {
                  ...state.currentProject,
                  team: [...state.currentProject.team, newMember],
                }
              : state.currentProject,
        }))
      },

      removeTeamMember: async (projectId, userId) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  team: project.team.filter((member) => member.userId !== userId),
                }
              : project,
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? {
                  ...state.currentProject,
                  team: state.currentProject.team.filter((member) => member.userId !== userId),
                }
              : state.currentProject,
        }))
      },

      updateMemberRole: async (projectId, userId, role) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  team: project.team.map((member) => (member.userId === userId ? { ...member, role } : member)),
                }
              : project,
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? {
                  ...state.currentProject,
                  team: state.currentProject.team.map((member) =>
                    member.userId === userId ? { ...member, role } : member,
                  ),
                }
              : state.currentProject,
        }))
      },

      // 分享和权限
      shareProject: async (projectId, shareConfig) => {
        // 生成分享链接
        const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const shareUrl = `${window.location.origin}/share/${shareId}`

        // 这里可以实现分享配置的保存逻辑
        console.log("分享配置:", shareConfig)

        return shareUrl
      },

      updatePermissions: async (projectId, permissions) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  permissions: { ...project.permissions, ...permissions },
                }
              : project,
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? {
                  ...state.currentProject,
                  permissions: { ...state.currentProject.permissions, ...permissions },
                }
              : state.currentProject,
        }))
      },

      // 云端同步
      syncToCloud: async (projectId) => {
        // 实现云端同步逻辑
        console.log("同步到云端:", projectId)
      },

      syncFromCloud: async (projectId) => {
        // 实现从云端同步逻辑
        console.log("从云端同步:", projectId)
      },

      // 搜索和过滤
      searchProjects: (query) => {
        const projects = get().projects
        return projects.filter(
          (project) =>
            project.name.toLowerCase().includes(query.toLowerCase()) ||
            project.description.toLowerCase().includes(query.toLowerCase()) ||
            project.metadata.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
        )
      },

      filterProjects: (filters) => {
        const projects = get().projects
        return projects.filter((project) => {
          if (filters.type && project.type !== filters.type) return false
          if (filters.status && project.status !== filters.status) return false
          if (filters.language && project.metadata.language !== filters.language) return false
          return true
        })
      },
    }),
    {
      name: "yanyu-project-store",
      partialize: (state) => ({
        projects: state.projects,
        currentProject: state.currentProject,
      }),
    },
  ),
)
