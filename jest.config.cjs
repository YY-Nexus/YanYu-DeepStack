/**
 * Jest 配置文件
 */

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // 提供 Next.js 应用的路径
  dir: './',
})

// 自定义 Jest 配置
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    // 映射EnhancedOllamaService到模拟文件
    '^lib/ai/enhanced-ollama-service$': '<rootDir>/__tests__/mocks/enhanced-ollama-service.ts',
    '^lib/ai/enhanced-ollama-service\.ts$': '<rootDir>/__tests__/mocks/enhanced-ollama-service.ts',
  },
  // 模拟外部依赖模块
  moduleDirectories: ['node_modules', 'src', 'lib'],
  // 模拟定时器
  timers: 'fake',
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx)',
    '**/?(*.)+(spec|test).(ts|tsx)',
  ],
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/mobile/',
    '<rootDir>/.next/types/',
    '<rootDir>/e2e/',
  ],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', { presets: ['next/babel'] }],
    // 为three.js及其相关模块添加转换配置
    '^node_modules/three/examples/jsm/.*$': ['babel-jest', { presets: ['next/babel'] }],
    '^node_modules/three/build/.*$': ['babel-jest', { presets: ['next/babel'] }],
  },
}

// 导出配置
module.exports = createJestConfig(customJestConfig)