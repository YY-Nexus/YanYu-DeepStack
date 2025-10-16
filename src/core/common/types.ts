// YYC³ 通用类型定义

/**
 * YYC³ 响应基础接口
 */
export interface YYC3Response<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  timestamp?: number;
  requestId?: string;
}

/**
 * YYC³ 基础配置接口
 */
export interface YYC3BaseConfig {
  brandId: string;
  version: string;
  debug?: boolean;
  [key: string]: any;
}

/**
 * YYC³ 错误接口
 */
export interface YYC3Error {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

/**
 * YYC³ 分页数据接口
 */
export interface YYC3PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}