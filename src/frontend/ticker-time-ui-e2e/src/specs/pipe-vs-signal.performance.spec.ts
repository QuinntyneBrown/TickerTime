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
        test.setTimeout(120000);

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
            const max = Number(await slider.getAttribute('max') ?? '0');
            const stops = [max, 0, Math.floor(max / 2), max, 0];

            for (const stop of stops) {
                await slider.evaluate((element, value) => {
                    const input = element as HTMLInputElement;
                    input.value = String(value);
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }, stop);
                await page.waitForTimeout(100);
            }
        }

        const metrics = await page.evaluate(() => (window as any).__tickerMetrics.getSnapshot());
        console.log(`RESULTS|${scenario.name}|${mode}|${JSON.stringify(metrics)}`);
      });
    }
  }
});
