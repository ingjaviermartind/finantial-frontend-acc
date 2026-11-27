import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import {
  PricingRequest,
  PricingResponse,
  EvaluationResult,
  MultiProjectPricingRequest,
  GroupEvaluationResult
} from '../models/pricing';

@Injectable({
  providedIn: 'root',
})
export class PricingService {

  private baseUrl = `${environment.apiUrl}/pricing/evaluate/`;
  private evaluatePriceUrl = `${environment.apiUrl}/pricing/evaluate_price/`;
  private evaluateGroupUrl = `${environment.apiUrl}/pricing/evaluate_group/`;

  constructor(private http: HttpClient) {}

  // Evaluación individual
  evaluate(request: PricingRequest): Observable<PricingResponse> {
    return this.http.post<PricingResponse>(
      this.baseUrl,
      request
    );
  }

  // Evaluación individual con precio definido
  evaluatePrice(request: PricingRequest): Observable<EvaluationResult> {
    return this.http.post<EvaluationResult>(
      this.evaluatePriceUrl,
      request
    );
  }

  // Evaluación multiproyecto
  evaluateGroup(request: MultiProjectPricingRequest): Observable<GroupEvaluationResult> {
    return this.http.post<GroupEvaluationResult>(
      this.evaluateGroupUrl,
      request
    );
  }
}