import { Injectable, signal, untracked } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InvestigationMetricsService {
  private _derivationCount = 0;
  readonly derivationCount = signal(0);
  readonly renderLatencies = signal<number[]>([]);
  readonly scrubLatencies = signal<number[]>([]);

  recordDerivation() {
    this._derivationCount++;
    // Update the signal asynchronously to avoid write-during-computed errors
    // and ExpressionChangedAfterItHasBeenChecked errors
    setTimeout(() => {
        this.derivationCount.set(this._derivationCount);
    }, 0);
  }

  recordRenderLatency(ms: number) {
    this.renderLatencies.update(current => [...current, ms]);
  }

  recordScrubLatency(ms: number) {
    this.scrubLatencies.update(current => [...current, ms]);
  }

  reset() {
    this._derivationCount = 0;
    this.derivationCount.set(0);
    this.renderLatencies.set([]);
    this.scrubLatencies.set([]);
  }

  getSnapshot() {
    return {
      derivationCount: this._derivationCount,
      renderLatencies: this.renderLatencies(),
      scrubLatencies: this.scrubLatencies()
    };
  }
}
