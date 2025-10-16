#!/usr/bin/env node

/**
 * 类定义检测与修复工具
 * 整合Python脚本和ESLint规则的功能
 * 支持JavaScript/TypeScript/Python文件的类定义检查
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置项
const CONFIG = {
  // 项目根目录
  projectRoot: path.resolve(__dirname, '..'),
  // 要检查的文件扩展名
  extensions: ['.js', '.ts', '.tsx', '.py'],
  // 要忽略的目录
  ignoreDirs: ['node_modules', '.git', 'dist', 'build', '__tests__', 'coverage'],
  // JavaScript/TypeScript的配置
  jsConfig: {
    requiredBase: 'BaseComponent',
    eslintConfigPath: path.resolve(__dirname, '../yyc3_TypeScript/.eslintrc.js')
  },
  // Python的配置
  pyConfig: {
    requiredBase: 'BaseModel',
    checkerScriptPath: path.resolve(__dirname, '../yyc3_TypeScript/scripts/class_checker.py')
  }
};

/**
 * 日志工具
 */
const logger = {
  success: (message) => console.log('✅ ' + message),
  warning: (message) => console.log('⚠️ ' + message),
  error: (message) => console.log('❌ ' + message),
  info: (message) => console.log('ℹ️ ' + message)
};

/**
 * 检查文件是否应该被忽略
 */
function shouldIgnoreFile(filePath) {
  const relativePath = path.relative(CONFIG.projectRoot, filePath);
  return CONFIG.ignoreDirs.some(dir => relativePath.includes(dir + path.sep));
}

/**
 * 收集所有需要检查的文件
 */
function collectFiles(dir) {
  const files = [];
  
  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory() && !shouldIgnoreFile(fullPath)) {
        walk(fullPath);
      } else if (entry.isFile() && CONFIG.extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

/**
 * 使用ESLint检查JavaScript/TypeScript文件
 */
function checkJavaScriptFiles(files) {
  if (files.length === 0) return;
  
  logger.info(`开始检查${files.length}个JavaScript/TypeScript文件...`);
  
  try {
    // 创建临时ESLint配置
    const tempConfig = {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        project: path.resolve(CONFIG.projectRoot, 'tsconfig.json')
      },
      plugins: ['custom'],
      rules: {
        'custom/class-rules': ['error', { requiredBase: CONFIG.jsConfig.requiredBase }]
      },
      settings: {
        'import/resolver': {
          node: {
            extensions: ['.js', '.ts', '.tsx']
          }
        }
      },
      overrides: [
        {
          files: ['*.ts', '*.tsx'],
          parser: '@typescript-eslint/parser'
        }
      ]
    };
    
    // 写入临时配置文件
    const tempConfigPath = path.resolve(__dirname, '.temp_eslintrc.json');
    fs.writeFileSync(tempConfigPath, JSON.stringify(tempConfig, null, 2));
    
    // 执行ESLint检查并修复
    execSync(`npx eslint --config ${tempConfigPath} --fix ${files.join(' ')}`, {
      stdio: 'inherit',
      cwd: CONFIG.projectRoot
    });
    
    // 删除临时配置文件
    fs.unlinkSync(tempConfigPath);
    
    logger.success('JavaScript/TypeScript文件检查和修复完成');
  } catch (error) {
    logger.error('JavaScript/TypeScript文件检查过程中出现错误');
  }
}

/**
 * 使用Python脚本检查Python文件
 */
function checkPythonFiles(files) {
  if (files.length === 0) return;
  
  logger.info(`开始检查${files.length}个Python文件...`);
  
  try {
    // 检查Python环境
    execSync('python --version', { stdio: 'ignore' });
    
    // 为每个Python文件运行检查脚本
    files.forEach(file => {
      execSync(`python ${CONFIG.pyConfig.checkerScriptPath} --file ${file}`, {
        stdio: 'inherit',
        cwd: CONFIG.projectRoot
      });
    });
    
    logger.success('Python文件检查和修复完成');
  } catch (error) {
    logger.error('Python文件检查过程中出现错误');
  }
}

/**
 * 主函数
 */
function main() {
  logger.info('开始类定义检测与修复任务...');
  
  try {
    // 收集文件
    const allFiles = collectFiles(CONFIG.projectRoot);
    logger.info(`总共发现${allFiles.length}个需要检查的文件`);
    
    // 按文件类型分类
    const jsFiles = allFiles.filter(file => ['.js', '.ts', '.tsx'].some(ext => file.endsWith(ext)));
    const pyFiles = allFiles.filter(file => file.endsWith('.py'));
    
    // 分别检查
    checkJavaScriptFiles(jsFiles);
    checkPythonFiles(pyFiles);
    
    // 运行prettier格式化
    logger.info('运行prettier进行代码格式化...');
    execSync(`npx prettier --write "${CONFIG.projectRoot}/**/*.{js,ts,tsx,py}"`, {
      stdio: 'inherit'
    });
    
    logger.success('类定义检测与修复任务全部完成！');
  } catch (error) {
    logger.error('任务执行失败：', error.message);
    process.exit(1);
  }
}

// 执行主函数
if (require.main === module) {
  main();
}