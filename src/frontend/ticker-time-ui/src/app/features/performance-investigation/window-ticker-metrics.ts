import { InvestigationMetricsService } from '../investigation-metrics/investigation-metrics.service';

export function exposeMetricsToWindow(metricsService: InvestigationMetricsService) {
  (window as any).__tickerMetrics = {
    getSnapshot: () => metricsService.getSnapshot(),
    reset: () => metricsService.reset()
  };
}
