import { RequestContext, Middleware, NextFunction } from '../microservices/api-gateway';
import { SecurityUtils } from '../utils/security';
import { ConfigService } from '../config/config-service';

interface JwtPayload {
  userId: string;
  exp: number;
  iat: number;
}

// 直接导出execute函数，而非Middleware对象
export const jwtRefreshMiddleware = async (context: RequestContext, next: NextFunction) => {
  try {
    const authHeader = context.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    
    // 验证并解析JWT令牌
    const decoded = SecurityUtils.verifyJWT(token, ConfigService.getInstance().get('JWT_SECRET') || 'default-secret') as JwtPayload;

    // 如果token剩余有效期不足15分钟则刷新
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    if (expiresIn < 900) {
      const newToken = SecurityUtils.generateJWT(
        { userId: decoded.userId },
        ConfigService.getInstance().get('JWT_SECRET') || 'default-secret',
        '2h'
      );

      // 在响应头中返回新令牌
      if (context.response) {
        context.response.headers = {
          ...context.response.headers,
          'X-New-Token': newToken
        };
      } else {
        // 如果响应尚未创建，先保存新令牌
        context.headers['X-New-Token'] = newToken;
      }
      
      console.log(`Refreshed JWT token for user: ${decoded.userId}`);
    }

    next();
  } catch (error) {
    // 令牌验证错误不中断请求，让后续中间件处理身份验证
    console.error('JWT refresh middleware error:', error);
    next();
  }
}