import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Analytics } from '../models/analytics.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);

  getAnalytics(): Observable<Analytics> {
    return this.http.get<Analytics>(`${environment.apiUrl}/admin/analytics`);
  }
}
