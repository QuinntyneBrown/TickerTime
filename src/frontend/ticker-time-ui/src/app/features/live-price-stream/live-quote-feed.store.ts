import { Injectable, signal } from '@angular/core';
import { LiveQuote } from './live-quote';

@Injectable({
  providedIn: 'root'
})
export class LiveQuoteFeedStore {
  readonly latestQuotes = signal<Map<string, LiveQuote>>(new Map());

  updateQuote(quote: LiveQuote) {
    this.latestQuotes.update(current => {
      const next = new Map(current);
      next.set(quote.symbol, quote);
      return next;
    });
  }
}
