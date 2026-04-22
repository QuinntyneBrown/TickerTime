import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InvestigationMetricsService {
  readonly derivationCount = signal(0);
  readonly renderLatencies = signal<number[]>([]);
  readonly scrubLatencies = signal<number[]>([]);

  recordDerivation() {
    this.derivationCount.update(c => c + 1);
  }

  recordRenderLatency(ms: number) {
    this.renderLatencies.update(current => [...current, ms]);
  }

  recordScrubLatency(ms: number) {
    this.scrubLatencies.update(current => [...current, ms]);
  }

  reset() {
    this.derivationCount.set(0);
    this.renderLatencies.set([]);
    this.scrubLatencies.set([]);
  }

  getSnapshot() {
    return {
      derivationCount: this.derivationCount(),
      renderLatencies: this.renderLatencies(),
      scrubLatencies: this.scrubLatencies()
    };
  }
}
