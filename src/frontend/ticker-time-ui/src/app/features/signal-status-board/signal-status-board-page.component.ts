import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalStatusBoardStore } from './signal-status-board.store';
import { PlaybackToolbarComponent } from '../historical-playback/playback-toolbar.component';
import { SubscriptionPanelComponent } from '../stock-subscriptions/subscription-panel.component';
import { InvestigationMetricsService } from '../investigation-metrics/investigation-metrics.service';
import { RenderProbeCoordinator } from '../performance-investigation/render-probe-coordinator';

@Component({
  selector: 'app-signal-status-board-page',
  standalone: true,
  imports: [CommonModule, PlaybackToolbarComponent, SubscriptionPanelComponent],
  template: `
    <div class="page">
      <h1>Signal-based Status Board</h1>
      
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
              @for (row of store.derivedRows(); track row.symbol) {
                <tr>
                  <td>{{ row.symbol }}</td>
                  <td>{{ row.displayedPrice | number:'1.2-2' }}</td>
                  <td>
                    <span class="badge" [className]="'badge ' + row.badgeTone">
                      {{ row.direction === 'up' ? '▲' : row.direction === 'down' ? '▼' : '▬' }}
                      {{ row.percentChange | percent:'1.2-2' }}
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
export class SignalStatusBoardPageComponent {
  readonly store = inject(SignalStatusBoardStore);
  readonly metrics = inject(InvestigationMetricsService);
  private probeCoordinator = inject(RenderProbeCoordinator);

  constructor() {
    effect(() => {
      this.store.derivedRows();
      this.probeCoordinator.measureRender();
    });
  }
}
