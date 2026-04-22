import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaybackStore } from '../historical-playback/playback.store';
import { StockStatusPipe } from './stock-status.pipe';
import { PlaybackToolbarComponent } from '../historical-playback/playback-toolbar.component';
import { SubscriptionPanelComponent } from '../stock-subscriptions/subscription-panel.component';
import { InvestigationMetricsService } from '../investigation-metrics/investigation-metrics.service';
import { RenderProbeCoordinator } from '../performance-investigation/render-probe-coordinator';

@Component({
  selector: 'app-pipe-status-board-page',
  standalone: true,
  imports: [CommonModule, StockStatusPipe, PlaybackToolbarComponent, SubscriptionPanelComponent],
  template: `
    <div class="page">
      <h1>Pipe-based Status Board</h1>
      
      <div class="layout">
        <aside>
          <app-subscription-panel />
          <div class="metrics">
            <h3>Metrics</h3>
            <p>Derivations: {{ metrics.derivationCount() }}</p>
            <button (click)="metrics.reset()">Reset Metrics</button>
          </div>
        </aside>
        
        <main>
          <app-playback-toolbar />
          
          <table class="board">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Price</th>
                <th>Status</th>
                <th>At</th>
              </tr>
            </thead>
            <tbody>
              @for (row of playbackStore.displayedRows(); track row.symbol) {
                @let status = row | stockStatus;
                <tr>
                  <td>{{ row.symbol }}</td>
                  <td>{{ row.displayedPrice | number:'1.2-2' }}</td>
                  <td>
                    <span class="badge" [className]="'badge ' + status.badgeTone">
                      {{ status.direction === 'up' ? '▲' : status.direction === 'down' ? '▼' : '▬' }}
                      {{ status.percentChange | percent:'1.2-2' }}
                    </span>
                  </td>
                  <td>{{ row.displayedAtUtc | date:'HH:mm:ss.SSS' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 1rem; }
    .layout { display: flex; gap: 2rem; }
    aside { width: 300px; }
    main { flex: 1; }
    .board { width: 100%; border-collapse: collapse; }
    .board th, .board td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
    .badge { padding: 0.25rem 0.5rem; border-radius: 4px; color: white; font-weight: bold; }
    .positive { background: green; }
    .negative { background: red; }
    .neutral { background: gray; }
    .metrics { margin-top: 1rem; padding: 1rem; border: 1px solid #ccc; }
  `]
})
export class PipeStatusBoardPageComponent {
  readonly playbackStore = inject(PlaybackStore);
  readonly metrics = inject(InvestigationMetricsService);
  private probeCoordinator = inject(RenderProbeCoordinator);

  constructor() {
    effect(() => {
      this.playbackStore.displayedRows();
      this.probeCoordinator.measureRender();
    });
  }
}
