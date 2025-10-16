import crypto from 'crypto';

/**
 * 加密工具类
 * 提供AES-256-GCM加密、解密、哈希等安全功能
 */
export class EncryptionUtils {
  private static ALGORITHM = 'aes-256-gcm';
  private static SALT_LENGTH = 16;
  private static IV_LENGTH = 12;
  private static TAG_LENGTH = 16;

  /**
   * 使用AES-256-GCM加密数据
   * @param data 要加密的数据
   * @param secret 加密密钥
   * @returns 加密后的字符串
   */
  static encrypt(data: string, secret: string): string {
    try {
      // 生成随机盐值
      const salt = crypto.randomBytes(this.SALT_LENGTH);
      
      // 从密码和盐值生成密钥
      const key = this.generateKey(secret, salt);
      
      // 生成随机初始化向量
      const iv = crypto.randomBytes(this.IV_LENGTH);
      
      // 创建加密器并加密数据
      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // 获取认证标签
      const tag = cipher.getAuthTag();
      
      // 将盐值、初始化向量、认证标签和密文组合成一个字符串
      return Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')]).toString('base64');
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * 解密AES-256-GCM加密的数据
   * @param encryptedData 加密的数据
   * @param secret 解密密钥
   * @returns 解密后的原始数据
   */
  static decrypt(encryptedData: string, secret: string): string {
    try {
      // 解码base64数据
      const buffer = Buffer.from(encryptedData, 'base64');
      
      // 提取盐值、初始化向量、认证标签和密文
      const salt = buffer.subarray(0, this.SALT_LENGTH);
      const iv = buffer.subarray(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
      const tag = buffer.subarray(
        this.SALT_LENGTH + this.IV_LENGTH, 
        this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH
      );
      const encrypted = buffer.subarray(this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH);
      
      // 从密码和盐值生成密钥
      const key = this.generateKey(secret, salt);
      
      // 创建解密器并解密数据
      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * 生成安全的哈希值
   * @param data 要哈希的数据
   * @returns 哈希值
   */
  static hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * 使用PBKDF2算法从密码和盐值生成密钥
   * @param password 用户密码
   * @param salt 盐值
   * @returns 派生的密钥
   */
  static generateKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
  }

  /**
   * 生成随机密钥
   * @returns 随机生成的密钥
   */
  static generateRandomKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * 验证数据完整性
   * @param data 原始数据
   * @param hash 数据的哈希值
   * @returns 数据是否完整
   */
  static verifyIntegrity(data: string, hash: string): boolean {
    return this.hash(data) === hash;
  }

  /**
   * 安全比较两个字符串（防止时序攻击）
   * @param a 第一个字符串
   * @param b 第二个字符串
   * @returns 字符串是否相等
   */
  static secureCompare(a: string, b: string): boolean {
    try {
      return crypto.timingSafeEqual(
        Buffer.from(a),
        Buffer.from(b)
      );
    } catch {
      return false;
    }
  }
}