import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalRStocksClient {
  private connection: signalR.HubConnection;

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/hubs/stocks')
      .withAutomaticReconnect()
      .build();
  }

  async start(): Promise<void> {
    if (this.connection.state === signalR.HubConnectionState.Disconnected) {
      await this.connection.start();
    }
  }

  async setSubscriptions(symbols: string[]): Promise<void> {
    await this.start();
    await this.connection.send('SetSubscriptions', { symbols });
  }
}
