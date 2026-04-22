import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AvailableSymbol } from './available-symbol';
import { SignalRStocksClient } from './signalr-stocks.client';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionStore {
  private client = inject(SignalRStocksClient);
  private http = inject(HttpClient);

  readonly availableSymbols = signal<AvailableSymbol[]>([]);

  readonly selectedSymbols = signal<string[]>([]);

  constructor() {
    this.http.get<AvailableSymbol[]>('http://localhost:5000/api/symbols').subscribe(symbols => {
      this.availableSymbols.set(symbols);
    });
  }

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
