import { test, expect } from '@playwright/test';

test.describe('模型引擎页面 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000'); // 如端口不同请调整
    await page.click('text=模型引擎');
  });

  test('仪表盘与主卡片区加载', async ({ page }) => {
    await expect(page.getByText('模型引擎')).toBeVisible();
    await expect(page.getByText('本地大模型全生命周期管理')).toBeVisible();
    await expect(page.getByText('系统状态')).toBeVisible();
    await expect(page.getByText('快捷操作')).toBeVisible();
  });

  test('功能卡片切换', async ({ page }) => {
    const cards = ['核心功能', '智能辅助', '实时反馈', '数据分析', '自动化', '协作共享'];
    for (const card of cards) {
      await page.click(`text=${card}`);
      await expect(page.getByText(card)).toBeVisible();
    }
  });

  test('智能辅助推荐', async ({ page }) => {
    await page.click('text=智能辅助');
    await page.fill('input[aria-label="任务描述"]', '代码生成');
    await page.click('text=获取推荐');
    await expect(page.getByText('最优推荐')).toBeVisible();
    await page.click('button:has-text("应用")');
    await expect(page.getByText(/已应用/)).toBeVisible();
  });

  test('模型推理与批量操作', async ({ page }) => {
    await page.click('text=实时反馈');
    await page.fill('input[aria-label="推理输入"]', '你好');
    await page.click('button:has-text("调用")');
    await expect(page.getByText(/推理结果/)).toBeVisible();

    await page.click('text=自动化');
    await page.click('button:has-text("批量启动")');
    await expect(page.getByText(/成功启动/)).toBeVisible();
    await page.click('button:has-text("批量停止")');
    await expect(page.getByText(/成功停止/)).toBeVisible();
  });

  test('仪表盘快捷操作', async ({ page }) => {
    await page.click('button:has-text("生成代码")');
    await expect(page.locator('.ant-notification-notice-message')).toHaveText(/功能开发中/);
    await page.click('button:has-text("创建实验")');
    await expect(page.locator('.ant-notification-notice-message')).toHaveText(/功能开发中/);
    await page.click('button:has-text("数据分析")');
    await expect(page.locator('.ant-notification-notice-message')).toHaveText(/功能开发中/);
  });
});
