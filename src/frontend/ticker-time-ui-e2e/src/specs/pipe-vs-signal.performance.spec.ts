import { test, expect } from '@playwright/test';
import { createBrowserMemoryProbe } from '../support/browser-memory';

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
        const browserMemory = await createBrowserMemoryProbe(page);
        
        // Wait for checkboxes to load
        const checkboxes = page.getByRole('checkbox');
        await expect(checkboxes.first()).toBeVisible({ timeout: 5000 });
        await browserMemory.sample('baseline');
        
        const count = await checkboxes.count();
        for (let i = 0; i < count; i++) {
          await checkboxes.nth(i).check();
        }

        await browserMemory.sample('subscribed');

        // Run for 10 seconds to collect live render metrics and memory allocation samples.
        for (let i = 1; i <= 10; i++) {
          await page.waitForTimeout(1000);
          await browserMemory.sample(`live-${i}s`);
        }

        // Switch to history and scrub
        await page.getByRole('button', { name: 'History' }).click();
        await page.waitForTimeout(1000); // wait for history load
        await browserMemory.sample('history-loaded');

        const slider = page.getByRole('slider');
        if (await slider.isVisible()) {
          const max = Number(await slider.getAttribute('max') ?? '0');
          const stops = [max, 0, Math.floor(max / 2), max, 0];

          for (const [index, stop] of stops.entries()) {
            await slider.evaluate((element, value) => {
              const input = element as HTMLInputElement;
              input.value = String(value);
              input.dispatchEvent(new Event('input', { bubbles: true }));
            }, stop);
            await page.waitForTimeout(100);
            await browserMemory.sample(`scrub-${index + 1}`);
          }
        }

        const workloadEndMemory = await browserMemory.sample('workload-end');
        await browserMemory.collectGarbage();
        await page.waitForTimeout(250);
        const postGcMemory = await browserMemory.sample('post-gc');
        const metrics = await page.evaluate(() => (window as any).__tickerMetrics.getSnapshot());
        const result = {
          ...metrics,
          memory: browserMemory.summarize(workloadEndMemory, postGcMemory)
        };

        await browserMemory.detach();
        console.log(`RESULTS|${scenario.name}|${mode}|${JSON.stringify(result)}`);
      });
    }
  }
});
