import { Page } from '@playwright/test';

export interface BrowserMemorySnapshot {
  label: string;
  usedHeapBytes: number;
  totalHeapBytes: number;
  embedderHeapUsedBytes: number;
  backingStorageBytes: number;
}

export interface BrowserMemorySummary {
  baselineUsedHeapBytes: number;
  workloadEndUsedHeapBytes: number;
  postGcUsedHeapBytes: number;
  peakUsedHeapBytes: number;
  peakUsedHeapLabel: string;
  peakGrowthBytes: number;
  retainedGrowthAfterGcBytes: number;
  reclaimedByForcedGcBytes: number;
  baselineTotalHeapBytes: number;
  postGcTotalHeapBytes: number;
  sampleCount: number;
}

export async function createBrowserMemoryProbe(page: Page) {
  const session = await page.context().newCDPSession(page);
  const snapshots: BrowserMemorySnapshot[] = [];

  await session.send('Runtime.enable');
  await session.send('HeapProfiler.enable');

  async function sample(label: string): Promise<BrowserMemorySnapshot> {
    const heapUsage = await session.send('Runtime.getHeapUsage');
    const snapshot: BrowserMemorySnapshot = {
      label,
      usedHeapBytes: heapUsage.usedSize,
      totalHeapBytes: heapUsage.totalSize,
      embedderHeapUsedBytes: heapUsage.embedderHeapUsedSize,
      backingStorageBytes: heapUsage.backingStorageSize
    };

    snapshots.push(snapshot);
    return snapshot;
  }

  async function collectGarbage() {
    await session.send('HeapProfiler.collectGarbage');
  }

  async function detach() {
    await session.detach();
  }

  function summarize(workloadEnd: BrowserMemorySnapshot, postGc: BrowserMemorySnapshot): BrowserMemorySummary {
    if (snapshots.length === 0) {
      throw new Error('Cannot summarize browser memory before at least one sample is recorded.');
    }

    const baseline = snapshots[0];
    const peak = snapshots.reduce((currentPeak, snapshot) =>
      snapshot.usedHeapBytes > currentPeak.usedHeapBytes ? snapshot : currentPeak);

    return {
      baselineUsedHeapBytes: baseline.usedHeapBytes,
      workloadEndUsedHeapBytes: workloadEnd.usedHeapBytes,
      postGcUsedHeapBytes: postGc.usedHeapBytes,
      peakUsedHeapBytes: peak.usedHeapBytes,
      peakUsedHeapLabel: peak.label,
      peakGrowthBytes: peak.usedHeapBytes - baseline.usedHeapBytes,
      retainedGrowthAfterGcBytes: postGc.usedHeapBytes - baseline.usedHeapBytes,
      reclaimedByForcedGcBytes: workloadEnd.usedHeapBytes - postGc.usedHeapBytes,
      baselineTotalHeapBytes: baseline.totalHeapBytes,
      postGcTotalHeapBytes: postGc.totalHeapBytes,
      sampleCount: snapshots.length
    };
  }

  return {
    sample,
    collectGarbage,
    summarize,
    detach
  };
}
