import { Injectable, signal, inject } from '@angular/core';
import { AvailableSymbol } from './available-symbol';
import { SignalRStocksClient } from './signalr-stocks.client';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionStore {
  private client = inject(SignalRStocksClient);

  readonly availableSymbols = signal<AvailableSymbol[]>([
    { symbol: 'SYM001', name: 'Symbol 001' },
    { symbol: 'SYM002', name: 'Symbol 002' },
    { symbol: 'SYM003', name: 'Symbol 003' },
    { symbol: 'SYM004', name: 'Symbol 004' },
    { symbol: 'SYM005', name: 'Symbol 005' },
  ]);

  readonly selectedSymbols = signal<string[]>([]);

  toggleSymbol(symbol: string) {
    this.selectedSymbols.update(current => {
      if (current.includes(symbol)) {
        return current.filter(s => s !== symbol);
      } else {
        return [...current, symbol];
      }
    });

    this.client.setSubscriptions(this.selectedSymbols());
  }
}
