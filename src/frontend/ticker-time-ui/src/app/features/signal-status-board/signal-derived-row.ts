import { DisplayedStockRow } from '../historical-playback/displayed-stock-row';
import { DerivedStockStatus } from '../pipe-status-board/derived-stock-status';

export interface SignalDerivedRow extends DisplayedStockRow, DerivedStockStatus {}
