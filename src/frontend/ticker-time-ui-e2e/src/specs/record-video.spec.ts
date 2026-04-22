import { test } from '@playwright/test';

test('record 20 second video', async ({ page }) => {
  await page.goto('http://localhost:4200/investigation/pipe');
  
  // Wait for the app to load and start receiving data
  await page.waitForTimeout(2000);
  
  // Select some symbols to show some activity
  const checkboxes = await page.getByRole('checkbox');
  const count = await checkboxes.count();
  for (let i = 0; i < Math.min(count, 3); i++) {
    await checkboxes.nth(i).check();
    await page.waitForTimeout(500);
  }

  // Switch to Signal mode half way through
  await page.waitForTimeout(5000);
  await page.goto('http://localhost:4200/investigation/signal');
  
  // Record the rest of the time
  await page.waitForTimeout(10000);
});
