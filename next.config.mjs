/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 根据环境变量决定是否静态导出
  ...(process.env.NEXT_EXPORT === 'true' ? {
    output: 'export',
    trailingSlash: true,
  } : {}),
  // 跨域支持 (仅在非静态导出时生效)
  ...(process.env.NEXT_EXPORT !== 'true' ? {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
          ],
        },
      ]
    },
  } : {}),
}

export default nextConfig