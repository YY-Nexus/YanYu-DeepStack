import { test, expect } from '@playwright/test';

test.describe('实时预览页面 E2E 测试', () => {
  test('页面加载与主要交互', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=实时预览');
    await expect(page.getByText('实时预览')).toBeVisible();
    // ...更多交互与断言
  });
});
