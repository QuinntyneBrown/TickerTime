import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InvestigationMetricsService } from './features/investigation-metrics/investigation-metrics.service';
import { exposeMetricsToWindow } from './features/performance-investigation/window-ticker-metrics';
import { SignalRStocksClient } from './features/stock-subscriptions/signalr-stocks.client';
import { SignalRLiveQuoteClient } from './features/live-price-stream/signalr-live-quote.client';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  private metricsService = inject(InvestigationMetricsService);
  private stocksClient = inject(SignalRStocksClient);
  private liveQuoteClient = inject(SignalRLiveQuoteClient);

  ngOnInit() {
    exposeMetricsToWindow(this.metricsService);
    this.stocksClient.start();
    this.liveQuoteClient.start();
  }
}
