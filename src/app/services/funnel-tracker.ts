import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { FunnelTrackerResponse } from '../models/funnel-tracker';

@Injectable({
  providedIn: 'root',
})
export class FunnelTrackerService {
  private readonly baseUrl = `${environment.apiUrl}/tracker/`;

  constructor(private http: HttpClient) {}

  getTrackerData(radiusM = 100): Observable<FunnelTrackerResponse> {
    return this.http.get<FunnelTrackerResponse>(
      this.baseUrl,
      {
        params: {
          radius_m: radiusM,
        },
      }
    );
  }
}