import { Pipe, PipeTransform, inject, untracked } from '@angular/core';
import { DisplayedStockRow } from '../historical-playback/displayed-stock-row';
import { DerivedStockStatus } from './derived-stock-status';
import { InvestigationMetricsService } from '../investigation-metrics/investigation-metrics.service';

@Pipe({
  name: 'stockStatus',
  standalone: true,
  pure: true
})
export class StockStatusPipe implements PipeTransform {
  private metrics = inject(InvestigationMetricsService);

  transform(row: DisplayedStockRow): DerivedStockStatus {
    untracked(() => this.metrics.recordDerivation());

    const delta = row.displayedPrice - row.referencePrice;
    const percentChange = row.referencePrice === 0 ? 0 : delta / row.referencePrice;
    const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
    const badgeTone = direction === 'up' ? 'positive' : direction === 'down' ? 'negative' : 'neutral';

    return {
      direction,
      percentChange,
      badgeTone
    };
  }
}
