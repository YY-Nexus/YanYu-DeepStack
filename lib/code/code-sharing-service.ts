/**
 * 代码分享服务
 * 提供代码分享、协作和版本控制功能
 */

import { nanoid } from "nanoid"

// 分享代码接口
export interface SharedCode {
  id: string
  code: string
  language: string
  title: string
  description?: string
  author?: string
  createdAt: Date
  expiresAt?: Date
  views: number
  forks: number
  isPublic: boolean
  password?: string
  version: number
  versionHistory: SharedCodeVersion[]
  collaborators: string[]
}

// 代码版本接口
export interface SharedCodeVersion {
  version: number
  code: string
  createdAt: Date
  author?: string
  message?: string
}

// 创建分享代码请求
export interface CreateSharedCodeRequest {
  code: string
  language: string
  title: string
  description?: string
  author?: string
  expiresIn?: number // 过期时间（小时）
  isPublic: boolean
  password?: string
}

// 更新分享代码请求
export interface UpdateSharedCodeRequest {
  id: string
  code?: string
  title?: string
  description?: string
  isPublic?: boolean
  password?: string | null
  message?: string
}

// 添加协作者请求
export interface AddCollaboratorRequest {
  codeId: string
  collaboratorId: string
}

/**
 * 代码分享服务类
 */
export class CodeSharingService {
  private static instance: CodeSharingService
  private sharedCodes: Map<string, SharedCode> = new Map()

  /**
   * 获取单例实例
   */
  public static getInstance(): CodeSharingService {
    if (!CodeSharingService.instance) {
      CodeSharingService.instance = new CodeSharingService()
    }
    return CodeSharingService.instance
  }

  /**
   * 创建分享代码
   * @param request 创建请求
   * @returns 创建的分享代码
   */
  public async createSharedCode(request: CreateSharedCodeRequest): Promise<SharedCode> {
    const id = nanoid(10)
    const now = new Date()

    const sharedCode: SharedCode = {
      id,
      code: request.code,
      language: request.language,
      title: request.title,
      description: request.description,
      author: request.author,
      createdAt: now,
      expiresAt: request.expiresIn ? new Date(now.getTime() + request.expiresIn * 60 * 60 * 1000) : undefined,
      views: 0,
      forks: 0,
      isPublic: request.isPublic,
      password: request.password,
      version: 1,
      versionHistory: [
        {
          version: 1,
          code: request.code,
          createdAt: now,
          author: request.author,
          message: "初始版本",
        },
      ],
      collaborators: [],
    }

    this.sharedCodes.set(id, sharedCode)

    // 模拟异步操作
    await new Promise((resolve) => setTimeout(resolve, 100))

    return sharedCode
  }

  /**
   * 获取分享代码
   * @param id 分享代码ID
   * @param password 密码（如果需要）
   * @returns 分享代码
   */
  public async getSharedCode(id: string, password?: string): Promise<SharedCode> {
    const sharedCode = this.sharedCodes.get(id)

    if (!sharedCode) {
      throw new Error("分享代码不存在")
    }

    // 检查是否过期
    if (sharedCode.expiresAt && sharedCode.expiresAt < new Date()) {
      throw new Error("分享代码已过期")
    }

    // 检查密码
    if (sharedCode.password && sharedCode.password !== password) {
      throw new Error("密码错误")
    }

    // 增加查看次数
    sharedCode.views += 1

    // 模拟异步操作
    await new Promise((resolve) => setTimeout(resolve, 100))

    return sharedCode
  }

  /**
   * 更新分享代码
   * @param request 更新请求
   * @returns 更新后的分享代码
   */
  public async updateSharedCode(request: UpdateSharedCodeRequest): Promise<SharedCode> {
    const sharedCode = this.sharedCodes.get(request.id)

    if (!sharedCode) {
      throw new Error("分享代码不存在")
    }

    // 更新代码版本
    if (request.code !== undefined && request.code !== sharedCode.code) {
      const newVersion = sharedCode.version + 1

      sharedCode.code = request.code
      sharedCode.version = newVersion
      sharedCode.versionHistory.push({
        version: newVersion,
        code: request.code,
        createdAt: new Date(),
        author: sharedCode.author,
        message: request.message || `版本 ${newVersion}`,
      })
    }

    // 更新其他字段
    if (request.title !== undefined) {
      sharedCode.title = request.title
    }

    if (request.description !== undefined) {
      sharedCode.description = request.description
    }

    if (request.isPublic !== undefined) {
      sharedCode.isPublic = request.isPublic
    }

    if (request.password !== undefined) {
      sharedCode.password = request.password === null ? undefined : request.password
    }

    // 模拟异步操作
    await new Promise((resolve) => setTimeout(resolve, 100))

    return sharedCode
  }

  /**
   * 删除分享代码
   * @param id 分享代码ID
   * @returns 是否成功删除
   */
  public async deleteSharedCode(id: string): Promise<boolean> {
    const exists = this.sharedCodes.has(id)

    if (!exists) {
      return false
    }

    this.sharedCodes.delete(id)

    // 模拟异步操作
    await new Promise((resolve) => setTimeout(resolve, 100))

    return true
  }

  /**
   * 获取特定版本的分享代码
   * @param id 分享代码ID
   * @param version 版本号
   * @returns 特定版本的分享代码
   */
  public async getSharedCodeVersion(id: string, version: number): Promise<SharedCodeVersion | null> {
    const sharedCode = this.sharedCodes.get(id)

    if (!sharedCode) {
      throw new Error("分享代码不存在")
    }

    const versionInfo = sharedCode.versionHistory.find((v) => v.version === version)

    if (!versionInfo) {
      return null
    }

    // 模拟异步操作
    await new Promise((resolve) => setTimeout(resolve, 100))

    return versionInfo
  }

  /**
   * 添加协作者
   * @param request 添加协作者请求
   * @returns 更新后的分享代码
   */
  public async addCollaborator(request: AddCollaboratorRequest): Promise<SharedCode> {
    const sharedCode = this.sharedCodes.get(request.codeId)

    if (!sharedCode) {
      throw new Error("分享代码不存在")
    }

    if (!sharedCode.collaborators.includes(request.collaboratorId)) {
      sharedCode.collaborators.push(request.collaboratorId)
    }

    // 模拟异步操作
    await new Promise((resolve) => setTimeout(resolve, 100))

    return sharedCode
  }

  /**
   * 移除协作者
   * @param codeId 分享代码ID
   * @param collaboratorId 协作者ID
   * @returns 更新后的分享代码
   */
  public async removeCollaborator(codeId: string, collaboratorId: string): Promise<SharedCode> {
    const sharedCode = this.sharedCodes.get(codeId)

    if (!sharedCode) {
      throw new Error("分享代码不存在")
    }

    sharedCode.collaborators = sharedCode.collaborators.filter((id) => id !== collaboratorId)

    // 模拟异步操作
    await new Promise((resolve) => setTimeout(resolve, 100))

    return sharedCode
  }

  /**
   * 获取公开的分享代码列表
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 公开的分享代码列表
   */
  public async getPublicSharedCodes(limit = 10, offset = 0): Promise<SharedCode[]> {
    const now = new Date()

    const publicCodes = Array.from(this.sharedCodes.values())
      .filter((code) => code.isPublic && (!code.expiresAt || code.expiresAt > now))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit)

    // 模拟异步操作
    await new Promise((resolve) => setTimeout(resolve, 100))

    return publicCodes
  }

  /**
   * 获取用户的分享代码列表
   * @param authorId 作者ID
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 用户的分享代码列表
   */
  public async getUserSharedCodes(authorId: string, limit = 10, offset = 0): Promise<SharedCode[]> {
    const userCodes = Array.from(this.sharedCodes.values())
      .filter((code) => code.author === authorId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit)

    // 模拟异步操作
    await new Promise((resolve) => setTimeout(resolve, 100))

    return userCodes
  }

  /**
   * 复制分享代码（创建分支）
   * @param id 原始分享代码ID
   * @param authorId 新作者ID
   * @returns 复制的分享代码
   */
  public async forkSharedCode(id: string, authorId: string): Promise<SharedCode> {
    const originalCode = this.sharedCodes.get(id)

    if (!originalCode) {
      throw new Error("分享代码不存在")
    }

    // 增加原始代码的分支数
    originalCode.forks += 1

    // 创建新的分享代码
    const forkedCode = await this.createSharedCode({
      code: originalCode.code,
      language: originalCode.language,
      title: `${originalCode.title} (分支)`,
      description: `从 ${originalCode.id} 分支: ${originalCode.description || ""}`,
      author: authorId,
      isPublic: originalCode.isPublic,
    })

    return forkedCode
  }
}

// 导出单例实例
export const codeSharingService = CodeSharingService.getInstance()
