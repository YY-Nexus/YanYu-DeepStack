import { test, expect } from '@playwright/test';

test.describe('AI代码生成页面 E2E 测试', () => {
  test('页面加载与主要交互', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=AI代码生成');
    await expect(page.getByText('AI代码生成')).toBeVisible();
    // 示例：填写输入、点击生成、断言输出
    // await page.fill('input[aria-label="代码输入"]', '写一个斐波那契函数');
    // await page.click('button:has-text("生成")');
    // await expect(page.getByText(/function/)).toBeVisible();
  });
});
