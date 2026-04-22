export interface DerivedStockStatus {
  direction: 'up' | 'down' | 'flat';
  percentChange: number;
  badgeTone: 'positive' | 'negative' | 'neutral';
}
