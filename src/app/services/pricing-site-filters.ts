import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PricingSitesFilterOptions, PricingSitesFiltersBase } from '../models/pricing-site';
@Injectable({
  providedIn: 'root',
})
export class PricingSiteFilterOptionsService {
  private baseUrl =`${environment.apiUrl}/pricing-sites/filter-options/`;
  constructor(private http: HttpClient) {}
  getFilterOptions(
    filters: PricingSitesFiltersBase
  ): Observable<PricingSitesFilterOptions> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach(item => {
          params = params.append(key, item);
        });
      } else {
        params = params.set(key, value);
      }
    });
    return this.http.get<PricingSitesFilterOptions>(
      this.baseUrl,
      { params }
    );
  }
}