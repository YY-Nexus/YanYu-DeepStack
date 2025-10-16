/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // 在Next.js 15中使用新的编译器配置
    // optimizeCss: true,
  },
  webpack: (config) => {
    // 忽略React Native相关模块的解析，避免web项目中引入不必要的原生代码
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native': false,
      'react-native-svg': false,
      '@': __dirname,
    };
    return config;
  },
  // 添加重定向规则处理/@vite/client请求
  redirects: async () => [
    {
      source: '/@vite/client',
      destination: '/',
      permanent: false,
    },
  ],
};

export default nextConfig;