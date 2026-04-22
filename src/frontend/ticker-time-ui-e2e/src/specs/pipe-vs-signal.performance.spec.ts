import { test, expect } from '@playwright/test';

const SCENARIOS = [
  { name: 'Light', settings: { symbolCount: 5, tickIntervalMs: 250, historyPoints: 120, seed: 12345 } },
  { name: 'Heavy', settings: { symbolCount: 50, tickIntervalMs: 100, historyPoints: 120, seed: 12345 } },
  { name: 'Stress', settings: { symbolCount: 100, tickIntervalMs: 50, historyPoints: 240, seed: 12345 } }
];

test.describe('Performance Comparison: Pipe vs Signal', () => {
  for (const scenario of SCENARIOS) {
    for (const mode of ['pipe', 'signal']) {
      test(`${scenario.name} - ${mode}`, async ({ page, request }) => {
        page.on('console', msg => {
            if (msg.type() === 'error') console.log(`BROWSER_ERROR|${msg.text()}`);
            else console.log(`BROWSER_LOG|${msg.text()}`);
        });

        // Set scenario
        await request.post('http://localhost:5000/api/investigation/scenario', {
          data: scenario.settings
        });

        await page.goto(`http://localhost:4200/investigation/${mode}`);
        
        // Wait for checkboxes to load
        const checkboxes = page.getByRole('checkbox');
        await expect(checkboxes.first()).toBeVisible({ timeout: 5000 });
        
        const count = await checkboxes.count();
        for (let i = 0; i < count; i++) {
          await checkboxes.nth(i).check();
        }

        // Run for 10 seconds to collect live render metrics
        await page.waitForTimeout(10000);

        // Switch to history and scrub
        await page.getByRole('button', { name: 'History' }).click();
        await page.waitForTimeout(1000); // wait for history load

        const slider = page.getByRole('slider');
        if (await slider.isVisible()) {
            const box = await slider.boundingBox();
            if (box) {
                // Scrub back and forth
                for (let i = 0; i < 5; i++) {
                    await page.mouse.move(box.x, box.y + box.height / 2);
                    await page.mouse.down();
                    await page.mouse.move(box.x + box.width, box.y + box.height / 2, { steps: 20 });
                    await page.mouse.up();
                    await page.mouse.move(box.x + box.width, box.y + box.height / 2);
                    await page.mouse.down();
                    await page.mouse.move(box.x, box.y + box.height / 2, { steps: 20 });
                    await page.mouse.up();
                }
            }
        }

        const metrics = await page.evaluate(() => (window as any).__tickerMetrics.getSnapshot());
        console.log(`RESULTS|${scenario.name}|${mode}|${JSON.stringify(metrics)}`);
      });
    }
  }
});
