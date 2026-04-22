import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaybackStore } from './playback.store';
import { RenderProbeCoordinator } from '../performance-investigation/render-probe-coordinator';

@Component({
  selector: 'app-playback-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="playback-toolbar">
      <button (click)="store.setLive(true)" [disabled]="store.isLive()">Live</button>
      <button (click)="store.setLive(false)" [disabled]="!store.isLive()">History</button>
      
      @if (!store.isLive()) {
        <input 
          type="range" 
          [min]="0" 
          [max]="store.maxIndex()" 
          [value]="store.playbackIndex()" 
          (input)="onSliderChange($event)" />
        <span>Index: {{ store.playbackIndex() }} / {{ store.maxIndex() }} </span>
      }
    </div>
  `,
  styles: [`
    .playback-toolbar {
      padding: 1rem;
      background: #f0f0f0;
      display: flex;
      gap: 1rem;
      align-items: center;
    }
  `]
})
export class PlaybackToolbarComponent {
  readonly store = inject(PlaybackStore);
  private probeCoordinator = inject(RenderProbeCoordinator);

  constructor() {
    effect(() => {
      this.store.playbackIndex();
      if (!this.store.isLive()) {
        this.probeCoordinator.measureScrub();
      }
    });
  }

  onSliderChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.store.setIndex(parseInt(target.value, 10));
  }
}
