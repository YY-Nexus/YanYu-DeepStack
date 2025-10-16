// CloudProvider 云服务提供器接口
export interface CloudProvider {
  providerName: string;
  initialize(config: Record<string, any>): Promise<void>;
  uploadFile(file: File, options?: Record<string, any>): Promise<string>;
  downloadFile(filePath: string, options?: Record<string, any>): Promise<Blob>;
  listFiles(directory?: string, options?: Record<string, any>): Promise<string[]>;
  deleteFile(filePath: string, options?: Record<string, any>): Promise<boolean>;
  getFileInfo(filePath: string): Promise<Record<string, any>>;
  isAuthenticated(): Promise<boolean>;
  authenticate(): Promise<boolean>;
  logout(): Promise<void>;
}

export interface CloudProviderConfig {
  region?: string;
  apiKey?: string;
  secretKey?: string;
  token?: string;
  bucketName?: string;
  endpoint?: string;
  timeout?: number;
  retryCount?: number;
}

export interface UploadOptions {
  folder?: string;
  public?: boolean;
  metadata?: Record<string, string>;
  contentType?: string;
  progressCallback?: (progress: number) => void;
}