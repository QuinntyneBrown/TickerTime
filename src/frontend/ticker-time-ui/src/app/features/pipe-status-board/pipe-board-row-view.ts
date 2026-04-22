import { DisplayedStockRow } from '../historical-playback/displayed-stock-row';
import { DerivedStockStatus } from './derived-stock-status';

export interface PipeBoardRowView {
  row: DisplayedStockRow;
  status: DerivedStockStatus;
}
