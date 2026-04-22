import { Injectable, inject } from '@angular/core';
import { InvestigationMetricsService } from '../investigation-metrics/investigation-metrics.service';

@Injectable({
  providedIn: 'root'
})
export class RenderProbeCoordinator {
  private metrics = inject(InvestigationMetricsService);

  measureRender() {
    const start = performance.now();
    requestAnimationFrame(() => {
      const latency = performance.now() - start;
      this.metrics.recordRenderLatency(latency);
    });
  }

  measureScrub() {
    const start = performance.now();
    requestAnimationFrame(() => {
      const latency = performance.now() - start;
      this.metrics.recordScrubLatency(latency);
    });
  }
}
