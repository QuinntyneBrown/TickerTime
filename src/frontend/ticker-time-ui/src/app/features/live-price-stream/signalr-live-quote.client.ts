import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { LiveQuoteFeedStore } from './live-quote-feed.store';
import { LiveQuote } from './live-quote';

@Injectable({
  providedIn: 'root'
})
export class SignalRLiveQuoteClient {
  private store = inject(LiveQuoteFeedStore);
  private connection: signalR.HubConnection;

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/hubs/stocks')
      .withAutomaticReconnect()
      .build();

    this.connection.on('ReceiveQuote', (quote: LiveQuote) => {
      this.store.updateQuote(quote);
    });
  }

  async start(): Promise<void> {
    if (this.connection.state === signalR.HubConnectionState.Disconnected) {
      try {
        await this.connection.start();
        console.log('SignalR Live Quote connected');
      } catch (err) {
        console.error('SignalR Live Quote connection error: ', err);
      }
    }
  }
}
