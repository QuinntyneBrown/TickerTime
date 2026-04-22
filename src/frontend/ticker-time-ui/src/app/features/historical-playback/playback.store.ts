import { Injectable, signal, computed, inject } from '@angular/core';
import { HistoricalQuote } from './historical-quote';
import { DisplayedStockRow } from './displayed-stock-row';
import { HistoryApiClient } from './history-api.client';
import { SubscriptionStore } from '../stock-subscriptions/subscription.store';
import { LiveQuoteFeedStore } from '../live-price-stream/live-quote-feed.store';

@Injectable({
  providedIn: 'root'
})
export class PlaybackStore {
  private historyClient = inject(HistoryApiClient);
  private subscriptionStore = inject(SubscriptionStore);
  private liveFeedStore = inject(LiveQuoteFeedStore);

  readonly isLive = signal(true);
  readonly playbackIndex = signal(0);
  readonly historyBySymbol = signal<Record<string, HistoricalQuote[]>>({});

  readonly maxIndex = computed(() => {
    const histories = Object.values(this.historyBySymbol());
    if (histories.length === 0) return 0;
    return histories[0].length - 1;
  });

  readonly displayedRows = computed<DisplayedStockRow[]>(() => {
    const symbols = this.subscriptionStore.selectedSymbols();
    
    if (this.isLive()) {
      return symbols.map(symbol => {
        const latest = this.liveFeedStore.latestQuotes().get(symbol);
        return {
          symbol,
          displayedPrice: latest?.price ?? 0,
          referencePrice: 0, // Reference price for live mode would need historical context
          displayedAtUtc: latest?.timestamp ?? ''
        };
      });
    } else {
      const history = this.historyBySymbol();
      const index = this.playbackIndex();
      
      return symbols.map(symbol => {
        const symbolHistory = history[symbol] ?? [];
        const current = symbolHistory[index];
        const previous = index > 0 ? symbolHistory[index - 1] : null;
        
        return {
          symbol,
          displayedPrice: current?.price ?? 0,
          referencePrice: previous?.price ?? current?.price ?? 0,
          displayedAtUtc: current?.timestamp ?? ''
        };
      });
    }
  });

  setLive(live: boolean) {
    this.isLive.set(live);
    if (!live) {
      this.loadHistory();
    }
  }

  setIndex(index: number) {
    this.playbackIndex.set(index);
  }

  private loadHistory() {
    this.historyClient.getHistory().subscribe(resp => {
      this.historyBySymbol.set(resp.history);
      this.playbackIndex.set(this.maxIndex());
    });
  }
}
