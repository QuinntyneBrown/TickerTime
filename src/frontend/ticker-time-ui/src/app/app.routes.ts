import { Routes } from '@angular/router';
import { PipeStatusBoardPageComponent } from './features/pipe-status-board/pipe-status-board-page.component';
import { SignalStatusBoardPageComponent } from './features/signal-status-board/signal-status-board-page.component';

export const routes: Routes = [
  { path: 'investigation/pipe', component: PipeStatusBoardPageComponent },
  { path: 'investigation/signal', component: SignalStatusBoardPageComponent },
  { path: '', redirectTo: 'investigation/pipe', pathMatch: 'full' }
];
