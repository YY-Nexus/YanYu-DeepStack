/**
 * TOTP（基于时间的一次性密码）服务
 * 提供双重验证机制的核心功能
 */

import crypto from 'crypto';

export interface TOTPConfig {
  timeStep: number; // 时间步长（秒），默认30秒
  digits: number; // 验证码位数，默认6位
  algorithm: string; // 哈希算法，默认SHA1
}

export interface TOTPKey {
  secret: string; // Base32编码的密钥
  label: string; // 密钥标签
  issuer: string; // 发行者
  counter: number; // 初始计数器值
  createdAt: number; // 创建时间
  verified: boolean; // 是否已验证
}

export class TOTPService {
  private static instance: TOTPService;
  private config: TOTPConfig;
  private userKeys: Map<string, TOTPKey> = new Map();

  private constructor() {
    // 默认配置
    this.config = {
      timeStep: 30,
      digits: 6,
      algorithm: 'sha1'
    };
  }

  public static getInstance(): TOTPService {
    if (!TOTPService.instance) {
      TOTPService.instance = new TOTPService();
    }
    return TOTPService.instance;
  }

  /**
   * 配置TOTP服务
   * @param config 配置选项
   */
  public configure(config: Partial<TOTPConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 生成新的TOTP密钥
   * @param userId 用户ID
   * @param label 密钥标签
   * @param issuer 发行者
   * @returns TOTP密钥信息
   */
  public generateKey(userId: string, label: string, issuer: string): TOTPKey {
    // 生成随机密钥（20字节 = 160位，适合SHA1）
    const randomBytes = crypto.randomBytes(20);
    const secret = this.base32Encode(randomBytes);

    const totpKey: TOTPKey = {
      secret,
      label,
      issuer,
      counter: Math.floor(Date.now() / 1000 / this.config.timeStep),
      createdAt: Date.now(),
      verified: false
    };

    this.userKeys.set(userId, totpKey);
    return totpKey;
  }

  /**
   * 生成TOTP验证码
   * @param secret Base32编码的密钥
   * @param timestamp 时间戳（可选）
   * @returns 6位数字验证码
   */
  public generateOTP(secret: string, timestamp?: number): string {
    // 解码Base32密钥
    const key = this.base32Decode(secret);
    
    // 计算时间步长
    const timeCounter = Math.floor((timestamp || Date.now() / 1000) / this.config.timeStep);
    
    // 将计数器转换为8字节的缓冲区（大端序）
    const counterBuffer = Buffer.alloc(8);
    for (let i = 7; i >= 0; i--) {
      counterBuffer[i] = timeCounter & 0xff;
      timeCounter >>= 8;
    }
    
    // 使用HMAC算法计算哈希值
    const hmac = crypto.createHmac(this.config.algorithm, key);
    hmac.update(counterBuffer);
    const hmacResult = hmac.digest();
    
    // 动态截取4字节
    const offset = hmacResult[hmacResult.length - 1] & 0xf;
    const code = (
      ((hmacResult[offset] & 0x7f) << 24) |
      ((hmacResult[offset + 1] & 0xff) << 16) |
      ((hmacResult[offset + 2] & 0xff) << 8) |
      (hmacResult[offset + 3] & 0xff)
    ) % Math.pow(10, this.config.digits);
    
    // 确保是固定位数，不足前面补0
    return code.toString().padStart(this.config.digits, '0');
  }

  /**
   * 验证TOTP验证码
   * @param userId 用户ID
   * @param otp 验证码
   * @param window 时间窗口（允许的时间偏差，默认1，表示前后各1个时间步）
   * @returns 验证结果
   */
  public verifyOTP(userId: string, otp: string, window: number = 1): boolean {
    const totpKey = this.userKeys.get(userId);
    if (!totpKey || !otp || otp.length !== this.config.digits) {
      return false;
    }

    const currentTime = Date.now() / 1000;
    
    // 检查时间窗口内的所有可能值
    for (let i = -window; i <= window; i++) {
      const checkTime = currentTime + (i * this.config.timeStep);
      const expectedOTP = this.generateOTP(totpKey.secret, checkTime);
      
      if (otp === expectedOTP) {
        // 标记密钥为已验证
        if (!totpKey.verified) {
          totpKey.verified = true;
          this.userKeys.set(userId, totpKey);
        }
        return true;
      }
    }

    return false;
  }

  /**
   * 获取用户的TOTP密钥
   * @param userId 用户ID
   * @returns TOTP密钥信息或undefined
   */
  public getUserKey(userId: string): TOTPKey | undefined {
    return this.userKeys.get(userId);
  }

  /**
   * 删除用户的TOTP密钥
   * @param userId 用户ID
   * @returns 是否删除成功
   */
  public removeUserKey(userId: string): boolean {
    return this.userKeys.delete(userId);
  }

  /**
   * 生成Google Authenticator兼容的URI
   * @param totpKey TOTP密钥信息
   * @returns URI字符串
   */
  public generateURI(totpKey: TOTPKey): string {
    const label = encodeURIComponent(totpKey.label);
    const issuer = encodeURIComponent(totpKey.issuer);
    const secret = totpKey.secret;
    
    return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=${this.config.algorithm.toUpperCase()}&digits=${this.config.digits}&period=${this.config.timeStep}`;
  }

  /**
   * 生成QR码数据URL（用于扫描设置）
   * @param uri OTP认证URI
   * @returns Promise<string> 包含QR码的Data URL
   */
  public async generateQRCodeDataURL(uri: string): Promise<string> {
    try {
      // 这里为了简化实现，返回一个占位符URL
      // 实际项目中应该使用qr-image或其他库生成真正的QR码
      // 注意：在生产环境中，应该使用专门的QR码生成库
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uri)}`;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Base32编码实现
   * @param buffer 二进制数据
   * @returns Base32编码字符串
   */
  private base32Encode(buffer: Buffer): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    let bits = 0;
    let value = 0;

    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;

      while (bits >= 5) {
        result += chars[(value >>> (bits - 5)) & 0x1f];
        bits -= 5;
      }
    }

    if (bits > 0) {
      result += chars[(value << (5 - bits)) & 0x1f];
    }

    // 填充到8字节的倍数
    while (result.length % 8 !== 0) {
      result += '=';
    }

    return result;
  }

  /**
   * Base32解码实现
   * @param str Base32编码字符串
   * @returns 解码后的二进制数据
   */
  private base32Decode(str: string): Buffer {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const values: number[] = Array(256).fill(-1);
    
    // 初始化字符映射
    for (let i = 0; i < chars.length; i++) {
      values[chars.charCodeAt(i)] = i;
      values[chars.toLowerCase().charCodeAt(i)] = i;
    }

    const cleanedStr = str.replace(/[^A-Za-z2-7=]/g, '').replace(/=+$/, '');
    const result: number[] = [];
    let bits = 0;
    let value = 0;

    for (let i = 0; i < cleanedStr.length; i++) {
      const charCode = cleanedStr.charCodeAt(i);
      const charValue = values[charCode];
      
      if (charValue === -1) {
        continue;
      }

      value = (value << 5) | charValue;
      bits += 5;

      while (bits >= 8) {
        result.push((value >>> (bits - 8)) & 0xff);
        bits -= 8;
      }
    }

    return Buffer.from(result);
  }
}

// 导出TOTP服务实例
export const totpService = TOTPService.getInstance();