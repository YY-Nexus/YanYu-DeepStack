/**
 * @file 组件文档生成工具
 * @description 自动扫描组件目录，生成组件API文档
 * @module scripts/generate-component-docs
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * 组件属性接口
 */
interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description: string;
}

/**
 * 组件文档信息
 */
interface ComponentDoc {
  name: string;
  description: string;
  props: ComponentProp[];
  examples: string[];
  version: string;
  lastUpdated: string;
}

/**
 * 组件文档生成器
 */
class ComponentDocGenerator {
  private componentsDir: string;
  private outputDir: string;

  constructor(componentsDir: string, outputDir: string) {
    this.componentsDir = componentsDir;
    this.outputDir = outputDir;
  }

  /**
   * 开始生成文档
   */
  public async generateDocs(): Promise<void> {
    console.log(`开始生成组件文档...`);
    console.log(`源目录: ${this.componentsDir}`);
    console.log(`输出目录: ${this.outputDir}`);

    // 确保输出目录存在
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // 获取所有组件文件
    const componentFiles = this.getComponentFiles();
    console.log(`找到 ${componentFiles.length} 个组件文件`);

    // 生成每个组件的文档
    const docs: ComponentDoc[] = [];
    for (const file of componentFiles) {
      try {
        const doc = this.parseComponentFile(file);
        if (doc) {
          docs.push(doc);
          this.writeComponentDoc(doc);
        }
      } catch (error) {
        console.error(`解析文件 ${file} 时出错:`, error);
      }
    }

    // 生成文档索引
    this.generateIndex(docs);

    console.log(`🎉 文档生成完成！共生成 ${docs.length} 个组件文档`);
  }

  /**
   * 获取所有组件文件
   */
  private getComponentFiles(): string[] {
    const files: string[] = [];
    
    // 递归遍历目录
    function traverse(dir: string): void {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
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
   * 解析组件文件
   */
  private parseComponentFile(filePath: string): ComponentDoc | null {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // 提取文件头部注释信息
    const fileHeaderMatch = content.match(/\/\*\*[\s\S]*?\*\//);
    let description = '暂无描述';
    let version = '1.0.0';
    let lastUpdated = new Date().toISOString().split('T')[0];
    
    if (fileHeaderMatch) {
      const header = fileHeaderMatch[0];
      const descMatch = header.match(/@description\s+(.*)/);
      const versionMatch = header.match(/@version\s+(.*)/);
      const updatedMatch = header.match(/@updated\s+(.*)/);
      
      if (descMatch) description = descMatch[1].trim();
      if (versionMatch) version = versionMatch[1].trim();
      if (updatedMatch) lastUpdated = updatedMatch[1].trim();
    }

    // 提取组件接口/类型定义
    const props: ComponentProp[] = [];
    const interfaceMatch = content.match(/interface\s+\w+Props[\s\S]+?{[\s\S]+?}/);
    
    if (interfaceMatch) {
      const interfaceContent = interfaceMatch[0];
      const propMatches = interfaceContent.match(/(\w+)\s*:\s*([^;]+?)(\s*=\s*([^;]+))?;/g);
      
      if (propMatches) {
        for (const propMatch of propMatches) {
          const propNameMatch = propMatch.match(/^(\w+)/);
          const propTypeMatch = propMatch.match(/:\s*([^=;]+)/);
          const defaultValueMatch = propMatch.match(/=\s*([^;]+)/);
          
          if (propNameMatch && propTypeMatch) {
            props.push({
              name: propNameMatch[1],
              type: propTypeMatch[1].trim(),
              required: !defaultValueMatch,
              default: defaultValueMatch ? defaultValueMatch[1].trim() : undefined,
              description: '暂无描述'
            });
          }
        }
      }
    }

    // 提取示例代码
    const examples: string[] = [];
    const exampleMatches = content.match(/<\/\*\*\s*@example[\s\S]*?\*\/>/g);
    
    if (exampleMatches) {
      for (const exampleMatch of exampleMatches) {
        const exampleCode = exampleMatch.replace(/<\/\*\*\s*@example[\s\S]*?\*\/>/, '').trim();
        if (exampleCode) {
          examples.push(exampleCode);
        }
      }
    }

    return {
      name: fileName,
      description,
      props,
      examples,
      version,
      lastUpdated
    };
  }

  /**
   * 写入组件文档
   */
  private writeComponentDoc(doc: ComponentDoc): void {
    const mdContent = this.generateMarkdown(doc);
    const outputPath = path.join(this.outputDir, `${doc.name}.md`);
    fs.writeFileSync(outputPath, mdContent);
  }

  /**
   * 生成Markdown文档
   */
  private generateMarkdown(doc: ComponentDoc): string {
    let md = `# ${doc.name}\n\n`;
    
    // 基本信息
    md += `## 基本信息\n\n`;
    md += `- **描述**: ${doc.description}\n`;
    md += `- **版本**: ${doc.version}\n`;
    md += `- **最后更新**: ${doc.lastUpdated}\n\n`;
    
    // 属性列表
    if (doc.props.length > 0) {
      md += `## 属性\n\n`;
      md += `| 属性名 | 类型 | 必填 | 默认值 | 描述 |\n`;
      md += `|--------|------|------|--------|------|\n`;
      
      for (const prop of doc.props) {
        md += `| ${prop.name} | ${prop.type} | ${prop.required ? '是' : '否'} | ${prop.default || '-'} | ${prop.description} |\n`;
      }
      
      md += `\n`;
    }
    
    // 示例代码
    if (doc.examples.length > 0) {
      md += `## 示例\n\n`;
      
      for (let i = 0; i < doc.examples.length; i++) {
        md += `### 示例 ${i + 1}\n\n`;
        md += `\`\`\`tsx\n${doc.examples[i]}\n\`\`\`\n\n`;
      }
    }
    
    return md;
  }

  /**
   * 生成文档索引
   */
  private generateIndex(docs: ComponentDoc[]): void {
    let indexContent = `# YYC³ UI 组件库文档\n\n`;
    indexContent += `## 组件列表\n\n`;
    
    // 按字母顺序排序
    const sortedDocs = docs.sort((a, b) => a.name.localeCompare(b.name));
    
    for (const doc of sortedDocs) {
      indexContent += `- [${doc.name}](./${doc.name}.md) - ${doc.description}\n`;
    }
    
    indexContent += `\n## 版本信息\n\n`;
    indexContent += `- **文档生成时间**: ${new Date().toLocaleString()}\n`;
    indexContent += `- **组件总数**: ${docs.length}\n`;
    
    fs.writeFileSync(path.join(this.outputDir, 'index.md'), indexContent);
  }
}

// 执行文档生成
if (require.main === module) {
  const componentsDir = path.join(__dirname, '../components/ui');
  const outputDir = path.join(__dirname, '../docs/components');
  
  const generator = new ComponentDocGenerator(componentsDir, outputDir);
  generator.generateDocs().catch(console.error);
}