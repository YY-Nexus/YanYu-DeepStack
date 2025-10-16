/**
 * @file 组件库更新日志生成工具
 * @description 生成组件库版本报告和更新日志
 * @module scripts/generate-component-changelog
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * 组件变更记录
 */
interface ComponentChange {
  version: string;
  date: string;
  changes: string[];
  author?: string;
}

/**
 * 组件更新历史
 */
interface ComponentChangelog {
  name: string;
  currentVersion: string;
  history: ComponentChange[];
}

/**
 * 更新日志生成器
 */
class ChangelogGenerator {
  private componentsDir: string;
  private outputDir: string;
  private changelogDir: string;

  constructor(componentsDir: string, outputDir: string) {
    this.componentsDir = componentsDir;
    this.outputDir = outputDir;
    this.changelogDir = path.join(componentsDir, '.changelogs');
  }

  /**
   * 开始生成更新日志
   */
  public async generateChangelog(): Promise<void> {
    console.log(`开始生成组件库更新日志...`);
    console.log(`组件目录: ${this.componentsDir}`);
    console.log(`输出目录: ${this.outputDir}`);

    // 确保输出目录存在
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // 确保变更记录目录存在
    if (!fs.existsSync(this.changelogDir)) {
      fs.mkdirSync(this.changelogDir, { recursive: true });
    }

    // 获取所有组件文件
    const componentFiles = this.getComponentFiles();
    console.log(`找到 ${componentFiles.length} 个组件文件`);

    // 生成每个组件的更新日志
    const changelogs: ComponentChangelog[] = [];
    for (const file of componentFiles) {
      try {
        const changelog = this.parseComponentChangelog(file);
        if (changelog) {
          changelogs.push(changelog);
        }
      } catch (error) {
        console.error(`处理文件 ${file} 时出错:`, error);
      }
    }

    // 生成总体更新日志
    this.generateMasterChangelog(changelogs);

    // 生成版本报告
    this.generateVersionReport(changelogs);

    console.log(`🎉 更新日志生成完成！`);
  }

  /**
   * 获取所有组件文件
   */
  private getComponentFiles(): string[] {
    const files: string[] = [];
    
    function traverse(dir: string): void {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && entry.name !== '.changelogs') {
          traverse(fullPath);
        } else if (entry.isFile() && /\.(tsx|ts)$/.test(entry.name) && entry.name !== 'index.ts' && entry.name !== 'versioning.ts' && entry.name !== 'update-manager.ts') {
          files.push(fullPath);
        }
      }
    }

    traverse(this.componentsDir);
    return files;
  }

  /**
   * 解析组件更新日志
   */
  private parseComponentChangelog(filePath: string): ComponentChangelog | null {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // 提取文件头部注释信息
    const fileHeaderMatch = content.match(/\/\*\*[\s\S]*?\*\//);
    let currentVersion = '1.0.0';
    
    if (fileHeaderMatch) {
      const header = fileHeaderMatch[0];
      const versionMatch = header.match(/@version\s+(.*)/);
      if (versionMatch) currentVersion = versionMatch[1].trim();
    }

    // 读取变更记录文件
    const changelogFilePath = path.join(this.changelogDir, `${fileName}.json`);
    let history: ComponentChange[] = [];
    
    if (fs.existsSync(changelogFilePath)) {
      try {
        const changelogData = JSON.parse(fs.readFileSync(changelogFilePath, 'utf-8'));
        history = changelogData.history || [];
      } catch (error) {
        console.warn(`无法读取变更记录文件 ${changelogFilePath}:`, error);
      }
    } else {
      // 如果没有变更记录文件，创建初始记录
      history = [{
        version: currentVersion,
        date: new Date().toISOString().split('T')[0],
        changes: ['初始版本'],
        author: 'YYC'
      }];
      
      // 保存初始变更记录
      fs.writeFileSync(changelogFilePath, JSON.stringify({
        name: fileName,
        currentVersion,
        history
      }, null, 2));
    }

    return {
      name: fileName,
      currentVersion,
      history
    };
  }

  /**
   * 生成总体更新日志
   */
  private generateMasterChangelog(changelogs: ComponentChangelog[]): void {
    let changelogContent = `# YYC³ UI 组件库更新日志\n\n`;
    changelogContent += `最后更新: ${new Date().toLocaleString()}\n\n`;
    
    // 按版本分组
    const versionGroups = new Map<string, Array<{ component: string; changes: string[] }>>();
    
    changelogs.forEach(changelog => {
      changelog.history.forEach(change => {
        if (!versionGroups.has(change.version)) {
          versionGroups.set(change.version, []);
        }
        versionGroups.get(change.version)!.push({
          component: changelog.name,
          changes: change.changes
        });
      });
    });
    
    // 按版本号排序（从新到旧）
    const sortedVersions = Array.from(versionGroups.keys()).sort((a, b) => {
      const aParts = a.split('.').map(Number);
      const bParts = b.split('.').map(Number);
      
      for (let i = 0; i < 3; i++) {
        if (aParts[i] !== bParts[i]) {
          return bParts[i] - aParts[i];
        }
      }
      return 0;
    });
    
    // 生成每个版本的变更记录
    sortedVersions.forEach(version => {
      changelogContent += `## v${version}\n\n`;
      
      const components = versionGroups.get(version)!;
      components.forEach(comp => {
        changelogContent += `### ${comp.component}\n\n`;
        comp.changes.forEach(change => {
          changelogContent += `- ${change}\n`;
        });
        changelogContent += `\n`;
      });
    });
    
    fs.writeFileSync(path.join(this.outputDir, 'CHANGELOG.md'), changelogContent);
  }

  /**
   * 生成版本报告
   */
  private generateVersionReport(changelogs: ComponentChangelog[]): void {
    let reportContent = `# YYC³ UI 组件库版本报告\n\n`;
    reportContent += `生成时间: ${new Date().toLocaleString()}\n\n`;
    
    // 组件数量统计
    reportContent += `## 组件统计\n\n`;
    reportContent += `- **总组件数**: ${changelogs.length}\n\n`;
    
    // 版本分布统计
    const versionCounts = new Map<string, number>();
    changelogs.forEach(changelog => {
      const version = changelog.currentVersion;
      versionCounts.set(version, (versionCounts.get(version) || 0) + 1);
    });
    
    reportContent += `## 版本分布\n\n`;
    Array.from(versionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([version, count]) => {
        reportContent += `- v${version}: ${count} 个组件\n`;
      });
    
    reportContent += `\n## 组件版本列表\n\n`;
    reportContent += `| 组件名 | 当前版本 | 历史版本数 |\n`;
    reportContent += `|--------|----------|------------|\n`;
    
    // 按组件名排序
    changelogs.sort((a, b) => a.name.localeCompare(b.name))
      .forEach(changelog => {
        reportContent += `| ${changelog.name} | ${changelog.currentVersion} | ${changelog.history.length} |\n`;
      });
    
    fs.writeFileSync(path.join(this.outputDir, 'VERSION-REPORT.md'), reportContent);
  }

  /**
   * 添加组件变更记录
   */
  public addComponentChange(componentName: string, version: string, changes: string[], author?: string): void {
    const changelogFilePath = path.join(this.changelogDir, `${componentName}.json`);
    
    let changelog: ComponentChangelog;
    
    if (fs.existsSync(changelogFilePath)) {
      changelog = JSON.parse(fs.readFileSync(changelogFilePath, 'utf-8'));
    } else {
      changelog = {
        name: componentName,
        currentVersion: version,
        history: []
      };
    }
    
    // 添加新的变更记录
    changelog.currentVersion = version;
    changelog.history.unshift({
      version,
      date: new Date().toISOString().split('T')[0],
      changes,
      author: author || 'Unknown'
    });
    
    // 保存更新后的变更记录
    fs.writeFileSync(changelogFilePath, JSON.stringify(changelog, null, 2));
    console.log(`✅ 已为 ${componentName} 组件添加 v${version} 版本的变更记录`);
  }
}

// 执行更新日志生成
if (require.main === module) {
  const componentsDir = path.join(__dirname, '../components/ui');
  const outputDir = path.join(__dirname, '../docs');
  
  const generator = new ChangelogGenerator(componentsDir, outputDir);
  generator.generateChangelog().catch(console.error);
}

// 导出用于其他脚本使用
export { ChangelogGenerator };