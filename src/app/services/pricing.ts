import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import {
  PricingRequest,
  PricingResponse
} from '../models/pricing';

@Injectable({
  providedIn: 'root',
})

export class PricingService {
  private baseUrl = `${environment.apiUrl}/pricing/evaluate/`;
  constructor(private http: HttpClient) {}
  evaluate(request: PricingRequest): Observable<PricingResponse> {
    return this.http.post<PricingResponse>(
      this.baseUrl,
      request
    );
  }
}