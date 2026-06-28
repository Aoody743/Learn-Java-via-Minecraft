const { test, expect } = require('@playwright/test');

test('homepage renders and lesson completion unlocks achievement', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /从玩家血量/ })).toBeVisible();
  await page.getByRole('link', { name: '开始基础课程' }).click();
  await page.getByRole('button', { name: /标记本课完成/ }).click();
  await expect(page.locator('#progressText')).toContainText('完成 1');
  await expect(page.locator('#achievementGrid')).toContainText('砍下第一棵树');
  await expect(page.locator('#toastRegion')).toContainText('砍下第一棵树');
  await expect(page.locator('#lessonDetail')).toContainText('下一步');
});

test('practice answer gives XP and sandbox preserves output after fallback', async ({ page }) => {
  await page.goto('/');
  await page.locator('#answer-0').fill('health <= 0');
  await page.locator('[data-practice="0"]').click();
  await expect(page.locator('#feedback-0')).toContainText('正确');
  await page.getByRole('link', { name: '沙箱', exact: true }).click();
  const code = 'public class Main { public static void main(String[] args) { int health = 0; if (health <= 0) System.out.println("玩家死亡"); } }';
  await page.evaluate(value => {
    const models = window.monaco?.editor?.getModels?.() || [];
    if (models[0]) models[0].setValue(value);
    const textarea = document.querySelector('#codeEditor');
    if (textarea) textarea.value = value;
  }, code);
  await page.getByRole('button', { name: /运行后端沙箱测试/ }).click();
  await expect(page.locator('#consoleOutput')).toContainText(/任务|后端沙箱不可用|后端 Java 编译运行/, { timeout: 10000 });
  await expect(page.locator('#testResults')).toContainText(/通过|失败|自动测试|包含死亡判断/);
  await expect(page.getByRole('button', { name: /运行后端沙箱测试/ })).toBeEnabled();
  await expect.poll(() => page.evaluate(() => window.monaco?.editor?.getModels?.()[0]?.getValue?.() || document.querySelector('#codeEditor')?.value || '')).toContain('玩家死亡');
  await expect(page.locator('#sandboxHealth')).toContainText(/沙箱|Docker|后端/);
  await page.getByRole('button', { name: '清空控制台' }).click();
  await expect(page.locator('#consoleOutput')).toContainText('控制台已清空');
});


test('cloud sync creates profile and updates status', async ({ page }) => {
  await page.goto('/');
  await page.locator('#profileName').fill('Cloud Steve');
  await page.getByRole('button', { name: '登录 / 同步进度' }).click();
  await expect(page.locator('#syncStatus')).toContainText(/已同步|已登录/, { timeout: 10000 });
  await expect(page.locator('#appStatus')).toContainText(/云端进度已同步|课程内容已加载/);
});

test('mobile pickers allow changing lesson and sandbox', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/');
  await page.locator('#lessonPicker').selectOption('1');
  await expect(page.locator('#lessonTitle')).toContainText(/变量与数据类型/);
  await page.locator('#sandboxPicker').selectOption('1');
  await expect(page.locator('#sandboxTitle')).toContainText(/欢迎命令/);
});
