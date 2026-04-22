import { Injectable, computed, inject } from '@angular/core';
import { PlaybackStore } from '../historical-playback/playback.store';
import { SignalDerivedRow } from './signal-derived-row';
import { InvestigationMetricsService } from '../investigation-metrics/investigation-metrics.service';

@Injectable({
  providedIn: 'root'
})
export class SignalStatusBoardStore {
  private playbackStore = inject(PlaybackStore);
  private metrics = inject(InvestigationMetricsService);

  readonly derivedRows = computed<SignalDerivedRow[]>(() => {
    const rawRows = this.playbackStore.displayedRows();
    
    return rawRows.map(row => {
      this.metrics.recordDerivation();
      
      const delta = row.displayedPrice - row.referencePrice;
      const percentChange = row.referencePrice === 0 ? 0 : delta / row.referencePrice;
      const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
      const badgeTone = direction === 'up' ? 'positive' : direction === 'down' ? 'negative' : 'neutral';
      
      return {
        ...row,
        direction,
        percentChange,
        badgeTone
      };
    });
  });
}
