FROM node:20-alpine3.19 AS base

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 安装必要工具并设置时区
RUN apk update && \
  apk add --no-cache curl tzdata && \
  cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
  echo "Asia/Shanghai" > /etc/timezone && \
  apk upgrade --no-cache

FROM base AS deps

# 安装pnpm并清理缓存
RUN npm install -g pnpm@latest && pnpm cache clean

# 复制依赖文件
COPY package*.json pnpm-lock.yaml* ./

# 安装生产依赖
RUN pnpm install --prod --frozen-lockfile 

FROM base AS builder

# 安装pnpm用于构建
RUN npm install -g pnpm@latest

# 复制生产依赖
COPY --from=deps /app/node_modules ./node_modules

# 复制项目文件
COPY package*.json pnpm-lock.yaml* ./
COPY . .

# 构建应用
RUN pnpm install && pnpm run build && pnpm prune --prod

FROM base AS runner

# 创建专用用户和组
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --gid 1001 nextjs 

# 复制构建产物
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static 

# 健康检查脚本
RUN echo '#!/bin/bash\n\
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/api/health | grep -q "200"; then\n\
  exit 0\n\
  elif curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT | grep -q "200"; then\n\
  exit 0\n\
  else\n\
  exit 1\n\
  fi' > /usr/local/bin/healthcheck.sh \
  && chmod +x /usr/local/bin/healthcheck.sh \
  && chown nextjs:nodejs /usr/local/bin/healthcheck.sh 

# 设置健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD /usr/local/bin/healthcheck.sh 

# 使用专用用户运行应用
USER nextjs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 启动应用
CMD ["sh", "-c", "echo '启动应用...' && node server.js"]