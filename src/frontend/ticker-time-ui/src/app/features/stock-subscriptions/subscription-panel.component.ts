import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionStore } from './subscription.store';

@Component({
  selector: 'app-subscription-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="subscription-panel">
      <h3>Watchlist</h3>
      <ul>
        @for (item of store.availableSymbols(); track item.symbol) {
          <li>
            <label>
              <input 
                type="checkbox" 
                [checked]="store.selectedSymbols().includes(item.symbol)"
                (change)="store.toggleSymbol(item.symbol)" />
              {{ item.symbol }} - {{ item.name }}
            </label>
          </li>
        }
      </ul>
    </div>
  `,
  styles: [`
    .subscription-panel {
      padding: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    ul {
      list-style: none;
      padding: 0;
    }
    li {
      margin-bottom: 0.5rem;
    }
  `]
})
export class SubscriptionPanelComponent {
  readonly store = inject(SubscriptionStore);
}
