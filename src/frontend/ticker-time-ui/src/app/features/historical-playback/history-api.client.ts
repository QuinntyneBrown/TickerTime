import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoricalQuote } from './historical-quote';

@Injectable({
  providedIn: 'root'
})
export class HistoryApiClient {
  private http = inject(HttpClient);

  getHistory(): Observable<{ history: Record<string, HistoricalQuote[]> }> {
    return this.http.get<{ history: Record<string, HistoricalQuote[]> }>('http://localhost:5000/api/history');
  }
}
